import { extractText, getDocumentProxy } from 'unpdf';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { UPLOAD_MAX_TOTAL_BYTES } from '@/lib/forms/apply-schema';
import { applyLimiter, applySubmissions, handleApply } from '@/server/handlers/apply';
import { resetMailTransport } from '@/server/mail/send';
import { minimalPdf, signatureDataUrl, tinyPng, validApplication } from '../helpers/fixtures';
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

let n = 0;
const key = () => `apply-key-${Date.now()}-${++n}-abcdef`;

type Opts = { payload?: Record<string, unknown>; files?: { name: string; bytes: Buffer; type?: string }[]; headers?: Record<string, string>; raw?: FormData };

async function post({ payload = {}, files = [], headers = {}, raw }: Opts = {}) {
  let form = raw;
  if (!form) {
    form = new FormData();
    form.append('payload', JSON.stringify({ idempotencyKey: key(), honeypot: '', fields: validApplication(), signature: signatureDataUrl(), ...payload }));
    for (const f of files) form.append('files', new File([new Uint8Array(f.bytes)], f.name, { type: f.type ?? 'application/pdf' }));
  }
  const req = new Request('http://localhost/api/apply', { method: 'POST', body: form });
  const h = new Headers(req.headers);
  for (const [k, v] of Object.entries({ host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '203.0.113.7', 'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Version/17.0 Mobile/15E148 Safari/604.1', ...headers })) h.set(k, v);
  return handleApply(new Request(req, { headers: h }));
}

const pdfText = async (content: Buffer) => {
  const { text } = await extractText(await getDocumentProxy(new Uint8Array(content)), { mergePages: true });
  return text as string;
};

describe('POST /api/apply — happy path', () => {
  it('emails the owner the signed PDF plus the bank statements', async () => {
    const res = await post({
      files: [
        { name: 'October statement.pdf', bytes: minimalPdf() },
        { name: 'september.PNG', bytes: tinyPng(), type: 'image/png' },
      ],
    });
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.reference).toMatch(/^SBF-\d{4}-[A-Z2-9]{6}$/);

    expect(sink.messages).toHaveLength(1);
    const m = sink.messages[0];
    expect(m.subject).toBe(`New application: Maple Ridge Bakery – $46,000 (${body.reference})`);
    expect(m.replyTo?.value[0]).toMatchObject({ address: 'jordan@mapleridgebakery.com', name: 'Jordan Avery' });

    const names = m.attachments.map((a) => a.filename);
    expect(names).toEqual([`Funding-Application-Maple-Ridge-Bakery-${body.reference}.pdf`, 'October statement.pdf', 'september.png']);
    expect(m.attachments.map((a) => a.contentType)).toEqual(['application/pdf', 'application/pdf', 'image/png']);

    const text = await pdfText(m.attachments[0].content);
    for (const s of ['Maple Ridge Bakery LLC', '$46,000.00', '078-05-1120', '03/24/1965', 'Limited Liability Company', 'Michigan', '203.0.113.7 / Safari on iOS', 'Application Signed by Jordan Avery, Owner', 'Permission to Contact:']) {
      expect(text, s).toContain(s);
    }

    // full SSN / DOB only inside the PDF, never in the email body
    expect(m.text).toContain('***-**-1120');
    expect(m.text).not.toContain('078-05-1120');
    expect(m.html).not.toContain('078-05-1120');
    expect(m.text).not.toContain('03/24/1965');
    expect(m.text).toContain('2 bank statements were uploaded and are attached too.');
  });

  it('works without bank statements', async () => {
    const res = await post();
    expect(res.status).toBe(200);
    expect(sink.messages[0].attachments).toHaveLength(1);
    expect(sink.messages[0].text).toContain('No bank statements were uploaded');
  });
});

