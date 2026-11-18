import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { QuoteSpotlightSection, ReviewsSection } from '@/components/ReviewSections';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/loan-types",
  title: "Business Loan Types Explained | Spectrum Financial",
  description: "Compare business lines of credit, unsecured working capital loans and equipment loans & leases. Learn how each business loan type works and which fits you.",
  image: "/img/bg-city-skyline.jpg",
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
      "@type": "WebPage",
      "@id": "https://spectrumbusinessloans.com/loan-types#webpage",
      "url": "https://spectrumbusinessloans.com/loan-types",
      "name": "Business Loan Types Explained | Spectrum Financial",
      "description": "Compare business lines of credit, unsecured working capital loans and equipment loans & leases. Learn how each business loan type works and which fits you.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/loan-types#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/loan-types#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://spectrumbusinessloans.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Loan Types",
          "item": "https://spectrumbusinessloans.com/loan-types"
        }
      ]
    },
    {
      "@type": "ItemList",
      "name": "Business loan types",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "LoanOrCredit",
            "name": "Business Line of Credit",
            "url": "https://spectrumbusinessloans.com/loan-types#line-of-credit",
            "description": "A revolving line you can draw from as often as you need, paying interest only on the amount drawn, with minimum monthly payments.",
            "provider": {
              "@id": "https://spectrumbusinessloans.com/#organization"
            },
            "areaServed": "US"
          }
        },
        {
          "@type": "ListItem",
          "position": 2,
          "item": {
            "@type": "LoanOrCredit",
            "name": "Unsecured Working Capital Loans",
            "url": "https://spectrumbusinessloans.com/loan-types#unsecured-working-capital",
            "description": "A business loan that is not backed by collateral, so the borrower's assets can't be seized on default.",
            "provider": {
              "@id": "https://spectrumbusinessloans.com/#organization"
            },
            "areaServed": "US"
          }
        },
        {
          "@type": "ListItem",
          "position": 3,
          "item": {
            "@type": "LoanOrCredit",
            "name": "Equipment Loans & Leases",
            "url": "https://spectrumbusinessloans.com/loan-types#equipment-loans-leases",
            "description": "Financing or leasing for business equipment such as medical machinery, restaurant equipment, phone systems, computers and industrial machinery.",
            "provider": {
              "@id": "https://spectrumbusinessloans.com/#organization"
            },
            "areaServed": "US"
          }
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a business line of credit?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A line of credit works like a credit card for your business. You can draw funds as often as you need, you pay interest only on the amount you draw and only for the time you have it, and you repay with minimum monthly payments, or pay more, or pay the whole balance."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between a secured and an unsecured loan?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A secured loan is backed by a property or asset that the lender can claim if you default. An unsecured loan isn't backed by collateral, so your assets can't be seized — but it typically carries a higher interest rate because the lender takes on more risk."
          }
        },
        {
          "@type": "Question",
          "name": "Should I buy or lease equipment?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "An equipment loan lets you own the equipment outright, with the equipment serving as security. Leasing can lower your upfront costs and reduce upkeep, depending on the equipment. A funding specialist can help you compare both options for your situation."
          }
        },
        {
          "@type": "Question",
          "name": "What kinds of equipment can be financed?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Common examples include medical machinery, restaurant equipment, phone systems, computers, and specialized or industrial machinery."
          }
        },
        {
          "@type": "Question",
          "name": "What if I need a different type of financing?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Contact us. Beyond the three loan types we specialize in, we can customize a financing solution for your business through our network of lenders."
          }
        }
      ]
    }
  ]
};

