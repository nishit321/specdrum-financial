import { describe, expect, it } from 'vitest';
import { applySchema, validateFields, STEP_FIELDS } from '@/lib/forms/apply-schema';
import {
  ageOn,
  formatCurrencyInput,
  formatDateInput,
  formatEin,
  formatMonthYearInput,
  formatPhone,
  formatSsn,
  maskDob,
  maskSsn,
  parseCurrency,
  parsePercent,
  parseUsDate,
} from '@/lib/forms/format';
import { homeQuoteSchema, quoteRequestSchema } from '@/lib/forms/quote-schema';
import { validApplication, validHomeQuote, validQuoteRequest } from '../helpers/fixtures';

describe('input masks (same results as the static page)', () => {
  it('formats phone numbers as (999) 999-9999 and keeps 10 digits max', () => {
    expect(formatPhone('')).toBe('');
    expect(formatPhone('2')).toBe('(2');
    expect(formatPhone('269350')).toBe('(269) 350');
    expect(formatPhone('2693503651')).toBe('(269) 350-3651');
    // the country code 1 is dropped, extra digits are ignored
    expect(formatPhone('+1 (269) 350-3651 ext 9')).toBe('(269) 350-3651');
    expect(formatPhone('abc')).toBe('');
  });

  it('formats SSN, EIN, dates', () => {
    expect(formatSsn('078051120')).toBe('078-05-1120');
    expect(formatSsn('0780')).toBe('078-0');
    expect(formatSsn('0780511209999')).toBe('078-05-1120');
    expect(formatEin('462383674')).toBe('46-2383674');
    expect(formatDateInput('03241965')).toBe('03/24/1965');
    expect(formatDateInput('0324')).toBe('03/24');
    expect(formatMonthYearInput('032009')).toBe('03/2009');
  });

  it('formats currency on blur and parses it back', () => {
    expect(formatCurrencyInput('46000')).toBe('$ 46,000');
    expect(formatCurrencyInput('$ 46,000')).toBe('$ 46,000');
    expect(formatCurrencyInput('000')).toBe('$ 0');
    expect(formatCurrencyInput('')).toBe('');
    expect(formatCurrencyInput('abc')).toBe('');
    expect(parseCurrency('$ 46,000')).toBe(46000);
    expect(parseCurrency('46000.99')).toBe(46000);
    expect(parseCurrency('-5')).toBeNull();
    expect(parseCurrency('1e9')).toBeNull();
    expect(parseCurrency('')).toBeNull();
    expect(parseCurrency('99999999999999999999')).toBeNull();
  });

  it('parses real calendar dates only', () => {
    expect(parseUsDate('02/29/2024')).not.toBeNull();
    expect(parseUsDate('02/29/2023')).toBeNull();
    expect(parseUsDate('13/01/2000')).toBeNull();
    expect(parseUsDate('1/1/2000')).toBeNull();
    expect(ageOn(parseUsDate('11/17/2008')!, new Date('2026-11-16T12:00:00Z'))).toBe(17);
    expect(ageOn(parseUsDate('11/16/2008')!, new Date('2026-11-16T12:00:00Z'))).toBe(18);
  });

  it('parses percentages', () => {
    expect(parsePercent('100%')).toBe(100);
    expect(parsePercent(' 50.5 % ')).toBe(50.5);
    expect(parsePercent('abc')).toBeNull();
  });

  it('masks SSN and date of birth for the email body', () => {
    expect(maskSsn('078-05-1120')).toBe('***-**-1120');
    expect(maskSsn('12')).toBe('***-**-****');
    expect(maskDob('03/24/1965')).toBe('**/**/1965');
  });
});

