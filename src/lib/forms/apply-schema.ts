import { z } from 'zod';
import {
  BUSINESS_TYPES,
  INCORPORATION_TYPES,
  OPEN_LOANS,
  OWNER_TITLES,
  PROPERTY_STATUS,
  US_STATES,
  USE_OF_FUNDS_BUSINESS,
  USE_OF_FUNDS_INITIAL,
  values,
} from './options';
import { asciiEmail, asciiWebsite, isWebsite } from './email';
import { ageOn, cleanPasted, digitsOnly, nanpDigits, parseCurrency, parsePercent, parsePhoneSpaces, parseUsDate, stripInvisible } from './format';

// One schema for the whole Apply Now application. The browser validates the
// fields of the current step with it; the API validates everything again.

const MAX_AMOUNT = 50_000_000;

// Characters the PDF font (Roboto) can print: Latin with accents (incl. Vietnamese, Romanian),
// Greek, Cyrillic and common punctuation. Taken from the font's own character map;
// tests/server/review-fixes.test.ts checks every one of them against the font file.
export const PRINTABLE = new RegExp(
  '^[' +
    '\\u0020-\\u007e\\u00a0-\\u017f\\u018f\\u0192\\u01a0-\\u01a1\\u01af-\\u01b0\\u01f0\\u01fa-\\u01ff\\u0218-\\u021b\\u0237' +
    '\\u0384-\\u038a\\u038c\\u038e-\\u03a1\\u03a3-\\u03ce\\u03d1-\\u03d2\\u03d6\\u0400-\\u0486\\u0488-\\u04ff' +
    '\\u1e00-\\u1e01\\u1e3e-\\u1e3f\\u1e80-\\u1e85\\u1e9e\\u1ea0-\\u1ef9' +
    '\\u2010-\\u2011\\u2013-\\u2015\\u2017-\\u201e\\u2020-\\u2022\\u2025-\\u2027\\u2030\\u2032-\\u2033\\u2039-\\u203a\\u203c\\u2044' +
    '\\u20a3-\\u20a4\\u20a6-\\u20ac\\u20b1\\u20b9-\\u20ba\\u20bc-\\u20bd\\u2105\\u2113\\u2116\\u2122\\u2126\\u212e' +
    ']*$',
);

const text = (label: string, max = 120) =>
  z
    .string()
    .overwrite(cleanPasted)
    .trim()
    // a pasted "é" may arrive as "e" + combining accent; store and check the composed form
    .normalize('NFC')
    .min(1, `Please enter ${label}.`)
    .max(max, `${label[0].toUpperCase()}${label.slice(1)} is too long.`)
    // control characters never belong in a name or address; emoji and other scripts can't be printed on the PDF
    .refine((v) => !/[\u0000-\u001f\u007f]/.test(v), `Please remove special characters from ${label}.`)
    .refine(
      (v) => PRINTABLE.test(v),
      'Please use English letters (accents are fine), without emoji. If your name is written in another script, call us at 1-800-214-7498.',
    );

const choice = (list: Parameters<typeof values>[0], message: string) =>
  z.string().refine((v) => (values(list) as string[]).includes(v), message);

const zip = z.string().trim().regex(/^\d{5}$/, 'Enter a 5-digit ZIP code.');

const usPhone = z
  .string()
  .overwrite(parsePhoneSpaces)
  .trim()
  .refine((v) => /^[0-9 ().+-]+$/.test(v) && /^[2-9]\d{2}[2-9]\d{6}$/.test(nanpDigits(v)), 'Enter a 10-digit US phone number.');

const state = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase())
  .refine((v) => v in US_STATES, 'Enter a 2-letter US state code.');

const money = (label: string, { min = 0 } = {}) =>
  z.string().trim().refine((v) => {
    const n = parseCurrency(v);
    return n !== null && n >= min && n <= MAX_AMOUNT;
  }, min > 0 ? `Enter the ${label} in dollars.` : `Enter the ${label} in dollars (0 if none).`);

