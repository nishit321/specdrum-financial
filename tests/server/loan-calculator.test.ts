import { extractText, getDocumentProxy } from 'unpdf';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { applySchema } from '@/lib/forms/apply-schema';
import {
  MAX_MONTHLY_REVENUE,
  applyHref,
  estimate,
  estimateLabel,
  parseCalculatorQuery,
  type CalculatorChoice,
} from '@/lib/loan-calculator';
import { calculatorRows } from '@/server/application';
import { applyGate, applyGlobalLimiter, applyLimiter, applyPerVisitor, applyReadGate, applySubmissions, handleApply } from '@/server/handlers/apply';
import { applicationEmail } from '@/server/mail/apply-email';
import { resetMailTransport } from '@/server/mail/send';
import { renderEmailText } from '@/server/mail/template';
import { renderApplicationPdf } from '@/server/pdf/render';
import { signatureDataUrl, validApplication } from '../helpers/fixtures';
import { signaturePng } from '../helpers/png';
import { mailEnv, startSmtpSink, type Sink } from '../helpers/smtp-sink';

// Loan calculator (2026-11-21), same rules as the old site's /loan-calculator and /loan pages:
// amount = Math.round(monthly revenue * 1.15); equipment = amount * 4; SBA has a fixed range.

const meta = {
  reference: 'SBF-2026-4F7K2Q',
  submittedAt: new Date('2026-11-21T18:35:00Z'),
  timeZone: 'America/Los_Angeles',
  ip: '203.0.113.7',
  device: 'Chrome on Mac OS',
};
const choice = (patch: Partial<CalculatorChoice> = {}): CalculatorChoice => ({ program: 'line-of-credit', monthlyRevenue: 50_000, timeInBusiness: '6to12', ...patch });

describe('the estimate matches the old site', () => {
  it.each([
    [50_000, 57_500],
    [1, 1],
    [3, 3], // 3.45 rounds down
    [7, 8], // 8.05 rounds up
    [41_000, 47_150],
    [123_457, 141_976], // 141975.55
    [MAX_MONTHLY_REVENUE, 11_500_000],
  ])('monthly revenue %i → %i for working capital and the line of credit, four times that for equipment', (revenue, amount) => {
    // the old site: Math.round(revenue * 1.15) on the calculator page, then x4 for equipment on the offers page
    expect(amount).toBe(Math.round(revenue * 1.15));
    expect(estimate('working-capital', revenue)).toBe(amount);
    expect(estimate('line-of-credit', revenue)).toBe(amount);
    expect(estimate('equipment', revenue)).toBe(amount * 4);
    expect(estimate('sba', revenue)).toBeNull();
  });

  it('labels are whole dollars; SBA shows its range', () => {
    expect(estimateLabel('line-of-credit', 50_000)).toBe('$57,500');
    expect(estimateLabel('equipment', 50_000)).toBe('$230,000');
    expect(estimateLabel('sba', 50_000)).toBe('Up to $500,000');
  });

  it('the largest equipment estimate is still an amount Apply Now accepts', () => {
    const amount = estimate('equipment', MAX_MONTHLY_REVENUE)!;
    expect(applySchema.shape.amount.safeParse(`$ ${amount.toLocaleString('en-US')}`).success).toBe(true);
  });
});

describe('the link to Apply Now', () => {
  it('carries the choice and reads back the same', () => {
    const c = choice({ program: 'equipment', monthlyRevenue: 41_000, timeInBusiness: 'longer12' });
    const href = applyHref(c);
    expect(href).toBe('/apply-now?program=equipment&revenue=41000&tib=longer12');
    expect(parseCalculatorQuery(href.split('?')[1])).toEqual(c);
  });

  it.each([
    'program=free-money&revenue=50000&tib=6to12',
    'program=line-of-credit&revenue=0&tib=6to12',
    'program=line-of-credit&revenue=-5&tib=6to12',
    'program=line-of-credit&revenue=50000.5&tib=6to12',
    'program=line-of-credit&revenue=1e5&tib=6to12',
    'program=line-of-credit&revenue=10000001&tib=6to12',
    'program=line-of-credit&revenue=50000&tib=forever',
    'program=line-of-credit&revenue=50000',
    'program=__proto__&revenue=50000&tib=6to12',
    '',
  ])('ignores %j', (search) => {
    expect(parseCalculatorQuery(search)).toBeNull();
  });
});

