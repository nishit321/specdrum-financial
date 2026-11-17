import { deflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { applySchema } from '@/lib/forms/apply-schema';
import { quoteRequestSchema } from '@/lib/forms/quote-schema';
import { createRateLimiter } from '@/server/rate-limit';
import { BodyTimeoutError, clientIp, rateLimitKey, readBodyWithLimit } from '@/server/request';
import { decodeSignature } from '@/server/uploads';
import { validApplication, validQuoteRequest } from '../helpers/fixtures';
import { asDataUrl, makePng } from '../helpers/png';

// Regression tests for the delta review of the first fix round.

describe('a slow upload cannot hold a processing slot (delta #2)', () => {
  it('gives up when the body has not fully arrived in time', async () => {
    const never = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(10)); // a few bytes, then nothing
      },
    });
    const req = new Request('http://x', { method: 'POST', body: never, duplex: 'half' } as RequestInit);
    const started = Date.now();
    await expect(readBodyWithLimit(req, 1000, { totalMs: 150 })).rejects.toBeInstanceOf(BodyTimeoutError);
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it('still reads a normal body', async () => {
    const body = await readBodyWithLimit(new Request('http://x', { method: 'POST', body: 'hello' }), 100, { totalMs: 150 });
    expect(new TextDecoder().decode(body)).toBe('hello');
  });
});

describe('IPv4 seen through an IPv6 socket (delta #6)', () => {
  it('is treated as the IPv4 address, not one shared IPv6 bucket', () => {
    const ip = clientIp(new Headers({ 'x-forwarded-for': '::ffff:203.0.113.7' }), 1);
    expect(ip).toBe('203.0.113.7');
    expect(rateLimitKey(ip)).toBe('203.0.113.7');
    expect(rateLimitKey(clientIp(new Headers({ 'x-forwarded-for': '::ffff:198.51.100.9' }), 1))).not.toBe(rateLimitKey(ip));
  });
});

describe('rate limiter undo', () => {
  it('gives back the last hit', () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(rl.hit('k', 0)).toBe(0);
    expect(rl.hit('k', 1)).toBeGreaterThan(0);
    rl.undo('k');
    expect(rl.hit('k', 2)).toBe(0);
  });
});

describe('PNG rows must use a real filter type (delta #7)', () => {
  it('rejects filter bytes above 4', () => {
    const width = 20;
    const height = 4;
    // RGB zeros = black pixels, so the image has enough ink to pass once the filter is valid
    const rows = Buffer.alloc(height * (1 + width * 3));
    rows[0] = 9; // invalid filter type on the first row
    expect(decodeSignature(asDataUrl(makePng({ width, height, colorType: 2, idat: deflateSync(rows) })))).toBeNull();
    rows[0] = 4;
    expect(decodeSignature(asDataUrl(makePng({ width, height, colorType: 2, idat: deflateSync(rows) })))).not.toBeNull();
  });
});

describe('pasted names in decomposed form (delta #10)', () => {
  it('accepts "José" typed as e + combining accent and stores the composed form', () => {
    const decomposed = 'Jose\u0301'; // e + combining acute accent
    const parsed = applySchema.safeParse({ ...validApplication(), first_name: decomposed });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.first_name).toBe('José');
  });
});

describe('invisible line breaks and text-reversing characters in single-line fields (delta #11)', () => {
  it.each(['\u2028', '\u2029', '\u0085', '\u202e', '\u2066'])('rejects U+%s in a name', (ch) => {
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), first_name: `Priya${ch}Shah` }).success).toBe(false);
  });
});
