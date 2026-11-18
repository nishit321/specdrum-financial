import {
  UPLOAD_MAX_FILES,
  UPLOAD_MAX_TOTAL_BYTES,
  applySchema,
  formatMb,
  isAllowedUploadName,
  type ApplyFields,
} from '@/lib/forms/apply-schema';
import { fieldErrors } from '@/lib/forms/quote-schema';
import { errorMessage, fail, logEvent, ok } from '@/server/api';
import { ownerName, type SubmissionMeta } from '@/server/application';
import { appTimeZone, ConfigError, mailConfig } from '@/server/config';
import { createGate, createKeyedGate, GlobalLimitError, TimeoutError, withTimeout } from '@/server/guard';
import { createIdempotencyStore, fingerprintOf, IdempotencyConflictError, isValidIdempotencyKey } from '@/server/idempotency';
import { applicationEmail } from '@/server/mail/apply-email';
import { sendOwnerMail, type MailAttachment } from '@/server/mail/send';
import { applicationPdfName, renderApplicationPdf } from '@/server/pdf/render';
import { createRateLimiter } from '@/server/rate-limit';
import { newReference } from '@/server/reference';
import { BodyTimeoutError, BodyTooLargeError, checkOrigin, clientIp, describeDevice, rateLimitKey, readBodyWithLimit } from '@/server/request';
import { UPLOAD_CONTENT_TYPES, decodeSignature, safeFileName, sniffUpload } from '@/server/uploads';

// "Submit Application" on /apply-now: validates the whole application again,
// builds the signed PDF and emails it (plus any bank statements) to the owner.

// Uploads + the JSON payload + signature + multipart boundaries.
const MAX_BODY_BYTES = UPLOAD_MAX_TOTAL_BYTES + 1024 * 1024;

/** per visitor (IPv4 address or IPv6 /64) */
export const applyLimiter = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });
/** all visitors together; only valid applications count */
export const applyGlobalLimiter = createRateLimiter({ limit: 30, windowMs: 10 * 60_000 });
/** applications whose upload is still arriving or being handled (each holds up to ~16 MB in memory) */
export const applyReadGate = createGate(8);
/** applications having their PDF built and emailed at the same moment */
export const applyGate = createGate(4);
/** a visitor can hold at most 2 of those slots (two people applying from one office is fine) */
export const applyPerVisitor = createKeyedGate(2);
export const applySubmissions = createIdempotencyStore<string>({ ttlMs: 30 * 60_000 });

type Upload = { name: string; size: number; attachment: MailAttachment };

class PdfRenderError extends Error {}

const PDF_RENDER_LIMIT_MS = 20_000;
/** how long an application that has fully arrived waits for a PDF + email slot before "busy" */
const PROCESSING_WAIT_MS = 15_000;

/** 503 answers that still count against the visitor's own limit (see the refund in the handler). */
const countsAgainstVisitor = new WeakSet<Response>();
function countAgainstVisitor(res: Response) {
  countsAgainstVisitor.add(res);
  return res;
}

export async function handleApply(request: Request) {
  const origin = checkOrigin(request.headers);
  if (!origin.ok) {
    logEvent('warn', 'apply.forbidden_origin', { origin: origin.origin, host: origin.host });
    return fail(403, 'forbidden');
  }

  const ip = clientIp(request.headers);
  const limitKey = `apply:${rateLimitKey(ip)}`;
  const wait = ip === 'unknown' ? 0 : applyLimiter.hit(limitKey);
  if (wait) {
    logEvent('warn', 'apply.rate_limited', { ip });
    return fail(429, 'rate_limited', { retryAfter: wait });
  }
  const res = await admitApplication(request, ip);
  // A full slot or a missing mail setting is on our side: it must not use up the visitor's applications
  if (res.status === 503 && !countsAgainstVisitor.has(res) && ip !== 'unknown') applyLimiter.undo(limitKey);
  return res;
}