describe('the owner email and the PDF show the calculator choice', () => {
  const fields = () => applySchema.parse(validApplication());

  it('rows for the email and the PDF', () => {
    expect(calculatorRows(choice())).toEqual([
      { label: 'Program chosen', value: 'Line of Credit' },
      { label: 'Calculator estimate', value: '$57,500' },
      { label: 'Monthly revenue entered', value: '$50,000' },
      { label: 'Business start date', value: '6 months to 1 year' },
    ]);
  });

  it('email: a "Loan calculator" section and a line in the intro; none without a choice', () => {
    const withCalc = renderEmailText(applicationEmail(fields(), meta, [], choice({ program: 'equipment' })).content);
    expect(withCalc).toContain('They came from the loan calculator and picked Equipment Loan / Lease.');
    expect(withCalc).toMatch(/LOAN CALCULATOR[\s\S]*Program chosen:\s+Equipment Loan \/ Lease[\s\S]*Calculator estimate:\s+\$230,000/);
    const without = renderEmailText(applicationEmail(fields(), meta, []).content);
    expect(without).not.toMatch(/loan calculator/i);
  });

  const pdfText = async (calculator: CalculatorChoice | null) => {
    const pdf = await renderApplicationPdf({ fields: fields(), meta, signaturePng: signaturePng(), calculator });
    const { totalPages, text } = await extractText(await getDocumentProxy(new Uint8Array(pdf)), { mergePages: false });
    return { totalPages, pages: text as string[] };
  };

  it('PDF: a "Loan Calculator" card on page 2, still two pages', async () => {
    const { totalPages, pages } = await pdfText(choice({ program: 'sba' }));
    expect(totalPages).toBe(2);
    expect(pages[1]).toContain('Loan Calculator');
    expect(pages[1]).toContain('SBA 7(a) Loan');
    expect(pages[1]).toContain('Up to $500,000');
    expect(pages[1]).toContain('6 months to 1 year');
    expect(pages[0]).not.toContain('Loan Calculator');
  });

  // The longest values the form allows: the schema's own maximums, in wide capitals with spaces so
  // every line is full.
  const words = (n: number) => 'WMWMWMW '.repeat(n).slice(0, n - 1) + 'W';
  const LONGEST = {
    first_name: words(60),
    last_name: words(60),
    home_address: words(120),
    city: words(60),
    biz_dba: words(120),
    biz_legal: words(120),
    biz_address: words(120),
    sign_name: words(120),
    email: `${'a'.repeat(64)}@${'b'.repeat(63)}.${'c'.repeat(63)}.${'d'.repeat(57)}.com`,
    website: `https://www.${'w'.repeat(60)}.com/${'W'.repeat(200 - 12 - 60 - 5)}`,
  };
  const pdfPages = async (patch: Partial<typeof LONGEST>) => {
    const pdf = await renderApplicationPdf({
      fields: applySchema.parse({ ...validApplication(), ...patch }),
      meta,
      signaturePng: signaturePng(),
      calculator: choice({ program: 'equipment', monthlyRevenue: MAX_MONTHLY_REVENUE }),
    });
    return (await extractText(await getDocumentProxy(new Uint8Array(pdf)), { mergePages: false })).text as string[];
  };
  const squash = (t: string) => t.replace(/\s+/g, '');

  it('the test values really are the longest the form accepts', () => {
    const parsed = applySchema.parse({ ...validApplication(), ...LONGEST });
    expect(parsed.email).toHaveLength(254);
    expect(parsed.website).toHaveLength(200);
    expect(parsed.biz_dba).toHaveLength(120);
    expect(parsed.first_name).toHaveLength(60);
  });

  // the old design already needed a third page for the longest email address on its own
  it.each(Object.keys(LONGEST) as (keyof typeof LONGEST)[])('PDF with the longest %s and the calculator card: still two pages', async (field) => {
    const pages = await pdfPages({ [field]: LONGEST[field] });
    expect(pages).toHaveLength(2);
    expect(pages[1]).toContain('$46,000,000');
  });

  // More than fits on the first page (the old design needed three pages for these too). The second
  // case left room for the authorization text but not the signature, which went to a page of its own.
  it.each([
    ['every field at its longest', LONGEST],
    ['three long business fields', { biz_dba: words(100), biz_legal: words(100), biz_address: words(100) }],
  ])('PDF with %s: the signature moves with the authorization it signs, never alone', async (_, patch) => {
    const pages = await pdfPages(patch);
    const signedPages = pages.filter((p) => p.includes('Application Signed by'));
    expect(signedPages).toHaveLength(2);
    for (const page of pages) expect((page.match(/Application Signed by/g) ?? []).length).toBeLessThanOrEqual(1);
    expect(squash(signedPages[0])).toContain(squash('By checking this box, I agree that the electronic digitized signatures'));
    expect(pages[0]).toContain('Applicant Business Information');
    expect(pages.at(-1)).toContain('Permission to Contact');
    expect(pages.at(-1)).toContain('Application Signed by');
  });

  it('PDF without a choice has no calculator card', async () => {
    const { totalPages, pages } = await pdfText(null);
    expect(totalPages).toBe(2);
    expect(pages.join(' ')).not.toContain('Loan Calculator');
  });

  it('PDF in the site look: reference and page numbers in the header and footer', async () => {
    const { pages } = await pdfText(null);
    expect(pages[0]).toContain('Reference: SBF-2026-4F7K2Q');
    expect(pages[0]).toContain('Page 1 of 2');
    expect(pages[1]).toContain('Page 2 of 2');
    expect(pages[0]).toContain('Submitted on www.spectrumbusinessloans.com');
  });
});

