'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Select } from '@/components/ui/Select';
import { parseCurrency, usdWhole } from '@/lib/forms/format';
import {
  MAX_MONTHLY_REVENUE,
  OFFER_IDS,
  PROGRAMS,
  TIME_IN_BUSINESS,
  applyHref,
  estimateLabel,
  timeInBusinessLabel,
  type CalculatorChoice,
  type ProgramId,
  type TimeInBusiness,
} from '@/lib/loan-calculator';
import { useHydrated } from '@/lib/use-hydrated';

const IDS = { revenue: 'calcRevenue', tib: 'calcStart' } as const;
const ICONS: Record<ProgramId, string> = { 'working-capital': 'sbf-i-cash', 'line-of-credit': 'sbf-i-card', equipment: 'sbf-i-gear', sba: 'sbf-i-shield' };

type Result = Omit<CalculatorChoice, 'program'>;
type Errors = Partial<Record<'revenue' | 'tib', string>>;

// "$ 1,000" on leaving the field. Read the same way as on submit, so "1,000.50" stays $1,000
// (not $100,050) and a long number is never cut; anything unreadable is left as typed.
function tidyRevenue(value: string): string {
  const amount = parseCurrency(value);
  return amount === null ? value : `$ ${amount.toLocaleString('en-US')}`;
}

function validate(revenue: string, tib: string): { errors: Errors; result?: Result } {
  const errors: Errors = {};
  const amount = parseCurrency(revenue);
  if (amount === null || amount < 1) errors.revenue = 'Enter your average monthly revenue in dollars.';
  else if (amount > MAX_MONTHLY_REVENUE) errors.revenue = `Enter an amount up to ${usdWhole(MAX_MONTHLY_REVENUE)}, or call us at 1-800-214-7498.`;
  if (!tib) errors.tib = 'Select when your business started.';
  if (Object.keys(errors).length) return { errors };
  return { errors, result: { monthlyRevenue: amount!, timeInBusiness: tib as TimeInBusiness } };
}

