'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { FormAlert, LateScriptHint, NoScriptNotice, SubmitLabel } from '@/components/forms/parts';
import { useHydrated } from '@/lib/use-hydrated';
import { HoneypotField } from '@/components/forms/HomeQuoteForm';
import { Checkbox } from '@/components/ui/Checkbox';
import { Select } from '@/components/ui/Select';
import { STEP_FIELDS, validateFields, type ApplyField, type ApplyValues } from '@/lib/forms/apply-schema';
import { newIdempotencyKey, postFormData, submitErrorMessage } from '@/lib/forms/client';
import {
  digitsOnly,
  formatCurrencyInput,
  formatDateInput,
  formatMonthYearInput,
  formatPhone,
  formatSsn,
} from '@/lib/forms/format';
import {
  BUSINESS_TYPES,
  INCORPORATION_TYPES,
  OPEN_LOANS,
  OWNER_TITLES,
  PROPERTY_STATUS,
  USE_OF_FUNDS_BUSINESS,
  USE_OF_FUNDS_INITIAL,
} from '@/lib/forms/options';
import { PROGRAMS, estimate, estimateLabel, parseCalculatorQuery, type CalculatorChoice } from '@/lib/loan-calculator';
import { FileDrop } from './FileDrop';
import { SignaturePad, type SignaturePadHandle } from './SignaturePad';

// Apply Now: 4 steps (Owners 1A/1B → Business → E-Sign → Documents) and the
// success screen. "Submit Application" sends everything to /api/apply, which
// emails the owner a signed PDF plus the uploaded bank statements.

type View = '1A' | '1B' | '2' | '3' | '4' | 'success';
type FieldStep = keyof typeof STEP_FIELDS;

const STEP_NUMBER: Record<View, number> = { '1A': 1, '1B': 1, '2': 2, '3': 3, '4': 4, success: 5 };
const STEP_LABELS = ['Owners', 'Business', 'E-Sign', 'Documents'];
const VIEW_IDS: Record<View, string> = {
  '1A': 'sbfStep1A',
  '1B': 'sbfStep1B',
  '2': 'sbfStep2',
  '3': 'sbfStep3',
  '4': 'sbfStep4',
  success: 'sbfStepSuccess',
};

const INITIAL: ApplyValues = {
  email: '',
  zip: '',
  phone: '',
  amount: '',
  use_of_funds: '',
  consent_contact: false,
  first_name: '',
  last_name: '',
  home_address: '',
  city: '',
  state: '',
  home_zip: '',
  dob: '',
  ssn: '',
  ownership: '100%',
  title: '',
  biz_amount: '',
  biz_use: 'Business Working Capital',
  biz_dba: '',
  biz_legal: '',
  biz_ein: '',
  biz_address: '',
  biz_zip: '',
  biz_phone: '',
  biz_incorp: '',
  biz_state: '',
  biz_start: '',
  biz_type: '',
  biz_property: '',
  monthly_revenue: '',
  daily_balance: '',
  open_loans: 'None',
  website: '',
  sign_name: '',
  esign_consent: false,
};

// Element ids from the static page, used to move focus to the first problem.
const FIELD_IDS: Record<ApplyField | 'signature' | 'files', string> = {
  email: 'appEmail',
  zip: 'appZip',
  phone: 'appPhone',
  amount: 'appAmount',
  use_of_funds: 'appUseOfFunds',
  consent_contact: 'appConsentCheck',
  first_name: 'appFirstName',
  last_name: 'appLastName',
  home_address: 'appHomeAddress',
  city: 'appCity',
  state: 'appState',
  home_zip: 'appHomeZip',
  dob: 'appDob',
  ssn: 'appSsn',
  ownership: 'appOwnership',
  title: 'appTitle',
  biz_amount: 'appBizAmount',
  biz_use: 'appBizUse',
  biz_dba: 'appBizDba',
  biz_legal: 'appBizLegal',
  biz_ein: 'appBizEin',
  biz_address: 'appBizAddress',
  biz_zip: 'appBizZip',
  biz_phone: 'appBizPhone',
  biz_incorp: 'appBizIncorp',
  biz_state: 'appBizState',
  biz_start: 'appBizStart',
  biz_type: 'appBizType',
  biz_property: 'appBizProperty',
  monthly_revenue: 'appMonthlyRev',
  daily_balance: 'appDailyBal',
  open_loans: 'appOpenLoans',
  website: 'appWebsite',
  sign_name: 'appSignName',
  esign_consent: 'chkEsignConsent',
  signature: 'btnTypedSign', // the canvas can't take focus; the "sign with my printed name" button can
  files: 'btnBrowseFiles',
};

