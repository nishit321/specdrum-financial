import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { applySchema } from '@/lib/forms/apply-schema';
import { quoteRequestSchema } from '@/lib/forms/quote-schema';
import { ConfigError, mailConfig, trustedProxyHops } from '@/server/config';
import { withTimeout } from '@/server/guard';
import { quoteGlobalLimiter, quoteLimiter, quoteSubmissions, handleQuote } from '@/server/handlers/quote';
import { renderEmailText } from '@/server/mail/template';
import { resetMailTransport } from '@/server/mail/send';
import { checkOrigin, clientIp, readBodyWithLimit } from '@/server/request';
import { decodeSignature } from '@/server/uploads';
import { validApplication, validQuoteRequest } from '../helpers/fixtures';
import { asDataUrl, chunk, makePng, signaturePng } from '../helpers/png';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

// Regression tests for the breaker's findings (B-numbers follow its report).
const RLO = String.fromCodePoint(0x202e);
const EMOJI = String.fromCodePoint(0x1f600);

const countChunk = (png: Buffer, type: string) => {
  let n = 0;
  for (let pos = 8; pos + 12 <= png.length; ) {
    const len = png.readUInt32BE(pos);
    if (png.toString('latin1', pos + 4, pos + 8) === type) n++;
    pos += 12 + len;
  }
  return n;
};

describe('B1: a signature PNG cannot smuggle extra chunks to the PDF renderer', () => {
  it('a second IHDR claiming 60000x60000 is not passed on', () => {
    const good = signaturePng();
    const ihdr2 = Buffer.alloc(13);
    ihdr2.writeUInt32BE(60000, 0);
    ihdr2.writeUInt32BE(60000, 4);
    ihdr2[8] = 8;
    ihdr2[9] = 6;
    // insert right after the real IHDR (8-byte signature + 25-byte IHDR chunk)
    const evil = Buffer.concat([good.subarray(0, 33), chunk('IHDR', ihdr2), good.subarray(33)]);
    const out = decodeSignature(asDataUrl(evil));
    if (out) {
      expect(countChunk(out, 'IHDR')).toBe(1);
      expect(out.readUInt32BE(16)).toBe(360);
    }
  });

  it('the image handed on is a clean re-encode: text and other chunks are dropped', () => {
    const good = signaturePng();
    const withText = Buffer.concat([good.subarray(0, 33), chunk('tEXt', Buffer.from('Comment\0hello')), good.subarray(33)]);
    const out = decodeSignature(asDataUrl(withText))!;
    expect(out).not.toBeNull();
    expect(countChunk(out, 'tEXt')).toBe(0);
    expect(countChunk(out, 'IHDR')).toBe(1);
    expect(countChunk(out, 'IEND')).toBe(1);
  });

  it('PDF rendering has a hard time limit', async () => {
    await expect(withTimeout(new Promise(() => {}), 50, 'render')).rejects.toThrow(/render/);
    await expect(withTimeout(Promise.resolve(7), 50, 'render')).resolves.toBe(7);
  });
});

describe('B2: the body deadline really fires, even if the stream refuses to cancel', () => {
  it('rejects in time when cancel() never settles', async () => {
    const stuck = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(5));
      },
      cancel() {
        return new Promise(() => {}); // like a stalled Node socket
      },
    });
    const req = new Request('http://x', { method: 'POST', body: stuck, duplex: 'half' } as RequestInit);
    const started = Date.now();
    await expect(readBodyWithLimit(req, 1000, { totalMs: 100 })).rejects.toThrow();
    expect(Date.now() - started).toBeLessThan(1500);
  });
});

describe('B4: an empty signature is not a signature', () => {
  it('rejects fully transparent and blank images', () => {
    expect(decodeSignature(asDataUrl(makePng({ width: 300, height: 80 })))).toBeNull(); // all alpha 0
    expect(decodeSignature(asDataUrl(makePng({ width: 1, height: 1 })))).toBeNull();
    expect(decodeSignature(asDataUrl(signaturePng()))).not.toBeNull();
  });
});

describe('B7, B9, B10, B13: field rules', () => {
  const ok = (patch: Record<string, unknown>) => applySchema.safeParse({ ...validApplication(), ...patch }).success;

  it('B7: an email address with an international domain is accepted', () => {
    expect(ok({ email: 'bob@exämple.com' })).toBe(true);
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), email: 'bob@exämple.com' }).success).toBe(true);
  });

  it('B7: a name the PDF cannot print gets a message that says what to do', () => {
    const r = applySchema.safeParse({ ...validApplication(), first_name: '李' });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].message).toMatch(/English letters|call us/i);
  });

  it('B9: the website field gets the same character rules as every other field', () => {
    expect(ok({ website: `example.com/${EMOJI}` })).toBe(false);
    expect(ok({ website: `example.com/${RLO}x` })).toBe(false);
    expect(ok({ website: 'www.mapleridgebakery.com/about-us' })).toBe(true);
  });

  it('B10: a line break cannot sneak into the tax ID', () => {
    expect(ok({ biz_ein: '46-23836\n74' })).toBe(false);
    expect(ok({ biz_ein: '46 2383674' })).toBe(true);
  });

  it('B13: SSN and phone accept digits and separators only', () => {
    expect(ok({ ssn: '078-05-1120 <script>x</script>' })).toBe(false);
    expect(ok({ phone: '269 350 3651 call me' })).toBe(false);
    expect(ok({ phone: '+1 (269) 350-3651' })).toBe(true);
  });
});

