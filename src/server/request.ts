import { isIP } from 'node:net';
import { allowedOrigins, trustedProxyHops } from './config';

/**
 * Client IP as seen by the closest trusted proxy. Proxies append to X-Forwarded-For,
 * so with N trusted hops the client address is the N-th entry from the right;
 * anything further left was written by the client and cannot be trusted.
 * Returns 'unknown' when the chain is shorter than expected (no proxy in front, or
 * TRUSTED_PROXY_HOPS set too high); client-controlled headers are never used instead.
 */
export function clientIp(headers: Headers, hops = trustedProxyHops()): string {
  if (hops === 0) return 'unknown';
  const chain = (headers.get('x-forwarded-for') ?? '')
    .split(',')
    .map((s) => stripPort(s.trim()))
    .filter(Boolean);
  const ip = chain.length >= hops ? chain[chain.length - hops] : undefined;
  if (!ip || !isIp(ip)) return 'unknown';
  if (isIP(ip) === 4) return ip;
  const v6 = ip.replace(/%.*$/, '').toLowerCase(); // drop a zone id ("fe80::1%eth0")
  // "::ffff:203.0.113.7" (or "::ffff:cb00:7107") is an IPv4 visitor seen through an IPv6 socket
  const g = ipv6Groups(v6);
  if (g.slice(0, 5).every((n) => n === 0) && g[5] === 0xffff) return [g[6] >> 8, g[6] & 255, g[7] >> 8, g[7] & 255].join('.');
  return v6;
}

/** The eight 16-bit groups of a valid IPv6 address, with "::" and an embedded IPv4 tail expanded. */
function ipv6Groups(ip: string): number[] {
  let s = ip;
  const v4 = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(s);
  if (v4) {
    const [a, b, c, d] = v4.slice(1).map(Number);
    s = `${s.slice(0, v4.index)}${((a << 8) | b).toString(16)}:${((c << 8) | d).toString(16)}`;
  }
  const [head, tail] = s.split('::');
  const left = head ? head.split(':') : [];
  const right = tail ? tail.split(':') : [];
  const fill = s.includes('::') ? Array<string>(Math.max(0, 8 - left.length - right.length)).fill('0') : [];
  return [...left, ...fill, ...right].map((x) => parseInt(x, 16));
}

/** "203.0.113.7:51234" → "203.0.113.7", "[2001:db8::1]:443" → "2001:db8::1" */
function stripPort(s: string): string {
  const v6 = /^\[([0-9a-f:.]+)\](?::\d+)?$/i.exec(s);
  if (v6) return v6[1];
  const v4 = /^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/.exec(s);
  return v4 ? v4[1] : s;
}

const isIp = (s: string) => isIP(s) !== 0;

/**
 * Key used for rate limiting. IPv6 visitors are grouped by their /64 network, since
 * one connection usually controls the whole /64 and could otherwise rotate addresses.
 */
export function rateLimitKey(ip: string): string {
  if (!ip.includes(':')) return ip;
  return `${ipv6Groups(ip.toLowerCase())
    .slice(0, 4)
    .map((n) => n.toString(16))
    .join(':')}::/64`;
}

/** "Chrome on Windows", "Safari on iOS" — short and readable for the signed PDF. */
export function describeDevice(userAgent: string | null): string {
  const ua = userAgent ?? '';
  if (!ua) return 'Unknown device';
  const browser =
    /Edg(e|A|iOS)?\//.test(ua) ? 'Edge'
    : /OPR\/|Opera/.test(ua) ? 'Opera'
    : /SamsungBrowser\//.test(ua) ? 'Samsung Internet'
    : /Firefox\/|FxiOS\//.test(ua) ? 'Firefox'
    : /Chrome\/|CriOS\//.test(ua) ? 'Chrome'
    : /Safari\//.test(ua) && /Version\//.test(ua) ? 'Safari'
    : 'Unknown browser';
  const os =
    /iPhone|iPad|iPod/.test(ua) ? 'iOS'
    : /Android/.test(ua) ? 'Android'
    : /CrOS/.test(ua) ? 'ChromeOS'
    : /Windows/.test(ua) ? 'Windows'
    : /Mac OS X|Macintosh/.test(ua) ? 'Mac OS'
    : /Linux/.test(ua) ? 'Linux'
    : 'Unknown OS';
  return `${browser} on ${os}`;
}

