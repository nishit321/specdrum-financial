// Limits for the public form endpoints. Everything is in memory (no database), so the
// numbers apply per server process; README.md explains what that means on AWS.

/** At most `max` requests doing heavy work (large uploads, PDF rendering, SMTP) at the same time. */
export function createGate(max: number) {
  let active = 0;
  const waiting: ((release: () => void) => void)[] = [];
  const slot = () => {
    let released = false;
    return () => {
      if (released) return;
      released = true;
      // a freed slot goes straight to the next request in line
      const next = waiting.shift();
      if (next) next(slot());
      else active--;
    };
  };
  const tryEnter = (): (() => void) | null => {
    if (active >= max) return null;
    active++;
    return slot();
  };
  return {
    /** A release function, or null when the gate is full. */
    tryEnter,
    /**
     * Like tryEnter, but waits up to `waitMs` (first come, first served) for a slot to free up.
     * Gives up at once, and leaves the line, when `signal` aborts (the visitor went away).
     */
    enter(waitMs: number, signal?: AbortSignal): Promise<(() => void) | null> {
      if (signal?.aborted) return Promise.resolve(null);
      const release = tryEnter();
      if (release) return Promise.resolve(release);
      return new Promise((resolve) => {
        const leave = () => {
          clearTimeout(timer);
          signal?.removeEventListener('abort', leave);
          const i = waiting.indexOf(give);
          if (i >= 0) waiting.splice(i, 1);
          resolve(null);
        };
        const give = (r: () => void) => {
          clearTimeout(timer);
          signal?.removeEventListener('abort', leave);
          resolve(r);
        };
        const timer = setTimeout(leave, waitMs);
        signal?.addEventListener('abort', leave, { once: true });
        waiting.push(give);
      });
    },
    get active() {
      return active;
    },
    get waiting() {
      return waiting.length;
    },
    reset() {
      active = 0;
      waiting.length = 0;
    },
  };
}

/**
 * At most `maxPerKey` requests in progress per visitor, so one address cannot take every
 * slot of a gate by itself (for example with uploads that drip in slowly).
 */
export function createKeyedGate(maxPerKey: number) {
  const active = new Map<string, number>();
  return {
    /** A release function, or null when this visitor already has `maxPerKey` requests running. */
    tryEnter(key: string): (() => void) | null {
      const n = active.get(key) ?? 0;
      if (n >= maxPerKey) return null;
      active.set(key, n + 1);
      let released = false;
      return () => {
        if (released) return;
        released = true;
        const left = (active.get(key) ?? 1) - 1;
        if (left > 0) active.set(key, left);
        else active.delete(key);
      };
    },
    reset() {
      active.clear();
    },
  };
}

/** Thrown inside a submission when the all-visitors limit is reached. */
export class GlobalLimitError extends Error {}

export class TimeoutError extends Error {}

/** Rejects with TimeoutError when `promise` has not settled within `ms` (the work itself is not stopped). */
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new TimeoutError(`${label} took longer than ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