describe('B10: the plain-text email cannot be forged line by line', () => {
  it('continuation lines of a value are indented under the value', () => {
    const text = renderEmailText({
      eyebrow: 'x',
      heading: 'h',
      intro: [],
      sections: [{ title: 'What they need', rows: [{ label: 'Message', value: 'Hi\nPhone: 000-000-0000\nReference SBQ-FAKE' }] }],
      footer: [],
    });
    const lines = text.split('\n');
    expect(lines.some((l) => l.startsWith('Phone: 000'))).toBe(false);
    expect(lines.some((l) => l.startsWith('Reference SBQ-FAKE'))).toBe(false);
    expect(text).toContain('Phone: 000-000-0000');
  });
});

describe('B8, B14, B16, B19: configuration and request parsing', () => {
  const saved = { ...process.env };
  afterEach(() => {
    process.env = { ...saved };
  });

  it('B8: an empty TRUSTED_PROXY_HOPS means the default (1), not "no proxy"', () => {
    process.env.TRUSTED_PROXY_HOPS = '';
    expect(trustedProxyHops()).toBe(1);
    process.env.TRUSTED_PROXY_HOPS = '   ';
    expect(trustedProxyHops()).toBe(1);
    process.env.TRUSTED_PROXY_HOPS = '0';
    expect(trustedProxyHops()).toBe(0);
  });

  it('B14: junk is never taken as a client IP', () => {
    for (const junk of [':::', '::::::::::', '1:2', '...', '999.1.1.1']) {
      expect(clientIp(new Headers({ 'x-forwarded-for': junk }), 1), junk).toBe('unknown');
    }
    expect(clientIp(new Headers({ 'x-forwarded-for': '2001:db8::1' }), 1)).toBe('2001:db8::1');
  });

  it('B16: a MAIL_TO or MAIL_FROM that is not an address is a configuration error', () => {
    const base = { SMTP_HOST: 'h', SMTP_PORT: '587', MAIL_FROM: 'Site <no-reply@x.com>', MAIL_TO: 'a@b.com' };
    expect(() => mailConfig({ ...base, MAIL_TO: 'garbage' })).toThrow(ConfigError);
    expect(() => mailConfig({ ...base, MAIL_TO: 'a@b.com, nope' })).toThrow(ConfigError);
    expect(() => mailConfig({ ...base, MAIL_FROM: 'nobody' })).toThrow(ConfigError);
    expect(mailConfig(base).to).toEqual(['a@b.com']);
  });

  it('B19: X-Forwarded-Host is only trusted when a proxy is configured', () => {
    process.env.TRUSTED_PROXY_HOPS = '0';
    expect(checkOrigin(new Headers({ origin: 'https://evil.example', 'x-forwarded-host': 'evil.example', host: 'localhost:3000' })).ok).toBe(false);
    process.env.TRUSTED_PROXY_HOPS = '1';
    expect(checkOrigin(new Headers({ origin: 'https://www.site.com', 'x-forwarded-host': 'www.site.com', host: 'alb-internal' })).ok).toBe(true);
  });
});

/* ---------- handler-level: B3, B11, B12 ---------- */

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
  sink.rejected.length = 0;
  for (const s of [quoteLimiter, quoteGlobalLimiter, quoteSubmissions]) s.reset();
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
const key = () => `breaker-key-${Date.now()}-${++n}-abcdef`;
const quote = (body: unknown) =>
  handleQuote(
    new Request('http://localhost/api/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json', host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '203.0.113.7' },
      body: JSON.stringify(body),
    }),
  );
const refOf = (subject = '') => /\((SB[FQ]-\d{4}-[A-Z2-9]{6})\)$/.exec(subject)?.[1];

describe('handlers', () => {
  it('B3: a retry after a failed send carries the same reference, so the owner can spot a duplicate', async () => {
    const k = key();
    sink.failNext(1);
    expect((await quote({ form: 'quote-request', idempotencyKey: k, data: validQuoteRequest() })).status).toBe(502);
    const res = await quote({ form: 'quote-request', idempotencyKey: k, data: validQuoteRequest() });
    expect(res.status).toBe(200);
    const first = refOf(sink.rejected[0]?.subject);
    expect(first).toBeTruthy();
    expect(refOf(sink.messages[0].subject)).toBe(first);
    expect((await res.json()).reference).toBe(first);
  });

  it('B11: the Reply-To display name cannot pose as an address', async () => {
    const res = await quote({ form: 'quote-request', idempotencyKey: key(), data: { ...validQuoteRequest(), first_name: 'ceo@bank.com', last_name: '<boss@evil.com>' } });
    expect(res.status).toBe(200);
    const reply = sink.messages[0].replyTo!.value[0];
    expect(reply.address).toBe('priya@shahlogistics.com');
    expect(reply.name).not.toMatch(/[@<>]/);
  });

  it('B12: the same key with different data is refused instead of silently dropped', async () => {
    const k = key();
    expect((await quote({ form: 'quote-request', idempotencyKey: k, data: validQuoteRequest() })).status).toBe(200);
    const res = await quote({ form: 'quote-request', idempotencyKey: k, data: { ...validQuoteRequest(), email: 'other@x.com' } });
    expect(res.status).toBe(409);
    expect(sink.messages).toHaveLength(1);
    // the exact same request again is still the idempotent success
    expect((await quote({ form: 'quote-request', idempotencyKey: k, data: validQuoteRequest() })).status).toBe(200);
  });
});
