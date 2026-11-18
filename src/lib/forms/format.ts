// Input masks and parsers. Used while typing (browser) and again on the server,
// so a value that passes in the browser always parses the same way in the API.

// Pasted text (names, emails, websites) can carry invisible characters (zero-width spaces), and
// Hawaiian names often use the modifier-letter okina; both are folded into what the PDF font can
// print before any check.
export const cleanPasted = (v: string) =>
  v.replace(/[\u200b-\u200d\u2060\ufeff]/g, '').replace(/\u02bb/g, '\u2018').replace(/\u02bc/g, '\u2019');

// Direction marks and other invisible characters that phones and apps add around a pasted phone
// number or email address (iOS wraps numbers from Contacts in them). They carry nothing there.
export const stripInvisible = (v: string) => v.replace(/[\u00ad\u034f\u061c\u180e\u200b-\u200f\u202a-\u202e\u2060-\u2064\u2066-\u2069\ufeff]/g, '');

// Phone numbers copied from contacts or web pages often contain no-break, narrow or wide spaces,
// a tab, typographic dashes or full-width digits (NFKC turns the last into 0-9).
export const parsePhoneSpaces = (v: string) =>
  stripInvisible(v)
    .normalize('NFKC')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u00a0\u2000-\u200a\u202f\u3000\t]/g, ' ');

export const digitsOnly = (value: string) => value.replace(/\D/g, '');

/** US number without the leading country code 1: "+1 (269) 350-3651" → "2693503651". */
export function nanpDigits(value: string): string {
  const d = digitsOnly(value);
  return d.length > 10 && d.startsWith('1') ? d.slice(1) : d;
}

/** (999) 999-9999 while typing; keeps at most 10 digits and drops a leading country code 1. */
export function formatPhone(value: string): string {
  const d = nanpDigits(value).slice(0, 10);
  if (d.length === 0) return '';
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** 999-99-9999 while typing; keeps at most 9 digits. */
export function formatSsn(value: string): string {
  const d = digitsOnly(value).slice(0, 9);
  if (d.length <= 3) return d;
  if (d.length <= 5) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

/** 99-9999999 for an EIN (9 digits). */
export function formatEin(value: string): string {
  const d = digitsOnly(value).slice(0, 9);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}-${d.slice(2)}`;
}

/** "$ 46,000" — same look the static site used on blur. Empty input stays empty. */
export function formatCurrencyInput(value: string): string {
  const d = digitsOnly(value).replace(/^0+(?=\d)/, '');
  if (!d) return '';
  return `$ ${Number(d.slice(0, 12)).toLocaleString('en-US')}`;
}

/** Whole dollars from "$ 46,000", "46000", "$46,000.00" (cents are dropped). */
export function parseCurrency(value: string): number | null {
  const cleaned = value.replace(/[$,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  const n = Math.floor(Number(cleaned));
  return Number.isSafeInteger(n) ? n : null;
}

export const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
export const usdWhole = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

/** MM/DD/YYYY while typing. */
export function formatDateInput(value: string): string {
  const d = digitsOnly(value).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** MM/YYYY while typing. */
export function formatMonthYearInput(value: string): string {
  const d = digitsOnly(value).slice(0, 6);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

/** Parses MM/DD/YYYY into a UTC date; null when the calendar date does not exist. */
export function parseUsDate(value: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!m) return null;
  const [month, day, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

/** Whole years between a birth date and `now` (UTC calendar days). */
export function ageOn(birth: Date, now: Date): number {
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < birth.getUTCMonth() || (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** "100%", "100", "50.5 %" -> 50.5 ; null when not a number. */
export function parsePercent(value: string): number | null {
  const m = /^\s*(\d{1,3}(?:\.\d{1,2})?)\s*%?\s*$/.exec(value);
  return m ? Number(m[1]) : null;
}

/** Last 4 digits only, for places where the full number must not appear (email body). */
export function maskSsn(ssn: string): string {
  const d = digitsOnly(ssn);
  return d.length === 9 ? `***-**-${d.slice(5)}` : '***-**-****';
}

export function maskDob(dob: string): string {
  const m = /^\d{2}\/\d{2}\/(\d{4})$/.exec(dob);
  return m ? `**/**/${m[1]}` : '**/**/****';
}
