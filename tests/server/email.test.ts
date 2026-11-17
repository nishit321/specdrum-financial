import { describe, expect, it } from 'vitest';
import { applySchema } from '@/lib/forms/apply-schema';
import { homeQuoteSchema, quoteRequestSchema } from '@/lib/forms/quote-schema';
import { applicationEmail } from '@/server/mail/apply-email';
import { homeQuoteEmail, quoteRequestEmail } from '@/server/mail/quote-email';
import { escapeHtml, oneLine, renderEmailHtml, renderEmailText } from '@/server/mail/template';
import { validApplication, validHomeQuote, validQuoteRequest } from '../helpers/fixtures';

const meta = {
  reference: 'SBF-2026-4F7K2Q',
  submittedAt: new Date('2026-11-14T18:35:00Z'),
  timeZone: 'America/Los_Angeles',
  ip: '203.0.113.7',
  device: 'Chrome on Mac OS',
};

describe('email template', () => {
  it('escapes everything that came from a form', () => {
    const html = renderEmailHtml({
      eyebrow: 'x',
      heading: '<img src=x onerror=alert(1)>',
      intro: ['"quotes" & <b>tags</b>'],
      sections: [{ title: 'T', rows: [{ label: '<script>', value: '</td><script>alert(1)</script>' }] }],
      footer: ['<a href="javascript:alert(1)">x</a>'],
    });
    expect(html).not.toMatch(/<script>|<img src=x|<b>tags|href="javascript/);
    expect(html).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(escapeHtml(`<>"'&`)).toBe('&lt;&gt;&quot;&#39;&amp;');
  });

  it('only links tel:, mailto: and http(s): values', () => {
    const html = renderEmailHtml({
      eyebrow: 'x',
      heading: 'h',
      intro: [],
      sections: [
        {
          title: 'T',
          rows: [
            { label: 'a', value: 'call', href: 'tel:+12693503651' },
            { label: 'b', value: 'evil', href: 'javascript:alert(1)' },
            { label: 'c', value: 'mail', href: 'mailto:a@b.com"onmouseover="x' },
          ],
        },
      ],
      footer: [],
    });
    expect(html).toContain('href="tel:+12693503651"');
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('onmouseover');
  });

  it('shows "Not provided" for empty values in HTML and text', () => {
    const content = { eyebrow: 'x', heading: 'h', intro: [], sections: [{ title: 'T', rows: [{ label: 'Company', value: '' }] }], footer: [] };
    expect(renderEmailHtml(content)).toContain('Not provided');
    expect(renderEmailText(content)).toContain('Company: Not provided');
  });

  it('keeps header values on one line', () => {
    expect(oneLine('New quote\r\nBcc: victim@x.com')).toBe('New quote Bcc: victim@x.com');
  });
});

describe('application email', () => {
  const f = applySchema.parse(validApplication());

  it('has every detail, masks SSN and date of birth, and reads like a person wrote it', () => {
    const { subject, content } = applicationEmail(f, meta, [{ name: 'october.pdf', size: 1_200_000 }]);
    expect(subject).toBe('New application: Maple Ridge Bakery – $46,000 (SBF-2026-4F7K2Q)');
    const text = renderEmailText(content);
    for (const expected of [
      'Maple Ridge Bakery applied for $46,000',
      'Jordan Avery (Owner, 100% owner) filled out the Apply Now form',
      'One bank statement was uploaded and is attached too.',
      'Maple Ridge Bakery LLC',
      '724 W Centre Ave, Suite 203, Portage, MI 49024',
      '46-2383674',
      'Restaurant & Hospitality',
      'LLC, Michigan',
      '$41,000',
      '$4,000',
      'jordan@mapleridgebakery.com',
      '269-350-3651',
      '188 W Chicago Street, Coldwater, MI 49036',
      '***-**-1120',
      '**/**/1965',
      '11/14/2026 10:35 AM PST',
      '203.0.113.7 / Chrome on Mac OS',
      'october.pdf (1.1 MB)',
      'Reply to this email to reach Jordan directly, or call 269-350-3651.',
    ]) {
      expect(text, expected).toContain(expected);
    }
    expect(text).not.toContain('078-05-1120');
    expect(text).not.toContain('03/24/1965');
    expect(renderEmailHtml(content)).not.toContain('078-05-1120');
  });

  it('masks the tax ID when it is the owner SSN, and mentions missing statements', () => {
    const g = applySchema.parse({ ...validApplication(), biz_ein: '078-05-1120' });
    const text = renderEmailText(applicationEmail(g, meta, []).content);
    expect(text).toContain("***-**-1120 (same as owner's SSN)");
    expect(text).not.toContain('078-05-1120');
    expect(text).toContain('No bank statements were uploaded');
  });

  it('shows the first-step answers only when they differ from the business step', () => {
    const same = renderEmailText(applicationEmail(f, meta, []).content);
    expect(same).not.toContain('(first step)\n');
    expect(same).not.toContain('Use of funds (first step)');
    const g = applySchema.parse({ ...validApplication(), use_of_funds: 'Secure New Inventory', amount: '$ 50,000' });
    const diff = renderEmailText(applicationEmail(g, meta, []).content);
    expect(diff).toContain('Secure New Inventory');
    expect(diff).toContain('Amount (first step)');
  });
});

describe('quote emails', () => {
  it('quote request: all fields, consent answers, reply hint', () => {
    const v = quoteRequestSchema.parse(validQuoteRequest());
    const { subject, content } = quoteRequestEmail(v, { ...meta, reference: 'SBQ-2026-ABCDEF' });
    expect(subject).toBe('New quote request: Priya Shah – Shah Logistics (SBQ-2026-ABCDEF)');
    const text = renderEmailText(content);
    for (const s of ['Priya Shah would like a quote for $25,000 – $50,000', 'priya@shahlogistics.com', '(714) 555-0142', 'Shah Logistics', 'Trucking & Logistics', '$50,000 – $75,000', 'SMS about this inquiry: Yes', 'Promotional SMS:        No', 'Accepted']) {
      expect(text, s).toContain(s);
    }
  });

  it('quote request without SMS consent says to call or email instead', () => {
    const v = quoteRequestSchema.parse({ ...validQuoteRequest(), sms_consent: false, company: '' });
    const { subject, content } = quoteRequestEmail(v, meta);
    expect(subject).toBe('New quote request: Priya Shah (SBF-2026-4F7K2Q)');
    expect(content.action).toContain('did not agree to SMS');
  });

  it('home quote: all fields including the message with line breaks', () => {
    const v = homeQuoteSchema.parse({ ...validHomeQuote(), message: 'Two new lifts\nand a tire machine' });
    const { subject, content } = homeQuoteEmail(v, meta);
    expect(subject).toBe('New free quote request: Marcus Lee – Lee Auto Repair (SBF-2026-4F7K2Q)');
    const html = renderEmailHtml(content);
    expect(html).toContain('Two new lifts<br>and a tire machine');
    expect(renderEmailText(content)).toContain('Equipment Loan / Lease');
  });

  it('no AI-sounding filler', () => {
    const all = [
      renderEmailText(applicationEmail(applySchema.parse(validApplication()), meta, []).content),
      renderEmailText(quoteRequestEmail(quoteRequestSchema.parse(validQuoteRequest()), meta).content),
      renderEmailText(homeQuoteEmail(homeQuoteSchema.parse(validHomeQuote()), meta).content),
    ].join('\n');
    expect(all).not.toMatch(/I hope this|delve|seamless|rest assured|Please do not hesitate|exciting opportunity|!/i);
  });
});
