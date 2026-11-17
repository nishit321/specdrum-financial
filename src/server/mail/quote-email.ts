import { digitsOnly } from '@/lib/forms/format';
import type { HomeQuoteValues, QuoteRequestValues } from '@/lib/forms/quote-schema';
import { SITE_DOMAIN } from '@/lib/seo';
import { displayIp, formatInZone, type SubmissionMeta } from '../application';
import { oneLine, type EmailContent } from './template';

const telHref = (phone: string) => {
  const d = digitsOnly(phone);
  return `tel:${d.length === 10 ? '+1' + d : '+' + d}`;
};

const yesNo = (v: boolean) => (v ? 'Yes' : 'No');

function footer(meta: SubmissionMeta, page: string) {
  const { dateTime } = formatInZone(meta.submittedAt, meta.timeZone);
  return [`Reference ${meta.reference}`, `Submitted ${dateTime} from ${displayIp(meta.ip)} (${meta.device})`, `Sent from the ${page} on ${SITE_DOMAIN}.`];
}

/** "Send My Quote Request" on /quote-request */
export function quoteRequestEmail(v: QuoteRequestValues, meta: SubmissionMeta): { subject: string; content: EmailContent } {
  const name = `${v.first_name} ${v.last_name}`;
  const content: EmailContent = {
    eyebrow: 'New quote request',
    heading: `${name} would like a quote for ${v.loan_amount}`,
    intro: [`${v.first_name} sent the quote request form on the website${v.company ? ` for ${v.company}` : ''}. Here is everything they filled in.`],
    sections: [
      {
        title: 'Contact details',
        rows: [
          { label: 'Name', value: name },
          { label: 'Email', value: v.email, href: `mailto:${v.email}` },
          { label: 'Phone', value: v.phone, href: telHref(v.phone) },
        ],
      },
      {
        title: 'Business details',
        rows: [
          { label: 'Company', value: v.company },
          { label: 'Business type', value: v.business_type },
          { label: 'Monthly sales', value: v.monthly_sales },
          { label: 'Loan amount', value: v.loan_amount },
        ],
      },
      {
        title: 'Consent',
        rows: [
          { label: 'SMS about this inquiry', value: yesNo(v.sms_consent) },
          { label: 'Promotional SMS', value: yesNo(v.sms_promo_consent) },
          { label: 'Terms & Privacy Policy', value: 'Accepted' },
        ],
      },
    ],
    action: `Reply to this email to reach ${v.first_name} directly, or call ${v.phone}.${v.sms_consent ? '' : ' They did not agree to SMS, so call or email rather than text.'}`,
    footer: footer(meta, 'Quote Request page'),
  };
  const subject = `New quote request: ${name}${v.company ? ` – ${v.company}` : ''} (${meta.reference})`;
  return { subject: oneLine(subject, 200), content };
}

/** "Get My Free Quote" on the home page */
export function homeQuoteEmail(v: HomeQuoteValues, meta: SubmissionMeta): { subject: string; content: EmailContent } {
  const firstName = v.name.split(/\s+/)[0];
  const content: EmailContent = {
    eyebrow: 'New free quote request',
    heading: `${v.name} from ${v.business} would like a quote for ${v.amount}`,
    intro: [`${firstName} filled out the free quote form on the home page. Here is everything they filled in.`],
    sections: [
      {
        title: 'Contact details',
        rows: [
          { label: 'Name', value: v.name },
          { label: 'Business', value: v.business },
          { label: 'Email', value: v.email, href: `mailto:${v.email}` },
          { label: 'Phone', value: v.phone, href: telHref(v.phone) },
        ],
      },
      {
        title: 'What they need',
        rows: [
          { label: 'Funding amount', value: v.amount },
          { label: 'Financing type', value: v.type },
          { label: 'How they will use the funds', value: v.message },
        ],
      },
    ],
    action: `Reply to this email to reach ${firstName} directly, or call ${v.phone}.`,
    footer: footer(meta, 'home page'),
  };
  return { subject: oneLine(`New free quote request: ${v.name} – ${v.business} (${meta.reference})`, 200), content };
}
