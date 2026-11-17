import { createHash } from 'node:crypto';

// Each form fill sends a random key with its submission. A double click, a retry after a
// network hiccup or a second tab with the same key gets the first submission's result
// instead of sending the owner a second email.

type Entry<T> = { promise: Promise<T>; expires: number; fingerprint: string };

const MAX_ENTRIES = 5_000;

/** The same key was sent again with different data. */
export class IdempotencyConflictError extends Error {}

export const fingerprintOf = (...parts: unknown[]) => createHash('sha256').update(JSON.stringify(parts)).digest('hex');

export function createIdempotencyStore<T>({ ttlMs }: { ttlMs: number }) {
  const entries = new Map<string, Entry<T>>();
  // The reference stays with the key even when a send fails: if the mail server received the
  // message and only the answer got lost, the retry's email carries the same reference and the
  // owner can see it is the same application.
  const references = new Map<string, { reference: string; expires: number }>();

  function sweep(now: number) {
    for (const [k, e] of entries) if (e.expires <= now) entries.delete(k);
    for (const [k, r] of references) if (r.expires <= now) references.delete(k);
    // still too many: drop the oldest (Map keeps insertion order)
    while (entries.size >= MAX_ENTRIES) entries.delete(entries.keys().next().value!);
    while (references.size >= MAX_ENTRIES) references.delete(references.keys().next().value!);
  }

  return {
    /**
     * Runs `work` once per key. A failed run is forgotten so the person can try again.
     * Throws IdempotencyConflictError when the key is reused for different data.
     */
    run(key: string, fingerprint: string, work: () => Promise<T>, now = Date.now()): Promise<T> {
      const existing = entries.get(key);
      if (existing && existing.expires > now) {
        if (existing.fingerprint !== fingerprint) return Promise.reject(new IdempotencyConflictError());
        return existing.promise;
      }
      if (entries.size >= MAX_ENTRIES || references.size >= MAX_ENTRIES) sweep(now);
      const promise = work();
      entries.set(key, { promise, expires: now + ttlMs, fingerprint });
      promise.catch(() => {
        if (entries.get(key)?.promise === promise) entries.delete(key);
      });
      return promise;
    },
    /** The reference for this key: the one minted on an earlier attempt, or a new one. */
    reference(key: string, mint: () => string, now = Date.now()): string {
      const known = references.get(key);
      if (known && known.expires > now) return known.reference;
      const reference = mint();
      references.set(key, { reference, expires: now + ttlMs });
      return reference;
    },
    reset() {
      entries.clear();
      references.clear();
    },
  };
}

export const isValidIdempotencyKey = (key: unknown): key is string => typeof key === 'string' && /^[A-Za-z0-9-]{16,64}$/.test(key);
