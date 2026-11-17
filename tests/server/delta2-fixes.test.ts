import { deflateSync } from 'node:zlib';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { applySchema } from '@/lib/forms/apply-schema';
import { submitErrorMessage } from '@/lib/forms/client';
import { homeQuoteSchema, quoteRequestSchema } from '@/lib/forms/quote-schema';
import { ConfigError, mailConfig } from '@/server/config';
import { applyLimiter, applySubmissions, handleApply } from '@/server/handlers/apply';
import { resetMailTransport, sendOwnerMail } from '@/server/mail/send';
import { renderEmailText } from '@/server/mail/template';
import { BodyTimeoutError, clientIp, rateLimitKey, readBodyWithLimit } from '@/server/request';
import { decodeSignature } from '@/server/uploads';
import { validApplication, validHomeQuote, validQuoteRequest } from '../helpers/fixtures';
import { asDataUrl, makePng, signaturePng } from '../helpers/png';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

// Regression tests for the delta review of the breaker fix round.

const OKINA = String.fromCodePoint(0x2bb); // modifier letter turned comma, used in Hawaiian names
const ZWSP = String.fromCodePoint(0x200b); // zero-width space, often pasted along with text
const LINE_SEP = String.fromCodePoint(0x2028);
const PARA_SEP = String.fromCodePoint(0x2029);
const NEL = String.fromCodePoint(0x85);

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

describe('email addresses (delta-2 #1, #2)', () => {
  const forms = [
    (email: string) => applySchema.safeParse({ ...validApplication(), email }).success,
    (email: string) => quoteRequestSchema.safeParse({ ...validQuoteRequest(), email }).success,
    (email: string) => homeQuoteSchema.safeParse({ ...validHomeQuote(), email }).success,
  ];

  it.each([
    'x@y',
    'john@gmail',
    'a@b..com',
    'a@b.com.',
    'a@-b.com',
    '.a@b.com',
    'a<b@c.com',
    'a;b@c.com',
    'a(b)@c.d',
    'a@[127.0.0.1]',
    'a@127.0.0.1',
    'a@b.com>',
    'a@b.com:25',
    'bøb@example.com',
  ])('rejects %s on every form', (email) => {
    for (const valid of forms) expect(valid(email)).toBe(false);
  });

  it.each(['jordan@mapleridgebakery.com', "o'brien+loans@sub.example.co.uk", 'Priya.Shah@ShahLogistics.COM', 'bob@exämple.com'])(
    'accepts %s on every form',
    (email) => {
      for (const valid of forms) expect(valid(email)).toBe(true);
    },
  );

  it('the Reply-To header carries the ASCII form of an international domain', async () => {
    await sendOwnerMail(
      { subject: 'Test', content: { eyebrow: 'e', heading: 'h', intro: [], sections: [], footer: [] }, replyTo: { name: 'Bob', address: 'bob@exämple.com' } },
      mailConfig(mailEnv(sink.port)),
    );
    const line = sink.messages[0].headerLines.find((h) => h.key === 'reply-to')!.line;
    expect(line).toContain('bob@xn--exmple-cua.com');
    expect(/^[\x20-\x7e]*$/.test(line)).toBe(true);
  });
});

describe('MAIL_TO accepts "Name <address>" like MAIL_FROM (delta-2 #3)', () => {
  const env = (to: string) => ({ ...mailEnv(2525), MAIL_TO: to });

  it('display-name entries, and commas inside a quoted name', () => {
    expect(mailConfig(env('Owner <owner@spectrum.test>')).to).toEqual(['Owner <owner@spectrum.test>']);
    expect(mailConfig(env('"Doe, Jane" <jane@spectrum.test>, ops@spectrum.test')).to).toEqual([
      '"Doe, Jane" <jane@spectrum.test>',
      'ops@spectrum.test',
    ]);
  });

  it('still refuses something that is not an address', () => {
    expect(() => mailConfig(env('garbage'))).toThrow(ConfigError);
    expect(() => mailConfig(env('Owner <garbage>'))).toThrow(ConfigError);
  });
});

describe('line breaks cannot sneak into single-line values or fake rows (delta-2 #4, not-tested U+2028)', () => {
  it('a phone number with a line break is rejected on the quote forms', () => {
    for (const phone of ['555\n1234567', '5551234567\n1', `(714) 555${LINE_SEP}0142`]) {
      expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), phone }).success).toBe(false);
      expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), phone }).success).toBe(false);
    }
    expect(quoteRequestSchema.safeParse({ ...validQuoteRequest(), phone: '(714) 555-0142' }).success).toBe(true);
  });

  it('Unicode line and paragraph separators in the message stay under the value in the text email', () => {
    for (const sep of [LINE_SEP, PARA_SEP, NEL]) {
      const text = renderEmailText({
        eyebrow: 'e',
        heading: 'h',
        intro: [],
        sections: [{ title: 'Request', rows: [{ label: 'Message', value: `Hello${sep}Phone: 000-000-0000` }] }],
        footer: [],
      });
      expect(text).not.toMatch(/^Phone:/m);
      expect(text).toMatch(/^ +Phone: 000-000-0000$/m);
    }
  });
});