export default function LoanTypesPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* ============ HERO ============ */}
        <section className="sbf-hero sbf-svc-hero">
          <div className="sbf-hero-media">
            <div className="sbf-hero-media-bg" style={{ backgroundImage: "url('/img/bg-city-skyline.jpg')" }} />
            <div className="sbf-hero-chart" data-sbf-parallax="0.12" style={{ backgroundImage: "url('/img/pattern-hero.svg')" }} />
          </div>
          <div className="sbf-hero-overlay" />
          <div className="sbf-hero-aurora" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="sbf-hero-grid" />
          <div className="container position-relative">
            <div className="row align-items-center">
              <div className="col-lg-9 col-xl-8 mx-auto text-center" data-sbf-reveal="">
                <nav className="sbf-breadcrumb" aria-label="Breadcrumb">
                  <Link href="/">Home</Link>
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-chevron" /></svg>
                  {" "}
                  <span aria-current="page">Loan Types</span>
                </nav>
                <span className="sbf-pill">
                  {" "}
                  <span className="sbf-pill-dot" />
                  {" "}
                  Business Loan Types · Explained Simply
                  {" "}
                </span>
                <h1 className="sbf-hero-title">
                  Business loan types,
                  {" "}
                  <em>explained in plain English.</em>
                </h1>
                <p className="sbf-hero-lead mx-auto" style={{ maxWidth: "720px" }}>
                  We specialize in business lines of credit, unsecured working capital loans and equipment loans
                  &amp; leases. Learn how each one works, who it suits best — and if you need a different
                  financing solution, just contact us.
                </p>
                <div className="sbf-hero-actions justify-content-center">
                  <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                    {" "}
                    Apply Now
                    {" "}
                    <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                    {" "}
                  </Link>
                  {" "}
                  <a href="#compare" className="btn sbf-btn sbf-btn-glass sbf-btn-lg">
                    {" "}
                    Compare Loan Types
                    {" "}
                  </a>
                </div>
                <ul className="sbf-hero-trust justify-content-center">
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    3 specialized programs
                  </li>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    Custom solutions available
                  </li>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    Serving businesses nationwide
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* ============ LOAN TYPE QUICK LINKS (overlaps hero) ============ */}
        <section className="sbf-stats">
          <div className="container">
            <div className="sbf-stats-card">
              <div className="row g-0">
                <div className="col-md-4">
                  <a href="#line-of-credit" className="sbf-svc-jump">
                    {" "}
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-card" /></svg></span>
                    {" "}
                    <span className="sbf-svc-jump-body">
                      {" "}
                      <small>Loan Type 01</small>
                      {" "}
                      <strong>Line of Credit</strong>
                      {" "}
                    </span>
                    {" "}
                    <svg className="sbf-icon sbf-svc-jump-arrow"><use href="#sbf-i-arrow" /></svg>
                    {" "}
                  </a>
                </div>
                <div className="col-md-4">
                  <a href="#unsecured-working-capital" className="sbf-svc-jump">
                    {" "}
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-cash" /></svg></span>
                    {" "}
                    <span className="sbf-svc-jump-body">
                      {" "}
                      <small>Loan Type 02</small>
                      {" "}
                      <strong>Unsecured Working Capital</strong>
                      {" "}
                    </span>
                    {" "}
                    <svg className="sbf-icon sbf-svc-jump-arrow"><use href="#sbf-i-arrow" /></svg>
                    {" "}
                  </a>
                </div>
                <div className="col-md-4">
                  <a href="#equipment-loans-leases" className="sbf-svc-jump">
                    {" "}
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-gear" /></svg></span>
                    {" "}
                    <span className="sbf-svc-jump-body">
                      {" "}
                      <small>Loan Type 03</small>
                      {" "}
                      <strong>Equipment Loans &amp; Leases</strong>
                      {" "}
                    </span>
                    {" "}
                    <svg className="sbf-icon sbf-svc-jump-arrow"><use href="#sbf-i-arrow" /></svg>
                    {" "}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ QUOTE SPOTLIGHT ============ */}
        <QuoteSpotlightSection />
        {/* ============ LOAN TYPES — DETAILED ============ */}
        <section className="sbf-section sbf-svc sbf-lt">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">We Specialize In</span>
              <h2 className="sbf-title">Three loan types, built for real businesses</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                Each loan type works differently. Here&apos;s what each one is, how it works and when it makes
                the most sense for your business.
              </p>
            </div>
            {/* 01 · Line of Credit */}
            <article className="sbf-svc-row" id="line-of-credit">
              <div className="row align-items-center g-5">
                <div className="col-lg-6">
                  <div className="sbf-svc-visual" data-sbf-reveal="">
                    <div className="sbf-intro-photo-card sbf-svc-photo">
                      <Image src="/img/ind-salon.jpg" alt="Salon owner at work in her salon" width="560" height="440" loading="lazy" />
                      <div className="sbf-intro-photo-overlay" />
                    </div>
                    <span className="sbf-svc-index" aria-hidden="true">01</span>
                    <div className="sbf-float-card sbf-float-card--approved sbf-svc-chip">
                      <span className="sbf-float-icon"><svg className="sbf-icon"><use href="#sbf-i-card" /></svg></span>
                      <div>
                        <strong>Works Like a Credit Card</strong>
                        {" "}
                        <span>Draw and repay as you go</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="sbf-svc-content" data-sbf-reveal="" data-sbf-delay="100">
                    <span className="sbf-svc-tag">
                      <svg className="sbf-icon"><use href="#sbf-i-card" /></svg>
                      {" "}
                      Loan Type 01
                    </span>
                    <h3 className="sbf-svc-title">Business Line of Credit</h3>
                    <p className="sbf-text">
                      A business line of credit works much like a credit card. Instead of one lump sum, you
                      get funds you can draw from as often as you need, and you only pay interest on the
                      amount you draw, for the time you have it.
                    </p>
                    <h4 className="sbf-lt-subhead">How it works</h4>
                    <ol className="sbf-lt-steps">
                      <li>
                        <span>1</span>
                        {" "}
                        You draw funds whenever your business needs them.
                      </li>
                      <li>
                        <span>2</span>
                        {" "}
                        You pay interest only on the balance you have drawn.
                      </li>
                      <li>
                        <span>3</span>
                        {" "}
                        You make minimum monthly payments, or pay more, and can draw again.
                      </li>
                    </ol>
                    <div className="sbf-lt-fit">
                      <strong>
                        <svg className="sbf-icon"><use href="#sbf-i-user" /></svg>
                        {" "}
                        Best for
                      </strong>
                      <p>
                        Businesses whose cash needs come and go, and who want funds ready without taking it all
                        at once.
                      </p>
                    </div>
                    <div className="sbf-svc-actions">
                      <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold">
                        Apply Now
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                      {" "}
                      <Link href="/services#line-of-credit" className="sbf-link">
                        Terms &amp; benefits
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            {/* 02 · Unsecured Working Capital */}
            <article className="sbf-svc-row" id="unsecured-working-capital">
              <div className="row align-items-center g-5">
                <div className="col-lg-6 order-lg-2">
                  <div className="sbf-svc-visual sbf-svc-visual--flip" data-sbf-reveal="">
                    <div className="sbf-intro-photo-card sbf-svc-photo">
                      <Image src="/img/ind-construction.jpg" alt="Contractor reviewing plans, using unsecured working capital to cover project costs" width="560" height="440" loading="lazy" />
                      <div className="sbf-intro-photo-overlay" />
                    </div>
                    <span className="sbf-svc-index" aria-hidden="true">02</span>
                    <div className="sbf-float-card sbf-float-card--approved sbf-svc-chip">
                      <span className="sbf-float-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                      <div>
                        <strong>No Collateral</strong>
                        {" "}
                        <span>Your assets aren&apos;t pledged</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 order-lg-1">
                  <div className="sbf-svc-content" data-sbf-reveal="" data-sbf-delay="100">
                    <span className="sbf-svc-tag">
                      <svg className="sbf-icon"><use href="#sbf-i-cash" /></svg>
                      {" "}
                      Loan Type 02
                    </span>
                    <h3 className="sbf-svc-title">Unsecured Working Capital Loans</h3>
                    <p className="sbf-text">
                      An unsecured loan is a loan that is not backed by collateral. It&apos;s the opposite of
                      a secured loan, which is backed by a property or asset. Because nothing is pledged, the
                      lender can&apos;t seize your assets if you default — which also means unsecured loans
                      typically carry a higher interest rate, as the lender takes on more risk.
                    </p>
                    <div className="sbf-lt-versus">
                      <div className="sbf-lt-versus-col sbf-lt-versus-col--us">
                        <small>Unsecured loan</small>
                        <ul>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            {" "}
                            No collateral required
                          </li>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            {" "}
                            Assets can&apos;t be seized
                          </li>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            {" "}
                            Faster, simpler approval
                          </li>
                        </ul>
                      </div>
                      <div className="sbf-lt-versus-col">
                        <small>Secured loan</small>
                        <ul>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-lock" /></svg>
                            {" "}
                            Backed by property or assets
                          </li>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-lock" /></svg>
                            {" "}
                            Assets at risk on default
                          </li>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-lock" /></svg>
                            {" "}
                            Usually lower interest rate
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="sbf-lt-fit">
                      <strong>
                        <svg className="sbf-icon"><use href="#sbf-i-user" /></svg>
                        {" "}
                        Best for
                      </strong>
                      <p>
                        Covering payroll, buying inventory, paying down debt or seizing an opportunity —
                        without putting business or personal assets on the line.
                      </p>
                    </div>
                    <div className="sbf-svc-actions">
                      <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold">
                        Apply Now
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                      {" "}
                      <Link href="/services#working-capital" className="sbf-link">
                        Terms &amp; benefits
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            {/* 03 · Equipment Loans & Leases */}
            <article className="sbf-svc-row" id="equipment-loans-leases">
              <div className="row align-items-center g-5">
                <div className="col-lg-6">
                  <div className="sbf-svc-visual" data-sbf-reveal="">
                    <div className="sbf-intro-photo-card sbf-svc-photo">
                      <Image src="/img/ind-medical.jpg" alt="Medical practice equipment financed with an equipment loan or lease" width="560" height="440" loading="lazy" />
                      <div className="sbf-intro-photo-overlay" />
                    </div>
                    <span className="sbf-svc-index" aria-hidden="true">03</span>
                    <div className="sbf-float-card sbf-float-card--approved sbf-svc-chip">
                      <span className="sbf-float-icon"><svg className="sbf-icon"><use href="#sbf-i-gear" /></svg></span>
                      <div>
                        <strong>Buy or Lease</strong>
                        {" "}
                        <span>Choose what suits your cash flow</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="sbf-svc-content" data-sbf-reveal="" data-sbf-delay="100">
                    <span className="sbf-svc-tag">
                      <svg className="sbf-icon"><use href="#sbf-i-gear" /></svg>
                      {" "}
                      Loan Type 03
                    </span>
                    <h3 className="sbf-svc-title">Equipment Loans &amp; Leases</h3>
                    <p className="sbf-text">
                      An equipment loan is used to purchase the equipment your business needs to run
                      efficiently. Leasing is also an option — and depending on the equipment, leasing can
                      lower your upfront costs or reduce the cost of upkeep.
                    </p>
                    <h4 className="sbf-lt-subhead">Equipment we can help finance</h4>
                    <ul className="sbf-lt-chips">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-medical" /></svg>
                        {" "}
                        Medical machinery
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-food" /></svg>
                        {" "}
                        Restaurant equipment
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                        {" "}
                        Phone systems
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-doc" /></svg>
                        {" "}
                        Computers
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-wrench" /></svg>
                        {" "}
                        Specialized machinery
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-factory" /></svg>
                        {" "}
                        Industrial machinery
                      </li>
                    </ul>
                    <div className="sbf-lt-versus">
                      <div className="sbf-lt-versus-col sbf-lt-versus-col--us">
                        <small>Equipment loan</small>
                        <ul>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            {" "}
                            You own the equipment
                          </li>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            {" "}
                            Equipment serves as security
                          </li>
                        </ul>
                      </div>
                      <div className="sbf-lt-versus-col sbf-lt-versus-col--us">
                        <small>Equipment lease</small>
                        <ul>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            {" "}
                            Lower upfront costs
                          </li>
                          <li>
                            <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                            {" "}
                            Can reduce upkeep costs
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="sbf-svc-actions">
                      <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold">
                        Apply Now
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                      {" "}
                      <Link href="/services#equipment-financing" className="sbf-link">
                        Terms &amp; benefits
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
        {/* ============ COMPARE LOAN TYPES ============ */}
        <section className="sbf-section sbf-lt-compare-section" id="compare">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">Side by Side</span>
              <h2 className="sbf-title">Compare business loan types</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                A quick way to see which loan type fits your business. Not sure? A funding specialist will
                help you choose.
              </p>
            </div>
            <div className="sbf-compare-card" data-sbf-reveal="">
              <div className="table-responsive">
                <table className="table sbf-lt-table mb-0">
                  <caption className="visually-hidden">
                    Comparison of business lines of credit, unsecured working capital and equipment loans
                    and leases
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Feature</th>
                      <th scope="col">
                        <span className="sbf-lt-th-icon"><svg className="sbf-icon"><use href="#sbf-i-card" /></svg></span>
                        Line of Credit
                      </th>
                      <th scope="col" className="sbf-lt-col-featured">
                        <span className="sbf-lt-th-icon"><svg className="sbf-icon"><use href="#sbf-i-cash" /></svg></span>
                        Unsecured Working Capital
                      </th>
                      <th scope="col">
                        <span className="sbf-lt-th-icon"><svg className="sbf-icon"><use href="#sbf-i-gear" /></svg></span>
                        Equipment Loans &amp; Leases
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">How it works</th>
                      <td data-label="Line of Credit">Draw funds as needed, like a credit card</td>
                      <td data-label="Unsecured Working Capital" className="sbf-lt-col-featured">
                        Short-term loan with no collateral
                      </td>
                      <td data-label="Equipment Loans &amp; Leases">Finance or lease the equipment you need</td>
                    </tr>
                    <tr>
                      <th scope="row">Collateral</th>
                      <td data-label="Line of Credit">Ask your specialist</td>
                      <td data-label="Unsecured Working Capital" className="sbf-lt-col-featured">None required</td>
                      <td data-label="Equipment Loans &amp; Leases">The equipment itself</td>
                    </tr>
                    <tr>
                      <th scope="row">Repayment</th>
                      <td data-label="Line of Credit">Minimum monthly payments</td>
                      <td data-label="Unsecured Working Capital" className="sbf-lt-col-featured">3 to 24 month terms</td>
                      <td data-label="Equipment Loans &amp; Leases">Up to 60 month terms</td>
                    </tr>
                    <tr>
                      <th scope="row">Best for</th>
                      <td data-label="Line of Credit">Cash needs that come and go</td>
                      <td data-label="Unsecured Working Capital" className="sbf-lt-col-featured">
                        Payroll, inventory &amp; everyday costs
                      </td>
                      <td data-label="Equipment Loans &amp; Leases">Machinery, vehicles &amp; technology</td>
                    </tr>
                    <tr>
                      <th scope="row">Funding speed</th>
                      <td data-label="Line of Credit">Ask your specialist</td>
                      <td data-label="Unsecured Working Capital" className="sbf-lt-col-featured">Often within 24 hours</td>
                      <td data-label="Equipment Loans &amp; Leases">Fast decisions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <p className="sbf-lt-note text-center" data-sbf-reveal="">
              Need a different financing solution?
              {" "}
              <Link href="/quote-request">Contact us</Link>
              {" "}
              — we&apos;ll customize one for your business.
            </p>
          </div>
        </section>
        {/* ============ SOLUTIONS (USE CASES FROM ORIGINAL PAGE) ============ */}
        <section className="sbf-section sbf-solutions">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">Put Your Loan to Work</span>
              <h2 className="sbf-title">Common ways businesses use their funding</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                Reliable, customized business financing for companies nationwide.
              </p>
            </div>
            <div className="row g-4">
              <div className="col-md-6 col-lg-4">
                <article className="sbf-solution-card" data-sbf-reveal="">
                  <div className="sbf-solution-img-wrapper">
                    <Image src="/img/sol-expand.jpg" alt="Expand your business" width="400" height="260" loading="lazy" />
                    <div className="sbf-solution-overlay" />
                    <span className="sbf-solution-tag-top">Growth &amp; Locations</span>
                  </div>
                  <div className="sbf-solution-body">
                    <span className="sbf-solution-badge"><svg className="sbf-icon"><use href="#sbf-i-chart" /></svg></span>
                    <h3 className="sbf-card-title">Expand Your Business</h3>
                    <p className="sbf-card-text">
                      Need to grow your business? Secure financing within 24 hours to make your dreams a
                      reality. Contact us regarding our no-hassle application process.
                    </p>
                    <div className="sbf-solution-foot">
                      <Link href="/quote-request" className="sbf-link">
                        Contact Us
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
              <div className="col-md-6 col-lg-4">
                <article className="sbf-solution-card" data-sbf-reveal="" data-sbf-delay="100">
                  <div className="sbf-solution-img-wrapper">
                    <Image src="/img/sol-inventory.jpg" alt="Secure new inventory" width="400" height="260" loading="lazy" />
                    <div className="sbf-solution-overlay" />
                    <span className="sbf-solution-tag-top">Supply &amp; Stock</span>
                  </div>
                  <div className="sbf-solution-body">
                    <span className="sbf-solution-badge"><svg className="sbf-icon"><use href="#sbf-i-card" /></svg></span>
                    <h3 className="sbf-card-title">Secure New Inventory</h3>
                    <p className="sbf-card-text">
                      Need to secure inventory for your business while maintaining cash flow? Buy the
                      inventory you need by securing a business loan. No collateral needed.
                    </p>
                    <div className="sbf-solution-foot">
                      <Link href="/services" className="sbf-link">
                        Learn More
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
              <div className="col-md-6 col-lg-4">
                <article className="sbf-solution-card" data-sbf-reveal="" data-sbf-delay="200">
                  <div className="sbf-solution-img-wrapper">
                    <Image src="/img/sol-equipment.jpg" alt="Short-term loans for contract work" width="400" height="260" loading="lazy" />
                    <div className="sbf-solution-overlay" />
                    <span className="sbf-solution-tag-top">Bridge Capital</span>
                  </div>
                  <div className="sbf-solution-body">
                    <span className="sbf-solution-badge">
                      <svg className="sbf-icon"><use href="#sbf-i-wallet" /></svg>
                    </span>
                    <h3 className="sbf-card-title">Short-Term Loans Available</h3>
                    <p className="sbf-card-text">
                      You have a contract but you need financing to carry your business before you get paid.
                      Ask about our short-term financing options and get moving today.
                    </p>
                    <div className="sbf-solution-foot">
                      <Link href="/services" className="sbf-link">
                        Learn More
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>
        {/* ============ FAQ ============ */}
        <section className="sbf-section sbf-faq">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-5" data-sbf-reveal="">
                <span className="sbf-eyebrow">Loan Types FAQ</span>
                <h2 className="sbf-title">Understanding your loan options</h2>
                <p className="sbf-text">
                  Answers to the questions business owners ask most when comparing loan types. Prefer to talk
                  it through? Give us a call.
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
                <div className="accordion sbf-accordion" id="sbfLtFaq">
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sbfLtFaq0" aria-expanded="true" aria-controls="sbfLtFaq0">
                        What is a business line of credit?
                      </button>
                    </h3>
                    <div id="sbfLtFaq0" className="accordion-collapse collapse show" data-bs-parent="#sbfLtFaq">
                      <div className="accordion-body">
                        A line of credit works like a credit card for your business. You can draw funds as often
                        as you need, you pay interest only on the amount you draw and only for the time you have
                        it, and you repay with minimum monthly payments, or pay more, or pay the whole balance.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfLtFaq1" aria-expanded="false" aria-controls="sbfLtFaq1">
                        What is the difference between a secured and an unsecured loan?
                      </button>
                    </h3>
                    <div id="sbfLtFaq1" className="accordion-collapse collapse" data-bs-parent="#sbfLtFaq">
                      <div className="accordion-body">
                        A secured loan is backed by a property or asset that the lender can claim if you
                        default. An unsecured loan isn&apos;t backed by collateral, so your assets can&apos;t
                        be seized — but it typically carries a higher interest rate because the lender takes
                        on more risk.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfLtFaq2" aria-expanded="false" aria-controls="sbfLtFaq2">
                        Should I buy or lease equipment?
                      </button>
                    </h3>
                    <div id="sbfLtFaq2" className="accordion-collapse collapse" data-bs-parent="#sbfLtFaq">
                      <div className="accordion-body">
                        An equipment loan lets you own the equipment outright, with the equipment serving as
                        security. Leasing can lower your upfront costs and reduce upkeep, depending on the
                        equipment. A funding specialist can help you compare both options for your situation.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfLtFaq3" aria-expanded="false" aria-controls="sbfLtFaq3">
                        What kinds of equipment can be financed?
                      </button>
                    </h3>
                    <div id="sbfLtFaq3" className="accordion-collapse collapse" data-bs-parent="#sbfLtFaq">
                      <div className="accordion-body">
                        Common examples include medical machinery, restaurant equipment, phone systems,
                        computers, and specialized or industrial machinery.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfLtFaq4" aria-expanded="false" aria-controls="sbfLtFaq4">
                        What if I need a different type of financing?
                      </button>
                    </h3>
                    <div id="sbfLtFaq4" className="accordion-collapse collapse" data-bs-parent="#sbfLtFaq">
                      <div className="accordion-body">
                        Contact us. Beyond the three loan types we specialize in, we can customize a financing
                        solution for your business through our network of lenders.
                      </div>
                    </div>
                  </div>
                </div>
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
              <h2 className="sbf-cta-title">Experience the Spectrum Financial difference.</h2>
              <p className="sbf-cta-text">
                Lines of Credit, Unsecured Working Capital and Equipment Loans / Leases — reliable,
                customized business financing for businesses nationwide.
              </p>
              <div className="sbf-hero-actions justify-content-center">
                <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                  Apply Now
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                </Link>
                {" "}
                <a href="tel:18002147498" className="btn sbf-btn sbf-btn-glass sbf-btn-lg">
                  <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                  {" "}
                  1-800-214-7498
                </a>
              </div>
            </div>
          </div>
        </section>
        {/* ============ REVIEWS WIDGET ============ */}
        <ReviewsSection />
      </main>
    </>
  );
}