/** Loan calculator: monthly revenue + business start date → the programs the business pre-qualifies for. */
export function LoanCalculator() {
  const [revenue, setRevenue] = useState('');
  const [tib, setTib] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [result, setResult] = useState<Result | null>(null);
  const resultsHeading = useRef<HTMLHeadingElement>(null);
  const hydrated = useHydrated();

  // after each calculation, bring the offers into view and move focus there for screen readers
  useEffect(() => {
    if (!result) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('offers')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    resultsHeading.current?.focus({ preventScroll: true });
  }, [result]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const checked = validate(revenue, tib);
    setErrors(checked.errors);
    setResult(checked.result ? { ...checked.result } : null);
    if (!checked.result) document.getElementById(checked.errors.revenue ? IDS.revenue : IDS.tib)?.focus();
  };

  // offers shown for other numbers would mislead, and their links would carry the old numbers
  const changeRevenue = (value: string) => {
    setRevenue(value);
    setResult(null);
  };
  const changeTib = (value: string) => {
    if (value === tib) return;
    setTib(value);
    setResult(null);
  };

  const feedback = (name: keyof Errors, id: string) =>
    errors[name] ? (
      <div className="invalid-feedback d-block" id={`${id}Error`}>
        {errors[name]}
      </div>
    ) : null;

  return (
    <>
      {/* ============ CALCULATOR (overlaps hero) ============ */}
      <section className="sbf-qr-wrap" id="calculator">
        <div className="container">
          <div className="sbf-quote-card">
            <div className="row g-0">
              <div className="col-lg-5 order-2 order-lg-1">
                <div className="sbf-quote-aside">
                  <span className="sbf-eyebrow sbf-eyebrow-light">Loan Calculator</span>
                  <h2 className="sbf-quote-title">Let&apos;s see how much you qualify for</h2>
                  <p className="sbf-text sbf-text-light">
                    Enter your average monthly revenue and when your business started. You&apos;ll see the
                    funding programs you pre-qualify for right away.
                  </p>
                  <ul className="sbf-quote-points">
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg> An estimate in seconds
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-chart" /></svg> Working capital, line of credit and equipment financing
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg> No application fees
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-lock" /></svg> Finish your application online in minutes
                    </li>
                  </ul>
                  <div className="sbf-quote-contact">
                    <a href="tel:18002147498">
                      <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg> 1-800-214-7498
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-lg-7 order-1 order-lg-2">
                {/* method="post": a submit without our script never puts the revenue into the address */}
                <form className="sbf-quote-form" id="sbfCalcForm" method="post" noValidate onSubmit={onSubmit}>
                  <fieldset className="sbf-qr-fieldset">
                    <legend className="sbf-qr-legend">Your business</legend>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="sbf-label" htmlFor={IDS.revenue}>
                          Average monthly revenue <span className="sbf-qr-req" aria-hidden="true">*</span>
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={`form-control sbf-input${errors.revenue ? ' is-invalid' : ''}`}
                          id={IDS.revenue}
                          name="revenue"
                          placeholder="$ 50,000"
                          maxLength={20}
                          required
                          value={revenue}
                          onChange={(e) => changeRevenue(e.target.value)}
                          onBlur={(e) => setRevenue(tidyRevenue(e.target.value))}
                          aria-invalid={errors.revenue ? true : undefined}
                          aria-describedby={errors.revenue ? `${IDS.revenue}Error` : `${IDS.revenue}Hint`}
                        />
                        {feedback('revenue', IDS.revenue) ?? (
                          <div className="sbf-calc-hint" id={`${IDS.revenue}Hint`}>
                            Your business&apos;s average sales per month.
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <label className="sbf-label" htmlFor={IDS.tib}>
                          Business start date <span className="sbf-qr-req" aria-hidden="true">*</span>
                        </label>
                        <Select
                          id={IDS.tib}
                          name="tib"
                          className="form-select sbf-select"
                          placeholder="Select one"
                          options={TIME_IN_BUSINESS.map((t) => ({ value: t.value, label: t.label }))}
                          value={tib}
                          onChange={changeTib}
                          invalid={!!errors.tib}
                          required
                          describedBy={errors.tib ? `${IDS.tib}Error` : undefined}
                        />
                        {feedback('tib', IDS.tib)}
                      </div>
                    </div>
                  </fieldset>
                  <button type="submit" className="btn sbf-btn sbf-btn-gold sbf-btn-lg w-100" disabled={!hydrated}>
                    Review Available Offers <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                  </button>
                  <noscript>
                    <div className="sbf-form-alert">
                      <span>
                        The calculator needs JavaScript. Please turn it on, or call us at{' '}
                        <a href="tel:18002147498">1-800-214-7498</a>.
                      </span>
                    </div>
                  </noscript>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {result && <Offers result={result} headingRef={resultsHeading} />}
    </>
  );
}

function Offers({ result, headingRef }: { result: Result; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const choice = (program: ProgramId): CalculatorChoice => ({ program, ...result });
  return (
    // not data-sbf-reveal: this section appears after the page's reveal effects were set up
    <section className="sbf-section sbf-loans sbf-grain sbf-offers" id="offers" aria-labelledby="offersTitle">
      <div className="sbf-parallax-bg" style={{ backgroundImage: "url('/img/bg-city-skyline.jpg')" }} aria-hidden="true" />
      <div className="sbf-parallax-overlay sbf-parallax-overlay--loans" aria-hidden="true" />
      <div className="container position-relative">
        <div className="row align-items-end g-4 sbf-section-head">
          <div className="col-lg-7">
            <span className="sbf-eyebrow sbf-eyebrow-light">Congratulations</span>
            <h2 className="sbf-title sbf-title-light" id="offersTitle" ref={headingRef} tabIndex={-1}>
              You pre-qualify for the following loan programs
            </h2>
          </div>
          <div className="col-lg-5">
            <p className="sbf-text sbf-text-light mb-2">
              Based on average monthly revenue of {usdWhole(result.monthlyRevenue)}, in business{' '}
              {timeInBusinessLabel(result.timeInBusiness).toLowerCase()}.
            </p>
            <p className="sbf-offers-note mb-0">* Larger loan amounts can be made available upon further review.</p>
          </div>
        </div>
        <div className="row g-4">
          {OFFER_IDS.map((id, i) => (
            <div className="col-md-6 col-lg-4" key={id}>
              <div className="sbf-loan-card sbf-offer-card">
                <span className="sbf-loan-num">0{i + 1}</span>{' '}
                <span className="sbf-loan-icon">
                  <svg className="sbf-icon"><use href={`#${ICONS[id]}`} /></svg>
                </span>
                <h3 className="sbf-loan-title">{PROGRAMS[id].name}</h3>
                <div className="sbf-offer-amount">
                  <small>Estimated amount</small>
                  <strong data-testid={`offer-${id}`}>{estimateLabel(id, result.monthlyRevenue)}</strong>
                </div>
                <ul className="sbf-loan-feature-list">
                  {PROGRAMS[id].lines.map((line) => (
                    <li key={line}>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg> {line}
                    </li>
                  ))}
                </ul>
                <Link href={applyHref(choice(id))} className="btn sbf-btn sbf-btn-gold w-100 sbf-offer-cta">
                  Finish your Application <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="sbf-offer-sba">
          <div className="sbf-offer-sba-body">
            <span className="sbf-loan-icon">
              <svg className="sbf-icon"><use href={`#${ICONS.sba}`} /></svg>
            </span>
            <div>
              <h3 className="sbf-offer-sba-title">You may also qualify for an SBA 7(a) Loan</h3>
              <ul className="sbf-offer-sba-list">
                {PROGRAMS.sba.lines.map((line) => (
                  <li key={line}>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg> {line}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link href={applyHref(choice('sba'))} className="btn sbf-btn sbf-btn-gold sbf-offer-cta">
            Finish your Application <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
