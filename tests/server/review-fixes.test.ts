import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { extractText, getDocumentProxy } from 'unpdf';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRINTABLE, applySchema } from '@/lib/forms/apply-schema';
import { formatPhone } from '@/lib/forms/format';
import { homeQuoteSchema, quoteRequestSchema } from '@/lib/forms/quote-schema';
import { mailConfig } from '@/server/config';
import { applyGate, applyGlobalLimiter, applyLimiter, applySubmissions, handleApply } from '@/server/handlers/apply';
import { handleQuote, quoteGlobalLimiter, quoteLimiter, quoteSubmissions } from '@/server/handlers/quote';
import { resetMailTransport } from '@/server/mail/send';
import { renderApplicationPdf } from '@/server/pdf/render';
import { clientIp, rateLimitKey } from '@/server/request';
import { decodeSignature } from '@/server/uploads';
import { validApplication, validHomeQuote, validQuoteRequest } from '../helpers/fixtures';
import { asDataUrl, makePng, signaturePng } from '../helpers/png';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

// Regression tests for the findings of the first code review.

describe('signature PNG cannot exhaust memory (review #1)', () => {
  it('accepts a normal drawn signature', () => {
    expect(decodeSignature(asDataUrl(signaturePng()))).not.toBeNull();
    expect(decodeSignature(asDataUrl(makePng({ width: 1200, height: 300, colorType: 2 })))).not.toBeNull();
  });

  it('rejects a tiny file that claims huge dimensions', () => {
    const bomb = makePng({ width: 30000, height: 30000, idat: deflateSync(Buffer.alloc(1000)) });
    expect(bomb.length).toBeLessThan(5000);
    expect(decodeSignature(asDataUrl(bomb))).toBeNull();
  });

  it('rejects pixel data that inflates past what the header allows (zlib bomb)', () => {
    const idat = deflateSync(Buffer.alloc(50 * 1024 * 1024)); // 50 MB of zeros, ~50 KB compressed
    expect(decodeSignature(asDataUrl(makePng({ width: 100, height: 100, idat })))).toBeNull();
  });

  it('rejects 16-bit, palette, grey, interlaced and truncated images', () => {
    for (const png of [
      makePng({ width: 100, height: 50, depth: 16 }),
      makePng({ width: 100, height: 50, colorType: 3 }),
      makePng({ width: 100, height: 50, colorType: 0 }),
      makePng({ width: 100, height: 50, interlace: 1 }),
      makePng({ width: 100, height: 50 }).subarray(0, 60),
      makePng({ width: 100, height: 50, idat: Buffer.from('not zlib at all, just text padding padding') }),
    ]) {
      expect(decodeSignature(asDataUrl(png))).toBeNull();
    }
  });
});

describe('SMTP must be encrypted by default (review #2)', () => {
  const base = { SMTP_HOST: 'smtp.example.com', MAIL_FROM: 'a@b.com', MAIL_TO: 'c@d.com' };
  it('requires TLS on 587 unless explicitly turned off', () => {
    expect(mailConfig({ ...base, SMTP_PORT: '587' }).requireTls).toBe(true);
    expect(mailConfig({ ...base, SMTP_PORT: '587', SMTP_REQUIRE_TLS: 'false' }).requireTls).toBe(false);
    expect(mailConfig({ ...base, SMTP_PORT: '465' })).toMatchObject({ secure: true, requireTls: false });
  });
});

describe('client IP and rate-limit keys (review #4)', () => {
  const h = (init: Record<string, string>) => new Headers(init);
  it('never falls back to client-controlled X-Real-IP', () => {
    expect(clientIp(h({ 'x-real-ip': '198.51.100.4' }), 1)).toBe('unknown');
    expect(clientIp(h({ 'x-forwarded-for': '203.0.113.7' }), 2)).toBe('unknown'); // chain shorter than the hops
  });

  it('understands ip:port entries', () => {
    expect(clientIp(h({ 'x-forwarded-for': '203.0.113.7:51234' }), 1)).toBe('203.0.113.7');
    expect(clientIp(h({ 'x-forwarded-for': '[2001:db8::1]:443' }), 1)).toBe('2001:db8::1');
    expect(clientIp(h({ 'x-forwarded-for': '999.1.1.1' }), 1)).toBe('unknown');
  });

  it('groups IPv6 visitors by /64 so rotating addresses does not escape the limit', () => {
    expect(rateLimitKey('2001:db8:aa:bb:1::1')).toBe('2001:db8:aa:bb::/64');
    expect(rateLimitKey('2001:db8:aa:bb:ffff:1:2:3')).toBe('2001:db8:aa:bb::/64');
    expect(rateLimitKey('2001:db8::1')).toBe('2001:db8:0:0::/64');
    expect(rateLimitKey('203.0.113.7')).toBe('203.0.113.7');
  });
});