async function admitApplication(request: Request, ip: string) {
  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.toLowerCase().startsWith('multipart/form-data')) return fail(415, 'unsupported');

  // Taken before the body is read, so memory use stays bounded under a burst.
  const releaseVisitor = ip === 'unknown' ? () => {} : applyPerVisitor.tryEnter(rateLimitKey(ip));
  if (!releaseVisitor) {
    logEvent('warn', 'apply.busy_visitor', { ip });
    return fail(503, 'busy', { retryAfter: 30 });
  }
  const releaseRead = applyReadGate.tryEnter();
  if (!releaseRead) {
    releaseVisitor();
    logEvent('warn', 'apply.busy_reading', { active: applyReadGate.active });
    return fail(503, 'busy', { retryAfter: 30 });
  }
  try {
    return await processApplication(request, contentType, ip);
  } finally {
    releaseRead();
    releaseVisitor();
  }
}

async function processApplication(request: Request, contentType: string, ip: string) {
  let form: FormData;
  try {
    const bytes = await readBodyWithLimit(request, MAX_BODY_BYTES);
    form = await new Response(bytes as BodyInit, { headers: { 'content-type': contentType } }).formData();
  } catch (err) {
    if (err instanceof BodyTooLargeError) {
      return fail(413, 'too_large', { message: `The bank statements are larger than ${formatMb(UPLOAD_MAX_TOTAL_BYTES)} in total.` });
    }
    if (err instanceof BodyTimeoutError) {
      logEvent('warn', 'apply.body_timeout', { ip });
      return fail(408, 'slow_upload');
    }
    return fail(400, 'bad_request');
  }

  // Building the PDF and sending: at most 4 at a time. Taken only now that the whole upload is
  // here, so uploads still coming in (or dripping on purpose) cannot block applications that are
  // ready. A ready one waits a little for a slot rather than making the visitor upload again.
  const release = await applyGate.enter(PROCESSING_WAIT_MS, request.signal);
  if (!release) {
    if (request.signal.aborted) return clientGone();
    logEvent('warn', 'apply.busy', { active: applyGate.active });
    // counted, like the all-visitors limit: the whole upload was already read
    return countAgainstVisitor(fail(503, 'busy', { retryAfter: 30 }));
  }
  try {
    // the visitor may have closed the page while waiting: don't build and mail an application nobody saw go through
    if (request.signal.aborted) return clientGone();
    return await submitApplication(form, request, ip);
  } finally {
    release();
  }
}

function clientGone() {
  logEvent('info', 'apply.client_gone');
  return fail(400, 'bad_request');
}

