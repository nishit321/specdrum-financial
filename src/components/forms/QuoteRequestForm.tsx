'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Checkbox } from '@/components/ui/Checkbox';
import { Combobox } from '@/components/ui/Combobox';
import { Select } from '@/components/ui/Select';
import { QUOTE_BUSINESS_TYPE_SUGGESTIONS, QUOTE_LOAN_AMOUNTS, QUOTE_MONTHLY_SALES } from '@/lib/forms/options';
import { quoteRequestSchema, type QuoteRequestValues } from '@/lib/forms/quote-schema';
import { HoneypotField, QuoteSuccess } from './HomeQuoteForm';
import { useHydrated } from '@/lib/use-hydrated';
import { FormAlert, LateScriptHint, NoScriptNotice, SubmitLabel } from './parts';
import { useQuoteSubmit } from './useQuoteSubmit';

const INITIAL = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  company: '',
  business_type: '',
  monthly_sales: '',
  loan_amount: '',
  sms_consent: false,
  sms_promo_consent: false,
  terms: false,
} as unknown as QuoteRequestValues; // terms starts unchecked; the schema only accepts true

const IDS = {
  first_name: 'sbfQrFirst',
  last_name: 'sbfQrLast',
  email: 'sbfQrEmail',
  phone: 'sbfQrPhone',
  company: 'sbfQrCompany',
  business_type: 'sbfQrType',
  monthly_sales: 'sbfQrSales',
  loan_amount: 'sbfQrAmount',
  sms_consent: 'sbfQrSms',
  sms_promo_consent: 'sbfQrPromo',
  terms: 'sbfQrTerms',
};

const Req = () => (
  <span className="sbf-qr-req" aria-hidden="true">
    *
  </span>
);