describe('ITIN, +1 phone numbers, printable names (review #7, #8, #13)', () => {
  const ok = (patch: Record<string, unknown>) => applySchema.safeParse({ ...validApplication(), ...patch }).success;

  it('accepts ITINs and still rejects numbers that are neither SSN nor ITIN', () => {
    expect(ok({ ssn: '912-78-1234' })).toBe(true);
    expect(ok({ ssn: '900-50-1234' })).toBe(true);
    expect(ok({ ssn: '912-93-1234' })).toBe(false);
    expect(ok({ ssn: '912-12-1234' })).toBe(false);
    expect(ok({ ssn: '912-78-0000' })).toBe(false);
  });

  it('keeps a pasted +1 / 1- prefix from breaking the phone number', () => {
    expect(formatPhone('+1 (269) 350-3651')).toBe('(269) 350-3651');
    expect(formatPhone('1-800-214-7498')).toBe('(800) 214-7498');
    expect(ok({ phone: '+1 269 350 3651', biz_phone: '1-517-918-9004' })).toBe(true);
  });

  it('accepts accented, Greek and Cyrillic names; rejects emoji and scripts the PDF cannot print', () => {
    expect(ok({ first_name: 'Nguyễn', last_name: 'Łukasz-Müller', city: 'Ærøskøbing', biz_dba: 'Δέλτα Бизнес' })).toBe(true);
    expect(ok({ first_name: 'Jordan 😀' })).toBe(false);
    expect(ok({ last_name: '张伟' })).toBe(false);
  });

  it('every character the schema lets through has a glyph in the PDF font', async () => {
    const fontkit = createRequire(import.meta.url)('fontkit');
    const font: { hasGlyphForCodePoint(cp: number): boolean } = fontkit.openSync(path.join(process.cwd(), 'src/server/pdf/fonts/Roboto-Regular.ttf'));
    const missing: string[] = [];
    for (let cp = 0x20; cp <= 0x2200; cp++) {
      const ch = String.fromCodePoint(cp);
      if (/\p{Cn}|\p{Cc}|\p{Cf}|\p{Zl}|\p{Zp}/u.test(ch)) continue; // unassigned / control / format
      if (PRINTABLE.test(ch) && !font.hasGlyphForCodePoint(cp)) missing.push(cp.toString(16));
    }
    expect(missing).toEqual([]);
  });

  it('prints such names on the PDF', async () => {
    const fields = applySchema.parse({ ...validApplication(), first_name: 'Nguyễn', last_name: 'Łukasz', biz_dba: 'Ærø Δέλτα Бизнес' });
    const pdf = await renderApplicationPdf({
      fields,
      meta: { reference: 'SBF-2026-AAAAAA', submittedAt: new Date(), timeZone: 'America/Los_Angeles', ip: 'unknown', device: 'Chrome on Windows' },
      signaturePng: signaturePng(),
    });
    const { text } = await extractText(await getDocumentProxy(new Uint8Array(pdf)), { mergePages: true });
    expect(text).toContain('Nguyễn Łukasz');
    expect(text).toContain('Ærø Δέλτα Бизнес');
    expect(text).toContain('IP not available / Chrome on Windows');
    fs.mkdirSync(path.join(__dirname, '../.output'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '../.output/unicode-application.pdf'), pdf);
  });
});

describe('line breaks only where they belong (review #20)', () => {
  it('a name or company cannot contain a line break; the message can', () => {
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), first_name: 'Priya\nReference SBQ-FAKE' }).success).toBe(false);
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), company: 'Shah\r\nLogistics' }).success).toBe(false);
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), name: 'Marcus\nLee' }).success).toBe(false);
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), message: 'Line one\r\nLine two\tend' }).success).toBe(true);
  });
});

/* ---------- handler-level fixes, against a local SMTP sink ---------- */

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
  for (const s of [quoteLimiter, quoteGlobalLimiter, quoteSubmissions, applyLimiter, applyGlobalLimiter, applySubmissions, applyGate]) s.reset();
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
const key = () => `review-key-${Date.now()}-${++n}-abcdef`;
const quote = (body: unknown, headers: Record<string, string> = {}) =>
  handleQuote(
    new Request('http://localhost/api/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json', host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '203.0.113.7', ...headers },
      body: JSON.stringify(body),
    }),
  );

