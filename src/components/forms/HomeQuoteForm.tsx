'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { HOME_FINANCING_TYPES, HOME_FUNDING_AMOUNTS } from '@/lib/forms/options';
import { homeQuoteSchema, type HomeQuoteValues } from '@/lib/forms/quote-schema';
import { useHydrated } from '@/lib/use-hydrated';
import { FormAlert, LateScriptHint, NoScriptNotice, SubmitLabel } from './parts';
import { useQuoteSubmit } from './useQuoteSubmit';

const INITIAL: HomeQuoteValues = { name: '', business: '', phone: '', email: '', amount: '', type: 'Not sure yet', message: '' };
const IDS = {
  name: 'sbfQName',
  business: 'sbfQBusiness',
  phone: 'sbfQPhone',
  email: 'sbfQEmail',
  amount: 'sbfQAmount',
  type: 'sbfQType',
  message: 'sbfQMessage',
};

/** "Get My Free Quote" on the home page. */
export function HomeQuoteForm() {
  const { values, set, errors, status, formError, onSubmit, formRef } = useQuoteSubmit('home-quote', homeQuoteSchema, INITIAL, IDS);
  const [honeypot, setHoneypot] = useState('');
  const hydrated = useHydrated();

  const input = (name: 'name' | 'business' | 'phone' | 'email', type: string, autoComplete: string) => (
    <input
      type={type}
      className={`form-control sbf-input${errors[name] ? ' is-invalid' : ''}`}
      id={IDS[name]}
      name={name}
      autoComplete={autoComplete}
      required
      maxLength={name === 'email' ? 254 : 120}
      value={values[name]}
      onChange={(e) => set(name, e.target.value)}
      aria-invalid={errors[name] ? true : undefined}
      aria-describedby={errors[name] ? `${IDS[name]}Error` : undefined}
    />
  );

  const feedback = (name: keyof HomeQuoteValues) =>
    errors[name] ? (
      <div className="invalid-feedback d-block" id={`${IDS[name]}Error`}>
        {errors[name]}
      </div>
    ) : null;

  return (
    // method="post": should a submit ever happen without our script, nothing goes into the URL
    <form className="sbf-quote-form" id="sbfQuoteForm" method="post" noValidate ref={formRef} onSubmit={(e) => onSubmit(e, honeypot)}>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="sbf-label" htmlFor={IDS.name}>
            Full name
          </label>
          {input('name', 'text', 'name')}
          {feedback('name')}
        </div>
        <div className="col-md-6">
          <label className="sbf-label" htmlFor={IDS.business}>
            Business name
          </label>
          {input('business', 'text', 'organization')}
          {feedback('business')}
        </div>
        <div className="col-md-6">
          <label className="sbf-label" htmlFor={IDS.phone}>
            Phone
          </label>
          {input('phone', 'tel', 'tel')}
          {feedback('phone')}
        </div>
        <div className="col-md-6">
          <label className="sbf-label" htmlFor={IDS.email}>
            Email
          </label>
          {input('email', 'email', 'email')}
          {feedback('email')}
        </div>
        <div className="col-md-6">
          <label className="sbf-label" htmlFor={IDS.amount}>
            Funding amount
          </label>
          <Select
            id={IDS.amount}
            name="amount"
            className="form-select sbf-select"
            placeholder="Select amount"
            options={HOME_FUNDING_AMOUNTS}
            value={values.amount}
            onChange={(v) => set('amount', v)}
            invalid={!!errors.amount}
            required
            describedBy={errors.amount ? `${IDS.amount}Error` : undefined}
          />
          {feedback('amount')}
        </div>
        <div className="col-md-6">
          <label className="sbf-label" htmlFor={IDS.type}>
            Financing type
          </label>
          <Select
            id={IDS.type}
            name="type"
            className="form-select sbf-select"
            options={HOME_FINANCING_TYPES}
            value={values.type}
            onChange={(v) => set('type', v)}
          />
        </div>
        <div className="col-12">
          <label className="sbf-label" htmlFor={IDS.message}>
            How will you use the funds? <span className="sbf-optional">(optional)</span>
          </label>
          <textarea
            className={`form-control sbf-input${errors.message ? ' is-invalid' : ''}`}
            id={IDS.message}
            name="message"
            rows={3}
            maxLength={2000}
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
          />
          {feedback('message')}
        </div>
        <HoneypotField value={honeypot} onChange={setHoneypot} id="sbfHpHome" />
        <div className="col-12">
          <button
            type="submit"
            className="btn sbf-btn sbf-btn-gold sbf-btn-lg w-100"
            disabled={status === 'sending' || !hydrated}
            aria-busy={status === 'sending'}
          >
            <SubmitLabel sending={status === 'sending'} label="Get My Free Quote" sendingLabel="Sending…" />
          </button>
          {formError && <FormAlert message={formError} />}
          <NoScriptNotice />
          <LateScriptHint ready={hydrated} />
          <p className="sbf-form-note">
            By submitting, you agree to be contacted about financing options. See our <Link href="/privacy-policy">Privacy Policy</Link>.
          </p>
        </div>
      </div>
      <QuoteSuccess show={status === 'sent'} />
    </form>
  );
}

export function QuoteSuccess({ show }: { show: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (show) ref.current?.focus();
  }, [show]);
  return (
    <div className="sbf-form-success" id="sbfQuoteSuccess" role="status" hidden={!show} tabIndex={-1} ref={ref}>
      <span className="sbf-form-success-icon">
        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
      </span>
      <h3>Thank you — request received!</h3>
      <p>
        A funding specialist will contact you shortly. Need funds today? Call <a href="tel:18002147498">1-800-214-7498</a>.
      </p>
    </div>
  );
}

/**
 * Hidden from people (off-screen, skipped by Tab and screen readers); bots fill it in.
 * The name means nothing on purpose: browsers and password managers autofill fields
 * called "website" or "company_url", which would silently drop a real lead.
 */
export function HoneypotField({ value, onChange, id }: { value: string; onChange: (v: string) => void; id: string }) {
  return (
    <div className="sbf-qr-hp" aria-hidden="true">
      <label htmlFor={id}>Leave this field empty</label>
      <input type="text" id={id} name="sbf_hp" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
