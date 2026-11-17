import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyGate, applyGlobalLimiter, applyLimiter, applyPerVisitor, applyReadGate, applySubmissions, handleApply } from '@/server/handlers/apply';
import { resetMailTransport } from '@/server/mail/send';
import { signatureDataUrl, validApplication } from '../helpers/fixtures';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

// Regression test for delta review 7, #5.

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
  for (const s of [applyLimiter, applyGlobalLimiter, applySubmissions, applyPerVisitor, applyReadGate, applyGate]) s.reset();
  resetMailTransport();
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  process.env = { ...savedEnv };
  vi.restoreAllMocks();
});

const headers = { host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '203.0.113.90' };

describe('#5: "busy" after a full upload still counts against the visitor', () => {
  it('a 503 from waiting for a PDF slot uses up one of the 5 attempts', async () => {
    // 4 quick attempts that the limiter counts (wrong content type)
    for (let i = 0; i < 4; i++) {
      expect((await handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: 'x', headers: { ...headers, 'content-type': 'text/plain' } }))).status).toBe(415);
    }
    const busy = [1, 2, 3, 4].map(() => applyGate.tryEnter()!);
    const form = new FormData();
    form.append('payload', JSON.stringify({ idempotencyKey: `waited-too-long-${Date.now()}-abc`, honeypot: '', fields: validApplication(), signature: signatureDataUrl() }));
    const res = await handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: form, headers }));
    expect(res.status).toBe(503); // after the 15 s wait
    busy.forEach((r) => r());
    // that was attempt 5: the next one is over the limit
    expect((await handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: 'x', headers: { ...headers, 'content-type': 'text/plain' } }))).status).toBe(429);
  }, 25_000);
});
