import { simpleParser, type ParsedMail } from 'mailparser';
import type { AddressInfo } from 'node:net';
import { SMTPServer } from 'smtp-server';

// Local SMTP server for tests: accepts every message and keeps it in memory.
// Nothing ever leaves the machine.

export type Sink = {
  port: number;
  messages: ParsedMail[];
  /** messages whose DATA was received and then refused (failNext) */
  rejected: ParsedMail[];
  envelopes: { from: string; to: string[] }[];
  /** Makes the next N messages fail with a 451 error. */
  failNext(count?: number): void;
  close(): Promise<void>;
};

export async function startSmtpSink(): Promise<Sink> {
  const messages: ParsedMail[] = [];
  const rejected: ParsedMail[] = [];
  const envelopes: { from: string; to: string[] }[] = [];
  let failures = 0;

  const server = new SMTPServer({
    authOptional: true,
    disabledCommands: ['STARTTLS'],
    logger: false,
    size: 60 * 1024 * 1024,
    onData(stream, session, callback) {
      const chunks: Buffer[] = [];
      stream.on('data', (c: Buffer) => chunks.push(c));
      stream.on('end', async () => {
        if (failures > 0) {
          failures--;
          rejected.push(await simpleParser(Buffer.concat(chunks)));
          const err = Object.assign(new Error('Temporary failure'), { responseCode: 451 });
          return callback(err);
        }
        messages.push(await simpleParser(Buffer.concat(chunks)));
        envelopes.push({
          from: session.envelope.mailFrom ? session.envelope.mailFrom.address : '',
          to: session.envelope.rcptTo.map((r) => r.address),
        });
        callback();
      });
    },
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = (server.server.address() as AddressInfo).port;

  return {
    port,
    messages,
    rejected,
    envelopes,
    failNext(count = 1) {
      failures = count;
    },
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

export function mailEnv(port: number): Record<string, string> {
  return {
    SMTP_HOST: '127.0.0.1',
    SMTP_PORT: String(port),
    SMTP_SECURE: 'false',
    SMTP_REQUIRE_TLS: 'false', // the local sink has no TLS
    SMTP_USER: '',
    SMTP_PASS: '',
    MAIL_FROM: 'Spectrum Financial Website <no-reply@spectrumbusinessfinance.com>',
    MAIL_TO: 'owner@spectrum.test',
    APP_TIMEZONE: 'America/Los_Angeles',
    TRUSTED_PROXY_HOPS: '1',
  };
}
