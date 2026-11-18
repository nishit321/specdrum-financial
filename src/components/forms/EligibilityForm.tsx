'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { usdWhole } from '@/lib/forms/format';
import { ELIGIBILITY_REVENUE, ELIGIBILITY_YEARS } from '@/lib/forms/options';

/** Home page hero: "See if you're pre-approved" (nothing is sent anywhere). */
export function EligibilityForm() {
  const [amount, setAmount] = useState(75_000);
  const [revenue, setRevenue] = useState('2');
  const [years, setYears] = useState('1 – 3 years');

  // Estimated monthly based on competitive working capital rates (same formula as the static site).
  const monthly = Math.round((amount * 1.14) / 12);
  const term = amount > 200_000 ? 'Up to 36 mos' : '3 – 24 mos';
  const approved = parseInt(revenue, 10) >= 2;

  return (
    <form className="sbf-eligibility-form" id="sbfEligibility" noValidate onSubmit={(e) => e.preventDefault()}>
      <div className="sbf-field">
        <div className="d-flex justify-content-between align-items-end">
          <label id="sbfAmountLabel" className="sbf-label">
            Funding needed
          </label>
          <output className="sbf-amount-value" id="sbfAmountValue" htmlFor="sbfAmount">
            {usdWhole(amount)}
          </output>
        </div>
        <Slider id="sbfAmount" min={10_000} max={500_000} step={5_000} value={amount} onChange={setAmount} labelledBy="sbfAmountLabel" valueText={usdWhole} />
        <div className="sbf-range-scale">
          <span>$10K</span>
          <span>$500K</span>
        </div>
      </div>
      <div className="sbf-calculator-metrics">
        <div className="sbf-calc-metric">
          <span className="sbf-calc-metric-lbl">Est. Repayment</span>
          <span className="sbf-calc-metric-val" id="sbfEstMonthly">
            {usdWhole(monthly)}/mo
          </span>
        </div>
        <div className="sbf-calc-metric">
          <span className="sbf-calc-metric-lbl">Typical Term</span>
          <span className="sbf-calc-metric-val" id="sbfEstTerm">
            {term}
          </span>
        </div>
      </div>
      <div className="row g-3">
        <div className="col-sm-6">
          <label htmlFor="sbfRevenue" className="sbf-label">
            Monthly sales
          </label>
          <Select id="sbfRevenue" className="form-select sbf-select" options={ELIGIBILITY_REVENUE} value={revenue} onChange={setRevenue} />
        </div>
        <div className="col-sm-6">
          <label htmlFor="sbfYears" className="sbf-label">
            Time in business
          </label>
          <Select id="sbfYears" className="form-select sbf-select" options={ELIGIBILITY_YEARS} value={years} onChange={setYears} />
        </div>
      </div>
      <div className={`sbf-eligibility-result${approved ? ' is-approved' : ''}`} id="sbfResult" aria-live="polite">
        <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>{' '}
        {approved ? (
          <span>
            <strong>Great news — you&apos;re pre-approved.</strong> Businesses with over $20,000 in monthly sales qualify.
          </span>
        ) : (
          <span>
            You may still qualify. <strong>Bad credit? No problem</strong> — apply and a specialist will review your options.
          </span>
        )}
      </div>
      <Link href="/apply-now" className="btn sbf-btn sbf-btn-navy w-100" id="sbfEligibilityCta">
        Continue to Application <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
      </Link>
      <p className="sbf-eligibility-note">No application fees · Checking won&apos;t affect your credit</p>
    </form>
  );
}
