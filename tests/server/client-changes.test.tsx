import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import { extractText, getDocumentProxy } from 'unpdf';
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { Footer } from '@/components/layout/Footer';
import { applySchema } from '@/lib/forms/apply-schema';
import { HOME_FINANCING_TYPES, values } from '@/lib/forms/options';
import { homeQuoteSchema, quoteRequestSchema } from '@/lib/forms/quote-schema';
import { SITE_URL } from '@/lib/seo';
import { applicationEmail } from '@/server/mail/apply-email';
import { homeQuoteEmail, quoteRequestEmail } from '@/server/mail/quote-email';
import { renderEmailText } from '@/server/mail/template';
import { renderApplicationPdf } from '@/server/pdf/render';
import { validApplication, validHomeQuote, validQuoteRequest } from '../helpers/fixtures';
import { signaturePng } from '../helpers/png';

// Website changes the client (David, Spectrum Financial) asked for in the meeting of 2026-11-14.

const ROOT = path.join(import.meta.dirname, '../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const PAGES = fs
  .readdirSync(path.join(ROOT, 'src/app'), { recursive: true, encoding: 'utf8' })
  .filter((f) => f.endsWith('page.tsx'))
  .map((f) => `src/app/${f.replaceAll('\\', '/')}`);
const SITE_TEXT = [...PAGES, 'src/components/layout/Footer.tsx'];

const meta = {
  reference: 'SBQ-2026-4F7K2Q',
  submittedAt: new Date('2026-11-14T18:35:00Z'),
  timeZone: 'America/Los_Angeles',
  ip: '203.0.113.7',
  device: 'Chrome on Mac OS',
};

describe('20 years in business, not 10', () => {
  it.each(SITE_TEXT)('%s', (file) => {
    const src = read(file);
    expect(src).not.toMatch(/decade|10\+ Years|Over 10 years|data-sbf-count="10"/i);
  });

  it('the stats counters and headings say 20 years', () => {
    for (const file of ['src/app/page.tsx', 'src/app/about/page.tsx', 'src/app/testimonials/page.tsx']) {
      // the real number is in the HTML (search engines, no JavaScript); it counts up only with JavaScript
      expect(read(file)).toContain('<span data-sbf-count="20">20</span>');
    }
    expect(read('src/app/page.tsx')).toContain('20 years of satisfied clients');
    expect(read('src/components/layout/Footer.tsx')).toContain('For 20 years, Spectrum Financial');
  });
});

describe('Merchant Cash Advance is now Line of Credit', () => {
  it.each(SITE_TEXT)('%s no longer markets a merchant cash advance', (file) => {
    expect(read(file)).not.toMatch(/merchant cash|cash advance|Explore MCA|merchant-cash-advance/i);
  });

  it('the program tickers list Line of Credit and Term Loans', () => {
    for (const file of ['src/app/page.tsx', 'src/app/about/page.tsx', 'src/app/services/page.tsx']) {
      const src = read(file);
      expect(src.match(/sbf-ticker-item[^>]*>Line of Credit</g)).toHaveLength(2);
      expect(src.match(/sbf-ticker-item[^>]*>Term Loans</g)).toHaveLength(2);
    }
  });

  it('the Line of Credit text makes no claim the client did not confirm (speed, collateral, amounts)', () => {
    const blocks = [
      /<h3 className="sbf-loan-title">Line of Credit<\/h3>[\s\S]*?<\/Link>/.exec(read('src/app/page.tsx'))?.[0],
      /<article className="sbf-svc-row" id="line-of-credit">[\s\S]*?<\/article>/.exec(read('src/app/services/page.tsx'))?.[0],
      /<article className="sbf-svc-row" id="line-of-credit">[\s\S]*?<\/article>/.exec(read('src/app/loan-types/page.tsx'))?.[0],
    ];
    for (const block of blocks) {
      expect(block).toBeTruthy();
      expect(block).toMatch(/credit card/i);
      expect(block).not.toMatch(/24 Hours|collateral|\$\d/i);
    }
  });

  it('the home quote form offers Line of Credit, and the owner email shows it', () => {
    const types = values(HOME_FINANCING_TYPES) as string[];
    expect(types).toContain('Line of Credit');
    expect(types).not.toContain('Merchant Cash Advance');
    const v = homeQuoteSchema.parse({ ...validHomeQuote(), type: 'Line of Credit' });
    expect(renderEmailText(homeQuoteEmail(v, meta).content)).toMatch(/Line of Credit/);
  });

  it('a page loaded before the update can still send the old choice, so that request is not lost', () => {
    const v = homeQuoteSchema.parse({ ...validHomeQuote(), type: 'Merchant Cash Advance' });
    expect(renderEmailText(homeQuoteEmail(v, meta).content)).toMatch(/Merchant Cash Advance/);
    expect(homeQuoteSchema.safeParse({ ...validHomeQuote(), type: 'Something Else' }).success).toBe(false);
  });

  it('the applicant is still asked about open MCA balances (lenders need it)', () => {
    expect(read('src/components/apply/ApplyForm.tsx')).toContain('label="Open MCA/Loan Balance"');
  });
});

describe('higher funding caps', () => {
  it('all 8 industry cards say up to $2,000,000', () => {
    const pills = read('src/app/page.tsx').match(/<span className="sbf-ind-pill">[^<]*<\/span>/g) ?? [];
    expect(pills).toHaveLength(8);
    for (const pill of pills) expect(pill).toContain('Up to $2,000,000');
  });

  it('unsecured working capital goes up to $2,000,000 on Home, About and Services', () => {
    for (const file of ['src/app/page.tsx', 'src/app/about/page.tsx', 'src/app/services/page.tsx']) {
      expect(read(file)).toMatch(/<small>Amounts Up To<\/small>\s*(?:\{" "\}\s*)?<strong>\$2,000,000<\/strong>/);
    }
  });
});

describe('legal name (A2P)', () => {
  it('every page footer names Tri-Cities Consulting LLC d/b/a Spectrum Financial', () => {
    expect(renderToString(<Footer />)).toMatch(/Tri-Cities Consulting LLC d\/b\/a Spectrum Financial\. All rights reserved\./);
  });

  it.each(['privacy-policy', 'terms-of-service', 'disclaimer'])('the %s page says who operates the website', (page) => {
    expect(read(`src/app/${page}/page.tsx`)).toContain('This website is operated by Tri-Cities Consulting LLC, doing business as Spectrum Financial.');
  });

  it.each(PAGES)('%s gives search engines the legal name', (file) => {
    expect(read(file)).toMatch(/"name": "Spectrum Financial",\s*"legalName": "Tri-Cities Consulting LLC",/);
  });
});

describe('stat counters', () => {
  it.each(PAGES)('%s carries the real numbers in its HTML', (file) => {
    expect(read(file)).not.toMatch(/data-sbf-count="[1-9]\d*">0</);
  });
});

describe('the website moves to spectrumbusinessloans.com', () => {
  it('canonical base, sitemap and structured data use the new domain', () => {
    expect(SITE_URL).toBe('https://spectrumbusinessloans.com');
    expect(sitemap().every((e) => e.url.startsWith('https://spectrumbusinessloans.com/'))).toBe(true);
    for (const file of PAGES) expect(read(file)).not.toContain('https://spectrumbusinessfinance.com');
  });

  it('emails say which site they came from; contact emails stay on spectrumbusinessfinance.com', () => {
    const quote = renderEmailText(quoteRequestEmail(quoteRequestSchema.parse(validQuoteRequest()), meta).content);
    const apply = renderEmailText(applicationEmail(applySchema.parse(validApplication()), meta, []).content);
    for (const text of [quote, apply]) {
      expect(text).toContain('on spectrumbusinessloans.com.');
      expect(text).not.toMatch(/on spectrumbusinessfinance\.com/);
    }
  });

  it('the signed PDF says it was submitted on the new domain', async () => {
    const pdf = await renderApplicationPdf({ fields: applySchema.parse(validApplication()), meta, signaturePng: signaturePng() });
    const { text } = await extractText(await getDocumentProxy(new Uint8Array(pdf)), { mergePages: true });
    expect(text).toContain('www.spectrumbusinessloans.com');
    expect(text).toContain('info@spectrumbusinessfinance.com');
  });
});