describe('in the API', () => {
  let sink: Sink;
  const savedEnv = { ...process.env };
  beforeAll(async () => {
    sink = await startSmtpSink();
  });
  afterAll(async () => {
    await sink.close();
  });
  beforeEach(() => {
    Object.assign(process.env, mailEnv(sink.port));
    sink.messages.length = 0;
    for (const x of [applyLimiter, applyGlobalLimiter, applySubmissions, applyPerVisitor, applyReadGate, applyGate]) x.reset();
    resetMailTransport();
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    process.env = { ...savedEnv };
    vi.restoreAllMocks();
  });

  const post = (calculator: unknown, ip: string) => {
    const form = new FormData();
    form.append(
      'payload',
      JSON.stringify({ idempotencyKey: `calc-${ip.replaceAll('.', '-')}-${Date.now()}-abc`, honeypot: '', fields: validApplication(), signature: signatureDataUrl(), calculator }),
    );
    return handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: form, headers: { host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': ip } }));
  };

  it('a valid choice reaches the email; the estimate is worked out by the server', async () => {
    const res = await post({ program: 'working-capital', monthlyRevenue: 41_000, timeInBusiness: 'longer12', estimate: 9_999_999 }, '203.0.113.101');
    expect(res.status).toBe(200);
    expect(sink.messages[0].text).toMatch(/Program chosen:\s+Unsecured Working Capital/);
    expect(sink.messages[0].text).toMatch(/Calculator estimate:\s+\$47,150/);
    expect(sink.messages[0].text).not.toContain('9,999,999');
  });

  it.each([
    ['an unknown program', { program: 'free-money', monthlyRevenue: 41_000, timeInBusiness: 'longer12' }],
    ['a revenue over the limit', { program: 'equipment', monthlyRevenue: 99_000_000, timeInBusiness: 'longer12' }],
    ['a string', 'line-of-credit'],
    ['a prototype key as the program', { program: '__proto__', monthlyRevenue: 41_000, timeInBusiness: 'longer12' }],
    ['a constructor key as the program', { program: 'constructor', monthlyRevenue: 41_000, timeInBusiness: 'longer12' }],
    ['a revenue with cents', { program: 'equipment', monthlyRevenue: 41_000.5, timeInBusiness: 'longer12' }],
    ['a revenue sent as text', { program: 'equipment', monthlyRevenue: '41000', timeInBusiness: 'longer12' }],
    ['a huge revenue', { program: 'equipment', monthlyRevenue: 1e308, timeInBusiness: 'longer12' }],
    ['a zero revenue', { program: 'equipment', monthlyRevenue: 0, timeInBusiness: 'longer12' }],
    ['an unknown start date', { program: 'equipment', monthlyRevenue: 41_000, timeInBusiness: '<b>always</b>' }],
    ['an array', [{ program: 'equipment', monthlyRevenue: 41_000, timeInBusiness: 'longer12' }]],
    ['a number', 7],
  ])('%s is left out; the application still goes through', async (_, calculator) => {
    const res = await post(calculator, '203.0.113.102');
    expect(res.status).toBe(200);
    expect(sink.messages[0].text).not.toMatch(/loan calculator/i);
  });

  const postWithKey = (idempotencyKey: string, calculator: unknown) => {
    const form = new FormData();
    form.append('payload', JSON.stringify({ idempotencyKey, honeypot: '', fields: validApplication(), signature: signatureDataUrl(), calculator }));
    return handleApply(new Request('http://localhost/api/apply', { method: 'POST', body: form, headers: { host: 'localhost', origin: 'http://localhost', 'x-forwarded-for': '203.0.113.103' } }));
  };

  it('a retry with the same choice is the same application: one email, same reference', async () => {
    const k = `calc-retry-${Date.now()}-abcdef`;
    const c = { program: 'equipment', monthlyRevenue: 41_000, timeInBusiness: 'longer12' };
    const a = await postWithKey(k, c);
    const b = await postWithKey(k, c);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
    expect((await b.json()).reference).toBe((await a.json()).reference);
    expect(sink.messages).toHaveLength(1);
  });

  it('the same key with a different choice is refused, not silently dropped', async () => {
    const k = `calc-conflict-${Date.now()}-abcdef`;
    expect((await postWithKey(k, { program: 'equipment', monthlyRevenue: 41_000, timeInBusiness: 'longer12' })).status).toBe(200);
    expect((await postWithKey(k, { program: 'line-of-credit', monthlyRevenue: 41_000, timeInBusiness: 'longer12' })).status).toBe(409);
    expect((await postWithKey(k, null)).status).toBe(409);
    expect(sink.messages).toHaveLength(1);
  });

  it('a junk choice counts as no choice, so a retry without it is the same application', async () => {
    const k = `calc-junk-${Date.now()}-abcdef`;
    expect((await postWithKey(k, { program: '__proto__' })).status).toBe(200);
    expect((await postWithKey(k, undefined)).status).toBe(200);
    expect(sink.messages).toHaveLength(1);
  });
});
