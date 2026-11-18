import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createGate } from '@/server/guard';
import { applyGate, applyLimiter, applyPerVisitor, applyReadGate, applySubmissions, handleApply } from '@/server/handlers/apply';
import { resetMailTransport } from '@/server/mail/send';
import { BodyTimeoutError, readBodyWithLimit } from '@/server/request';
import { signatureDataUrl, validApplication } from '../helpers/fixtures';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

// Regression tests for the review of the client changes and the fourth fix round (numbers follow its report).

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const body = (stream: ReadableStream<Uint8Array>) => new Request('http://x', { method: 'POST', body: stream, duplex: 'half' } as RequestInit);

describe('#6: a burst at the start cannot pay for a long drip afterwards', () => {
  it('300 KB at once, then a byte now and then, is dropped one window later', async () => {
    let sentBurst = false;
    const stream = new ReadableStream<Uint8Array>({
      async pull(c) {
        if (!sentBurst) {
          sentBurst = true;
          return c.enqueue(new Uint8Array(300_000));
        }
        await wait(100);
        c.enqueue(new Uint8Array(1));
      },
    });
    const started = Date.now();
    await expect(readBodyWithLimit(body(stream), 10_000_000, { totalMs: 20_000, idleMs: 5_000, minBytesPerSec: 1_000, windowMs: 300 })).rejects.toBeInstanceOf(
      BodyTimeoutError,
    );
    expect(Date.now() - started).toBeLessThan(2_000);
  });
});

describe('#7: a slow connection that starts late is not cut off', () => {
  it('nothing for a while, then a steady upload, is read in full', async () => {
    let sent = 0;
    const stream = new ReadableStream<Uint8Array>({
      async pull(c) {
        if (sent === 0) await wait(500); // longer than the window: the speed rule starts with the first byte
        if (sent >= 12) return c.close();
        await wait(50);
        sent++;
        c.enqueue(new Uint8Array(100)); // 2 KB/s
      },
    });
    const data = await readBodyWithLimit(body(stream), 10_000, { totalMs: 20_000, idleMs: 5_000, minBytesPerSec: 1_000, windowMs: 300 });
    expect(data.byteLength).toBe(1_200);
  });

  it('a short pause in the middle of a steady upload is tolerated', async () => {
    let sent = 0;
    const stream = new ReadableStream<Uint8Array>({
      async pull(c) {
        if (sent >= 30) return c.close();
        await wait(sent === 15 ? 150 : 20); // one pause of half a window
        sent++;
        c.enqueue(new Uint8Array(100)); // ~5 KB/s, needs 1 KB/s
      },
    });
    const data = await readBodyWithLimit(body(stream), 10_000, { totalMs: 20_000, idleMs: 5_000, minBytesPerSec: 1_000, windowMs: 300 });
    expect(data.byteLength).toBe(3_000);
  });
});

describe('#8: a ready application waits briefly for a PDF + email slot', () => {
  it('the gate hands a freed slot to the next in line, first come first served', async () => {
    const gate = createGate(1);
    const first = gate.tryEnter()!;
    const order: string[] = [];
    const a = gate.enter(1_000).then((r) => (order.push('a'), r));
    const b = gate.enter(1_000).then((r) => (order.push('b'), r));
    expect(gate.waiting).toBe(2);
    first();
    const ra = await a;
    expect(ra).not.toBeNull();
    ra!();
    expect(await b).not.toBeNull();
    expect(order).toEqual(['a', 'b']);
    expect(gate.active).toBe(1);
  });

  it('gives up after the wait and leaves the gate as it was', async () => {
    const gate = createGate(1);
    const held = gate.tryEnter()!;
    expect(await gate.enter(50)).toBeNull();
    expect(gate.waiting).toBe(0);
    held();
    expect(gate.active).toBe(0);
  });

  describe('in the API', () => {
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

    it('all 4 slots busy: the application is sent as soon as one frees up, not refused', async () => {
      const busy = [1, 2, 3, 4].map(() => applyGate.tryEnter()!);
      const form = new FormData();
      form.append('payload', JSON.stringify({ idempotencyKey: `waits-for-slot-${Date.now()}-abc`, honeypot: '', fields: validApplication(), signature: signatureDataUrl() }));
      const pending = handleApply(
        new Request('http://localhost/api/apply', { method: 'POST', body: form, headers: { host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '203.0.113.70' } }),
      );
      await wait(300);
      expect(applyGate.waiting).toBe(1);
      busy[0]();
      expect((await pending).status).toBe(200);
      busy.slice(1).forEach((r) => r());
      expect(applyGate.active).toBe(0);
    });
  });
});