async function submitApplication(form: FormData, request: Request, ip: string) {
  let payload: Record<string, unknown>;
  try {
    const raw = form.get('payload');
    payload = typeof raw === 'string' ? JSON.parse(raw) : null;
    if (!payload || typeof payload !== 'object') throw new Error('no payload');
  } catch {
    return fail(400, 'bad_request');
  }

  const { idempotencyKey, honeypot, fields, signature } = payload;
  if (!isValidIdempotencyKey(idempotencyKey)) return fail(400, 'bad_request');

  if (typeof honeypot === 'string' && honeypot.trim() !== '') {
    logEvent('warn', 'apply.honeypot', { ip });
    return ok(newReference('SBF'));
  }

  const parsed = applySchema.safeParse(fields);
  if (!parsed.success) return fail(400, 'validation', { fields: fieldErrors(parsed.error) });

  const signaturePng = decodeSignature(signature);
  if (!signaturePng) {
    // no content logged; a browser producing PNGs we don't accept would show up here
    logEvent('warn', 'apply.signature_rejected', { present: typeof signature === 'string' && signature.length > 0 });
    return fail(400, 'validation', { fields: { signature: 'Please draw your signature.' } });
  }

  const uploads = await readUploads(form.getAll('files'));
  if ('error' in uploads) return fail(400, 'validation', { fields: { files: uploads.error } });

  let config;
  try {
    config = mailConfig();
  } catch (err) {
    logEvent('error', 'apply.not_configured', { message: err instanceof ConfigError ? err.message : errorMessage(err) });
    return fail(503, 'not_configured');
  }

  const device = describeDevice(request.headers.get('user-agent'));
  let limited = 0;
  try {
    const runKey = `apply:${idempotencyKey}`;
    // Not the signature bytes: the pad re-draws the same signature at a new size when the window
    // is resized, so an honest retry would differ. Any real change to the signature (or anything
    // else) makes the browser start a new key anyway.
    const fingerprint = fingerprintOf(parsed.data, uploads.files.map((f) => [f.name, f.size]));
    const reference = await applySubmissions
      .run(runKey, fingerprint, async () => {
        limited = applyGlobalLimiter.hit('all');
        if (limited) throw new GlobalLimitError();
        try {
          const meta: SubmissionMeta = {
            reference: applySubmissions.reference(runKey, () => newReference('SBF')),
            submittedAt: new Date(),
            timeZone: appTimeZone(),
            ip,
            device,
          };
          const data: ApplyFields = parsed.data;
          // a hard limit, so a render that never finishes can't hold a processing slot
          const pdf = await withTimeout(renderApplicationPdf({ fields: data, meta, signaturePng }), PDF_RENDER_LIMIT_MS, 'PDF render').catch((err) => {
            throw new PdfRenderError(err instanceof TimeoutError ? err.message : errorMessage(err));
          });
          const { subject, content } = applicationEmail(data, meta, uploads.files.map(({ name, size }) => ({ name, size })));
          await sendOwnerMail(
            {
              subject,
              content,
              replyTo: { name: ownerName(data), address: data.email },
              attachments: [
                { filename: applicationPdfName(data.biz_dba, meta.reference), content: pdf, contentType: 'application/pdf' },
                ...uploads.files.map((u) => u.attachment),
              ],
            },
            config,
          );
          logEvent('info', 'apply.sent', { reference: meta.reference, statements: uploads.files.length });
          return meta.reference;
        } catch (err) {
          applyGlobalLimiter.undo('all'); // failed on our side: it should not use up the quota
          throw err;
        }
      })
      .catch((err) => {
        if (err instanceof GlobalLimitError) return null;
        throw err;
      });
    if (reference === null) {
      // Not refunded: this answer comes after the whole request was read and checked, and
      // refunding it would let one address repeat that work while the all-visitors limit is full.
      logEvent('warn', 'apply.global_limit');
      return countAgainstVisitor(fail(503, 'busy', { retryAfter: limited }));
    }
    return ok(reference);
  } catch (err) {
    if (err instanceof IdempotencyConflictError) {
      logEvent('warn', 'apply.key_conflict');
      return fail(409, 'conflict');
    }
    logEvent('error', err instanceof PdfRenderError ? 'apply.pdf_failed' : 'apply.send_failed', { message: errorMessage(err) });
    return fail(502, 'send_failed');
  }
}

async function readUploads(entries: FormDataEntryValue[]): Promise<{ files: Upload[] } | { error: string }> {
  const files = entries.filter((e): e is File => typeof e !== 'string');
  if (files.length !== entries.length) return { error: 'Upload the statements as files.' };
  if (files.length > UPLOAD_MAX_FILES) return { error: `Upload at most ${UPLOAD_MAX_FILES} files.` };
  const total = files.reduce((sum, f) => sum + f.size, 0);
  if (total > UPLOAD_MAX_TOTAL_BYTES) return { error: `The files are larger than ${formatMb(UPLOAD_MAX_TOTAL_BYTES)} in total.` };

  const out: Upload[] = [];
  for (const [i, file] of files.entries()) {
    if (file.size === 0) return { error: `"${file.name}" is empty.` };
    if (!isAllowedUploadName(file.name)) return { error: `"${file.name}" is not a PDF, JPG or PNG file.` };
    const bytes = Buffer.from(await file.arrayBuffer());
    const kind = sniffUpload(bytes);
    if (!kind) return { error: `"${file.name}" is not a PDF, JPG or PNG file.` };
    const name = safeFileName(file.name, kind, `bank-statement-${i + 1}`);
    out.push({ name, size: file.size, attachment: { filename: name, content: bytes, contentType: UPLOAD_CONTENT_TYPES[kind] } });
  }
  return { files: out };
}