function apply(payloadPatch: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  const form = new FormData();
  form.append('payload', JSON.stringify({ idempotencyKey: key(), honeypot: '', fields: validApplication(), signature: asDataUrl(signaturePng()), ...payloadPatch }));
  const req = new Request('http://localhost/api/apply', { method: 'POST', body: form });
  const h = new Headers(req.headers);
  for (const [k, v] of Object.entries({ host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '203.0.113.7', ...headers })) h.set(k, v);
  return handleApply(new Request(req, { headers: h }));
}

describe('handlers', () => {
  it('a form name like "constructor" is a 400, not a crash (review #9)', async () => {
    for (const form of ['constructor', 'toString', '__proto__', 'hasOwnProperty']) {
      const res = await quote({ form, idempotencyKey: key(), data: validHomeQuote() });
      expect(res.status, form).toBe(400);
    }
  });

  it('refuses to send over an unencrypted connection unless told to (review #2)', async () => {
    delete process.env.SMTP_REQUIRE_TLS; // the sink has no STARTTLS
    const res = await quote({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() });
    expect(res.status).toBe(502);
    expect(sink.messages).toHaveLength(0);
  });

  it('logs the origin and host of a refused cross-site post (review #3)', async () => {
    const res = await quote({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() }, { origin: 'https://spectrumbusinessfinance.com', host: 'alb-123.us-east-1.elb.amazonaws.com' });
    expect(res.status).toBe(403);
    const logged = vi.mocked(console.warn).mock.calls.flat().join(' ');
    expect(logged).toContain('forbidden_origin');
    expect(logged).toContain('alb-123.us-east-1.elb.amazonaws.com');
  });

  it('all-visitors limit: the 61st quote from many different IPs in 10 minutes is refused; junk does not count (review #5)', async () => {
    for (let i = 0; i < 20; i++) await quote({ form: 'home-quote', idempotencyKey: key(), data: {} }, { 'x-forwarded-for': `198.51.100.${i}` });
    for (let i = 0; i < 60; i++) {
      const res = await quote({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() }, { 'x-forwarded-for': `10.1.${i}.1` });
      expect(res.status, `send ${i}`).toBe(200);
    }
    const res = await quote({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() }, { 'x-forwarded-for': '10.9.9.9' });
    // a site-wide cap is not "your connection": the visitor is told we're busy (delta review #3)
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('busy');
    expect(sink.messages).toHaveLength(60);
  });

  it('a submission that failed on our side gives its all-visitors quota back (delta review #3)', async () => {
    sink.failNext(1);
    expect((await quote({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() })).status).toBe(502);
    for (let i = 0; i < 60; i++) {
      expect((await quote({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() }, { 'x-forwarded-for': `10.2.${i}.1` })).status).toBe(200);
    }
  });

  it('when the client IP is unknown, visitors are not lumped into one tiny bucket (review #4)', async () => {
    process.env.TRUSTED_PROXY_HOPS = '0';
    for (let i = 0; i < 10; i++) {
      expect((await quote({ form: 'home-quote', idempotencyKey: key(), data: validHomeQuote() })).status).toBe(200);
    }
  });

  it('at most 4 applications are processed at once; the 5th gets "busy" (review #5)', async () => {
    const releases = [1, 2, 3, 4].map(() => applyGate.tryEnter()!);
    const res = await apply();
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe('busy');
    expect(res.headers.get('retry-after')).toBe('30');
    releases.forEach((r) => r());
    expect((await apply()).status).toBe(200);
    expect(applyGate.active).toBe(0);
  });

  it('a corrupt or oversized signature image is a validation error, not a server failure (review #1)', async () => {
    const res = await apply({ signature: asDataUrl(makePng({ width: 40000, height: 10, idat: deflateSync(Buffer.alloc(10)) })) });
    expect(res.status).toBe(400);
    expect((await res.json()).fields.signature).toBeTruthy();
    expect(sink.messages).toHaveLength(0);
  });

  it('without a trusted proxy the email says the IP is not available (instead of "unknown")', async () => {
    process.env.TRUSTED_PROXY_HOPS = '0';
    expect((await quote({ form: 'quote-request', idempotencyKey: key(), data: validQuoteRequest() })).status).toBe(200);
    expect(sink.messages[0].text).toContain('from IP not available');
  });
});
