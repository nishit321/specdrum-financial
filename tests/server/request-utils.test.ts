import { afterEach, describe, expect, it } from 'vitest';
import { createIdempotencyStore } from '@/server/idempotency';
import { createRateLimiter } from '@/server/rate-limit';
import { newReference } from '@/server/reference';
import { BodyTooLargeError, clientIp, describeDevice, isSameOrigin, readBodyWithLimit } from '@/server/request';
import { decodeSignature, safeFileName, sniffUpload } from '@/server/uploads';
import { minimalPdf, signatureDataUrl, tinyPng } from '../helpers/fixtures';

const h = (init: Record<string, string>) => new Headers(init);

describe('clientIp', () => {
  it('takes the address added by the trusted proxy, not what the client wrote', () => {
    // client spoofs "1.1.1.1"; the ALB appends the real address
    expect(clientIp(h({ 'x-forwarded-for': '1.1.1.1, 203.0.113.7' }), 1)).toBe('203.0.113.7');
    // CloudFront + ALB
    expect(clientIp(h({ 'x-forwarded-for': '1.1.1.1, 203.0.113.7, 10.0.0.5' }), 2)).toBe('203.0.113.7');
  });

  it('falls back safely', () => {
    expect(clientIp(h({}), 1)).toBe('unknown');
    expect(clientIp(h({ 'x-forwarded-for': 'garbage<script>' }), 1)).toBe('unknown');
    // X-Real-IP can be sent by the client itself, so it is never trusted
    expect(clientIp(h({ 'x-real-ip': '198.51.100.4' }), 1)).toBe('unknown');
    expect(clientIp(h({ 'x-forwarded-for': '203.0.113.7' }), 0)).toBe('unknown');
    expect(clientIp(h({ 'x-forwarded-for': '2001:db8::1' }), 1)).toBe('2001:db8::1');
  });
});

describe('describeDevice', () => {
  it.each([
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36', 'Chrome on Mac OS'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36 Edg/130.0', 'Edge on Windows'],
    ['Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', 'Safari on iOS'],
    ['Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0 Mobile Safari/537.36', 'Samsung Internet on Android'],
    ['Mozilla/5.0 (X11; Linux x86_64; rv:131.0) Gecko/20100101 Firefox/131.0', 'Firefox on Linux'],
    ['curl/8.0', 'Unknown browser on Unknown OS'],
  ])('%s', (ua, expected) => {
    expect(describeDevice(ua)).toBe(expected);
  });

  it('handles a missing user agent', () => {
    expect(describeDevice(null)).toBe('Unknown device');
  });
});

describe('isSameOrigin', () => {
  afterEach(() => {
    delete process.env.ALLOWED_ORIGINS;
  });

  it('allows the site itself and requests without Origin', () => {
    expect(isSameOrigin(h({ origin: 'https://spectrumbusinessfinance.com', host: 'spectrumbusinessfinance.com' }))).toBe(true);
    expect(isSameOrigin(h({ origin: 'https://www.x.com', host: 'internal-alb', 'x-forwarded-host': 'www.x.com' }))).toBe(true);
    expect(isSameOrigin(h({ host: 'spectrumbusinessfinance.com' }))).toBe(true);
  });

  it('blocks other websites and broken origins', () => {
    expect(isSameOrigin(h({ origin: 'https://evil.example', host: 'spectrumbusinessfinance.com' }))).toBe(false);
    expect(isSameOrigin(h({ origin: 'null', host: 'spectrumbusinessfinance.com' }))).toBe(false);
  });

  it('allows extra origins from ALLOWED_ORIGINS', () => {
    process.env.ALLOWED_ORIGINS = 'https://www.spectrumbusinessfinance.com/';
    expect(isSameOrigin(h({ origin: 'https://www.spectrumbusinessfinance.com', host: 'internal' }))).toBe(true);
  });
});

describe('readBodyWithLimit', () => {
  it('reads a body under the limit', async () => {
    const body = await readBodyWithLimit(new Request('http://x', { method: 'POST', body: 'hello' }), 10);
    expect(new TextDecoder().decode(body)).toBe('hello');
  });

  it('rejects from Content-Length before reading', async () => {
    const req = new Request('http://x', { method: 'POST', body: 'x', headers: { 'content-length': '999999' } });
    await expect(readBodyWithLimit(req, 10)).rejects.toBeInstanceOf(BodyTooLargeError);
  });

  it('rejects a streamed body that grows past the limit', async () => {
    const stream = new ReadableStream({
      start(c) {
        for (let i = 0; i < 5; i++) c.enqueue(new Uint8Array(8));
        c.close();
      },
    });
    const req = new Request('http://x', { method: 'POST', body: stream, duplex: 'half' } as RequestInit);
    await expect(readBodyWithLimit(req, 20)).rejects.toBeInstanceOf(BodyTooLargeError);
  });
});

