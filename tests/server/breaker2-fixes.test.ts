import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import sitemap from '@/app/sitemap';
import { submitErrorMessage } from '@/lib/forms/client';
import { homeQuoteSchema, quoteRequestSchema } from '@/lib/forms/quote-schema';
import { createGate } from '@/server/guard';
import { applyGate, applyGlobalLimiter, applyLimiter, applyPerVisitor, applyReadGate, applySubmissions, handleApply } from '@/server/handlers/apply';
import { handleQuote, quoteGlobalLimiter, quoteLimiter, quoteSubmissions } from '@/server/handlers/quote';
import { resetMailTransport } from '@/server/mail/send';
import { signatureDataUrl, validApplication, validHomeQuote, validQuoteRequest } from '../helpers/fixtures';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

// Regression tests for the second breaker run (numbers follow its report).

const cp = (n: number) => String.fromCodePoint(n);
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

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
  for (const s of [applyLimiter, applyGlobalLimiter, quoteLimiter, quoteGlobalLimiter, applySubmissions, quoteSubmissions, applyPerVisitor, applyReadGate, applyGate]) s.reset();
  resetMailTransport();
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = { ...savedEnv };
  vi.restoreAllMocks();
});

const applyForm = (key: string) => {
  const form = new FormData();
  form.append('payload', JSON.stringify({ idempotencyKey: key, honeypot: '', fields: validApplication(), signature: signatureDataUrl() }));
  return form;
};
const headers = (ip: string) => ({ host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': ip });

describe('#1: a visitor who leaves while waiting for a slot is not mailed', () => {
  it('the gate drops a waiter whose signal aborts, and does not hand it a slot later', async () => {
    const gate = createGate(1);
    const held = gate.tryEnter()!;
    const ac = new AbortController();
    const waiting = gate.enter(10_000, ac.signal);
    expect(gate.waiting).toBe(1);
    ac.abort();
    expect(await waiting).toBeNull();
    expect(gate.waiting).toBe(0);
    held();
    expect(gate.active).toBe(0);
  });

  it('in the API: the application is dropped, no email, no slot kept', async () => {
    const busy = [1, 2, 3, 4].map(() => applyGate.tryEnter()!);
    const ac = new AbortController();
    const pending = handleApply(
      new Request('http://localhost/api/apply', { method: 'POST', body: applyForm(`left-the-page-${Date.now()}-abc`), headers: headers('203.0.113.80'), signal: ac.signal }),
    );
    await wait(300);
    expect(applyGate.waiting).toBe(1);
    ac.abort(); // the visitor closed the tab
    await pending;
    busy.forEach((r) => r());
    await wait(200);
    expect(sink.messages).toHaveLength(0);
    expect(applyGate.active).toBe(0);
    expect(applyGate.waiting).toBe(0);
  });
});

describe('#16: "busy" on our side does not use up the visitor\'s attempts', () => {
  it('apply: 6 tries while every upload slot is taken all get "busy", never "too many requests"', async () => {
    const taken = Array.from({ length: 8 }, () => applyReadGate.tryEnter()!);
    for (let i = 0; i < 6; i++) {
      const res = await handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: applyForm(`busy-try-${i}-${Date.now()}-abc`), headers: headers('203.0.113.81') }));
      expect(res.status).toBe(503);
    }
    taken.forEach((r) => r());
    const res = await handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: applyForm(`after-busy-${Date.now()}-abc`), headers: headers('203.0.113.81') }));
    expect(res.status).toBe(200);
  });

  const quote = (ip: string, i: number) =>
    handleQuote(
      new Request('http://localhost/api/quote', {
        method: 'POST',
        headers: { ...headers(ip), 'content-type': 'application/json' },
        body: JSON.stringify({ form: 'home-quote', idempotencyKey: `quote-busy-${i}-${Date.now()}-abc`, honeypot: '', data: validHomeQuote() }),
      }),
    );

  it('quote: 9 tries while the mail settings are missing all get "not configured", never "too many requests"', async () => {
    delete process.env.MAIL_TO;
    for (let i = 0; i < 9; i++) expect((await quote('203.0.113.82', i)).status).toBe(503);
  });

  // delta review 6, #1: refunding this one would let one address repeat a full read and check
  // as often as it likes while the all-visitors limit is full
  it('the all-visitors limit still counts against the visitor', async () => {
    for (let i = 0; i < 60; i++) quoteGlobalLimiter.hit('all');
    for (let i = 0; i < 8; i++) expect((await quote('203.0.113.83', i)).status).toBe(503);
    expect((await quote('203.0.113.83', 8)).status).toBe(429);

    for (let i = 0; i < 30; i++) applyGlobalLimiter.hit('all');
    for (let i = 0; i < 5; i++) {
      const res = await handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: applyForm(`global-full-${i}-${Date.now()}-abc`), headers: headers('203.0.113.84') }));
      expect(res.status).toBe(503);
    }
    const sixth = await handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: applyForm(`global-full-6-${Date.now()}-abc`), headers: headers('203.0.113.84') }));
    expect(sixth.status).toBe(429);
  });
});

describe('#13: one honest message for an upload that did not finish', () => {
  it('says the connection may be slow or may have dropped, and offers the email route', () => {
    const text = submitErrorMessage({ ok: false, error: 'slow_upload' });
    expect(text).toMatch(/didn't finish/);
    expect(text).toMatch(/dropped/);
    expect(text).toMatch(/info@spectrumbusinessfinance\.com/);
  });
});

describe('#15: phone numbers pasted with typographic dashes, wide spaces or full-width digits', () => {
  const fullWidth = (s: string) => [...s].map((c) => (/\d/.test(c) ? cp(0xff10 + Number(c)) : c)).join('');
  it.each([
    `562${cp(0x2013)}555${cp(0x2013)}0199`, // en dash
    `562${cp(0x2011)}555${cp(0x2011)}0199`, // non-breaking hyphen
    `562${cp(0x2212)}555${cp(0x2212)}0199`, // minus sign
    `(562)${cp(0x2009)}555-0199`, // thin space
    `562${cp(0x3000)}555${cp(0x3000)}0199`, // ideographic space
    fullWidth('(562) 555-0199'),
  ])('%j is accepted on both quote forms', (phone) => {
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), phone }).success).toBe(true);
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), phone }).success).toBe(true);
  });
});

describe('#8: the sitemap carries the date the copy changed', () => {
  it('lastmod is the date of the last content change on every page', () => {
    // 2026-11-16: client copy changes; 2026-11-21: loan calculator page
    expect(sitemap().every((e) => String(e.lastModified) === '2026-11-21')).toBe(true);
  });
});
