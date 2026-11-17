import {
  QUOTE_FORMS,
  fieldErrors,
  type HomeQuoteValues,
  type QuoteFormName,
  type QuoteRequestValues,
} from '@/lib/forms/quote-schema';
import { errorMessage, fail, logEvent, ok } from '@/server/api';
import { appTimeZone, ConfigError, mailConfig } from '@/server/config';
import { GlobalLimitError } from '@/server/guard';
import { createIdempotencyStore, fingerprintOf, IdempotencyConflictError, isValidIdempotencyKey } from '@/server/idempotency';
import { homeQuoteEmail, quoteRequestEmail } from '@/server/mail/quote-email';
import { sendOwnerMail } from '@/server/mail/send';
import { createRateLimiter } from '@/server/rate-limit';
import { newReference } from '@/server/reference';
import { BodyTooLargeError, checkOrigin, clientIp, describeDevice, rateLimitKey, readBodyWithLimit } from '@/server/request';

const MAX_BODY_BYTES = 32 * 1024;

/** per visitor (IPv4 address or IPv6 /64) */
export const quoteLimiter = createRateLimiter({ limit: 8, windowMs: 10 * 60_000 });
/** all visitors together; only valid submissions count, so junk requests cannot use it up */
export const quoteGlobalLimiter = createRateLimiter({ limit: 60, windowMs: 10 * 60_000 });
export const quoteSubmissions = createIdempotencyStore<string>({ ttlMs: 30 * 60_000 });

/** 503 answers that still count against the visitor's own limit (see the refund in the handler). */
const countsAgainstVisitor = new WeakSet<Response>();
function countAgainstVisitor(res: Response) {
  countsAgainstVisitor.add(res);
  return res;
}

export async function handleQuote(request: Request) {
  const origin = checkOrigin(request.headers);
  if (!origin.ok) {
    logEvent('warn', 'quote.forbidden_origin', { origin: origin.origin, host: origin.host });
    return fail(403, 'forbidden');
  }

  const ip = clientIp(request.headers);
  const limitKey = `quote:${rateLimitKey(ip)}`;
  const wait = ip === 'unknown' ? 0 : quoteLimiter.hit(limitKey);
  if (wait) {
    logEvent('warn', 'quote.rate_limited', { ip });
    return fail(429, 'rate_limited', { retryAfter: wait });
  }
  const res = await processQuote(request, ip);
  // A full slot or a missing mail setting is on our side: it must not use up the visitor's requests
  if (res.status === 503 && !countsAgainstVisitor.has(res) && ip !== 'unknown') quoteLimiter.undo(limitKey);
  return res;
}

async function processQuote(request: Request, ip: string) {

  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('application/json')) return fail(415, 'unsupported');

  let body: unknown;
  try {
    body = JSON.parse(new TextDecoder().decode(await readBodyWithLimit(request, MAX_BODY_BYTES)));
  } catch (err) {
    return err instanceof BodyTooLargeError ? fail(413, 'too_large') : fail(400, 'bad_request');
  }

  const { form, idempotencyKey, honeypot, data } = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  if (typeof form !== 'string' || !Object.hasOwn(QUOTE_FORMS, form)) return fail(400, 'bad_request');
  if (!isValidIdempotencyKey(idempotencyKey)) return fail(400, 'bad_request');
  const formName = form as QuoteFormName;

  // Filled-in hidden field: a bot. Look successful so it moves on, send nothing.
  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    logEvent('warn', 'quote.honeypot', { form: formName, ip });
    return ok(newReference('SBQ'));
  }

  const parsed = QUOTE_FORMS[formName].safeParse(data);
  if (!parsed.success) return fail(400, 'validation', { fields: fieldErrors(parsed.error) });

  let config;
  try {
    config = mailConfig();
  } catch (err) {
    logEvent('error', 'quote.not_configured', { message: err instanceof ConfigError ? err.message : errorMessage(err) });
    return fail(503, 'not_configured');
  }

  const device = describeDevice(request.headers.get('user-agent'));
  try {
    let limited = 0;
    const runKey = `${formName}:${idempotencyKey}`;
    const reference = await quoteSubmissions.run(runKey, fingerprintOf(formName, parsed.data), async () => {
      limited = quoteGlobalLimiter.hit('all');
      if (limited) throw new GlobalLimitError();
      try {
        const meta = { reference: quoteSubmissions.reference(runKey, () => newReference('SBQ')), submittedAt: new Date(), timeZone: appTimeZone(), ip, device };
        let mail;
        let replyName;
        if (formName === 'quote-request') {
          const v = parsed.data as QuoteRequestValues;
          mail = quoteRequestEmail(v, meta);
          replyName = `${v.first_name} ${v.last_name}`;
        } else {
          const v = parsed.data as HomeQuoteValues;
          mail = homeQuoteEmail(v, meta);
          replyName = v.name;
        }
        await sendOwnerMail({ ...mail, replyTo: { name: replyName, address: parsed.data.email } }, config);
        logEvent('info', 'quote.sent', { form: formName, reference: meta.reference });
        return meta.reference;
      } catch (err) {
        quoteGlobalLimiter.undo('all'); // failed on our side: it should not use up the quota
        throw err;
      }
    }).catch((err) => {
      if (err instanceof GlobalLimitError) return null;
      throw err;
    });
    if (reference === null) {
      // Not refunded: this answer comes after the whole request was read and checked, and
      // refunding it would let one address repeat that work while the all-visitors limit is full.
      logEvent('warn', 'quote.global_limit', { form: formName });
      return countAgainstVisitor(fail(503, 'busy', { retryAfter: limited }));
    }
    return ok(reference);
  } catch (err) {
    if (err instanceof IdempotencyConflictError) {
      logEvent('warn', 'quote.key_conflict', { form: formName });
      return fail(409, 'conflict');
    }
    logEvent('error', 'quote.send_failed', { form: formName, message: errorMessage(err) });
    return fail(502, 'send_failed');
  }
}