export type OriginCheck = { ok: true } | { ok: false; origin: string; host: string };

/**
 * Blocks form posts made from other websites. Requests without an Origin header
 * (server-to-server tools, very old browsers) are let through; they still go
 * through validation and rate limiting.
 */
export function checkOrigin(headers: Headers): OriginCheck {
  const origin = headers.get('origin');
  if (!origin) return { ok: true };
  // X-Forwarded-Host only means something when a proxy we trust put it there
  const forwarded = trustedProxyHops() > 0 ? headers.get('x-forwarded-host') : null;
  const host = (forwarded ?? headers.get('host') ?? '').split(',')[0].trim().toLowerCase();
  let originHost: string;
  try {
    originHost = new URL(origin).host.toLowerCase();
  } catch {
    return { ok: false, origin: origin.slice(0, 100), host };
  }
  if (host && originHost === host) return { ok: true };
  if (allowedOrigins().includes(origin.toLowerCase().replace(/\/$/, ''))) return { ok: true };
  return { ok: false, origin: origin.slice(0, 100), host };
}

export const isSameOrigin = (headers: Headers) => checkOrigin(headers).ok;

export class BodyTooLargeError extends Error {}
export class BodyTimeoutError extends Error {}

type BodyLimits = {
  /** the whole body must have arrived by then */
  totalMs?: number;
  /** longest wait for the next bytes */
  idleMs?: number;
  /** from `windowMs` after the first byte, every `windowMs` must bring at least this speed */
  minBytesPerSec?: number;
  windowMs?: number;
};

/**
 * Reads the request body but stops (and throws) once it passes `maxBytes`, or when it arrives
 * too slowly: not complete within `totalMs`, nothing at all for `idleMs`, or (from `windowMs`
 * after the first byte) less than `minBytesPerSec` over the last `windowMs`. The speed is
 * measured over a moving window, so a burst at the start cannot pay for a long drip afterwards.
 * A real upload, even on a poor connection with short pauses, is far faster than the minimum.
 */
export async function readBodyWithLimit(
  request: Request,
  maxBytes: number,
  { totalMs = 60_000, idleMs = 20_000, minBytesPerSec = 2 * 1024, windowMs = 20_000 }: BodyLimits = {},
): Promise<Uint8Array> {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) throw new BodyTooLargeError();
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const deadline = Date.now() + totalMs;
  const perWindow = (minBytesPerSec * windowMs) / 1000;
  // running total after each chunk, oldest first (older than one window is pruned)
  const arrivals: { at: number; total: number }[] = [];
  let firstByteAt: number | null = null;
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      const now = Date.now();
      let tooSlowAt = Infinity;
      if (firstByteAt !== null) {
        // If nothing more arrives, the window ending at t fails once the chunks that arrived
        // before t - windowMs already account for more than total - perWindow.
        const k = total < perWindow ? undefined : arrivals.find((a) => a.total > total - perWindow);
        tooSlowAt = Math.max(firstByteAt + windowMs, k ? k.at + windowMs : 0);
      }
      timer = setTimeout(() => reject(new BodyTimeoutError()), Math.max(0, Math.min(idleMs, deadline - now, tooSlowAt - now)));
    });
    let chunk: ReadableStreamReadResult<Uint8Array>;
    try {
      chunk = await Promise.race([reader.read(), timeout]);
    } catch (err) {
      // don't wait for the cancel: on a stalled socket it may never settle
      void reader.cancel().catch(() => {});
      throw err;
    } finally {
      clearTimeout(timer);
    }
    const { done, value } = chunk;
    if (done) break;
    total += value.byteLength;
    const now = Date.now();
    firstByteAt ??= now;
    arrivals.push({ at: now, total });
    while (arrivals.length > 1 && arrivals[1].at <= now - windowMs) arrivals.shift();
    if (total > maxBytes) {
      void reader.cancel().catch(() => {});
      throw new BodyTooLargeError();
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.byteLength;
  }
  return out;
}
