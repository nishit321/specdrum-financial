import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { EligibilityForm } from '@/components/forms/EligibilityForm';
import { HomeQuoteForm } from '@/components/forms/HomeQuoteForm';
import { StoryproofWidget } from '@/components/StoryproofWidget';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/",
  title: "Business Loans & Funding in 24 Hours | Spectrum Financial",
  description: "Working capital and equipment loans funded within 24 hours, plus business lines of credit. Over 80% approval and no application fees.",
  image: "/img/hero-bg.jpg",
});

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FinancialService",
      "@id": "https://spectrumbusinessloans.com/#organization",
      "name": "Spectrum Financial",
      "legalName": "Tri-Cities Consulting LLC",
      "url": "https://spectrumbusinessloans.com/",
      "logo": "https://spectrumbusinessloans.com/img/logo.png",
      "image": "https://spectrumbusinessloans.com/img/hero-bg.jpg",
      "telephone": "+1-800-214-7498",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "11021 Winners Cir #103",
        "addressLocality": "Los Alamitos",
        "addressRegion": "CA",
        "postalCode": "90720",
        "addressCountry": "US"
      },
      "areaServed": "US"
    },
    {
      "@type": "WebSite",
      "@id": "https://spectrumbusinessloans.com/#website",
      "name": "Spectrum Financial",
      "url": "https://spectrumbusinessloans.com/",
      "publisher": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      }
    },
    {
      "@type": "WebPage",
      "@id": "https://spectrumbusinessloans.com/#webpage",
      "url": "https://spectrumbusinessloans.com/",
      "name": "Business Loans & Funding in 24 Hours | Spectrum Financial",
      "description": "Working capital and equipment loans funded within 24 hours, plus business lines of credit. Over 80% approval and no application fees.",
      "isPartOf": {
        "@id": "https://spectrumbusinessloans.com/#website"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How quickly can I receive funding?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "In most cases we can fund your business within 24 hours. Our streamlined application requires minimal documentation, so there is very little waiting on paperwork."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need collateral to qualify?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. Our unsecured working capital programs do not require collateral. Equipment financing is secured by the equipment itself."
          }
        },
        {
          "@type": "Question",
          "name": "I have bad credit. Can I still be approved?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes — bad credit is not a deal-breaker. We focus on the health and sales of your business rather than relying on personal credit scores, which is why our approval rate is over 80%."
          }
        },
        {
          "@type": "Question",
          "name": "What do I need to be pre-approved?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "If your business is generating over $20,000 in monthly sales, you are pre-approved. Simply complete the application and a funding specialist will walk you through your options."
          }
        },
        {
          "@type": "Question",
          "name": "Are there any application or upfront fees?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "None. There are no advance fees and no application fees — it costs nothing to apply and see what your business qualifies for."
          }
        },
        {
          "@type": "Question",
          "name": "What can I use the funds for?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Anything that keeps your business thriving: expansion, payroll, inventory, equipment, paying off debt, or bridging the gap until a contract pays out."
          }
        }
      ]
    }
  ]
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* ============ HERO ============ */}
        <section className="sbf-hero sbf-grain">
          <div className="sbf-hero-media" aria-hidden="true">
            <div className="sbf-hero-media-bg" />
            <div className="sbf-hero-chart" data-sbf-parallax="0.12" style={{ backgroundImage: "url('/img/pattern-hero.svg')" }} />
          </div>
          <div className="sbf-hero-overlay" />
          <div className="sbf-hero-aurora" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="sbf-hero-grid" />
          <div className="container position-relative">
            <div className="row align-items-center g-5">
              <div className="col-lg-7">
                <div className="sbf-hero-content" data-sbf-reveal="">
                  <span className="sbf-pill">
                    {" "}
                    <span className="sbf-pill-dot" />
                    {" "}
                    Over $500M+ Capital Deployed Nationwide
                    {" "}
                  </span>
                  <h1 className="sbf-hero-title">
                    Business financing
                    {" "}
                    <em>within 24&nbsp;hours.</em>
                  </h1>
                  <p className="sbf-hero-lead">
                    Fuel your growth, cover payroll, stock high-demand inventory or seize time-sensitive
                    opportunities. Fast approvals, no collateral required, and zero upfront application fees.
                  </p>
                  <div className="sbf-hero-actions">
                    <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                      {" "}
                      Apply Now
                      {" "}
                      <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      {" "}
                    </Link>
                    {" "}
                    <a href="tel:18002147498" className="btn sbf-btn sbf-btn-glass sbf-btn-lg">
                      {" "}
                      <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                      {" "}
                      1-800-214-7498
                      {" "}
                    </a>
                  </div>
                  <ul className="sbf-hero-trust">
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Over 80% approval rate
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      No collateral needed
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Bad credit? No problem
                    </li>
                  </ul>
                  <div className="sbf-hero-social-proof">
                    <div className="sbf-avatar-stack">
                      <Image src="/img/testi-rudy.jpg" alt="Rudy S." width="36" height="36" loading="eager" />
                      {" "}
                      <Image src="/img/testi-greg.jpg" alt="Greg P." width="36" height="36" loading="eager" />
                      {" "}
                      <Image src="/img/testi-butch.jpg" alt="Butch H." width="36" height="36" loading="eager" />
                      {" "}
                      <Image src="/img/testi-david.jpg" alt="Dr. David S." width="36" height="36" loading="eager" />
                    </div>
                    <div className="sbf-social-text">
                      <div className="sbf-stars-inline">
                        <svg><use href="#sbf-i-star" /></svg>
                        <svg><use href="#sbf-i-star" /></svg>
                        <svg><use href="#sbf-i-star" /></svg>
                        <svg><use href="#sbf-i-star" /></svg>
                        <svg><use href="#sbf-i-star" /></svg>
                        {" "}
                        <strong>4.9 / 5 Rating</strong>
                      </div>
                      <span>Trusted by 4,200+ American business owners</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Eligibility card */}
              <div className="col-lg-5">
                <div className="sbf-hero-visual">
                  <div className="sbf-hero-chip sbf-hero-chip--photo sbf-hero-chip--top d-none d-lg-flex" aria-hidden="true">
                    <Image src="/img/testi-rudy.jpg" alt="Rudy S." width="300" height="300" loading="eager" />
                    {" "}
                    <span>
                      <strong>$125,000 Approved</strong>
                      <small>Funded in 18 hrs · Rudy S.</small>
                    </span>
                  </div>
                  <div className="sbf-hero-chip sbf-hero-chip--bottom d-none d-lg-flex" aria-hidden="true">
                    <span className="sbf-hero-chip-icon">
                      <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                    </span>
                    {" "}
                    <span>
                      <strong>Zero Collateral Needed</strong>
                      <small>$0 application fees</small>
                    </span>
                  </div>
                  <div className="sbf-eligibility" data-sbf-reveal="" data-sbf-delay="150">
                    <div className="sbf-eligibility-head">
                      <span className="sbf-eyebrow">Quick eligibility check</span>
                      <h2 className="sbf-eligibility-title">See if you&apos;re pre-approved</h2>
                    </div>
                    <EligibilityForm />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ STATS STRIP ============ */}
        <section className="sbf-stats">
          <div className="container">
            <div className="sbf-stats-card">
              <div className="row g-0">
                <div className="col-6 col-lg-3">
                  <div className="sbf-stat">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-clock" /></svg></span>
                    {" "}
                    <span className="sbf-stat-num">
                      <span data-sbf-count="24">24</span>
                      <small>hrs</small>
                    </span>
                    {" "}
                    <span className="sbf-stat-label">Typical time to funding</span>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="sbf-stat">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-chart" /></svg></span>
                    {" "}
                    <span className="sbf-stat-num">
                      <span data-sbf-count="80">80</span>
                      <small>%+</small>
                    </span>
                    {" "}
                    <span className="sbf-stat-label">Application approval rate</span>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="sbf-stat">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                    {" "}
                    <span className="sbf-stat-num">
                      <span data-sbf-count="20">20</span>
                      <small>yrs</small>
                    </span>
                    {" "}
                    <span className="sbf-stat-label">Helping businesses nationwide</span>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="sbf-stat">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-cash" /></svg></span>
                    {" "}
                    <span className="sbf-stat-num">
                      <small>$</small>
                      <span data-sbf-count="0">0</span>
                    </span>
                    {" "}
                    <span className="sbf-stat-label">Advance or application fees</span>
                  </div>
                </div>
              </div>
              <div className="sbf-trust-strip">
                <div className="sbf-trust-badge">
                  <span className="sbf-trust-badge-icon"><svg className="sbf-icon"><use href="#sbf-i-lock" /></svg></span>
                  {" "}
                  <span>256-Bit Bank-Grade SSL</span>
                </div>
                <div className="sbf-trust-badge">
                  <span className="sbf-trust-badge-icon"><svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg></span>
                  {" "}
                  <span>Same-Day Wire Transfer</span>
                </div>
                <div className="sbf-trust-badge">
                  <span className="sbf-trust-badge-icon">
                    <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                  </span>
                  {" "}
                  <span>A+ Industry Rating Standards</span>
                </div>
                <div className="sbf-trust-badge">
                  <span className="sbf-trust-badge-icon"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                  {" "}
                  <span>No Hard Credit Pull to Apply</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ PROGRAMS TICKER ============ */}
        <div className="sbf-ticker" aria-label="Financing programs">
          <div className="sbf-ticker-track">
            <div className="sbf-ticker-group">
              <span className="sbf-ticker-item">Line of Credit</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item sbf-ticker-item--outline">Term Loans</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item">Unsecured Working Capital</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item sbf-ticker-item--outline">Equipment Loans &amp; Leases</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item">Short-Term Financing</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item sbf-ticker-item--outline">Inventory Funding</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item">Business Expansion</span>
              <span className="sbf-ticker-star">✦</span>
            </div>
            <div className="sbf-ticker-group" aria-hidden="true">
              <span className="sbf-ticker-item">Line of Credit</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item sbf-ticker-item--outline">Term Loans</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item">Unsecured Working Capital</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item sbf-ticker-item--outline">Equipment Loans &amp; Leases</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item">Short-Term Financing</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item sbf-ticker-item--outline">Inventory Funding</span>
              <span className="sbf-ticker-star">✦</span>
              <span className="sbf-ticker-item">Business Expansion</span>
              <span className="sbf-ticker-star">✦</span>
            </div>
          </div>
        </div>
        {/* ============ ABOUT / INTRO ============ */}
        <section className="sbf-section sbf-intro">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 order-lg-2">
                <div className="sbf-intro-content" data-sbf-reveal="">
                  <span className="sbf-eyebrow">Why Spectrum Financial</span>
                  <h2 className="sbf-title">
                    Business financing with an
                    {" "}
                    <em>over 80%</em>
                    {" "}
                    approval rate
                  </h2>
                  <p className="sbf-text">
                    We empower American business owners to secure essential capital without the bureaucratic
                    roadblocks of traditional commercial banks. Minimal paperwork, zero collateral required,
                    and no advance or upfront fees.
                  </p>
                  <ul className="sbf-checklist">
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      Minimal documentation required
                    </li>
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      No collateral, no advance fees
                    </li>
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      No reliance on personal credit scores
                    </li>
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      Funding usually within 24 hours
                    </li>
                  </ul>
                  <div className="sbf-intro-callout">
                    <div className="sbf-intro-callout-icon">
                      <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                    </div>
                    <div>
                      <span className="sbf-intro-callout-label">Speak with a funding specialist</span>
                      {" "}
                      <a href="tel:18002147498" className="sbf-intro-callout-phone">1-800-214-7498</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 order-lg-1">
                <div className="sbf-intro-visual" data-sbf-reveal="" data-sbf-delay="100">
                  <div className="sbf-intro-photo-card">
                    <Image src="/img/about-consult.jpg" alt="Spectrum Financial lending specialist consulting with business owners" width="560" height="580" loading="lazy" />
                    <div className="sbf-intro-photo-overlay" />
                  </div>
                  <div className="sbf-float-card sbf-float-card--approved">
                    <span className="sbf-float-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                    <div>
                      <strong>Pre-approved</strong>
                      {" "}
                      <span>$20K+ monthly sales</span>
                    </div>
                  </div>
                  <div className="sbf-float-card sbf-float-card--funded">
                    <span className="sbf-float-label">Funds deposited</span>
                    {" "}
                    <span className="sbf-float-amount">$125,000</span>
                    {" "}
                    <span className="sbf-float-bar"><span /></span>
                    {" "}
                    <span className="sbf-float-meta">
                      <svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg>
                      {" "}
                      Within 24 hours
                    </span>
                  </div>
                  <div className="sbf-float-card sbf-float-card--borrower d-none d-sm-flex">
                    <Image src="/img/testi-rudy.jpg" alt="Rudy S." width="300" height="300" loading="eager" />
                    <div>
                      <strong>Direct Wire Disbursed</strong>
                      {" "}
                      <small>Rudy S. · NY Carpet Dist.</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ SOLUTIONS ============ */}
        <section className="sbf-section sbf-solutions">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">Financing for every stage</span>
              <h2 className="sbf-title">Capital that keeps your business moving</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                Whether you&apos;re expanding operations, stocking up for a seasonal surge, or acquiring
                machinery, we match you with the optimal funding structure.
              </p>
            </div>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <article className="sbf-solution-card" data-sbf-reveal="">
                  <div className="sbf-solution-img-wrapper">
                    <Image src="/img/sol-expand.jpg" alt="Business owner expanding a thriving retail storefront" width="400" height="260" loading="lazy" />
                    <div className="sbf-solution-overlay" />
                    <span className="sbf-solution-tag-top">Growth &amp; Locations</span>
                    {" "}
                    <span className="sbf-solution-limit">Up to $500,000</span>
                  </div>
                  <div className="sbf-solution-body">
                    <span className="sbf-solution-badge"><svg className="sbf-icon"><use href="#sbf-i-chart" /></svg></span>
                    <h3 className="sbf-card-title">Expand Your Business</h3>
                    <p className="sbf-card-text">
                      Open additional storefronts, remodel existing locations, or launch new marketing
                      campaigns without waiting months for traditional bank red tape.
                    </p>
                    <ul className="sbf-solution-bullets">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Funding wired within 24 hours
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Zero equity or company control surrendered
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Repayments scale flexibly with cash flow
                      </li>
                    </ul>
                    <Link href="/quote-request" className="sbf-link">
                      Request Expansion Capital
                      {" "}
                      <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                    </Link>
                  </div>
                </article>
              </div>
              <div className="col-md-6 col-lg-4">
                <article className="sbf-solution-card" data-sbf-reveal="" data-sbf-delay="100">
                  <div className="sbf-solution-img-wrapper">
                    <Image src="/img/sol-inventory.jpg" alt="Modern stocked fulfillment warehouse ready for distribution" width="400" height="260" loading="lazy" />
                    <div className="sbf-solution-overlay" />
                    <span className="sbf-solution-tag-top">Wholesale &amp; Supply</span>
                    {" "}
                    <span className="sbf-solution-limit">Zero Collateral</span>
                  </div>
                  <div className="sbf-solution-body">
                    <span className="sbf-solution-badge">
                      <svg className="sbf-icon"><use href="#sbf-i-wallet" /></svg>
                    </span>
                    <h3 className="sbf-card-title">Secure New Inventory</h3>
                    <p className="sbf-card-text">
                      Take advantage of supplier volume discounts, fulfill large customer purchase orders, and
                      navigate seasonal rush without straining your working capital.
                    </p>
                    <ul className="sbf-solution-bullets">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Lock in early bulk purchase discounts
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Protect liquid cash for staff payroll
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Approval based on revenue, not personal FICO
                      </li>
                    </ul>
                    <Link href="/services" className="sbf-link">
                      Explore Inventory Capital
                      {" "}
                      <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                    </Link>
                  </div>
                </article>
              </div>
              <div className="col-md-6 col-lg-4">
                <article className="sbf-solution-card" data-sbf-reveal="" data-sbf-delay="200">
                  <div className="sbf-solution-img-wrapper">
                    <Image src="/img/sol-equipment.jpg" alt="Heavy equipment and machinery on an active commercial job site" width="400" height="260" loading="lazy" />
                    <div className="sbf-solution-overlay" />
                    <span className="sbf-solution-tag-top">Machinery &amp; Fleet</span>
                    {" "}
                    <span className="sbf-solution-limit">Preserve Capital</span>
                  </div>
                  <div className="sbf-solution-body">
                    <span className="sbf-solution-badge"><svg className="sbf-icon"><use href="#sbf-i-gear" /></svg></span>
                    <h3 className="sbf-card-title">Equipment Loans &amp; Leases</h3>
                    <p className="sbf-card-text">
                      Acquire essential manufacturing tools, medical gear, construction machines or commercial
                      vehicle fleets with terms that protect operating liquidity.
                    </p>
                    <ul className="sbf-solution-bullets">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        New and pre-owned equipment eligible
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Section 179 tax deduction eligible
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Secured by the machinery itself
                      </li>
                    </ul>
                    <Link href="/services" className="sbf-link">
                      View Equipment Options
                      {" "}
                      <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                    </Link>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
        {/* ============ INDUSTRIES ============ */}
        <section className="sbf-section sbf-industries">
          <div className="container">
            <div className="row align-items-end g-4 sbf-section-head">
              <div className="col-lg-6" data-sbf-reveal="">
                <span className="sbf-eyebrow">Industries we fund</span>
                <h2 className="sbf-title mb-0">
                  Financing for businesses of
                  {" "}
                  <em>every</em>
                  {" "}
                  size and sector
                </h2>
              </div>
              <div className="col-lg-5 offset-lg-1" data-sbf-reveal="" data-sbf-delay="100">
                <p className="sbf-text mb-0">
                  From downtown retail storefronts to nationwide logistics fleets, we provide high-speed
                  capital solutions tailored to the operational demands of each industry.
                </p>
              </div>
            </div>
            <div className="sbf-industry-grid" data-sbf-reveal="">
              {/* 1. Retail & E-commerce */}
              <div className="sbf-ind-card">
                <Image className="sbf-ind-bg" src="/img/ind-retail.jpg" alt="Retail boutique and storefront" loading="lazy" width="600" height="400" />
                <div className="sbf-ind-gradient" />
                <div className="sbf-ind-content">
                  <span className="sbf-ind-icon-badge"><svg className="sbf-icon"><use href="#sbf-i-store" /></svg></span>
                  <h3 className="sbf-ind-title">Retail &amp; E-commerce</h3>
                  <p className="sbf-ind-desc">Storefront fit-outs, inventory buys &amp; omnichannel POS systems.</p>
                  <div className="sbf-ind-footer">
                    <span className="sbf-ind-pill">Up to $2,000,000</span>
                    {" "}
                    <span className="sbf-ind-arrow"><svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg></span>
                  </div>
                </div>
              </div>
              {/* 2. Restaurants & Hospitality */}
              <div className="sbf-ind-card">
                <Image className="sbf-ind-bg" src="/img/ind-restaurant.jpg" alt="Fine dining restaurant and kitchen" loading="lazy" width="600" height="400" />
                <div className="sbf-ind-gradient" />
                <div className="sbf-ind-content">
                  <span className="sbf-ind-icon-badge"><svg className="sbf-icon"><use href="#sbf-i-food" /></svg></span>
                  <h3 className="sbf-ind-title">Restaurants &amp; Hospitality</h3>
                  <p className="sbf-ind-desc">Kitchen equipment, outdoor seating &amp; seasonal cash flow cushion.</p>
                  <div className="sbf-ind-footer">
                    <span className="sbf-ind-pill">Up to $2,000,000</span>
                    {" "}
                    <span className="sbf-ind-arrow"><svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg></span>
                  </div>
                </div>
              </div>
              {/* 3. Construction & Contractors */}
              <div className="sbf-ind-card">
                <Image className="sbf-ind-bg" src="/img/ind-construction.jpg" alt="Construction job site and architectural contractor" loading="lazy" width="600" height="338" />
                <div className="sbf-ind-gradient" />
                <div className="sbf-ind-content">
                  <span className="sbf-ind-icon-badge"><svg className="sbf-icon"><use href="#sbf-i-hardhat" /></svg></span>
                  <h3 className="sbf-ind-title">Construction &amp; Contractors</h3>
                  <p className="sbf-ind-desc">Heavy machinery, building supplies &amp; payroll for contract bids.</p>
                  <div className="sbf-ind-footer">
                    <span className="sbf-ind-pill">Up to $2,000,000</span>
                    {" "}
                    <span className="sbf-ind-arrow"><svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg></span>
                  </div>
                </div>
              </div>
              {/* 4. Medical & Dental Practices */}
              <div className="sbf-ind-card">
                <Image className="sbf-ind-bg" src="/img/ind-medical.jpg" alt="Modern healthcare clinic and dental practice" loading="lazy" width="600" height="401" />
                <div className="sbf-ind-gradient" />
                <div className="sbf-ind-content">
                  <span className="sbf-ind-icon-badge"><svg className="sbf-icon"><use href="#sbf-i-medical" /></svg></span>
                  <h3 className="sbf-ind-title">Medical &amp; Dental</h3>
                  <p className="sbf-ind-desc">Diagnostic imaging, practice buyout &amp; insurance float lines.</p>
                  <div className="sbf-ind-footer">
                    <span className="sbf-ind-pill">Up to $2,000,000</span>
                    {" "}
                    <span className="sbf-ind-arrow"><svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg></span>
                  </div>
                </div>
              </div>
              {/* 5. Trucking & Logistics */}
              <div className="sbf-ind-card">
                <Image className="sbf-ind-bg" src="/img/ind-trucking.jpg" alt="Freight transport semi-truck and logistics fleet" loading="lazy" width="600" height="400" />
                <div className="sbf-ind-gradient" />
                <div className="sbf-ind-content">
                  <span className="sbf-ind-icon-badge"><svg className="sbf-icon"><use href="#sbf-i-truck" /></svg></span>
                  <h3 className="sbf-ind-title">Trucking &amp; Logistics</h3>
                  <p className="sbf-ind-desc">Fleet expansion, diesel fuel lines, trailers &amp; carrier insurance.</p>
                  <div className="sbf-ind-footer">
                    <span className="sbf-ind-pill">Up to $2,000,000</span>
                    {" "}
                    <span className="sbf-ind-arrow"><svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg></span>
                  </div>
                </div>
              </div>
              {/* 6. Auto Repair & Services */}
              <div className="sbf-ind-card">
                <Image className="sbf-ind-bg" src="/img/ind-auto.jpg" alt="Automotive repair workshop and diagnostic center" loading="lazy" width="600" height="450" />
                <div className="sbf-ind-gradient" />
                <div className="sbf-ind-content">
                  <span className="sbf-ind-icon-badge"><svg className="sbf-icon"><use href="#sbf-i-wrench" /></svg></span>
                  <h3 className="sbf-ind-title">Auto Repair &amp; Service</h3>
                  <p className="sbf-ind-desc">Hydraulic lifts, diagnostic scanners, tire stock &amp; bay expansion.</p>
                  <div className="sbf-ind-footer">
                    <span className="sbf-ind-pill">Up to $2,000,000</span>
                    {" "}
                    <span className="sbf-ind-arrow"><svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg></span>
                  </div>
                </div>
              </div>
              {/* 7. Salons, Spas & Wellness */}
              <div className="sbf-ind-card">
                <Image className="sbf-ind-bg" src="/img/ind-salon.jpg" alt="Luxury hair salon and wellness spa interior" loading="lazy" width="600" height="450" />
                <div className="sbf-ind-gradient" />
                <div className="sbf-ind-content">
                  <span className="sbf-ind-icon-badge">
                    <svg className="sbf-icon"><use href="#sbf-i-scissors" /></svg>
                  </span>
                  <h3 className="sbf-ind-title">Salons &amp; Wellness</h3>
                  <p className="sbf-ind-desc">Styling stations, luxury treatment lasers &amp; retail product inventory.</p>
                  <div className="sbf-ind-footer">
                    <span className="sbf-ind-pill">Up to $2,000,000</span>
                    {" "}
                    <span className="sbf-ind-arrow"><svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg></span>
                  </div>
                </div>
              </div>
              {/* 8. Manufacturing & Wholesale */}
              <div className="sbf-ind-card">
                <Image className="sbf-ind-bg" src="/img/ind-manufacturing.jpg" alt="Precision manufacturing facility and industrial engineering" loading="lazy" width="600" height="400" />
                <div className="sbf-ind-gradient" />
                <div className="sbf-ind-content">
                  <span className="sbf-ind-icon-badge"><svg className="sbf-icon"><use href="#sbf-i-factory" /></svg></span>
                  <h3 className="sbf-ind-title">Manufacturing</h3>
                  <p className="sbf-ind-desc">CNC milling equipment, raw material supply &amp; wholesale orders.</p>
                  <div className="sbf-ind-footer">
                    <span className="sbf-ind-pill">Up to $2,000,000</span>
                    {" "}
                    <span className="sbf-ind-arrow"><svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ LOAN TYPES ============ */}
        <section className="sbf-section sbf-loans sbf-grain">
          <div className="sbf-parallax-bg" data-sbf-parallax="0.25" style={{ backgroundImage: "url('/img/bg-city-skyline.jpg')" }} aria-hidden="true" />
          <div className="sbf-parallax-overlay sbf-parallax-overlay--loans" aria-hidden="true" />
          <div className="container">
            <div className="row align-items-end g-4 sbf-section-head">
              <div className="col-lg-7" data-sbf-reveal="">
                <span className="sbf-eyebrow sbf-eyebrow-light">Loan types</span>
                <h2 className="sbf-title sbf-title-light">Funding solutions built around your cash flow</h2>
              </div>
              <div className="col-lg-5" data-sbf-reveal="" data-sbf-delay="100">
                <p className="sbf-text sbf-text-light mb-0">
                  For 20 years we&apos;ve helped businesses of all sizes across the nation secure the
                  financing they need — on terms that make sense.
                </p>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <div className="sbf-loan-card sbf-spotlight" data-sbf-reveal="">
                  <span className="sbf-loan-num">01</span>
                  {" "}
                  <span className="sbf-loan-icon"><svg className="sbf-icon"><use href="#sbf-i-card" /></svg></span>
                  <h3 className="sbf-loan-title">Line of Credit</h3>
                  <p className="sbf-loan-text">
                    Works like a credit card for your business — draw funds when you need them and pay
                    interest only on what you use.
                  </p>
                  <div className="sbf-loan-meta-grid">
                    <div className="sbf-loan-meta-item">
                      <small>Draws</small>
                      {" "}
                      <strong>As Needed</strong>
                    </div>
                    <div className="sbf-loan-meta-item">
                      <small>Payments</small>
                      {" "}
                      <strong>Minimum Monthly</strong>
                    </div>
                  </div>
                  <ul className="sbf-loan-feature-list">
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Interest only on the amount you draw
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Pay the minimum, more, or all of it
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Pay it back and draw again
                    </li>
                  </ul>
                  <Link href="/loan-types#line-of-credit" className="sbf-link sbf-link-light">
                    Explore Line of Credit
                    {" "}
                    <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                  </Link>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="sbf-loan-card sbf-loan-card--featured sbf-spotlight" data-sbf-reveal="" data-sbf-delay="100">
                  <span className="sbf-loan-tag">Most requested</span>
                  {" "}
                  <span className="sbf-loan-num">02</span>
                  {" "}
                  <span className="sbf-loan-icon"><svg className="sbf-icon"><use href="#sbf-i-cash" /></svg></span>
                  <h3 className="sbf-loan-title">Unsecured Working Capital</h3>
                  <p className="sbf-loan-text">
                    Cover payroll, pay down debt or seize new opportunities — with no collateral required and
                    funding usually within 24 hours.
                  </p>
                  <div className="sbf-loan-meta-grid">
                    <div className="sbf-loan-meta-item">
                      <small>Amounts Up To</small>
                      {" "}
                      <strong>$2,000,000</strong>
                    </div>
                    <div className="sbf-loan-meta-item">
                      <small>Terms</small>
                      {" "}
                      <strong>3 to 24 Months</strong>
                    </div>
                  </div>
                  <ul className="sbf-loan-feature-list">
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Direct wire into business checking
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      No personal assets pledged
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Interest is fully tax deductible
                    </li>
                  </ul>
                  <Link href="/loan-types" className="sbf-link sbf-link-light">
                    Explore Working Capital
                    {" "}
                    <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                  </Link>
                </div>
              </div>
              <div className="col-md-6 col-lg-4">
                <div className="sbf-loan-card sbf-spotlight" data-sbf-reveal="" data-sbf-delay="200">
                  <span className="sbf-loan-num">03</span>
                  {" "}
                  <span className="sbf-loan-icon"><svg className="sbf-icon"><use href="#sbf-i-gear" /></svg></span>
                  <h3 className="sbf-loan-title">Equipment Loans &amp; Leases</h3>
                  <p className="sbf-loan-text">
                    Acquire the machinery, vehicles or technology your business runs on, while preserving
                    working capital for daily operations.
                  </p>
                  <div className="sbf-loan-meta-grid">
                    <div className="sbf-loan-meta-item">
                      <small>Financing Up To</small>
                      {" "}
                      <strong>100% of Invoice</strong>
                    </div>
                    <div className="sbf-loan-meta-item">
                      <small>Terms</small>
                      {" "}
                      <strong>Up to 60 Months</strong>
                    </div>
                  </div>
                  <ul className="sbf-loan-feature-list">
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      New and pre-owned equipment
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Section 179 tax advantages
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Equipment itself serves as security
                    </li>
                  </ul>
                  <Link href="/loan-types" className="sbf-link sbf-link-light">
                    Explore Equipment
                    {" "}
                    <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ PROCESS ============ */}
        <section className="sbf-section sbf-process">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">The process</span>
              <h2 className="sbf-title">
                Business funding should be
                {" "}
                <em>easy</em>
                , not difficult
              </h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                With no advance fees, zero application costs, and decisioning under 4 hours, financing your
                business has never been simpler.
              </p>
            </div>
            <div className="sbf-process-row" data-sbf-progress="">
              <div className="sbf-step" data-sbf-reveal="">
                <span className="sbf-step-icon">
                  <svg className="sbf-icon"><use href="#sbf-i-doc" /></svg>
                  <span className="sbf-step-num">1</span>
                </span>
                <h3 className="sbf-step-title">Apply in 2 minutes</h3>
                <p className="sbf-step-text">
                  Complete our streamlined digital form — minimal paperwork and $0 application fees.
                </p>
              </div>
              <div className="sbf-step" data-sbf-reveal="" data-sbf-delay="100">
                <span className="sbf-step-icon">
                  <svg className="sbf-icon"><use href="#sbf-i-chart" /></svg>
                  <span className="sbf-step-num">2</span>
                </span>
                <h3 className="sbf-step-title">Instant soft review</h3>
                <p className="sbf-step-text">
                  We assess your monthly business revenue, without relying on personal credit scores.
                </p>
              </div>
              <div className="sbf-step" data-sbf-reveal="" data-sbf-delay="200">
                <span className="sbf-step-icon">
                  <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                  <span className="sbf-step-num">3</span>
                </span>
                <h3 className="sbf-step-title">Custom term sheet</h3>
                <p className="sbf-step-text">
                  Review your approval amount and transparent repayment terms with a dedicated specialist.
                </p>
              </div>
              <div className="sbf-step" data-sbf-reveal="" data-sbf-delay="300">
                <span className="sbf-step-icon">
                  <svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg>
                  <span className="sbf-step-num">4</span>
                </span>
                <h3 className="sbf-step-title">Direct wire in 24 hrs</h3>
                <p className="sbf-step-text">
                  Accept your terms and funds are transferred directly into your business checking account.
                </p>
              </div>
            </div>
            <div className="text-center mt-5" data-sbf-reveal="">
              <Link href="/the-process" className="btn sbf-btn sbf-btn-outline">
                See the full process
                {" "}
                <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
              </Link>
              <p className="sbf-eligibility-note mt-3">
                <svg className="sbf-icon" style={{ color: "var(--sbf-success)" }}><use href="#sbf-i-shield" /></svg>
                {" "}
                100% Secure &amp; Confidential · Checking your eligibility will
                {" "}
                <strong>never affect your credit score</strong>
              </p>
            </div>
          </div>
        </section>
        {/* ============ COMPARISON ============ */}
        <section className="sbf-section sbf-compare pt-0">
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-4" data-sbf-reveal="">
                <span className="sbf-eyebrow">Why business owners switch</span>
                <h2 className="sbf-title">
                  Spectrum vs. a
                  {" "}
                  <em>traditional</em>
                  {" "}
                  bank loan
                </h2>
                <p className="sbf-text">
                  Banks were engineered for long delays and heavy collateral demands. Spectrum Financial is
                  engineered for modern business speed.
                </p>
                <Link href="/apply-now" className="btn sbf-btn sbf-btn-navy mt-2">
                  Start Your Application
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                </Link>
              </div>
              <div className="col-lg-8" data-sbf-reveal="" data-sbf-delay="100">
                <div className="sbf-compare-card">
                  <div className="table-responsive">
                    <table className="table sbf-compare-table mb-0">
                      <thead>
                        <tr>
                          <th scope="col"><span className="visually-hidden">Feature</span></th>
                          <th scope="col" className="sbf-compare-head-us">
                            <span className="sbf-compare-pill">Fastest in USA</span>
                            {" "}
                            <Image className="sbf-compare-logo" src="/img/logo.png" alt="Spectrum Financial" width="404" height="150" loading="lazy" />
                          </th>
                          <th scope="col">Typical bank loan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">Time to funding</th>
                          <td className="sbf-compare-us">
                            <span className="sbf-compare-yes">
                              <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            </span>
                            Usually within 24 hours
                          </td>
                          <td className="sbf-compare-them">
                            <span className="sbf-compare-no"><svg className="sbf-icon"><use href="#sbf-i-x" /></svg></span>
                            Often weeks to months
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Collateral</th>
                          <td className="sbf-compare-us">
                            <span className="sbf-compare-yes">
                              <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            </span>
                            Not required
                          </td>
                          <td className="sbf-compare-them">
                            <span className="sbf-compare-no"><svg className="sbf-icon"><use href="#sbf-i-x" /></svg></span>
                            Frequently required
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Personal credit score</th>
                          <td className="sbf-compare-us">
                            <span className="sbf-compare-yes">
                              <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            </span>
                            Not the deciding factor
                          </td>
                          <td className="sbf-compare-them">
                            <span className="sbf-compare-no"><svg className="sbf-icon"><use href="#sbf-i-x" /></svg></span>
                            Heavily weighted
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Application fees</th>
                          <td className="sbf-compare-us">
                            <span className="sbf-compare-yes">
                              <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            </span>
                            None — $0 upfront
                          </td>
                          <td className="sbf-compare-them">
                            <span className="sbf-compare-no"><svg className="sbf-icon"><use href="#sbf-i-x" /></svg></span>
                            May apply
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Paperwork</th>
                          <td className="sbf-compare-us">
                            <span className="sbf-compare-yes">
                              <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            </span>
                            Minimal documentation
                          </td>
                          <td className="sbf-compare-them">
                            <span className="sbf-compare-no"><svg className="sbf-icon"><use href="#sbf-i-x" /></svg></span>
                            Extensive financials
                          </td>
                        </tr>
                        <tr>
                          <th scope="row">Approval rate</th>
                          <td className="sbf-compare-us">
                            <span className="sbf-compare-yes">
                              <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            </span>
                            Over 80%
                          </td>
                          <td className="sbf-compare-them">
                            <span className="sbf-compare-no"><svg className="sbf-icon"><use href="#sbf-i-x" /></svg></span>
                            Varies — often selective
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ PRE-APPROVED BANNER ============ */}
        <section className="sbf-preapproved">
          <div className="container">
            <div className="sbf-preapproved-card" data-sbf-reveal="">
              <div className="row align-items-center g-4">
                <div className="col-lg-8">
                  <span className="sbf-preapproved-badge">
                    <svg className="sbf-icon" style={{ width: "13px", height: "13px", marginRight: "2px" }}>
                      <use href="#sbf-i-shield" />
                    </svg>
                    {" "}
                    Instant Qualification
                  </span>
                  <h2 className="sbf-preapproved-title">
                    Over
                    {" "}
                    <em>$20,000</em>
                    {" "}
                    in monthly sales? You&apos;re pre-approved.
                  </h2>
                  <p className="sbf-preapproved-text">
                    No advance fees, no tax returns needed for initial review, and no impact to your credit
                    score.
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end">
                  <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                    Check Your Rate in 2 Min
                    {" "}
                    <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ TESTIMONIALS ============ */}
        <section className="sbf-section sbf-testimonials" id="testimonials">
          <div className="container">
            <div className="row g-5 align-items-center">
              <div className="col-lg-4" data-sbf-reveal="">
                <span className="sbf-eyebrow">Client stories</span>
                <h2 className="sbf-title">20 years of satisfied clients</h2>
                <p className="sbf-text mb-0">
                  Business owners across the nation trust Spectrum Financial to deliver exactly what we
                  promise.
                </p>
              </div>
              <div className="col-lg-8" data-sbf-reveal="" data-sbf-delay="100">
                <div className="sbf-testi-widget-card"><StoryproofWidget widgetId="6af49fb191f9b7a0112848fe" /></div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ FAQ ============ */}
        <section className="sbf-section sbf-faq">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-5" data-sbf-reveal="">
                <span className="sbf-eyebrow">FAQ</span>
                <h2 className="sbf-title">Questions business owners ask us</h2>
                <p className="sbf-text">
                  Straight answers about speed, requirements and cost. Don&apos;t see your question? Our
                  funding specialists are a phone call away.
                </p>
                <div className="sbf-faq-help">
                  <span className="sbf-faq-help-icon"><svg className="sbf-icon"><use href="#sbf-i-phone" /></svg></span>
                  <div>
                    <strong>Still have questions?</strong>
                    {" "}
                    <span>
                      Call us at
                      {" "}
                      <a href="tel:18002147498">1-800-214-7498</a>
                    </span>
                  </div>
                </div>
              </div>
              <div className="col-lg-7" data-sbf-reveal="" data-sbf-delay="100">
                <div className="accordion sbf-accordion" id="sbfFaq">
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sbfFaq0" aria-expanded="true" aria-controls="sbfFaq0">
                        How quickly can I receive funding?
                      </button>
                    </h3>
                    <div id="sbfFaq0" className="accordion-collapse collapse show" data-bs-parent="#sbfFaq">
                      <div className="accordion-body">
                        In most cases we can fund your business within 24 hours. Our streamlined application
                        requires minimal documentation, so there is very little waiting on paperwork.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfFaq1" aria-expanded="false" aria-controls="sbfFaq1">
                        Do I need collateral to qualify?
                      </button>
                    </h3>
                    <div id="sbfFaq1" className="accordion-collapse collapse" data-bs-parent="#sbfFaq">
                      <div className="accordion-body">
                        No. Our unsecured working capital programs do not require collateral. Equipment
                        financing is secured by the equipment itself.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfFaq2" aria-expanded="false" aria-controls="sbfFaq2">
                        I have bad credit. Can I still be approved?
                      </button>
                    </h3>
                    <div id="sbfFaq2" className="accordion-collapse collapse" data-bs-parent="#sbfFaq">
                      <div className="accordion-body">
                        Yes — bad credit is not a deal-breaker. We focus on the health and sales of your
                        business rather than relying on personal credit scores, which is why our approval rate
                        is over 80%.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfFaq3" aria-expanded="false" aria-controls="sbfFaq3">
                        What do I need to be pre-approved?
                      </button>
                    </h3>
                    <div id="sbfFaq3" className="accordion-collapse collapse" data-bs-parent="#sbfFaq">
                      <div className="accordion-body">
                        If your business is generating over $20,000 in monthly sales, you are pre-approved.
                        Simply complete the application and a funding specialist will walk you through your
                        options.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfFaq4" aria-expanded="false" aria-controls="sbfFaq4">
                        Are there any application or upfront fees?
                      </button>
                    </h3>
                    <div id="sbfFaq4" className="accordion-collapse collapse" data-bs-parent="#sbfFaq">
                      <div className="accordion-body">
                        None. There are no advance fees and no application fees — it costs nothing to apply
                        and see what your business qualifies for.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfFaq5" aria-expanded="false" aria-controls="sbfFaq5">
                        What can I use the funds for?
                      </button>
                    </h3>
                    <div id="sbfFaq5" className="accordion-collapse collapse" data-bs-parent="#sbfFaq">
                      <div className="accordion-body">
                        Anything that keeps your business thriving: expansion, payroll, inventory, equipment,
                        paying off debt, or bridging the gap until a contract pays out.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ QUOTE FORM ============ */}
        <section className="sbf-section sbf-quote" id="quote">
          <div className="container">
            <div className="sbf-quote-card" data-sbf-reveal="">
              <div className="row g-0">
                <div className="col-lg-5">
                  <div className="sbf-quote-aside">
                    <span className="sbf-eyebrow sbf-eyebrow-light">Free quote</span>
                    <h2 className="sbf-quote-title">Find out what your business qualifies for</h2>
                    <p className="sbf-text sbf-text-light">
                      Tell us a little about your business and a funding specialist will reach out with
                      options — no obligation, no fees.
                    </p>
                    <ul className="sbf-quote-points">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg>
                        {" "}
                        Fast response from a real specialist
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                        {" "}
                        No collateral, no application fees
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-lock" /></svg>
                        {" "}
                        Your information stays confidential
                      </li>
                    </ul>
                    <div className="sbf-quote-contact">
                      <a href="tel:18002147498">
                        <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                        {" "}
                        1-800-214-7498
                      </a>
                      {" "}
                      <span>
                        <svg className="sbf-icon"><use href="#sbf-i-pin" /></svg>
                        {" "}
                        11021 Winners Cir #103, Los Alamitos, CA 90720
                      </span>
                    </div>
                  </div>
                </div>
                <div className="col-lg-7"><HomeQuoteForm /></div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ FINAL CTA ============ */}
        <section className="sbf-cta sbf-grain">
          <div className="sbf-parallax-bg" data-sbf-parallax="0.25" style={{ backgroundImage: "url('/img/bg-cta.jpg')" }} aria-hidden="true" />
          <div className="sbf-parallax-overlay sbf-parallax-overlay--cta" aria-hidden="true" />
          <div className="container position-relative">
            <div className="sbf-cta-inner" data-sbf-reveal="">
              <h2 className="sbf-cta-title">Ready to fund your next move?</h2>
              <p className="sbf-cta-text">
                Lines of Credit, Unsecured Working Capital and Equipment Loans / Leases — all with no
                application fees.
              </p>
              <div className="sbf-hero-actions justify-content-center">
                <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                  Apply Now
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                </Link>
                {" "}
                <Link href="/quote-request" className="btn sbf-btn sbf-btn-glass sbf-btn-lg">Request a Quote</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
