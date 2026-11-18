import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { applySchema } from '@/lib/forms/apply-schema';
import { postFormData } from '@/lib/forms/client';
import { homeQuoteSchema, quoteRequestSchema } from '@/lib/forms/quote-schema';
import { ConfigError, mailConfig } from '@/server/config';
import { createKeyedGate } from '@/server/guard';
import { applyGate, applyLimiter, applyPerVisitor, applyReadGate, applySubmissions, handleApply } from '@/server/handlers/apply';
import { resetMailTransport } from '@/server/mail/send';
import { BodyTimeoutError, readBodyWithLimit } from '@/server/request';
import { signatureDataUrl, validApplication, validHomeQuote, validQuoteRequest } from '../helpers/fixtures';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

// Regression tests for the second delta review (letters follow its report).

const NBSP = String.fromCodePoint(0xa0);
const NNBSP = String.fromCodePoint(0x202f);
const ZWSP = String.fromCodePoint(0x200b);

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
  resetMailTransport();
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = { ...savedEnv };
  vi.restoreAllMocks();
});

describe('A: a slow upload cut off by the server gets the slow-upload message', () => {
  it('a dropped connection late in an upload is reported as too slow, an early one as a network problem', async () => {
    const now = vi.spyOn(Date, 'now');
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('Failed to fetch'))));
    try {
      const withStatement = new FormData();
      withStatement.append('files', new File([new Uint8Array(10)], 'march.pdf', { type: 'application/pdf' }));
      now.mockReturnValueOnce(0).mockReturnValueOnce(61_000);
      expect(await postFormData('/api/apply', withStatement)).toEqual({ ok: false, error: 'slow_upload' });
      now.mockReturnValueOnce(0).mockReturnValueOnce(300);
      expect(await postFormData('/api/apply', new FormData())).toEqual({ ok: false, error: 'network' });
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('B: a dripping upload cannot hold the application slots', () => {
  it('a body slower than the minimum average speed is dropped soon after the grace period', async () => {
    const drip = new ReadableStream<Uint8Array>({
      async pull(c) {
        await new Promise((r) => setTimeout(r, 40));
        c.enqueue(new Uint8Array(1)); // never idle, but far too slow
      },
    });
    const req = new Request('http://x', { method: 'POST', body: drip, duplex: 'half' } as RequestInit);
    const started = Date.now();
    await expect(readBodyWithLimit(req, 10_000, { totalMs: 20_000, idleMs: 5_000, minBytesPerSec: 200, windowMs: 300 })).rejects.toBeInstanceOf(
      BodyTimeoutError,
    );
    expect(Date.now() - started).toBeLessThan(2_000);
  });

  it('a body at a normal speed is read in full', async () => {
    let sent = 0;
    const steady = new ReadableStream<Uint8Array>({
      async pull(c) {
        if (sent >= 10) return c.close();
        await new Promise((r) => setTimeout(r, 30));
        sent++;
        c.enqueue(new Uint8Array(500));
      },
    });
    const req = new Request('http://x', { method: 'POST', body: steady, duplex: 'half' } as RequestInit);
    const body = await readBodyWithLimit(req, 10_000, { totalMs: 20_000, idleMs: 5_000, minBytesPerSec: 1_000, windowMs: 100 });
    expect(body.byteLength).toBe(5_000);
  });

  it('one visitor can hold at most 2 slots; others still get through', async () => {
    const gate = createKeyedGate(2);
    const a1 = gate.tryEnter('a');
    const a2 = gate.tryEnter('a');
    expect(a1 && a2).toBeTruthy();
    expect(gate.tryEnter('a')).toBeNull();
    expect(gate.tryEnter('b')).not.toBeNull();
    a1!();
    a1!(); // releasing twice frees only one slot
    expect(gate.tryEnter('a')).not.toBeNull();
    expect(gate.tryEnter('a')).toBeNull();
  });

  it('in the API: a third parallel upload from one address is turned away at once, another address is not', async () => {
    applyPerVisitor.reset();
    applyReadGate.reset();
    applyGate.reset();
    const stalled: ReadableStreamDefaultController<Uint8Array>[] = [];
    const post = (ip: string, body: BodyInit) =>
      handleApply(
        new Request('http://localhost/api/apply', {
          method: 'POST',
          body,
          duplex: 'half',
          headers: { host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': ip, 'content-type': 'multipart/form-data; boundary=x' },
        } as RequestInit),
      );
    const dripping = () => new ReadableStream<Uint8Array>({ start: (c) => void stalled.push(c) });
    const held = [post('198.51.100.1', dripping()), post('198.51.100.1', dripping())];
    await new Promise((r) => setTimeout(r, 20));

    const third = await post('198.51.100.1', dripping());
    expect(third.status).toBe(503);
    expect((await third.json()).error).toBe('busy');

    const form = new FormData();
    form.append('payload', JSON.stringify({ idempotencyKey: `other-visitor-${Date.now()}-abc`, honeypot: '', fields: validApplication(), signature: signatureDataUrl() }));
    const other = await handleApply(
      new Request('http://localhost/api/apply', { method: 'POST', body: form, headers: { host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '203.0.113.50' } }),
    );
    expect(other.status).toBe(200);

    for (const c of stalled) c.error(new Error('client went away'));
    await Promise.all(held);
    expect(applyGate.active).toBe(0);
    expect(applyReadGate.active).toBe(0);
  });
});

describe('D: phone numbers pasted with special spaces are accepted', () => {
  it.each([`562${NBSP}555-0199`, `(562)${NNBSP}555-0199`, '562\t555 0199'])('%s', (phone) => {
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), phone }).success).toBe(true);
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), phone }).success).toBe(true);
    expect(applySchema.safeParse({ ...validApplication(), phone, biz_phone: phone }).success).toBe(true);
  });

  it('a line break still is not', () => {
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), phone: '562\n5550199' }).success).toBe(false);
  });
});

