// Server-side settings read from the environment (see .env.example).

export type MailConfig = {
  host: string;
  port: number;
  secure: boolean;
  /** Refuse to send unless the connection is encrypted (STARTTLS on 587). */
  requireTls: boolean;
  user: string;
  pass: string;
  from: string;
  to: string[];
};

export class ConfigError extends Error {}

/** Throws ConfigError naming the missing settings (never their values). */
export function mailConfig(env: Record<string, string | undefined> = process.env): MailConfig {
  const missing = ['SMTP_HOST', 'SMTP_PORT', 'MAIL_FROM', 'MAIL_TO'].filter((k) => !env[k]?.trim());
  if (missing.length) throw new ConfigError(`Missing mail settings: ${missing.join(', ')}`);
  const port = Number(env.SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ConfigError('SMTP_PORT is not a valid port');
  // commas inside a quoted name ("Doe, Jane" <jane@x.com>) do not separate entries
  const to = env.MAIL_TO!.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((s) => s.trim()).filter(Boolean);
  if (to.length === 0) throw new ConfigError('MAIL_TO has no address');
  if (!to.every((entry) => isAddress(addressOf(entry)))) {
    throw new ConfigError('MAIL_TO contains something that is not an email address (use plain addresses or "Name <address>")');
  }
  if (!isAddress(addressOf(env.MAIL_FROM!))) throw new ConfigError('MAIL_FROM is not an email address (use "Name <address>" or a plain address)');
  const secure = env.SMTP_SECURE ? /^(1|true|yes)$/i.test(env.SMTP_SECURE.trim()) : port === 465;
  // Default on: the mail carries the PDF with the full SSN, so it must never go out in clear text.
  // Only a local test mail server should set SMTP_REQUIRE_TLS=false.
  const requireTls = !secure && !/^(0|false|no)$/i.test(env.SMTP_REQUIRE_TLS?.trim() ?? '');
  return {
    host: env.SMTP_HOST!.trim(),
    port,
    secure,
    requireTls,
    user: env.SMTP_USER?.trim() ?? '',
    pass: env.SMTP_PASS ?? '',
    from: env.MAIL_FROM!.trim(),
    to,
  };
}

export const appTimeZone = () => {
  const tz = process.env.APP_TIMEZONE?.trim() || 'America/Los_Angeles';
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return tz;
  } catch {
    return 'America/Los_Angeles';
  }
};

/**
 * "Owner <owner@x.com>" or '"Doe, Jane" <jane@x.com>' → the address; a plain address stays as it
 * is. Anything else (an unclosed quote, two addresses in one entry) gives '' so the check fails
 * and the forms stop with "not configured" instead of mailing a garbled recipient.
 */
const addressOf = (entry: string) => {
  const s = entry.trim();
  if (!/[<>"]/.test(s)) return s;
  return /^(?:"[^"]*"|[^"<>@]*)\s*<([^<>"\s]+)>$/.exec(s)?.[1] ?? '';
};

const isAddress = (s: string) => /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]+$/.test(s.trim());

export const trustedProxyHops = () => {
  // blank (e.g. an empty value in a deploy template) means the default, not "no proxy"
  const raw = process.env.TRUSTED_PROXY_HOPS?.trim();
  const n = raw ? Number(raw) : 1;
  return Number.isInteger(n) && n >= 0 && n <= 5 ? n : 1;
};

/** Extra origins allowed to post to the API, besides the site's own host. */
export const allowedOrigins = () =>
  (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase().replace(/\/$/, ''))
    .filter(Boolean);