/** "Send My Quote Request" on /quote-request. */
export function QuoteRequestForm() {
  const { values, set, errors, status, formError, onSubmit, formRef } = useQuoteSubmit('quote-request', quoteRequestSchema, INITIAL, IDS);
  const [honeypot, setHoneypot] = useState('');
  const hydrated = useHydrated();

  const feedback = (name: keyof QuoteRequestValues) =>
    errors[name] ? (
      <div className="invalid-feedback d-block" id={`${IDS[name]}Error`}>
        {errors[name]}
      </div>
    ) : null;

  const text = (name: 'first_name' | 'last_name' | 'email' | 'phone' | 'company', type: string, autoComplete: string, extra: Record<string, string> = {}) => (
    <input
      type={type}
      className={`form-control sbf-input${errors[name] ? ' is-invalid' : ''}`}
      id={IDS[name]}
      name={name}
      autoComplete={autoComplete}
      required={name !== 'company'}
      maxLength={name === 'email' ? 254 : name === 'phone' ? 25 : name === 'company' ? 120 : 60}
      value={values[name]}
      onChange={(e) => set(name, e.target.value)}
      aria-invalid={errors[name] ? true : undefined}
      aria-describedby={errors[name] ? `${IDS[name]}Error` : undefined}
      {...extra}
    />
  );

  return (
    // method="post": should a submit ever happen without our script, nothing goes into the URL
    <form className="sbf-quote-form" id="sbfQuoteForm" method="post" noValidate ref={formRef} onSubmit={(e) => onSubmit(e, honeypot)}>
      <fieldset className="sbf-qr-fieldset">
        <legend className="sbf-qr-legend">Contact details</legend>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="sbf-label" htmlFor={IDS.first_name}>
              First name <Req />
            </label>
            {text('first_name', 'text', 'given-name')}
            {feedback('first_name')}
          </div>
          <div className="col-md-6">
            <label className="sbf-label" htmlFor={IDS.last_name}>
              Last name <Req />
            </label>
            {text('last_name', 'text', 'family-name')}
            {feedback('last_name')}
          </div>
          <div className="col-md-6">
            <label className="sbf-label" htmlFor={IDS.email}>
              Email <Req />
            </label>
            {text('email', 'email', 'email')}
            {feedback('email')}
          </div>
          <div className="col-md-6">
            <label className="sbf-label" htmlFor={IDS.phone}>
              Phone (with area code) <Req />
            </label>
            {text('phone', 'tel', 'tel', { inputMode: 'tel' })}
            {feedback('phone')}
          </div>
        </div>
      </fieldset>

      <fieldset className="sbf-qr-fieldset">
        <legend className="sbf-qr-legend">Business details</legend>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="sbf-label" htmlFor={IDS.company}>
              Company name
            </label>
            {text('company', 'text', 'organization')}
            {feedback('company')}
          </div>
          <div className="col-md-6">
            <label className="sbf-label" htmlFor={IDS.business_type}>
              Business type
            </label>
            <Combobox
              id={IDS.business_type}
              name="business_type"
              className="form-control sbf-input"
              placeholder="e.g. Restaurant"
              maxLength={100}
              suggestions={QUOTE_BUSINESS_TYPE_SUGGESTIONS}
              value={values.business_type}
              onChange={(v) => set('business_type', v)}
              invalid={!!errors.business_type}
            />
            {feedback('business_type')}
          </div>
          <div className="col-md-6">
            <label className="sbf-label" htmlFor={IDS.monthly_sales}>
              Monthly sales <Req />
            </label>
            <Select
              id={IDS.monthly_sales}
              name="monthly_sales"
              className="form-select sbf-select"
              placeholder="Select one"
              options={QUOTE_MONTHLY_SALES}
              value={values.monthly_sales}
              onChange={(v) => set('monthly_sales', v)}
              invalid={!!errors.monthly_sales}
              required
              describedBy={errors.monthly_sales ? `${IDS.monthly_sales}Error` : undefined}
            />
            {feedback('monthly_sales')}
          </div>
          <div className="col-md-6">
            <label className="sbf-label" htmlFor={IDS.loan_amount}>
              Loan amount <Req />
            </label>
            <Select
              id={IDS.loan_amount}
              name="loan_amount"
              className="form-select sbf-select"
              placeholder="Select one"
              options={QUOTE_LOAN_AMOUNTS}
              value={values.loan_amount}
              onChange={(v) => set('loan_amount', v)}
              invalid={!!errors.loan_amount}
              required
              describedBy={errors.loan_amount ? `${IDS.loan_amount}Error` : undefined}
            />
            {feedback('loan_amount')}
          </div>
        </div>
      </fieldset>

      <div className="sbf-qr-consents">
        <label className="sbf-qr-check" htmlFor={IDS.sms_consent}>
          <Checkbox id={IDS.sms_consent} name="sms_consent" value="yes" checked={values.sms_consent} onChange={(v) => set('sms_consent', v)} />
          <span>
            I agree to receive SMS messages from Spectrum Financial about my inquiry, appointments, and transaction updates. Message frequency
            varies. Message and data rates may apply. Reply HELP for help and STOP to opt out.
          </span>
        </label>
        <label className="sbf-qr-check" htmlFor={IDS.sms_promo_consent}>
          <Checkbox
            id={IDS.sms_promo_consent}
            name="sms_promo_consent"
            value="yes"
            checked={values.sms_promo_consent}
            onChange={(v) => set('sms_promo_consent', v)}
          />
          <span>
            I agree to receive promotional SMS messages from Spectrum Financial about promotional and special offers. Message frequency varies.
            Message and data rates may apply. Reply HELP for help and STOP to opt out.
          </span>
        </label>
        <div className="sbf-qr-check-wrap">
          <label className={`sbf-qr-check sbf-qr-check--terms${errors.terms ? ' is-invalid' : ''}`} htmlFor={IDS.terms}>
            <Checkbox
              id={IDS.terms}
              name="terms"
              value="yes"
              required
              checked={values.terms}
              onChange={(v) => set('terms', v as true)}
              invalid={!!errors.terms}
              aria-describedby={errors.terms ? `${IDS.terms}Error` : undefined}
            />
            <span>
              I accept the <Link href="/terms-of-service">Terms of Service</Link> &amp; <Link href="/privacy-policy">Privacy Policy</Link>. <Req />
            </span>
          </label>
          {feedback('terms')}
        </div>
      </div>

      <HoneypotField value={honeypot} onChange={setHoneypot} id="sbfHpQuote" />

      <button
        type="submit"
        className="btn sbf-btn sbf-btn-gold sbf-btn-lg w-100"
        disabled={status === 'sending' || !hydrated}
        aria-busy={status === 'sending'}
      >
        <SubmitLabel sending={status === 'sending'} label="Send My Quote Request" sendingLabel="Sending…" />
      </button>
      {formError && <FormAlert message={formError} />}
      <NoScriptNotice />
      <LateScriptHint ready={hydrated} />
      <p className="sbf-form-note">
        <span className="sbf-qr-req">*</span> Required fields. Consent to SMS is not a condition of any purchase or loan.
      </p>

      <QuoteSuccess show={status === 'sent'} />
    </form>
  );
}
