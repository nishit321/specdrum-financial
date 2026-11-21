import { formatMb, type ApplyFields } from '@/lib/forms/apply-schema';
import { digitsOnly, maskDob, maskSsn, parseCurrency, usdWhole } from '@/lib/forms/format';
import { US_STATES } from '@/lib/forms/options';
import { PROGRAMS, type CalculatorChoice } from '@/lib/loan-calculator';
import { businessAddress, calculatorRows, dashedPhone, displayIp, formatInZone, ownerName, type SubmissionMeta } from '../application';
import { SITE_DOMAIN } from '@/lib/seo';
import type { EmailContent } from './template';
import { oneLine } from './template';

export type AttachedFile = { name: string; size: number };

const amountText = (v: string) => {
  const n = parseCurrency(v);
  return n === null ? v : usdWhole(n);
};

export function applicationEmail(
  f: ApplyFields,
  meta: SubmissionMeta,
  files: AttachedFile[],
  calculator: CalculatorChoice | null = null,
): { subject: string; content: EmailContent } {
  const { dateTime } = formatInZone(meta.submittedAt, meta.timeZone);
  const name = ownerName(f);
  const amount = amountText(f.biz_amount);
  const taxIdIsSsn = digitsOnly(f.biz_ein) === digitsOnly(f.ssn);

  const filesSentence =
    files.length === 0
      ? 'No bank statements were uploaded, so you may need to ask for them.'
      : `${files.length === 1 ? 'One bank statement was' : `${files.length} bank statements were`} uploaded and ${files.length === 1 ? 'is' : 'are'} attached too.`;

  const content: EmailContent = {
    eyebrow: 'New funding application',
    heading: `${f.biz_dba} applied for ${amount}`,
    intro: [
      `${name} (${f.title}, ${f.ownership.replace(/\s/g, '')} owner) filled out the Apply Now form and signed it electronically. The signed application is attached as a PDF. ${filesSentence}`,
      ...(calculator ? [`They came from the loan calculator and picked ${PROGRAMS[calculator.program].name}.`] : []),
    ],
    sections: [
      {
        title: 'Funding request',
        rows: [
          { label: 'Amount requested', value: amount },
          { label: 'Use of funds', value: f.biz_use },
          ...(f.use_of_funds !== f.biz_use ? [{ label: 'Use of funds (first step)', value: f.use_of_funds }] : []),
          ...(amountText(f.amount) !== amount ? [{ label: 'Amount (first step)', value: amountText(f.amount) }] : []),
        ],
      },
      ...(calculator ? [{ title: 'Loan calculator', rows: calculatorRows(calculator) }] : []),
      {
        title: 'Business',
        rows: [
          { label: 'Legal name', value: f.biz_legal },
          { label: 'D/B/A name', value: f.biz_dba },
          { label: 'Address', value: businessAddress(f.biz_address, f.biz_zip) },
          { label: 'Phone', value: dashedPhone(f.biz_phone), href: `tel:+1${digitsOnly(f.biz_phone)}` },
          { label: 'Tax ID', value: taxIdIsSsn ? `${maskSsn(f.biz_ein)} (same as owner's SSN)` : f.biz_ein },
          { label: 'Type of business', value: f.biz_type },
          { label: 'Incorporation', value: `${f.biz_incorp}, ${US_STATES[f.biz_state] ?? f.biz_state}` },
          { label: 'In business since', value: f.biz_start },
          { label: 'Property', value: f.biz_property },
          { label: 'Avg. monthly revenue', value: amountText(f.monthly_revenue) },
          { label: 'Avg. daily bank balance', value: amountText(f.daily_balance) },
          { label: 'Open MCA/loans', value: f.open_loans },
          { label: 'Website', value: f.website },
        ],
      },
      {
        title: 'Business owner',
        rows: [
          { label: 'Name', value: name },
          { label: 'Title / ownership', value: `${f.title}, ${f.ownership.replace(/\s/g, '')}` },
          { label: 'Email', value: f.email, href: `mailto:${f.email}` },
          { label: 'Mobile phone', value: dashedPhone(f.phone), href: `tel:+1${digitsOnly(f.phone)}` },
          { label: 'Home address', value: `${f.home_address}, ${f.city}, ${f.state} ${f.home_zip}` },
          { label: 'ZIP code (first step)', value: f.zip },
          { label: 'Date of birth', value: maskDob(f.dob) },
          { label: 'SSN', value: maskSsn(f.ssn) },
        ],
      },
      {
        title: 'Signature',
        rows: [
          { label: 'Signed by', value: f.sign_name },
          { label: 'Signed at', value: dateTime },
          { label: 'IP / device', value: `${displayIp(meta.ip)} / ${meta.device}` },
        ],
      },
      {
        title: 'Attachments',
        rows: [
          { label: 'Application', value: 'Signed application (PDF)' },
          ...files.map((file, i) => ({ label: `Bank statement ${i + 1}`, value: `${file.name} (${formatMb(file.size)})` })),
        ],
      },
    ],
    action: `Reply to this email to reach ${f.first_name} directly, or call ${dashedPhone(f.phone)}.`,
    footer: [
      `Reference ${meta.reference}`,
      `Submitted ${dateTime} from ${displayIp(meta.ip)} (${meta.device})`,
      `The full SSN and date of birth are only in the attached PDF. Sent from the Apply Now page on ${SITE_DOMAIN}.`,
    ],
  };

  return { subject: oneLine(`New application: ${f.biz_dba} – ${amount} (${meta.reference})`, 200), content };
}
