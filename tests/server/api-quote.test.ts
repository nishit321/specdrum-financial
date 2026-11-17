import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { handleQuote, quoteLimiter, quoteSubmissions } from '@/server/handlers/quote';
import { resetMailTransport } from '@/server/mail/send';
import { validHomeQuote, validQuoteRequest } from '../helpers/fixtures';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

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
  sink.envelopes.length = 0;
  quoteLimiter.reset();
  quoteSubmissions.reset();
  resetMailTransport();
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = { ...savedEnv };
  vi.restoreAllMocks();
});

let n = 0;
const key = () => `test-key-${Date.now()}-${++n}-abcdef`;

function post(body: unknown, headers: Record<string, string> = {}) {
  return handleQuote(
    new Request('http://localhost/api/quote', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        host: 'localhost',
        origin: 'http://localhost',
        'x-forwarded-for': '203.0.113.7',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 Chrome/130.0 Safari/537.36',
        ...headers,
      },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    }),
  );
}

describe('POST /api/quote — quote request page', () => {
  it('emails the owner every field, with reply-to set to the visitor', async () => {
    const res = await post({ form: 'quote-request', idempotencyKey: key(), honeypot: '', data: validQuoteRequest() });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.reference).toMatch(/^SBQ-\d{4}-[A-Z2-9]{6}$/);

    expect(sink.messages).toHaveLength(1);
    const m = sink.messages[0];
    expect(sink.envelopes[0].to).toEqual(['owner@spectrum.test']);
    expect(m.subject).toBe(`New quote request: Priya Shah – Shah Logistics (${body.reference})`);
    expect(m.replyTo?.value[0]).toMatchObject({ address: 'priya@shahlogistics.com', name: 'Priya Shah' });
    expect(m.from?.value[0].address).toBe('no-reply@spectrumbusinessfinance.com');
    for (const s of ['Priya Shah', 'priya@shahlogistics.com', '(714) 555-0142', 'Shah Logistics', 'Trucking & Logistics', '$50,000 – $75,000', '$25,000 – $50,000', '203.0.113.7 (Chrome on Windows)']) {
      expect(m.text, s).toContain(s);
    }
    expect(m.html).toContain('Spectrum Financial');
    expect(m.attachments).toHaveLength(0);
  });

  it('sends to several owner addresses', async () => {
    process.env.MAIL_TO = 'owner@spectrum.test, partner@spectrum.test';
    await post({ form: 'quote-request', idempotencyKey: key(), data: validQuoteRequest() });
    expect(sink.envelopes[0].to).toEqual(['owner@spectrum.test', 'partner@spectrum.test']);
  });
});