const ALL_FIELDS = Object.values(STEP_FIELDS).flat() as ApplyField[];

const stepOfField = (field: string): View => {
  if (field === 'signature') return '3';
  if (field === 'files') return '4';
  const hit = (Object.keys(STEP_FIELDS) as FieldStep[]).find((s) => (STEP_FIELDS[s] as readonly string[]).includes(field));
  return hit ?? '4';
};

const todayUs = () => {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`;
};
const noopSubscribe = () => () => {};

type TextName = { [K in ApplyField]: ApplyValues[K] extends string ? K : never }[ApplyField];

export function ApplyForm() {
  const [view, setView] = useState<View>('1A');
  const [values, setValues] = useState<ApplyValues>(INITIAL);
  const [attempted, setAttempted] = useState<ReadonlySet<View>>(new Set());
  const [serverErrors, setServerErrors] = useState<Record<string, string>>({});
  const [hasSignature, setHasSignature] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sameLegal, setSameLegal] = useState(false);
  const [taxSameSsn, setTaxSameSsn] = useState(false);
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState({ name: 'Applicant', reference: '' });
  const [honeypot, setHoneypot] = useState('');
  /** the program picked on the loan calculator, when the person came from there */
  const [calculator, setCalculator] = useState<CalculatorChoice | null>(null);
  const signDate = useSyncExternalStore(noopSubscribe, todayUs, () => '');
  const hydrated = useHydrated();
  const signatureRef = useRef<SignaturePadHandle>(null);
  const idempotencyKey = useRef<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  // Coming from the loan calculator: fill in what it already knows; the person can change any of it.
  // The address is read after hydration (the server renders the empty form), and applied once.
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => '');
  const [appliedSearch, setAppliedSearch] = useState('');
  if (search && search !== appliedSearch) {
    setAppliedSearch(search);
    const choice = parseCalculatorQuery(search);
    if (choice) {
      const program = PROGRAMS[choice.program];
      const amount = estimate(choice.program, choice.monthlyRevenue);
      setCalculator(choice);
      setValues((v) => ({
        ...v,
        ...(amount !== null ? { amount: formatCurrencyInput(String(amount)) } : {}),
        ...(program.useOfFunds ? { use_of_funds: program.useOfFunds } : {}),
        ...(program.bizUse ? { biz_use: program.bizUse } : {}),
        monthly_revenue: formatCurrencyInput(String(choice.monthlyRevenue)),
      }));
    }
  }

  /* ---------- errors ---------- */

  const liveErrors = (v: View) => (attempted.has(v) && v in STEP_FIELDS ? validateFields(values, STEP_FIELDS[v as FieldStep]) : {});
  const errors: Record<string, string | undefined> = { ...serverErrors, ...liveErrors(view) };
  if (attempted.has('3') && !hasSignature) errors.signature = 'Please draw your signature.';
  const err = (name: ApplyField | 'signature' | 'files') => errors[name];

  /* ---------- navigation ---------- */

  // Scroll the card into view and move focus to the new step's heading.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const card = rootRef.current?.closest<HTMLElement>('.sbf-app-card') ?? rootRef.current;
    if (card) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: card.getBoundingClientRect().top + window.scrollY - 90, behavior: reduce ? 'auto' : 'smooth' });
    }
    document.querySelector<HTMLElement>(`#${VIEW_IDS[view]} h2`)?.focus({ preventScroll: true });
  }, [view]);

  const focusField = (field: string) => {
    requestAnimationFrame(() => document.getElementById(FIELD_IDS[field as ApplyField])?.focus());
  };

  /**
   * Something the person entered changed: drop the server's error for it and start a new
   * submission key (re-sending under an old key could return an earlier result and lose the edit).
   */
  const changed = (name: string) => {
    idempotencyKey.current = null;
    setServerErrors((prev) => {
      if (!(name in prev)) return prev;
      const rest = { ...prev };
      delete rest[name];
      return rest;
    });
  };

  const set = <K extends ApplyField>(name: K, value: ApplyValues[K]) => {
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'biz_dba' && sameLegal) next.biz_legal = value as string;
      return next;
    });
    changed(name);
    // a signature typed from the old printed name no longer matches it
    if (name === 'sign_name') signatureRef.current?.clearIfTyped();
  };

  const goTo = (next: View) => {
    setFormError(null);
    setView(next);
  };

  const continueFrom = (from: FieldStep, to: View, carryOver?: (v: ApplyValues) => Partial<ApplyValues>) => {
    setAttempted((prev) => new Set(prev).add(from));
    const errs = validateFields(values, STEP_FIELDS[from]);
    const signatureMissing = from === '3' && (signatureRef.current?.isEmpty() ?? true);
    const first = Object.keys(errs)[0] ?? (signatureMissing ? 'signature' : null);
    if (first) return focusField(first);
    if (carryOver) setValues((v) => ({ ...v, ...carryOver(v) }));
    goTo(to);
  };

  const nextStep: Partial<Record<View, () => void>> = {
    '1A': () => continueFrom('1A', '1B', (v) => (v.amount ? { biz_amount: v.amount } : {})),
    '1B': () => continueFrom('1B', '2', (v) => ({ sign_name: `${v.first_name} ${v.last_name}`.trim() })),
    '2': () => continueFrom('2', '3'),
    '3': () => continueFrom('3', '4'),
  };

  /* ---------- submit ---------- */

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Enter in a field on steps 1-3 means "Continue"
    if (view !== '4') return nextStep[view]?.();
    if (sending) return;

    // everything again, in case an earlier step was changed and not re-checked
    const all = validateFields(values, ALL_FIELDS);
    const signature = signatureRef.current?.toDataUrl() ?? null;
    const firstProblem = Object.keys(all)[0] ?? (signature ? null : 'signature');
    if (firstProblem) {
      const step = stepOfField(firstProblem);
      setAttempted((prev) => new Set(prev).add(step));
      goTo(step);
      return focusField(firstProblem);
    }

    idempotencyKey.current ??= newIdempotencyKey();
    const body = new FormData();
    body.append('payload', JSON.stringify({ idempotencyKey: idempotencyKey.current, honeypot, fields: values, signature, ...(calculator ? { calculator } : {}) }));
    files.forEach((f) => body.append('files', f, f.name));

    setSending(true);
    setFormError(null);
    const result = await postFormData('/api/apply', body);
    setSending(false);

    if (result.ok) {
      setSuccess({ name: values.first_name || 'Applicant', reference: result.reference });
      // don't keep the SSN and the rest in memory once it has been sent
      setValues(INITIAL);
      setFiles([]);
      setSameLegal(false);
      setTaxSameSsn(false);
      setAttempted(new Set());
      signatureRef.current?.clear();
      setCalculator(null);
      idempotencyKey.current = null;
      goTo('success');
      return;
    }

    // the server already holds different details under this key: the next press needs a new one
    if (result.error === 'conflict') idempotencyKey.current = null;
    if (result.error === 'validation' && 'fields' in result && result.fields) {
      setServerErrors(result.fields);
      const first = Object.keys(result.fields)[0];
      const step = stepOfField(first);
      if (step !== view) setView(step);
      focusField(first);
    }
    setFormError(submitErrorMessage(result));
  };

  /* ---------- field helpers ---------- */

  const describedBy = (name: ApplyField | 'signature') => (errors[name] ? `${FIELD_IDS[name]}Error` : undefined);

  const text = (
    name: TextName,
    opts: {
      type?: string;
      placeholder?: string;
      maxLength?: number;
      inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
      autoComplete?: string;
      required?: boolean;
      readOnly?: boolean;
      mask?: (v: string) => string;
      onBlurFormat?: (v: string) => string;
      style?: React.CSSProperties;
    } = {},
  ) => (
    <input
      type={opts.type ?? 'text'}
      className={`sbf-field-input${err(name) ? ' is-invalid' : ''}`}
      id={FIELD_IDS[name]}
      name={name}
      placeholder={opts.placeholder}
      maxLength={opts.maxLength ?? 120}
      inputMode={opts.inputMode}
      autoComplete={opts.autoComplete ?? 'off'}
      required={opts.required ?? true}
      readOnly={opts.readOnly}
      style={opts.style}
      value={values[name]}
      onChange={(e) => set(name, opts.mask ? opts.mask(e.target.value) : e.target.value)}
      onBlur={opts.onBlurFormat ? () => values[name] && set(name, opts.onBlurFormat!(values[name])) : undefined}
      aria-invalid={err(name) ? true : undefined}
      aria-describedby={describedBy(name)}
    />
  );

  const select = (name: TextName, options: Parameters<typeof Select>[0]['options'], placeholder?: string, required = true) => (
    <Select
      id={FIELD_IDS[name]}
      name={name}
      className="sbf-field-select"
      options={options}
      placeholder={placeholder}
      value={values[name]}
      onChange={(v) => set(name, v)}
      invalid={!!err(name)}
      required={required}
      describedBy={describedBy(name)}
    />
  );

  const step = STEP_NUMBER[view];
  const shown = (v: View) => (view === v ? undefined : { display: 'none' as const });

  return (
    <div ref={rootRef}>
      {/* Progress Step Indicator */}
      <div
        className="sbf-app-steps-bar"
        role="progressbar"
        aria-label="Application Progress"
        aria-valuemin={1}
        aria-valuemax={4}
        aria-valuenow={Math.min(step, 4)}
        aria-valuetext={step > 4 ? 'Application submitted' : `Step ${step} of 4: ${STEP_LABELS[step - 1]}`}
      >
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? ' is-completed' : n === step ? ' is-active' : '';
          return (
            <StepNode key={label} n={n} label={label} state={state} showDivider={n < 4} dividerDone={n < step} />
          );
        })}
      </div>

      {/* The Multi-Step Form */}
      {/* method="post": Enter in a field without our script must never put the SSN into the URL */}
      <form id="sbfApplyForm" method="post" noValidate onSubmit={onSubmit}>
        <NoScriptNotice />
        <LateScriptHint ready={hydrated} />
        {calculator && (
          <div className="sbf-calc-note" role="note">
            <svg className="sbf-icon"><use href="#sbf-i-chart" /></svg>
            <p>
              From the loan calculator: <strong>{PROGRAMS[calculator.program].name}</strong> (
              {calculator.program === 'sba' ? 'up to $500,000' : `estimated ${estimateLabel(calculator.program, calculator.monthlyRevenue)}`}).
              We&apos;ve filled in what we already know; you can change anything.
            </p>
          </div>
        )}
        {/* ================= STEP 1-A: OWNERS (INITIAL CONTACT) ================= */}
        <div className="sbf-step-view" id="sbfStep1A" style={shown('1A')}>
          <h2 className="sbf-app-step-title" tabIndex={-1}>
            Let&apos;s get started with your funding application
          </h2>
          <p className="sbf-app-step-sub">Tell us something about yourself</p>

          <Field id={FIELD_IDS.email} label="Email Address" error={err('email')}>
            {text('email', { type: 'email', placeholder: 'john@doe.com', maxLength: 254, autoComplete: 'email' })}
          </Field>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.zip} label="Zip Code" error={err('zip')}>
                {text('zip', { placeholder: '10001', maxLength: 5, inputMode: 'numeric', autoComplete: 'postal-code', mask: (v) => digitsOnly(v).slice(0, 5) })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.phone} label="Mobile Phone" error={err('phone')}>
                {text('phone', { type: 'tel', placeholder: '(999) 999-9999', maxLength: 14, inputMode: 'tel', autoComplete: 'tel', mask: formatPhone })}
              </Field>
            </div>
          </div>

          <Field id={FIELD_IDS.amount} label="Amount Requested" error={err('amount')}>
            {text('amount', { placeholder: '$ How much cash do you need?', maxLength: 20, inputMode: 'numeric', onBlurFormat: formatCurrencyInput })}
          </Field>

          <Field id={FIELD_IDS.use_of_funds} label="Use of Funds" error={err('use_of_funds')}>
            {select('use_of_funds', USE_OF_FUNDS_INITIAL, 'Select use of funds')}
          </Field>

          {/* Disclaimer Box with Checkbox */}
          <div className="sbf-app-disclaimer-box">
            <Checkbox
              id={FIELD_IDS.consent_contact}
              required
              checked={values.consent_contact}
              onChange={(v) => set('consent_contact', v)}
              invalid={!!err('consent_contact')}
              aria-describedby={describedBy('consent_contact')}
            />
            <label htmlFor={FIELD_IDS.consent_contact} className="sbf-app-disclaimer-text">
              By checking this box and selecting Continue the Borrower agrees to authorize Spectrum Financial to contact the Borrower at the
              telephone, cell phone, email or direct mail contact data provided in this form for purposes of fulfilling this inquiry about
              business financing, even if the Borrower has previously indicated a preference of &quot;do not call&quot; or &quot;do not
              email&quot; with a government registry or with Spectrum Financial. Also, the Borrower agrees that we may deliver a response to
              the pre-approval request to the email address provided. By agreeing to communicate with Spectrum Financial about this
              pre-approval request by email, the Borrower agrees to retain (whether by printing or saving electronically) the communications
              and documents that we email. If the Borrower is unable to print or retain the information, or wishes to revoke the agreement to
              be contacted about this qualification inquiry by email, the Borrower agrees to call Spectrum Financial at (800) 214-7498.
            </label>
          </div>
          <FieldError id={FIELD_IDS.consent_contact} error={err('consent_contact')} />

          <div className="sbf-app-actions">
            <button
              type="button"
              className="sbf-app-btn-continue"
              id="btnStep1A"
              onClick={nextStep['1A']}
            >
              Continue <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
            </button>
          </div>
        </div>

        {/* ================= STEP 1-B: OWNERS (PERSONAL DETAILS) ================= */}
        <div className="sbf-step-view" id="sbfStep1B" style={shown('1B')}>
          <h2 className="sbf-app-step-title" tabIndex={-1}>
            Tell us more about yourself
          </h2>
          <p className="sbf-app-step-sub">Personal verification required for soft eligibility review</p>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.first_name} label="First Name" error={err('first_name')}>
                {text('first_name', { placeholder: 'John', maxLength: 60, autoComplete: 'given-name' })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.last_name} label="Last Name" error={err('last_name')}>
                {text('last_name', { placeholder: 'Smith', maxLength: 60, autoComplete: 'family-name' })}
              </Field>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.home_address} label="Home Address" error={err('home_address')}>
                {text('home_address', { placeholder: '123 Main Street', autoComplete: 'street-address' })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.city} label="City" error={err('city')}>
                {text('city', { placeholder: 'Anniston', maxLength: 60, autoComplete: 'address-level2' })}
              </Field>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.state} label="State" error={err('state')}>
                {text('state', {
                  placeholder: 'AL',
                  maxLength: 2,
                  autoComplete: 'address-level1',
                  style: { textTransform: 'uppercase' },
                  mask: (v) => v.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase(),
                })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.home_zip} label="Zip Code" error={err('home_zip')}>
                {text('home_zip', { placeholder: '36201', maxLength: 5, inputMode: 'numeric', autoComplete: 'postal-code', mask: (v) => digitsOnly(v).slice(0, 5) })}
              </Field>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.dob} label="Date of Birth" error={err('dob')}>
                {text('dob', { placeholder: '01/01/1969', maxLength: 10, inputMode: 'numeric', autoComplete: 'bday', mask: formatDateInput })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.ssn} label="Social Security Number" error={err('ssn')}>
                {text('ssn', { placeholder: '999-88-9999', maxLength: 11, inputMode: 'numeric', mask: formatSsn })}
              </Field>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.ownership} label="Ownership Percent" error={err('ownership')}>
                {text('ownership', { maxLength: 7 })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.title} label="Business Title" error={err('title')}>
                {select('title', OWNER_TITLES, 'Select title')}
              </Field>
            </div>
          </div>

          <div className="sbf-app-actions">
            <button type="button" className="sbf-app-btn-back" id="btnBack1B" onClick={() => goTo('1A')}>
              Back
            </button>
            <button
              type="button"
              className="sbf-app-btn-continue"
              id="btnStep1B"
              onClick={nextStep['1B']}
            >
              Continue <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
            </button>
          </div>
        </div>

        {/* ================= STEP 2: BUSINESS ================= */}
        <div className="sbf-step-view" id="sbfStep2" style={shown('2')}>
          <h2 className="sbf-app-step-title" tabIndex={-1}>
            Tell us more about your business
          </h2>
          <p className="sbf-app-step-sub">We underwrite based on your revenue trajectory and cash flow</p>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_amount} label="Amount Requested" error={err('biz_amount')}>
                {text('biz_amount', { placeholder: '$ 250,000', maxLength: 20, inputMode: 'numeric', onBlurFormat: formatCurrencyInput })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_use} label="Use of Funds" error={err('biz_use')}>
                {select('biz_use', USE_OF_FUNDS_BUSINESS)}
              </Field>
            </div>
          </div>

          <Field id={FIELD_IDS.biz_dba} label="Business D/B/A Name" error={err('biz_dba')}>
            {text('biz_dba', { placeholder: 'Doing Business As (e.g. Apex Logistics)', autoComplete: 'organization' })}
          </Field>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_legal} label="Business Legal Name" error={err('biz_legal')}>
                {text('biz_legal', { placeholder: 'Legal Entity Name' })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_ein} label="Tax ID / EIN" error={err('biz_ein')}>
                {text('biz_ein', { placeholder: '27-1115599', maxLength: 11, inputMode: 'numeric', mask: (v) => v.replace(/[^\d-]/g, '').slice(0, 11) })}
              </Field>
            </div>
          </div>

          {/* Checkbox helpers */}
          <div className="row g-3 mb-2">
            <div className="col-md-6">
              <label className="sbf-app-checkbox-label">
                <Checkbox
                  id="chkSameLegalName"
                  checked={sameLegal}
                  onChange={(checked) => {
                    setSameLegal(checked);
                    if (checked && values.biz_dba) set('biz_legal', values.biz_dba);
                  }}
                />
                <span>Legal Name is same as D/B/A</span>
              </label>
            </div>
            <div className="col-md-6">
              <label className="sbf-app-checkbox-label">
                <Checkbox
                  id="chkTaxSameSsn"
                  checked={taxSameSsn}
                  onChange={(checked) => {
                    setTaxSameSsn(checked);
                    if (checked && values.ssn) set('biz_ein', values.ssn);
                  }}
                />
                <span>Tax ID is same as my SSN</span>
              </label>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_address} label="Business Address" error={err('biz_address')}>
                {text('biz_address', { placeholder: 'Commercial address' })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_zip} label="Business Zip Code" error={err('biz_zip')}>
                {text('biz_zip', { placeholder: '10001', maxLength: 5, inputMode: 'numeric', mask: (v) => digitsOnly(v).slice(0, 5) })}
              </Field>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_phone} label="Contact Number" error={err('biz_phone')}>
                {text('biz_phone', { type: 'tel', placeholder: '(999) 999-9999', maxLength: 14, inputMode: 'tel', mask: formatPhone })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_incorp} label="Incorporation Type" error={err('biz_incorp')}>
                {select('biz_incorp', INCORPORATION_TYPES, 'Select entity type')}
              </Field>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_state} label="State of Incorporation" error={err('biz_state')}>
                {text('biz_state', {
                  placeholder: 'e.g. CA or DE',
                  maxLength: 2,
                  style: { textTransform: 'uppercase' },
                  mask: (v) => v.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase(),
                })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_start} label="Business Start Date" error={err('biz_start')}>
                {text('biz_start', { placeholder: 'MM/YYYY', maxLength: 7, inputMode: 'numeric', mask: formatMonthYearInput })}
              </Field>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_type} label="Type of Business" error={err('biz_type')}>
                {select('biz_type', BUSINESS_TYPES, 'Select industry')}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.biz_property} label="Own/Lease Property" error={err('biz_property')}>
                {select('biz_property', PROPERTY_STATUS, 'Select property status')}
              </Field>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.monthly_revenue} label="Average Monthly Revenue" error={err('monthly_revenue')}>
                {text('monthly_revenue', { placeholder: '$ Avg Monthly Revenue', maxLength: 20, inputMode: 'numeric', onBlurFormat: formatCurrencyInput })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.daily_balance} label="Average Daily Bank Balance" error={err('daily_balance')}>
                {text('daily_balance', { placeholder: '$ Approx. Avg Daily Balance', maxLength: 20, inputMode: 'numeric', onBlurFormat: formatCurrencyInput })}
              </Field>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.open_loans} label="Open MCA/Loan Balance" required={false} error={err('open_loans')}>
                {select('open_loans', OPEN_LOANS, undefined, false)}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id={FIELD_IDS.website} label="Website" required={false} error={err('website')}>
                {text('website', { placeholder: 'www.yourbusiness.com', maxLength: 200, required: false, autoComplete: 'url' })}
              </Field>
            </div>
          </div>

          <div className="sbf-app-actions">
            <button type="button" className="sbf-app-btn-back" id="btnBack2" onClick={() => goTo('1B')}>
              Back
            </button>
            <button type="button" className="sbf-app-btn-continue" id="btnStep2" onClick={nextStep['2']}>
              Continue <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
            </button>
          </div>
        </div>

        {/* ================= STEP 3: E-SIGN ================= */}
        <div className="sbf-step-view" id="sbfStep3" style={shown('3')}>
          <h2 className="sbf-app-step-title" tabIndex={-1}>
            Electronic Signature &amp; Authorization
          </h2>
          <p className="sbf-app-step-sub">Authorize soft credit verification and review underwriting disclosures</p>

          {/* Application Summary Box */}
          <div className="sbf-esign-box">
            <div className="row g-2 mb-3 pb-3 border-bottom text-muted" style={{ fontSize: '13.5px' }}>
              <div className="col-sm-4">
                <strong>Applicant:</strong> <span id="summaryName">{`${values.first_name} ${values.last_name}`.trim() || 'John Smith'}</span>
              </div>
              <div className="col-sm-4">
                <strong>Business:</strong> <span id="summaryDba">{values.biz_dba || 'Apex Logistics'}</span>
              </div>
              <div className="col-sm-4">
                <strong>Requested:</strong> <span id="summaryAmount">{values.biz_amount || '$250,000'}</span>
              </div>
            </div>
            <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#475569', marginBottom: 0 }}>
              By signing below, the undersigned business and its principal owner(s) authorize Spectrum Financial and its financial lender
              network to obtain consumer and business credit reports, verify bank account balances, and contact financial references to
              process this funding application. You certify that all representations made on this application are true, accurate, and
              complete. Checking your options uses a soft inquiry that will never affect your personal credit score.
            </p>
          </div>

          {/* Signature Pad */}
          <div>
            <span className="form-label fw-bold mb-1 d-inline-block" style={{ fontSize: '14px', color: '#1e293b' }} id="sbfSignLabel">
              Draw Your Signature Below <span className="text-danger">*</span>
            </span>
            <SignaturePad
              ref={signatureRef}
              active={view === '3'}
              invalid={!!err('signature')}
              onChange={(has) => {
                setHasSignature(has);
                changed('signature');
              }}
              typedName={values.sign_name}
              describedBy={err('signature') ? `${FIELD_IDS.signature}Error` : 'sbfSignLabel'}
            />
            <FieldError id={FIELD_IDS.signature} error={err('signature')} />
          </div>

          {/* Signer Printed Name & Date */}
          <div className="row g-3 mt-3">
            <div className="col-md-6">
              <Field id={FIELD_IDS.sign_name} label="Printed Name" error={err('sign_name')}>
                {text('sign_name', { placeholder: 'Full Legal Name', autoComplete: 'name' })}
              </Field>
            </div>
            <div className="col-md-6">
              <Field id="appSignDate" label="Date">
                <input type="text" className="sbf-field-input" id="appSignDate" name="sign_date" readOnly value={signDate} />
              </Field>
            </div>
          </div>

          <div className="mt-2 mb-4">
            <label className="sbf-app-checkbox-label">
              <Checkbox
                id={FIELD_IDS.esign_consent}
                required
                checked={values.esign_consent}
                onChange={(v) => set('esign_consent', v)}
                invalid={!!err('esign_consent')}
                aria-describedby={describedBy('esign_consent')}
              />
              <span>I agree to use electronic records and signatures, and I certify that I am authorized to bind the business.</span>
            </label>
            <FieldError id={FIELD_IDS.esign_consent} error={err('esign_consent')} />
          </div>

          <div className="sbf-app-actions">
            <button type="button" className="sbf-app-btn-back" id="btnBack3" onClick={() => goTo('2')}>
              Back
            </button>
            <button type="button" className="sbf-app-btn-continue" id="btnStep3" onClick={nextStep['3']}>
              Continue <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
            </button>
          </div>
        </div>

        {/* ================= STEP 4: DOCUMENTS ================= */}
        <div className="sbf-step-view" id="sbfStep4" style={shown('4')}>
          <h2 className="sbf-app-step-title" tabIndex={-1}>
            Upload Recent Bank Statements
          </h2>
          <p className="sbf-app-step-sub">Attach your last 3 months of business checking account statements for instant revenue verification</p>

          <FileDrop
            files={files}
            onChange={(next) => {
              setFiles(next);
              changed('files');
            }}
            error={err('files')}
          />

          {/* Security notice */}
          <div className="d-flex align-items-center gap-3 p-3 mt-4 rounded-3" style={{ background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <svg className="sbf-icon text-success flex-shrink-0" style={{ width: '22px', height: '22px' }}>
              <use href="#sbf-i-shield" />
            </svg>
            <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              <strong>Bank-Grade 256-Bit SSL Encryption:</strong> Your statements are encrypted and transmitted directly to underwriting.
              Don&apos;t have your statements ready? You can still submit and email them directly to{' '}
              <a href="mailto:info@spectrumbusinessfinance.com">info@spectrumbusinessfinance.com</a>.
            </div>
          </div>

          <HoneypotField value={honeypot} onChange={setHoneypot} id="sbfHpApply" />

          <div className="sbf-app-actions">
            <button type="button" className="sbf-app-btn-back" id="btnBack4" onClick={() => goTo('3')} disabled={sending}>
              Back
            </button>
            <button
              type="submit"
              className="sbf-app-btn-continue"
              id="btnSubmitApp"
              style={{ background: 'var(--sbf-gold-500)', color: 'var(--sbf-navy-900)' }}
              disabled={sending || !hydrated}
              aria-busy={sending}
            >
              <SubmitLabel sending={sending} label="Submit Application" sendingLabel="Sending your application…" />
            </button>
          </div>
        </div>

        {formError && view !== 'success' && <FormAlert message={formError} />}

        {/* ================= STEP 5: APPLICATION SUCCESS ================= */}
        <div className="sbf-step-view sbf-app-success" id="sbfStepSuccess" style={shown('success')}>
          <div className="sbf-app-success-icon">
            <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
          </div>
          <h2 className="sbf-app-step-title mb-2" tabIndex={-1}>
            Application Successfully Submitted!
          </h2>
          <p className="text-muted mb-3" style={{ fontSize: '16px' }}>
            Thank you,{' '}
            <strong id="successApplicantName" className="text-dark">
              {success.name}
            </strong>
            . Your file has been assigned to a dedicated financing specialist.
          </p>
          <div className="sbf-app-ref-box">
            Reference Number: <span id="appRefCode">{success.reference}</span>
          </div>
          <div className="row g-3 text-start max-w-720 mx-auto mb-4 p-4 rounded-3" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <SuccessPoint n={1} title="Instant Soft Review" text="Underwriters assess your revenue with $0 application fees." />
            <SuccessPoint n={2} title="Custom Terms Prepared" text="You receive approval terms in 2 to 4 hours." />
            <SuccessPoint n={3} title="Same-Day Wire Transfer" text="Upon agreement, funds are wired in 24 hours." />
          </div>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <a href="tel:18002147498" className="btn sbf-btn sbf-btn-gold">
              <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg> Call Specialist: 1-800-214-7498
            </a>
            <Link href="/" className="btn sbf-btn sbf-btn-outline">
              Return to Home
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}

function StepNode({ n, label, state, showDivider, dividerDone }: { n: number; label: string; state: string; showDivider: boolean; dividerDone: boolean }) {
  return (
    <>
      <div className={`sbf-app-step-item${state}`} id={`sbfStepNode${n}`}>
        <div className="sbf-app-step-num">{n}</div>
        <span className="sbf-app-step-text">{label}</span>
      </div>
      {showDivider && <div className={`sbf-app-step-divider${dividerDone ? ' is-completed' : ''}`} id={`sbfStepDiv${n}`} />}
    </>
  );
}

function Field({ id, label, required = true, error, children }: { id: string; label: string; required?: boolean; error?: string; children: React.ReactNode }) {
  return (
    <div className="sbf-field">
      <label className="sbf-field-label" htmlFor={id}>
        {label}
        {required && (
          <>
            {' '}
            <span className="req">*</span>
          </>
        )}
      </label>
      {children}
      <FieldError id={id} error={error} />
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  return error ? (
    <div className="sbf-field-error" id={`${id}Error`}>
      {error}
    </div>
  ) : null;
}

function SuccessPoint({ n, title, text }: { n: number; title: string; text: string }) {
  return (
    <div className="col-md-4">
      <div className="d-flex align-items-start gap-2">
        <span className="badge rounded-pill sbf-app-badge">{n}</span>
        <div>
          <strong className="d-block" style={{ fontSize: '14px', color: '#0f172a' }}>
            {title}
          </strong>
          <small className="text-muted">{text}</small>
        </div>
      </div>
    </div>
  );
}
