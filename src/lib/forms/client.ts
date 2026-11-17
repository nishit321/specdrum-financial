'use client';

import type { ApiResponse } from '@/server/api';

// Browser side of the form submissions.

export const PHONE_DISPLAY = '1-800-214-7498';

export type SubmitResult = ApiResponse | { ok: false; error: 'network' | 'timeout' };

/** Random key per form fill, so a double click or retry never sends the owner two emails. */
export function newIdempotencyKey(): string {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function send(url: string, init: RequestInit, timeoutMs: number): Promise<SubmitResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal, credentials: 'same-origin' });
    const data = (await res.json().catch(() => null)) as ApiResponse | null;
    if (data && typeof data === 'object' && 'ok' in data) return data;
    return { ok: false, error: res.status === 413 ? 'too_large' : 'send_failed' };
  } catch (err) {
    return { ok: false, error: (err as Error).name === 'AbortError' ? 'timeout' : 'network' };
  } finally {
    clearTimeout(timer);
  }
}

export const postJson = (url: string, body: unknown, timeoutMs = 45_000) =>
  send(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }, timeoutMs);

// The server stops reading an upload that arrives too slowly. Chrome then drops the connection
// before the server's "too slow" answer gets through, so with statements attached a failure this
// late means just that. Without files it is an ordinary connection problem.
const SLOW_UPLOAD_AFTER_MS = 15_000;

export async function postFormData(url: string, body: FormData, timeoutMs = 120_000): Promise<SubmitResult> {
  const started = Date.now();
  const result = await send(url, { method: 'POST', body }, timeoutMs);
  const withFiles = body.getAll('files').some((f) => typeof f !== 'string' && f.size > 0);
  if (!result.ok && result.error === 'network' && withFiles && Date.now() - started >= SLOW_UPLOAD_AFTER_MS) {
    return { ok: false, error: 'slow_upload' };
  }
  return result;
}

/** What to tell the person when a submission did not go through. */
export function submitErrorMessage(result: Exclude<SubmitResult, { ok: true }>): string {
  switch (result.error) {
    case 'validation':
      return 'Some details need another look. Please check the highlighted fields.';
    case 'rate_limited':
      return `We've had several requests from your connection in the last few minutes. Please wait a few minutes and try again, or call us at ${PHONE_DISPLAY}.`;
    case 'busy':
      return `We're receiving a lot of requests right now. Please try again in a few minutes, or call us at ${PHONE_DISPLAY}.`;
    case 'conflict':
      return 'Some details changed while an earlier send was still going through. Please press the button again to send the latest version.';
    case 'too_large':
      return `${'message' in result && result.message ? result.message : 'The files are too large to send.'} Remove a file and try again, or email the statements to info@spectrumbusinessfinance.com.`;
    case 'slow_upload':
      return "The upload didn't finish. The connection may be too slow, or it dropped. Please try again; if it happens again, remove the bank statements here and email them to info@spectrumbusinessfinance.com.";
    case 'timeout':
    case 'network':
      return `We couldn't reach our server. Check your internet connection and try again, or call us at ${PHONE_DISPLAY}.`;
    default:
      return `We couldn't send this just now. Please try again in a minute, or call us at ${PHONE_DISPLAY} and we'll take your details over the phone.`;
  }
}
