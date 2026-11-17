import { z } from 'zod';
import {
  HOME_FINANCING_TYPES,
  HOME_FUNDING_AMOUNTS,
  QUOTE_LOAN_AMOUNTS,
  QUOTE_MONTHLY_SALES,
  RETIRED_HOME_FINANCING_TYPES,
  values,
} from './options';
import { asciiEmail } from './email';
import { cleanPasted, digitsOnly, parsePhoneSpaces, stripInvisible } from './format';

// The two "quote" forms: the full one on /quote-request and the short one on the home page.

// Single-line fields: no control characters at all (a line break in a name could fake extra lines in the text email).
// Also Unicode line/paragraph separators and the bidi controls that can reorder text.
const SINGLE_LINE_BAD = /[\u0000-\u001f\u007f\u0085\u2028\u2029\u202a-\u202e\u2066-\u2069]/;
// The message box may contain line breaks and tabs.
const MULTI_LINE_BAD = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u202a-\u202e\u2066-\u2069]/;

const required = (message: string, max = 120) =>
  z
    .string()
    .overwrite(cleanPasted)
    .trim()
    .min(1, message)
    .max(max, 'This is too long.')
    .refine((v) => !SINGLE_LINE_BAD.test(v), 'Please remove special characters.');

const optional = (max = 120) =>
  z
    .string()
    .overwrite(cleanPasted)
    .trim()
    .max(max, 'This is too long.')
    .refine((v) => !SINGLE_LINE_BAD.test(v), 'Please remove special characters.');

const multiline = (max: number) =>
  z
    .string()
    .trim()
    .max(max, 'This is too long.')
    .refine((v) => !MULTI_LINE_BAD.test(v), 'Please remove special characters.');

// international domains (bob@exämple.com) are fine; the Reply-To header gets the ASCII form
const email = (message: string) =>
  z
    .string()
    .overwrite(stripInvisible)
    .trim()
    .normalize('NFC')
    .max(254, 'Email address is too long.')
    .refine((v) => asciiEmail(v) !== null, message);

// Same rule the static page had (10+ characters of digits and phone punctuation), plus 10–15 actual digits.
// Plain spaces only: a line break would split the Phone row in the text email.
const phone = (message: string) =>
  z
    .string()
    .overwrite(parsePhoneSpaces)
    .trim()
    .refine((v) => /^[0-9() +\-.]{10,25}$/.test(v) && digitsOnly(v).length >= 10 && digitsOnly(v).length <= 15, message);

const oneOf = (list: Parameters<typeof values>[0], message: string) =>
  z.string().refine((v) => (values(list) as string[]).includes(v), message);

export const quoteRequestSchema = z.object({
  first_name: required('Please enter your first name.', 60),
  last_name: required('Please enter your last name.', 60),
  email: email('Please enter a valid email address.'),
  phone: phone('Please enter your phone number with area code.'),
  company: optional(),
  business_type: optional(100),
  monthly_sales: oneOf(QUOTE_MONTHLY_SALES, 'Please select your monthly sales.'),
  loan_amount: oneOf(QUOTE_LOAN_AMOUNTS, 'Please select a loan amount.'),
  sms_consent: z.boolean(),
  sms_promo_consent: z.boolean(),
  terms: z.literal(true, 'Please accept the Terms of Service & Privacy Policy.'),
});

export const homeQuoteSchema = z.object({
  name: required('Please enter your name.', 100),
  business: required('Please enter your business name.'),
  phone: phone('Please enter a phone number.'),
  email: email('Please enter a valid email.'),
  amount: oneOf(HOME_FUNDING_AMOUNTS, 'Please choose an amount.'),
  type: z
    .string()
    .refine((v) => (values(HOME_FINANCING_TYPES) as string[]).includes(v) || RETIRED_HOME_FINANCING_TYPES.includes(v), 'Please choose a financing type.'),
  message: multiline(2000),
});

export type QuoteRequestValues = z.infer<typeof quoteRequestSchema>;
export type HomeQuoteValues = z.infer<typeof homeQuoteSchema>;

export const QUOTE_FORMS = { 'quote-request': quoteRequestSchema, 'home-quote': homeQuoteSchema } as const;
export type QuoteFormName = keyof typeof QUOTE_FORMS;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