describe('rate limiter', () => {
  it('allows the limit then asks to wait, and frees up after the window', () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 1000 });
    expect(rl.hit('a', 0)).toBe(0);
    expect(rl.hit('a', 10)).toBe(0);
    expect(rl.hit('a', 20)).toBe(1);
    expect(rl.hit('b', 20)).toBe(0); // other visitors unaffected
    expect(rl.hit('a', 1001)).toBe(0);
  });
});

describe('idempotency store', () => {
  it('runs the work once per key, even for concurrent calls', async () => {
    const store = createIdempotencyStore<string>({ ttlMs: 1000 });
    let runs = 0;
    const work = async () => {
      runs++;
      await new Promise((r) => setTimeout(r, 20));
      return 'ref-1';
    };
    const [a, b] = await Promise.all([store.run('k', 'f', work), store.run('k', 'f', work)]);
    expect([a, b, runs]).toEqual(['ref-1', 'ref-1', 1]);
    expect(await store.run('k', 'f', work)).toBe('ref-1');
    expect(runs).toBe(1);
  });

  it('forgets a failed run so the person can retry', async () => {
    const store = createIdempotencyStore<string>({ ttlMs: 1000 });
    await expect(store.run('k', 'f', async () => Promise.reject(new Error('smtp down')))).rejects.toThrow('smtp down');
    await new Promise((r) => setTimeout(r, 0));
    expect(await store.run('k', 'f', async () => 'ok')).toBe('ok');
  });

  it('expires keys after the TTL', async () => {
    const store = createIdempotencyStore<number>({ ttlMs: 100 });
    expect(await store.run('k', 'f', async () => 1, 0)).toBe(1);
    expect(await store.run('k', 'f', async () => 2, 50)).toBe(1);
    expect(await store.run('k', 'f', async () => 3, 101)).toBe(3);
  });
});

describe('references', () => {
  it('look like SBF-2026-XXXXXX without confusable characters and do not repeat', () => {
    const refs = new Set(Array.from({ length: 500 }, () => newReference('SBF', new Date('2026-05-01T00:00:00Z'))));
    expect(refs.size).toBe(500);
    for (const r of refs) expect(r).toMatch(/^SBF-2026-[A-HJ-NP-Z2-9]{6}$/);
  });
});

describe('uploads', () => {
  it('recognises PDF, PNG and JPEG by content, not by name', () => {
    expect(sniffUpload(minimalPdf())).toBe('pdf');
    expect(sniffUpload(tinyPng())).toBe('png');
    expect(sniffUpload(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe('jpg');
    expect(sniffUpload(Buffer.from('MZ\x90\x00 windows exe'))).toBeNull();
    expect(sniffUpload(Buffer.from('<html><script>'))).toBeNull();
    expect(sniffUpload(new Uint8Array())).toBeNull();
  });

  it('cleans attachment names and fixes the extension', () => {
    expect(safeFileName('../../etc/passwd.pdf', 'pdf', 'x')).toBe('etcpasswd.pdf');
    expect(safeFileName('Statement Oct 2026.PDF', 'pdf', 'x')).toBe('Statement Oct 2026.pdf');
    expect(safeFileName('photo.jpeg', 'jpg', 'x')).toBe('photo.jpg');
    expect(safeFileName('évidence™.png', 'png', 'x')).toBe('evidenceTM.png');
    expect(safeFileName('<>.pdf', 'pdf', 'bank-statement-1')).toBe('bank-statement-1.pdf');
    expect(safeFileName('...pdf', 'pdf', 'bank-statement-2')).toBe('bank-statement-2.pdf');
    expect(safeFileName('-rf statement.pdf', 'pdf', 'x')).toBe('rf statement.pdf');
  });

  it('accepts only a PNG data URL as the signature', () => {
    expect(decodeSignature(signatureDataUrl())).not.toBeNull();
    expect(decodeSignature('data:image/svg+xml;base64,PHN2Zz4=')).toBeNull();
    expect(decodeSignature(`data:image/png;base64,${minimalPdf().toString('base64')}`)).toBeNull();
    expect(decodeSignature('data:image/png;base64,!!!')).toBeNull();
    expect(decodeSignature(`data:image/png;base64,${'A'.repeat(700_000)}`)).toBeNull();
    expect(decodeSignature(42)).toBeNull();
    expect(decodeSignature(undefined)).toBeNull();
  });
});
