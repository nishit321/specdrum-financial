// Small in-memory sliding-window limiter. There is no database, so the counts live
// in this server process: enough to stop a script hammering one instance. With
// several instances behind a load balancer each one counts on its own.

type Window = { hits: number[] };

const MAX_KEYS = 10_000;

export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
  const buckets = new Map<string, Window>();

  function prune(now: number) {
    for (const [key, w] of buckets) {
      w.hits = w.hits.filter((t) => now - t < windowMs);
      if (w.hits.length === 0) buckets.delete(key);
    }
  }

  return {
    /** Records a hit; returns seconds to wait when the key is over its limit, otherwise 0. */
    hit(key: string, now = Date.now()): number {
      if (buckets.size > MAX_KEYS) prune(now);
      const w = buckets.get(key) ?? { hits: [] };
      w.hits = w.hits.filter((t) => now - t < windowMs);
      if (w.hits.length >= limit) {
        buckets.set(key, w);
        return Math.max(1, Math.ceil((w.hits[0] + windowMs - now) / 1000));
      }
      w.hits.push(now);
      buckets.set(key, w);
      return 0;
    },
    /** Gives back the most recent hit (e.g. when the work failed on our side). */
    undo(key: string) {
      buckets.get(key)?.hits.pop();
    },
    reset() {
      buckets.clear();
    },
  };
}