describe('POST /api/quote — home page form', () => {
  it('emails the owner every field', async () => {
    const res = await post({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() });
    expect(res.status).toBe(200);
    const m = sink.messages[0];
    expect(m.subject).toMatch(/^New free quote request: Marcus Lee – Lee Auto Repair \(SBQ-/);
    for (const s of ['Marcus Lee', 'Lee Auto Repair', 'marcus@leeauto.com', '562-555-0199', '$50,000 – $150,000', 'Equipment Loan / Lease', 'Two new lifts and a tire machine.']) {
      expect(m.text, s).toContain(s);
    }
  });
});

describe('POST /api/quote — what must not send an email', () => {
  it('invalid fields → 400 with a message per field', async () => {
    const res = await post({ form: 'home-quote', idempotencyKey: key(), data: { ...validHomeQuote(), email: 'nope', amount: '' } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('validation');
    expect(Object.keys(body.fields)).toEqual(['email', 'amount']);
    expect(sink.messages).toHaveLength(0);
  });

  it('terms not accepted → 400', async () => {
    const res = await post({ form: 'quote-request', idempotencyKey: key(), data: { ...validQuoteRequest(), terms: false } });
    expect((await res.json()).fields.terms).toBeTruthy();
    expect(sink.messages).toHaveLength(0);
  });

  it('honeypot filled → looks successful, sends nothing', async () => {
    const res = await post({ form: 'quote-request', idempotencyKey: key(), honeypot: 'http://spam.example', data: validQuoteRequest() });
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(sink.messages).toHaveLength(0);
  });

  it('unknown form, missing/short idempotency key, broken JSON, wrong content type', async () => {
    expect((await post({ form: 'apply', idempotencyKey: key(), data: validHomeQuote() })).status).toBe(400);
    expect((await post({ form: 'home-quote', data: validHomeQuote() })).status).toBe(400);
    expect((await post({ form: 'home-quote', idempotencyKey: 'short', data: validHomeQuote() })).status).toBe(400);
    expect((await post('{not json')).status).toBe(400);
    expect((await post('null')).status).toBe(400);
    expect((await post({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() }, { 'content-type': 'text/plain' })).status).toBe(415);
    expect(sink.messages).toHaveLength(0);
  });

  it('body over 32 KB → 413', async () => {
    const res = await post({ form: 'home-quote', idempotencyKey: key(), data: { ...validHomeQuote(), message: 'x'.repeat(40_000) } });
    expect(res.status).toBe(413);
  });

  it('posted from another website → 403', async () => {
    const res = await post({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() }, { origin: 'https://evil.example' });
    expect(res.status).toBe(403);
    expect(sink.messages).toHaveLength(0);
  });

  it('SMTP settings missing → 503 and the log names the missing setting, not secrets', async () => {
    delete process.env.SMTP_HOST;
    const res = await post({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() });
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('not_configured');
    const logged = vi.mocked(console.error).mock.calls.flat().join(' ');
    expect(logged).toContain('SMTP_HOST');
  });

  it('mail server refuses → 502, and the same key can be retried successfully', async () => {
    const k = key();
    sink.failNext(1);
    const first = await post({ form: 'home-quote', idempotencyKey: k, data: validHomeQuote() });
    expect(first.status).toBe(502);
    expect((await first.json()).error).toBe('send_failed');
    const second = await post({ form: 'home-quote', idempotencyKey: k, data: validHomeQuote() });
    expect(second.status).toBe(200);
    expect(sink.messages).toHaveLength(1);
  });

  it('logs never contain the visitor details', async () => {
    await post({ form: 'quote-request', idempotencyKey: key(), data: validQuoteRequest() });
    const logged = [console.info, console.warn, console.error].flatMap((f) => vi.mocked(f).mock.calls.flat()).join(' ');
    expect(logged).not.toMatch(/Priya|shahlogistics|555-0142/);
  });
});

describe('POST /api/quote — double submits and floods', () => {
  it('double click (same key, at the same time) → one email, same reference', async () => {
    const k = key();
    const body = { form: 'quote-request', idempotencyKey: k, data: validQuoteRequest() };
    const [a, b] = await Promise.all([post(body), post(body)]);
    const [ja, jb] = [await a.json(), await b.json()];
    expect(ja.reference).toBe(jb.reference);
    expect(sink.messages).toHaveLength(1);
  });

  it('a new form fill (new key) is a new email', async () => {
    await post({ form: 'quote-request', idempotencyKey: key(), data: validQuoteRequest() });
    await post({ form: 'quote-request', idempotencyKey: key(), data: validQuoteRequest() });
    expect(sink.messages).toHaveLength(2);
  });

  it('the 9th request from one address in 10 minutes → 429 with Retry-After; others unaffected', async () => {
    for (let i = 0; i < 8; i++) expect((await post({ form: 'home-quote', idempotencyKey: key(), data: { ...validHomeQuote(), email: 'bad' } })).status).toBe(400);
    const limited = await post({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() });
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get('retry-after'))).toBeGreaterThan(0);
    const other = await post({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() }, { 'x-forwarded-for': '198.51.100.9' });
    expect(other.status).toBe(200);
  });

  it('a spoofed X-Forwarded-For does not get around the limit', async () => {
    for (let i = 0; i < 8; i++) await post({ form: 'home-quote', idempotencyKey: key(), data: {} }, { 'x-forwarded-for': `10.0.0.${i}, 203.0.113.7` });
    const res = await post({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() }, { 'x-forwarded-for': '10.9.9.9, 203.0.113.7' });
    expect(res.status).toBe(429);
  });
});
