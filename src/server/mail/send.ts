import nodemailer, { type Transporter } from 'nodemailer';
import { asciiEmail } from '@/lib/forms/email';
import { mailConfig, type MailConfig } from '../config';
import { oneLine, renderEmailHtml, renderEmailText, type EmailContent } from './template';

export type MailAttachment = { filename: string; content: Buffer; contentType: string };

export type OutgoingMail = {
  subject: string;
  content: EmailContent;
  replyTo?: { name: string; address: string };
  attachments?: MailAttachment[];
};

let cached: { key: string; transporter: Transporter } | null = null;

function transporterFor(config: MailConfig): Transporter {
  const key = JSON.stringify([config.host, config.port, config.secure, config.requireTls, config.user, config.pass]);
  if (cached?.key === key) return cached.transporter;
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    requireTLS: config.requireTls,
    auth: config.user ? { user: config.user, pass: config.pass } : undefined,
    // never let a slow mail server hang the request
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 45_000,
    tls: { minVersion: 'TLSv1.2' },
  });
  cached = { key, transporter };
  return transporter;
}

/** Sends one email to the owner address(es). Throws on any SMTP failure. */
export async function sendOwnerMail(mail: OutgoingMail, config: MailConfig = mailConfig()): Promise<string> {
  const info = await transporterFor(config).sendMail({
    from: config.from,
    to: config.to,
    // the display name must not look like an address ("ceo@bank.com <boss@evil.com>"); the address
    // goes out with an ASCII domain, which every mail server accepts in a header
    replyTo: mail.replyTo
      ? { name: oneLine(mail.replyTo.name.replace(/[@<>"]/g, ' '), 100), address: asciiEmail(mail.replyTo.address) ?? mail.replyTo.address }
      : undefined,
    subject: oneLine(mail.subject, 200),
    text: renderEmailText(mail.content),
    html: renderEmailHtml(mail.content),
    attachments: mail.attachments,
  });
  return info.messageId;
}

/** Test hook: forget the cached SMTP connection settings. */
export function resetMailTransport() {
  cached?.transporter.close();
  cached = null;
}
