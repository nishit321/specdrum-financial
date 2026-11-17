import { randomInt } from 'node:crypto';

// No 0/O or 1/I so a reference read out over the phone is not misheard.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** e.g. SBF-2026-4F7K2Q */
export function newReference(prefix: 'SBF' | 'SBQ', now = new Date()): string {
  let code = '';
  for (let i = 0; i < 6; i++) code += ALPHABET[randomInt(ALPHABET.length)];
  return `${prefix}-${now.getUTCFullYear()}-${code}`;
}