describe('POST /api/apply — rejected without sending', () => {
  it('invalid application fields → 400 with the field names', async () => {
    const res = await post({ payload: { fields: { ...validApplication(), ssn: '000-00-0000', consent_contact: false } } });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.fields).toHaveProperty('ssn');
    expect(body.fields).toHaveProperty('consent_contact');
    expect(sink.messages).toHaveLength(0);
  });

  it('missing or fake signature → 400 signature', async () => {
    for (const signature of [undefined, '', 'data:image/svg+xml;base64,PHN2Zz4=', `data:image/png;base64,${minimalPdf().toString('base64')}`]) {
      const res = await post({ payload: { signature } });
      expect(res.status).toBe(400);
      expect((await res.json()).fields.signature).toBe('Please draw your signature.');
    }
    expect(sink.messages).toHaveLength(0);
  });

  it('a program renamed to .pdf, an HTML file, an empty file, a .exe → 400 files', async () => {
    const cases = [
      { name: 'statement.pdf', bytes: Buffer.from('MZ\x90\x00 this is an exe') },
      { name: 'statement.pdf', bytes: Buffer.from('<html><script>alert(1)</script>') },
      { name: 'empty.pdf', bytes: Buffer.alloc(0) },
      { name: 'tool.exe', bytes: minimalPdf() },
    ];
    for (const f of cases) {
      const res = await post({ files: [f] });
      expect(res.status, f.name).toBe(400);
      expect((await res.json()).fields.files).toBeTruthy();
    }
    expect(sink.messages).toHaveLength(0);
  });

  it('more than 10 files → 400', async () => {
    const files = Array.from({ length: 11 }, (_, i) => ({ name: `s${i}.pdf`, bytes: minimalPdf() }));
    const res = await post({ files });
    expect(res.status).toBe(400);
    expect((await res.json()).fields.files).toContain('at most 10');
  });

  it('statements over the total limit → 413 before anything is parsed', async () => {
    const big = Buffer.concat([minimalPdf(), Buffer.alloc(UPLOAD_MAX_TOTAL_BYTES + 2 * 1024 * 1024)]);
    const res = await post({ files: [{ name: 'huge.pdf', bytes: big }] });
    expect(res.status).toBe(413);
    expect((await res.json()).error).toBe('too_large');
    expect(sink.messages).toHaveLength(0);
  });

  it('broken payloads → 400; not multipart → 415; other website → 403', async () => {
    const noPayload = new FormData();
    noPayload.append('something', 'else');
    expect((await post({ raw: noPayload })).status).toBe(400);

    const badJson = new FormData();
    badJson.append('payload', '{oops');
    expect((await post({ raw: badJson })).status).toBe(400);

    const noKey = new FormData();
    noKey.append('payload', JSON.stringify({ fields: validApplication(), signature: signatureDataUrl() }));
    expect((await post({ raw: noKey })).status).toBe(400);

    const json = await handleApply(
      new Request('http://localhost/api/apply', { method: 'POST', headers: { 'content-type': 'application/json', host: 'localhost' }, body: '{}' }),
    );
    expect(json.status).toBe(415);

    expect((await post({ headers: { origin: 'https://evil.example' } })).status).toBe(403);
    expect(sink.messages).toHaveLength(0);
  });

  it('honeypot → fake success, no email', async () => {
    const res = await post({ payload: { honeypot: 'bot was here' } });
    expect(res.status).toBe(200);
    expect(sink.messages).toHaveLength(0);
  });
});

describe('POST /api/apply — reliability', () => {
  it('double submit with the same key → one email, same reference', async () => {
    const k = key();
    const [a, b] = await Promise.all([post({ payload: { idempotencyKey: k } }), post({ payload: { idempotencyKey: k } })]);
    expect((await a.json()).reference).toBe((await b.json()).reference);
    expect(sink.messages).toHaveLength(1);
  });

  it('SMTP failure → 502, retry with the same key works', async () => {
    const k = key();
    sink.failNext(1);
    expect((await post({ payload: { idempotencyKey: k } })).status).toBe(502);
    expect((await post({ payload: { idempotencyKey: k } })).status).toBe(200);
    expect(sink.messages).toHaveLength(1);
  });

  it('mail server not reachable → 502 within the time limit', async () => {
    process.env.SMTP_PORT = '1'; // nothing listens there
    const started = Date.now();
    const res = await post();
    expect(res.status).toBe(502);
    expect(Date.now() - started).toBeLessThan(15_000);
  });

  it('6th application from one address in 10 minutes → 429', async () => {
    for (let i = 0; i < 5; i++) await post({ payload: { fields: {} } });
    expect((await post()).status).toBe(429);
  });

  it('logs never contain the applicant details', async () => {
    await post();
    const logged = [console.info, console.warn, console.error].flatMap((f) => vi.mocked(f).mock.calls.flat()).join(' ');
    expect(logged).not.toMatch(/Jordan|Avery|078-05|mapleridge/i);
  });
});