describe('E, F: invisible pasted characters', () => {
  it('an email with a zero-width space is accepted and stored without it, on every form', () => {
    const email = `jordan@mapleridgebakery.com${ZWSP}`;
    expect(applySchema.safeParse({ ...validApplication(), email }).data?.email).toBe('jordan@mapleridgebakery.com');
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), email }).data?.email).toBe('jordan@mapleridgebakery.com');
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), email }).data?.email).toBe('jordan@mapleridgebakery.com');
  });

  it('a name made only of invisible characters counts as empty on the quote forms', () => {
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), name: ZWSP.repeat(3) }).success).toBe(false);
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), business: ZWSP }).success).toBe(false);
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), first_name: ZWSP }).success).toBe(false);
  });
});

describe('G: a website whose domain the PDF font cannot print', () => {
  it('is accepted and kept in its ASCII form', () => {
    const r = applySchema.safeParse({ ...validApplication(), website: 'https://卸ッ.jp/menu' });
    expect(r.success).toBe(true);
    expect(r.data!.website).toMatch(/^https:\/\/xn--[a-z0-9-]+\.jp\/menu$/);
  });

  it('a printable one is kept as typed', () => {
    expect(applySchema.safeParse({ ...validApplication(), website: 'www.café.com' }).data?.website).toBe('www.café.com');
  });
});

describe('I: MAIL_TO and MAIL_FROM fail closed on garbled entries', () => {
  const env = (patch: Record<string, string>) => ({ ...mailEnv(2525), ...patch });

  it.each(['"Unbalanced <a@x.com>', 'Owner <o@x.com> <p@y.com>', 'Owner <o@x.com', 'o@x.com>', '<>'])('MAIL_TO %s', (to) => {
    expect(() => mailConfig(env({ MAIL_TO: to }))).toThrow(ConfigError);
  });

  it('MAIL_FROM with an unclosed quote', () => {
    expect(() => mailConfig(env({ MAIL_FROM: '"Spectrum <no-reply@x.com>' }))).toThrow(ConfigError);
  });

  it('valid forms still work', () => {
    expect(mailConfig(env({ MAIL_TO: 'Owner <o@x.com>, "Doe, Jane" <j@x.com>, ops@x.com' })).to).toHaveLength(3);
    expect(mailConfig(env({ MAIL_FROM: 'Spectrum Financial Website <no-reply@spectrumbusinessfinance.com>' })).from).toContain('no-reply@');
  });
});
