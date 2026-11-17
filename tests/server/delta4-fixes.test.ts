import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { applySchema } from '@/lib/forms/apply-schema';
import { postFormData } from '@/lib/forms/client';
import { homeQuoteSchema, quoteRequestSchema } from '@/lib/forms/quote-schema';
import { applyGate, applyLimiter, applyPerVisitor, applyReadGate, applySubmissions, handleApply } from '@/server/handlers/apply';
import { resetMailTransport } from '@/server/mail/send';
import { BodyTimeoutError, readBodyWithLimit } from '@/server/request';
import { signatureDataUrl, validApplication, validHomeQuote, validQuoteRequest } from '../helpers/fixtures';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

// Regression tests for the third delta review (numbers follow its report).

const cp = (n: number) => String.fromCodePoint(n);
const LRE = cp(0x202a);
const PDF_MARK = cp(0x202c);
const LRM = cp(0x200e);
const RLM = cp(0x200f);
const FSI = cp(0x2068);
const PDI = cp(0x2069);

let sink: Sink;
const savedEnv = { ...process.env };
beforeAll(async () => {
  sink = await startSmtpSink();
});
afterAll(async () => {
  await sink.close();
});
beforeEach(() => {
  Object.assign(process.env, mailEnv(sink.port));
  sink.messages.length = 0;
  applyLimiter.reset();
  applySubmissions.reset();
  applyPerVisitor.reset();
  applyReadGate.reset();
  applyGate.reset();
  resetMailTransport();
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = { ...savedEnv };
  vi.restoreAllMocks();
});

const headers = (ip: string) => ({ host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': ip });

function dripping(stalled: ReadableStreamDefaultController<Uint8Array>[], ip: string) {
  const body = new ReadableStream<Uint8Array>({ start: (c) => void stalled.push(c) });
  return handleApply(
    new Request('http://localhost/api/apply', {
      method: 'POST',
      body,
      duplex: 'half',
      headers: { ...headers(ip), 'content-type': 'multipart/form-data; boundary=x' },
    } as RequestInit),
  );
}

function complete(ip: string) {
  const form = new FormData();
  form.append('payload', JSON.stringify({ idempotencyKey: `ready-${ip.replaceAll(".", "-")}-${Date.now()}-abc`, honeypot: '', fields: validApplication(), signature: signatureDataUrl() }));
  return handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: form, headers: headers(ip) }));
}

describe('#1: uploads still arriving cannot block applications that are ready', () => {
  it('4 dripping uploads from 2 addresses; a complete application from a third is still sent', async () => {
    const stalled: ReadableStreamDefaultController<Uint8Array>[] = [];
    const held = ['198.51.100.1', '198.51.100.1', '198.51.100.2', '198.51.100.2'].map((ip) => dripping(stalled, ip));
    await new Promise((r) => setTimeout(r, 20));

    const ready = await complete('203.0.113.60');
    expect(ready.status).toBe(200);
    expect(sink.messages).toHaveLength(1);

    for (const c of stalled) c.error(new Error('client went away'));
    await Promise.all(held);
    expect(applyReadGate.active).toBe(0);
    expect(applyGate.active).toBe(0);
  });

  it('the number of uploads held in memory is still bounded (8)', async () => {
    const stalled: ReadableStreamDefaultController<Uint8Array>[] = [];
    const held = Array.from({ length: 8 }, (_, i) => dripping(stalled, `198.51.100.${10 + i}`));
    await new Promise((r) => setTimeout(r, 20));

    const ninth = await dripping(stalled, '198.51.100.99');
    expect(ninth.status).toBe(503);

    for (const c of stalled) c.error(new Error('client went away'));
    await Promise.all(held);
    expect(applyReadGate.active).toBe(0);
  });
});

describe('#1: a drip just above the old 1 KB/s minimum is dropped', () => {
  it('1.5 KB/s is too slow by default once the first window is over', async () => {
    const drip = new ReadableStream<Uint8Array>({
      async pull(c) {
        await new Promise((r) => setTimeout(r, 50));
        c.enqueue(new Uint8Array(75)); // 1.5 KB/s, forever
      },
    });
    const req = new Request('http://x', { method: 'POST', body: drip, duplex: 'half' } as RequestInit);
    const started = Date.now();
    await expect(readBodyWithLimit(req, 1_000_000, { windowMs: 300, idleMs: 5_000, totalMs: 20_000 })).rejects.toBeInstanceOf(BodyTimeoutError);
    expect(Date.now() - started).toBeLessThan(2_000);
  });
});

describe('#3: "upload too slow" only when statements are attached', () => {
  it('a late connection failure without files is a plain network problem', async () => {
    const now = vi.spyOn(Date, 'now');
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    try {
      now.mockReturnValueOnce(0).mockReturnValueOnce(30_000);
      expect(await postFormData('/api/apply', new FormData())).toEqual({ ok: false, error: 'network' });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('#4: invisible marks that phones add around pasted numbers and emails', () => {
  it.each([`${LRE}(562) 555-0199${PDF_MARK}`, `${LRM}562-555-0199`, `${FSI}562 555 0199${PDI}`])('phone %j is accepted', (phone) => {
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), phone }).success).toBe(true);
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), phone }).success).toBe(true);
    expect(applySchema.safeParse({ ...validApplication(), phone, biz_phone: phone }).success).toBe(true);
  });

  it('an email wrapped in direction marks is accepted and stored clean', () => {
    const email = `${RLM}jordan@mapleridgebakery.com${LRM}`;
    expect(applySchema.safeParse({ ...validApplication(), email }).data?.email).toBe('jordan@mapleridgebakery.com');
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), email }).data?.email).toBe('jordan@mapleridgebakery.com');
  });

  it('names still refuse direction-override characters', () => {
    expect(applySchema.safeParse({ ...validApplication(), first_name: `${cp(0x202e)}Jordan` }).success).toBe(false);
  });
});
