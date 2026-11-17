import type { ApplyValues } from '@/lib/forms/apply-schema';
import { asDataUrl, signaturePng } from './png';

// Made-up applicant. The SSN is the long-voided "Woolworth" number, never a real person's.
export const validApplication = (): ApplyValues => ({
  email: 'jordan@mapleridgebakery.com',
  zip: '49024',
  phone: '(269) 350-3651',
  amount: '$ 46,000',
  use_of_funds: 'Business Working Capital',
  consent_contact: true,

  first_name: 'Jordan',
  last_name: 'Avery',
  home_address: '188 W Chicago Street',
  city: 'Coldwater',
  state: 'MI',
  home_zip: '49036',
  dob: '03/24/1965',
  ssn: '078-05-1120',
  ownership: '100%',
  title: 'Owner',

  biz_amount: '$ 46,000',
  biz_use: 'Business Working Capital',
  biz_dba: 'Maple Ridge Bakery',
  biz_legal: 'Maple Ridge Bakery LLC',
  biz_ein: '46-2383674',
  biz_address: '724 W Centre Ave, Suite 203, Portage, MI',
  biz_zip: '49024',
  biz_phone: '(517) 918-9004',
  biz_incorp: 'LLC',
  biz_state: 'MI',
  biz_start: '03/2009',
  biz_type: 'Restaurant & Hospitality',
  biz_property: 'Lease Commercial',
  monthly_revenue: '$ 41,000',
  daily_balance: '$ 4,000',
  open_loans: 'None',
  website: 'mapleridgebakery.com',

  sign_name: 'Jordan Avery',
  esign_consent: true,
});

export const validQuoteRequest = () => ({
  first_name: 'Priya',
  last_name: 'Shah',
  email: 'priya@shahlogistics.com',
  phone: '(714) 555-0142',
  company: 'Shah Logistics',
  business_type: 'Trucking & Logistics',
  monthly_sales: '$50,000 – $75,000',
  loan_amount: '$25,000 – $50,000',
  sms_consent: true,
  sms_promo_consent: false,
  terms: true,
});

export const validHomeQuote = () => ({
  name: 'Marcus Lee',
  business: 'Lee Auto Repair',
  phone: '562-555-0199',
  email: 'marcus@leeauto.com',
  amount: '$50,000 – $150,000',
  type: 'Equipment Loan / Lease',
  message: 'Two new lifts and a tire machine.',
});

// 1x1 transparent PNG: a valid image file, but far too empty to pass as a signature.
export const tinyPng = () =>
  Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
    'base64',
  );

export const signatureDataUrl = () => asDataUrl(signaturePng());

export const minimalPdf = () => Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
