import { NextResponse } from 'next/server';

// Response shapes shared by /api/apply and /api/quote. The browser forms rely on `error`.

export type ApiError =
  | 'validation'
  | 'bad_request'
  | 'forbidden'
  | 'too_large'
  | 'slow_upload'
  | 'unsupported'
  | 'rate_limited'
  | 'busy'
  | 'conflict'
  | 'not_configured'
  | 'send_failed';

export type ApiResponse =
  | { ok: true; reference: string }
  | { ok: false; error: ApiError; message?: string; fields?: Record<string, string>; retryAfter?: number };

export const ok = (reference: string) => NextResponse.json<ApiResponse>({ ok: true, reference });

export function fail(status: number, error: ApiError, extra: { message?: string; fields?: Record<string, string>; retryAfter?: number } = {}) {
  const res = NextResponse.json<ApiResponse>({ ok: false, error, ...extra }, { status });
  if (extra.retryAfter) res.headers.set('Retry-After', String(extra.retryAfter));
  return res;
}

/** One JSON line per event. Never pass form values here: no names, SSNs or emails in logs. */
export function logEvent(level: 'info' | 'warn' | 'error', event: string, details: Record<string, string | number | boolean | undefined> = {}) {
  const line = JSON.stringify({ time: new Date().toISOString(), level, event, ...details });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.info(line);
}

export const errorMessage = (err: unknown) => (err instanceof Error ? `${err.name}: ${err.message}` : String(err)).slice(0, 300);