export const applySchema = z.object({
  /* step 1A — initial contact */
  // international domains (bob@exämple.com) are fine; the Reply-To header gets the ASCII form
  email: z
    .string()
    .overwrite(stripInvisible)
    .trim()
    .normalize('NFC')
    .max(254, 'Email address is too long.')
    .refine((v) => asciiEmail(v) !== null, 'Enter a valid email address.')
    // the address is printed on the PDF too
    .refine((v) => PRINTABLE.test(v), 'Please enter this email address in English letters, or call us at 1-800-214-7498.'),
  zip,
  phone: usPhone,
  amount: money('amount requested', { min: 1 }),
  use_of_funds: choice(USE_OF_FUNDS_INITIAL, 'Select the use of funds.'),
  consent_contact: z.literal(true, 'Please check the box to continue.'),

  /* step 1B — owner */
  first_name: text('your first name', 60),
  last_name: text('your last name', 60),
  home_address: text('your home address'),
  city: text('your city', 60),
  state,
  home_zip: zip,
  dob: z
    .string()
    .trim()
    .superRefine((v, ctx) => {
      const d = parseUsDate(v);
      if (!d) return void ctx.addIssue({ code: 'custom', message: 'Enter your date of birth as MM/DD/YYYY.' });
      const age = ageOn(d, new Date());
      if (age < 18) ctx.addIssue({ code: 'custom', message: 'The business owner must be at least 18.' });
      else if (age > 110) ctx.addIssue({ code: 'custom', message: 'Check the year of birth.' });
    }),
  ssn: z
    .string()
    .trim()
    .refine((v) => {
      const d = digitsOnly(v);
      if (!/^[0-9 -]+$/.test(v) || !/^\d{9}$/.test(d) || d.slice(5) === '0000') return false;
      // ITIN: 9xx with a group of 50-65, 70-88, 90-92 or 94-99
      if (d[0] === '9') return /^(5\d|6[0-5]|7\d|8[0-8]|9[0-2]|9[4-9])$/.test(d.slice(3, 5));
      // SSN: never issued with area 000/666 or group 00
      return !/^(000|666)/.test(d) && d.slice(3, 5) !== '00';
    }, 'Enter a valid 9-digit Social Security Number or ITIN.'),
  ownership: z.string().trim().refine((v) => {
    const n = parsePercent(v);
    return n !== null && n > 0 && n <= 100;
  }, 'Enter an ownership percentage between 1 and 100.'),
  title: choice(OWNER_TITLES, 'Select your title.'),

  /* step 2 — business */
  biz_amount: money('amount requested', { min: 1 }),
  biz_use: choice(USE_OF_FUNDS_BUSINESS, 'Select the use of funds.'),
  biz_dba: text('the business D/B/A name'),
  biz_legal: text('the business legal name'),
  biz_ein: z.string().trim().refine((v) => /^\d{9}$/.test(digitsOnly(v)) && /^[0-9 -]+$/.test(v), 'Enter a 9-digit Tax ID / EIN.'),
  biz_address: text('the business address'),
  biz_zip: zip,
  biz_phone: usPhone,
  biz_incorp: choice(INCORPORATION_TYPES, 'Select the incorporation type.'),
  biz_state: state,
  biz_start: z
    .string()
    .trim()
    .superRefine((v, ctx) => {
      const m = /^(\d{2})\/(\d{4})$/.exec(v);
      const month = m ? Number(m[1]) : 0;
      const year = m ? Number(m[2]) : 0;
      if (!m || month < 1 || month > 12 || year < 1800) {
        return void ctx.addIssue({ code: 'custom', message: 'Enter the start date as MM/YYYY.' });
      }
      const now = new Date();
      // allow the current month in any US time zone
      if (year > now.getUTCFullYear() || (year === now.getUTCFullYear() && month > now.getUTCMonth() + 2)) {
        ctx.addIssue({ code: 'custom', message: 'The start date cannot be in the future.' });
      }
    }),
  biz_type: choice(BUSINESS_TYPES, 'Select the type of business.'),
  biz_property: choice(PROPERTY_STATUS, 'Select the property status.'),
  monthly_revenue: money('average monthly revenue'),
  daily_balance: money('average daily bank balance'),
  open_loans: choice(OPEN_LOANS, 'Select the open MCA/loan balance.'),
  website: z
    .string()
    .overwrite(cleanPasted)
    .trim()
    .max(200, 'Website address is too long.')
    // the domain may be in any script; the rest must be printable on the PDF
    .refine(
      (v) => v === '' || (isWebsite(v) && PRINTABLE.test(asciiWebsite(v))),
      'Enter a website like www.yourbusiness.com, or leave it empty.',
    )
    // a domain the PDF font cannot print (卸ッ.jp) goes out in its ASCII form (xn--…)
    .transform((v) => (v === '' || PRINTABLE.test(v) ? v : asciiWebsite(v))),

  /* step 3 — e-sign */
  sign_name: text('your full legal name'),
  esign_consent: z.literal(true, 'Please agree to use electronic records and signatures.'),
});

export type ApplyFields = z.infer<typeof applySchema>;
export type ApplyField = keyof ApplyFields;
export type ApplyValues = { [K in ApplyField]: ApplyFields[K] extends boolean ? boolean : string };

export const STEP_FIELDS = {
  '1A': ['email', 'zip', 'phone', 'amount', 'use_of_funds', 'consent_contact'],
  '1B': ['first_name', 'last_name', 'home_address', 'city', 'state', 'home_zip', 'dob', 'ssn', 'ownership', 'title'],
  '2': [
    'biz_amount', 'biz_use', 'biz_dba', 'biz_legal', 'biz_ein', 'biz_address', 'biz_zip', 'biz_phone', 'biz_incorp',
    'biz_state', 'biz_start', 'biz_type', 'biz_property', 'monthly_revenue', 'daily_balance', 'open_loans', 'website',
  ],
  '3': ['sign_name', 'esign_consent'],
} as const satisfies Record<string, readonly ApplyField[]>;

export type FieldErrors<F extends string = string> = Partial<Record<F, string>>;

/** First message per field, for the given fields only. */
export function validateFields(input: Partial<ApplyValues>, fields: readonly ApplyField[]): FieldErrors<ApplyField> {
  const result = applySchema.safeParse(input);
  if (result.success) return {};
  const errors: FieldErrors<ApplyField> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as ApplyField;
    if (fields.includes(key) && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

/* ---------- signature + uploads (limits shared with the browser) ---------- */

export const SIGNATURE_MAX_BYTES = 400_000;

const envMb = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_TOTAL_MB);
export const UPLOAD_MAX_TOTAL_BYTES = Math.round((Number.isFinite(envMb) && envMb > 0 ? envMb : 15) * 1024 * 1024);
export const UPLOAD_MAX_FILES = 10;
export const UPLOAD_ACCEPT = '.pdf,.png,.jpg,.jpeg';

export const isAllowedUploadName = (name: string) => /\.(pdf|png|jpe?g)$/i.test(name);

export const formatMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
