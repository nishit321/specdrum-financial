import fs from 'node:fs';
import path from 'node:path';
import { extractText, getDocumentProxy } from 'unpdf';
import { describe, expect, it } from 'vitest';
import { applySchema } from '@/lib/forms/apply-schema';
import { applicationPdfName, renderApplicationPdf } from '@/server/pdf/render';
import { tinyPng, validApplication } from '../helpers/fixtures';

const meta = {
  reference: 'SBF-2026-4F7K2Q',
  submittedAt: new Date('2026-11-14T18:35:00Z'),
  timeZone: 'America/Los_Angeles',
  ip: '203.0.113.7',
  device: 'Chrome on Mac OS',
};

async function render(overrides: Partial<ReturnType<typeof validApplication>> = {}) {
  const fields = applySchema.parse({ ...validApplication(), ...overrides });
  const pdf = await renderApplicationPdf({ fields, meta, signaturePng: tinyPng() });
  const doc = await getDocumentProxy(new Uint8Array(pdf));
  const { totalPages, text } = await extractText(doc, { mergePages: false });
  return { pdf, totalPages, pages: text as string[] };
}

describe('application PDF', () => {
  it('has the two pages of the sample with every field filled in', async () => {
    const { pdf, totalPages, pages } = await render();
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(totalPages).toBe(2);

    const p1 = pages[0];
    for (const expected of [
      'Spectrum Financial',
      'ISO Rep: Spectrum Financial',
      'Funding Application',
      'Dated: 11/14/2026',
      'Applicant Business Information',
      'Business Legal Name', 'Maple Ridge Bakery LLC',
      'Amount Requested', '$46,000.00',
      'Use of Funds', 'Business Working Capital',
      'Business D/B/A Name', 'Maple Ridge Bakery',
      'Contact Number', '517-918-9004',
      'Own/Lease Property', 'Lease Commercial',
      'Business Address', '724 W Centre Ave, Suite 203, Portage, MI 49024',
      'Tax ID', '46-2383674',
      'Business Start', '03/2009',
      'Type of Business', 'Restaurant & Hospitality',
      'Average Monthly Revenue', '$41,000.00',
      'Incorporation Type', 'Limited Liability Company',
      'State of Incorporation', 'Michigan',
      'Average Daily Bank Balance', '$4,000.00',
      'Open MCA/Loan Balance', 'None',
      'Website', 'mapleridgebakery.com',
      'Business Owner',
      'Name', 'Jordan Avery',
      'Title', 'Owner',
      'Ownership', '100%',
      'Address', '188 W Chicago Street, Coldwater, MI 49036',
      'SSN', '078-05-1120',
      'Birth Date', '03/24/1965',
      'Phone', '269-350-3651',
      'Email', 'jordan@mapleridgebakery.com',
      'Uniform Electronic Transactions Act',
      'Application Signed by Jordan Avery, Owner',
      'IP Address / Device Info', '203.0.113.7 / Chrome on Mac OS',
      'Sign Date/Timestamp', '11/14/2026 10:35 AM PST',
      '(800) 214-7498',
      'info@spectrumbusinessfinance.com',
    ]) {
      expect(p1, expected).toContain(expected);
    }
    expect(p1).not.toContain('SmartyApp');

    const p2 = pages[1];
    expect(p2).toContain('Permission to Contact:');
    expect(p2).toContain('do not call');
    expect(p2).toContain('Application Signed by Jordan Avery, Owner');
    expect(p2).toContain('11/14/2026 10:35 AM PST');

    fs.mkdirSync(path.join(__dirname, '../.output'), { recursive: true });
    fs.writeFileSync(path.join(__dirname, '../.output/sample-application.pdf'), pdf);
  });

  it('shows the tax ID in SSN format when it is the owner SSN, and a dash for no website', async () => {
    const { pages } = await render({ biz_ein: '078-05-1120', website: '' });
    expect(pages[0]).toContain('078-05-1120');
    expect(pages[0]).toMatch(/Website\s*—/);
  });

  it('keeps long values and odd characters intact (no crash, still 2 pages)', async () => {
    const long = 'Ünïcödé & <Sons> "Quoted" Ltd. '.repeat(3).trim();
    const { totalPages, pages } = await render({ biz_legal: long.slice(0, 120), home_address: '9999 Very Long Street Name Boulevard Apartment 12B' });
    expect(totalPages).toBe(2);
    expect(pages[0]).toContain('<Sons>');
  });

  it('never splits an email address with a hyphen, even a long one', async () => {
    const email = 'accounts.payable.department@mapleridgebakeryandcafe.com';
    const { pages } = await render({ email });
    expect(pages[0]).toContain(email);
  });

  it('names the file after the business and reference', () => {
    expect(applicationPdfName('Maple Ridge Bakery', 'SBF-2026-4F7K2Q')).toBe('Funding-Application-Maple-Ridge-Bakery-SBF-2026-4F7K2Q.pdf');
    expect(applicationPdfName('../../etc/passwd', 'SBF-2026-AAAAAA')).toBe('Funding-Application-etcpasswd-SBF-2026-AAAAAA.pdf');
    expect(applicationPdfName('***', 'SBF-2026-AAAAAA')).toBe('Funding-Application-SBF-2026-AAAAAA.pdf');
  });
});