describe('apply schema', () => {
  const issuesFor = (patch: Record<string, unknown>) => {
    const r = applySchema.safeParse({ ...validApplication(), ...patch });
    return r.success ? {} : Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message]));
  };

  it('accepts a complete application', () => {
    expect(applySchema.safeParse(validApplication()).success).toBe(true);
  });

  it.each([
    ['email', 'not-an-email'],
    ['email', ''],
    ['zip', '4902'],
    ['zip', '4902a'],
    ['phone', '(123) 456-7890'], // area code cannot start with 1
    ['phone', '555-0142'],
    ['amount', '$ 0'],
    ['amount', ''],
    ['amount', '$ 60,000,000'],
    ['use_of_funds', 'Something made up'],
    ['consent_contact', false],
    ['first_name', '   '],
    ['first_name', 'x'.repeat(61)],
    ['state', 'ZZ'],
    ['dob', '02/30/1980'],
    ['dob', '01/01/2020'], // under 18
    ['dob', '01/01/1800'],
    ['ssn', '000-12-3456'],
    ['ssn', '666-12-3456'],
    ['ssn', '912-12-3456'],
    ['ssn', '123-00-4567'],
    ['ssn', '123-45-0000'],
    ['ssn', '12345678'],
    ['ownership', '0%'],
    ['ownership', '150%'],
    ['title', 'King'],
    ['biz_ein', '12-345'],
    ['biz_ein', 'ab-cdefghi'],
    ['biz_start', '13/2009'],
    ['biz_start', '01/3000'],
    ['biz_start', '2009'],
    ['monthly_revenue', 'lots'],
    ['open_loans', '7 Open Positions'],
    ['website', 'not a website'],
    ['esign_consent', false],
    ['biz_legal', 'Bad\u0000Name'],
  ])('rejects %s = %j', (field, value) => {
    expect(issuesFor({ [field]: value })).toHaveProperty(field);
  });

  it('accepts optional website empty, $0 balances, lower-case state, SSN as tax ID', () => {
    expect(issuesFor({ website: '', daily_balance: '$ 0', monthly_revenue: '0', state: 'mi', biz_ein: '078-05-1120' })).toEqual({});
    expect(applySchema.parse({ ...validApplication(), state: 'mi' }).state).toBe('MI');
  });

  it('trims whitespace before checking', () => {
    expect(applySchema.parse({ ...validApplication(), first_name: '  Jordan  ' }).first_name).toBe('Jordan');
  });

  it('validateFields only reports the fields of the step being checked', () => {
    const bad = { ...validApplication(), email: 'x', biz_dba: '' };
    expect(Object.keys(validateFields(bad, STEP_FIELDS['1A']))).toEqual(['email']);
    expect(Object.keys(validateFields(bad, STEP_FIELDS['2']))).toEqual(['biz_dba']);
    expect(validateFields(validApplication(), STEP_FIELDS['3'])).toEqual({});
  });

  it('rejects unknown types (number instead of string, missing fields)', () => {
    expect(applySchema.safeParse({ ...validApplication(), zip: 49024 }).success).toBe(false);
    expect(applySchema.safeParse({}).success).toBe(false);
    expect(applySchema.safeParse(null).success).toBe(false);
  });
});

describe('quote schemas', () => {
  it('accept complete submissions', () => {
    expect(quoteRequestSchema.safeParse(validQuoteRequest()).success).toBe(true);
    expect(homeQuoteSchema.safeParse(validHomeQuote()).success).toBe(true);
  });

  it('keep the static page rules: required fields, phone with area code, terms', () => {
    const q = (patch: Record<string, unknown>) => quoteRequestSchema.safeParse({ ...validQuoteRequest(), ...patch }).success;
    expect(q({ first_name: '' })).toBe(false);
    expect(q({ phone: '555-0142' })).toBe(false);
    expect(q({ phone: '+44 20 7946 0958' })).toBe(true);
    expect(q({ phone: '1'.repeat(16) })).toBe(false);
    expect(q({ terms: false })).toBe(false);
    expect(q({ monthly_sales: '' })).toBe(false);
    expect(q({ loan_amount: '$1' })).toBe(false);
    expect(q({ company: '', business_type: '' })).toBe(true);
    expect(q({ sms_consent: 'yes' })).toBe(false);
  });

  it('home form: financing type must be one of the list, message is optional but capped', () => {
    const h = (patch: Record<string, unknown>) => homeQuoteSchema.safeParse({ ...validHomeQuote(), ...patch }).success;
    expect(h({ type: 'Crypto loan' })).toBe(false);
    expect(h({ message: '' })).toBe(true);
    expect(h({ message: 'x'.repeat(2001) })).toBe(false);
    expect(h({ message: 'Line one\nLine two' })).toBe(true);
    expect(h({ amount: '' })).toBe(false);
  });
});
