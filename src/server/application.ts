import type { ApplyFields } from '@/lib/forms/apply-schema';
import { digitsOnly, formatEin, formatSsn, nanpDigits, parseCurrency, parsePercent, usd } from '@/lib/forms/format';
import { US_STATES } from '@/lib/forms/options';

// Turns a validated application into the labelled values shown on the PDF and in the email.

export type Row = { label: string; value: string };

export type SubmissionMeta = {
  reference: string;
  submittedAt: Date;
  timeZone: string;
  ip: string;
  device: string;
};

const INCORPORATION_DISPLAY: Record<string, string> = { LLC: 'Limited Liability Company' };

/** 269-350-3651, like the sample application. */
export const dashedPhone = (v: string) => {
  const d = nanpDigits(v);
  return d.length === 10 ? `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}` : v;
};

const money = (v: string) => {
  const n = parseCurrency(v);
  return n === null ? v : usd(n);
};

const percent = (v: string) => {
  const n = parsePercent(v);
  return n === null ? v : `${n}%`;
};

/** A 9-digit tax ID shown as an SSN when it is the owner's SSN, otherwise as an EIN. */
export const taxId = (ein: string, ssn: string) =>
  digitsOnly(ein) === digitsOnly(ssn) ? formatSsn(ein) : formatEin(ein);

/** "724 W Centre Ave, Portage, MI 49024" when the street line already ends in a state code. */
export const businessAddress = (address: string, zip: string) =>
  /\b[A-Za-z]{2}\.?$/.test(address.trim()) ? `${address.trim()} ${zip}` : `${address.trim()}, ${zip}`;

export const ownerName = (f: ApplyFields) => `${f.first_name} ${f.last_name}`;

/** The client IP for people to read; 'unknown' means no trusted proxy reported one. */
export const displayIp = (ip: string) => (ip === 'unknown' ? 'IP not available' : ip);

export function formatInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).formatToParts(date);
  const p = (type: Intl.DateTimeFormatPartTypes) => parts.find((x) => x.type === type)?.value ?? '';
  const day = `${p('month')}/${p('day')}/${p('year')}`;
  return { day, dateTime: `${day} ${p('hour')}:${p('minute')} ${p('dayPeriod')} ${p('timeZoneName')}` };
}

export function businessRows(f: ApplyFields): Row[][] {
  return [
    [
      { label: 'Business Legal Name', value: f.biz_legal },
      { label: 'Amount Requested', value: money(f.biz_amount) },
      { label: 'Use of Funds', value: f.biz_use },
    ],
    [
      { label: 'Business D/B/A Name', value: f.biz_dba },
      { label: 'Contact Number', value: dashedPhone(f.biz_phone) },
      { label: 'Own/Lease Property', value: f.biz_property },
    ],
    [
      { label: 'Business Address', value: businessAddress(f.biz_address, f.biz_zip) },
      { label: 'Tax ID', value: taxId(f.biz_ein, f.ssn) },
      { label: 'Business Start', value: f.biz_start },
    ],
    [
      { label: 'Type of Business', value: f.biz_type },
      { label: 'Average Monthly Revenue', value: money(f.monthly_revenue) },
      { label: 'Incorporation Type', value: INCORPORATION_DISPLAY[f.biz_incorp] ?? f.biz_incorp },
    ],
    [
      { label: 'State of Incorporation', value: US_STATES[f.biz_state] ?? f.biz_state },
      { label: 'Average Daily Bank Balance', value: money(f.daily_balance) },
      { label: 'Open MCA/Loan Balance', value: f.open_loans },
    ],
    [{ label: 'Website', value: f.website || '—' }],
  ];
}

export function ownerRows(f: ApplyFields): Row[][] {
  return [
    [
      { label: 'Name', value: ownerName(f) },
      { label: 'Title', value: f.title },
      { label: 'Ownership', value: percent(f.ownership) },
    ],
    [
      { label: 'Address', value: `${f.home_address}, ${f.city}, ${f.state} ${f.home_zip}` },
      { label: 'SSN', value: formatSsn(f.ssn) },
      { label: 'Birth Date', value: f.dob },
    ],
    [
      { label: 'Phone', value: dashedPhone(f.phone) },
      { label: 'Email', value: f.email },
    ],
  ];
}

export const AUTHORIZATION_TEXT =
  'By checking this box, I agree that the electronic digitized signatures I apply on the following document are representations of my signature and are legally valid and binding as if I had signed the document with ink on paper in accordance with the Uniform Electronic Transactions Act (UETA) and the Electronic Signatures in Global and National Commerce Act (E-SIGN) of 2000. By signing below, the undersigned individual, who is either a principal of the credit applicant or a personal guarantor of its obligations, provides written instruction to Borrower or its assignee (and any assignee or potential assignee thereof) authorizing review of his/her personal credit profile from a national credit bureau. Such authorization shall extend to obtaining a credit profile in considering this application and subsequently for the purposes of update, renewal or extension of such credit or additional credit and for reviewing or collecting the resulting account. A Photostat or facsimile copy of this authorization shall be valid as the original. By signature below, I/we affirm my/our identity as the respective individual(s) identified in the above application.';

// Same wording as the consent box on step 1 of the Apply Now form.
export const PERMISSION_TO_CONTACT_TEXT =
  'By checking this box and selecting Continue the Borrower agrees to authorize Spectrum Financial to contact the Borrower at the telephone, cell phone, email or direct mail contact data provided in this form for purposes of fulfilling this inquiry about business financing, even if the Borrower has previously indicated a preference of "do not call" or "do not email" with a government registry or with Spectrum Financial. Also, the Borrower agrees that we may deliver a response to the pre-approval request to the email address provided. By agreeing to communicate with Spectrum Financial about this pre-approval request by email, the Borrower agrees to retain (whether by printing or saving electronically) the communications and documents that we email. If the Borrower is unable to print or retain the information, or wishes to revoke the agreement to be contacted about this qualification inquiry by email, the Borrower agrees to call Spectrum Financial at (800) 214-7498.';