describe('signature images are no bigger than the pad can make (delta-2 #5)', () => {
  // RGB zeros = black pixels, so these have plenty of ink
  const black = (width: number, height: number) =>
    asDataUrl(makePng({ width, height, colorType: 2, idat: deflateSync(Buffer.alloc(height * (1 + width * 3))) }));

  it('rejects anything wider than 1200 px or taller than 400 px, before decoding the pixels', () => {
    expect(decodeSignature(black(2000, 1000))).toBeNull();
    expect(decodeSignature(black(1201, 100))).toBeNull();
    expect(decodeSignature(black(1200, 401))).toBeNull();
  });

  it('still accepts the largest export the pad produces', () => {
    expect(decodeSignature(black(1200, 300))).not.toBeNull();
    expect(decodeSignature(black(1200, 400))).not.toBeNull();
  });
});

describe('stalled uploads are let go early, steady ones are not (delta-2 #6, #7)', () => {
  const trickle = (bytes: number, everyMs: number) =>
    new ReadableStream<Uint8Array>({
      async start(c) {
        for (let i = 0; i < bytes; i++) {
          c.enqueue(new Uint8Array(1));
          await new Promise((r) => setTimeout(r, everyMs));
        }
        c.close();
      },
    });

  it('a body that keeps arriving is read in full, even past the idle limit in total', async () => {
    const req = new Request('http://x', { method: 'POST', body: trickle(8, 50), duplex: 'half' } as RequestInit);
    const body = await readBodyWithLimit(req, 1000, { totalMs: 5000, idleMs: 200 });
    expect(body.byteLength).toBe(8);
  });

  it('a body that stops arriving fails after the idle limit, long before the total limit', async () => {
    const stalled = new ReadableStream<Uint8Array>({
      start(c) {
        c.enqueue(new Uint8Array(3));
      },
    });
    const req = new Request('http://x', { method: 'POST', body: stalled, duplex: 'half' } as RequestInit);
    const started = Date.now();
    await expect(readBodyWithLimit(req, 1000, { totalMs: 10_000, idleMs: 150 })).rejects.toBeInstanceOf(BodyTimeoutError);
    expect(Date.now() - started).toBeLessThan(2000);
  });

  it('the visitor is told the upload was too slow, with another way to send the statements', () => {
    expect(submitErrorMessage({ ok: false, error: 'slow_upload' })).toMatch(/too slow.*info@spectrumbusinessfinance\.com/);
  });
});

describe('an honest retry is not a conflict (delta-2 #8)', () => {
  const post = (key: string, signature: string) => {
    const form = new FormData();
    form.append('payload', JSON.stringify({ idempotencyKey: key, honeypot: '', fields: validApplication(), signature }));
    return handleApply(
      new Request('http://localhost/api/apply', {
        method: 'POST',
        body: form,
        headers: { host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '203.0.113.7' },
      }),
    );
  };

  it('the same signature re-drawn at another size (window resized) gives the first answer, one email', async () => {
    const key = `resize-retry-${Date.now()}-abcdef`;
    const first = await post(key, asDataUrl(signaturePng(360, 90)));
    const again = await post(key, asDataUrl(signaturePng(420, 105)));
    expect(first.status).toBe(200);
    expect(again.status).toBe(200);
    expect((await again.json()).reference).toBe((await first.json()).reference);
    expect(sink.messages).toHaveLength(1);
  });
});

describe('IPv4 visitors written in IPv6 form share no bucket (delta-2 #9)', () => {
  const ip = (xff: string) => clientIp(new Headers({ 'x-forwarded-for': xff }), 1);

  it('hex and full forms of an IPv4-mapped address become the plain IPv4 address', () => {
    expect(ip('::ffff:101:102')).toBe('1.1.1.2');
    expect(ip('0:0:0:0:0:ffff:cb00:7107')).toBe('203.0.113.7');
    expect(ip('::FFFF:203.0.113.7')).toBe('203.0.113.7');
    expect(rateLimitKey(ip('::ffff:101:102'))).not.toBe(rateLimitKey(ip('::ffff:101:103')));
  });

  it('a zone id is dropped and real IPv6 keeps its /64', () => {
    expect(ip('fe80::1%eth0')).toBe('fe80::1');
    expect(rateLimitKey(ip('2001:DB8:aa:bb::7'))).toBe('2001:db8:aa:bb::/64');
  });
});

describe('pasted and Hawaiian names, international websites (delta-2 #11)', () => {
  const parse = (patch: Record<string, unknown>) => applySchema.safeParse({ ...validApplication(), ...patch });

  it('the okina is accepted and stored as the printable quote mark', () => {
    const r = parse({ first_name: `Ka${OKINA}ōnohi` });
    expect(r.success).toBe(true);
    expect(r.data!.first_name).toBe(`Ka${String.fromCodePoint(0x2018)}ōnohi`);
  });

  it('an invisible zero-width space from a paste is dropped, not rejected', () => {
    const r = parse({ biz_dba: `Bob${ZWSP}Shop` });
    expect(r.success).toBe(true);
    expect(r.data!.biz_dba).toBe('BobShop');
  });

  it.each(['www.café.com', 'https://café.com/menu', 'yourbusiness.com', 'https://www.yourbusiness.com/about?x=1'])('website %s is accepted', (website) => {
    expect(parse({ website }).success).toBe(true);
  });

  it.each(['http://1.2.3.4', 'example.com:8080', 'user@example.com', 'localhost', 'example.com/ path'])(
    'website %s is rejected',
    (website) => {
      expect(parse({ website }).success).toBe(false);
    },
  );
});
