import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { QuoteSpotlightSection, ReviewsSection } from '@/components/ReviewSections';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/services",
  title: "Business Financing Services | Spectrum Financial",
  description: "Business lines of credit, unsecured working capital and equipment loans for small businesses. Simple application and no application fees.",
  image: "/img/bg-office.jpg",
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
      "@id": "https://spectrumbusinessloans.com/services#webpage",
      "url": "https://spectrumbusinessloans.com/services",
      "name": "Business Financing Services | Spectrum Financial",
      "description": "Business lines of credit, unsecured working capital and equipment loans for small businesses. Simple application and no application fees.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/services#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/services#breadcrumb",
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
          "name": "Services",
          "item": "https://spectrumbusinessloans.com/services"
        }
      ]
    },
    {
      "@type": "ItemList",
      "name": "Business financing services",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "item": {
            "@type": "Service",
            "name": "Business Line of Credit",
            "url": "https://spectrumbusinessloans.com/services#line-of-credit",
            "description": "A revolving line you can draw from as often as you need, paying interest only on the amount drawn, with minimum monthly payments.",
            "serviceType": "Business financing",
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
            "@type": "Service",
            "name": "Unsecured Working Capital Loans",
            "url": "https://spectrumbusinessloans.com/services#working-capital",
            "description": "Short-term working capital for payroll, debt, inventory or new opportunities, with no collateral required.",
            "serviceType": "Business financing",
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
            "@type": "Service",
            "name": "Equipment Loans & Leases",
            "url": "https://spectrumbusinessloans.com/services#equipment-financing",
            "description": "Financing to acquire machinery, vehicles or technology, with the equipment serving as security.",
            "serviceType": "Business financing",
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
          "name": "Which service is right for my business?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "It depends on how you plan to use the funds. A line of credit suits businesses that want funds on hand to draw from as needs come up, unsecured working capital covers day-to-day needs like payroll and inventory, and equipment financing is built for buying machinery, vehicles or technology. A specialist will recommend the best fit after reviewing your application."
          }
        },
        {
          "@type": "Question",
          "name": "What do I need to apply?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Just a simple application. You don't need to provide tax returns or financial statements to get started, and there are no advance or application fees."
          }
        },
        {
          "@type": "Question",
          "name": "How fast will I get a decision and funding?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You'll get a decision immediately rather than waiting weeks, and in most cases funds are deposited into your business account within 24 hours."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need collateral?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our unsecured working capital programs don't require collateral. With equipment loans and leases, the equipment itself serves as security."
          }
        },
        {
          "@type": "Question",
          "name": "Can I come back for additional funding later?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We aim to be your financing partner for the life of your business — nearly 80% of the clients we fund return to us for repeat loans."
          }
        }
      ]
    }
  ]
};

export default function ServicesPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* ============ HERO ============ */}
        <section className="sbf-hero sbf-svc-hero">
          <div className="sbf-hero-media">
            <div className="sbf-hero-media-bg" style={{ backgroundImage: "url('/img/bg-office.jpg')" }} />
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
                  <span aria-current="page">Services</span>
                </nav>
                <span className="sbf-pill">
                  {" "}
                  <span className="sbf-pill-dot" />
                  {" "}
                  Our Services · Small &amp; Medium-Sized Businesses
                  {" "}
                </span>
                <h1 className="sbf-hero-title">
                  Financing services that fit
                  {" "}
                  <em>the way you do business.</em>
                </h1>
                <p className="sbf-hero-lead mx-auto" style={{ maxWidth: "720px" }}>
                  From short-term working capital loans to equipment financing, Spectrum Financial helps small
                  and medium-sized businesses find the right funding — with a simple application and a
                  decision immediately, not weeks later.
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
                  <a href="tel:18002147498" className="btn sbf-btn sbf-btn-glass sbf-btn-lg">
                    {" "}
                    <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                    {" "}
                    1-800-214-7498
                    {" "}
                  </a>
                </div>
                <ul className="sbf-hero-trust justify-content-center">
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    No tax returns required
                  </li>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    Immediate decision
                  </li>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    Funding within 24 hours
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* ============ SERVICE QUICK LINKS (overlaps hero) ============ */}
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
                      <small>Service 01</small>
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
                  <a href="#working-capital" className="sbf-svc-jump">
                    {" "}
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-cash" /></svg></span>
                    {" "}
                    <span className="sbf-svc-jump-body">
                      {" "}
                      <small>Service 02</small>
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
                  <a href="#equipment-financing" className="sbf-svc-jump">
                    {" "}
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-gear" /></svg></span>
                    {" "}
                    <span className="sbf-svc-jump-body">
                      {" "}
                      <small>Service 03</small>
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
        {/* ============ INTRO ============ */}
        <section className="sbf-section sbf-intro">
          <div className="container">
            <div className="row align-items-center g-5">
              <div className="col-lg-6 order-lg-2">
                <div className="sbf-intro-content" data-sbf-reveal="">
                  <span className="sbf-eyebrow">What We Do</span>
                  <h2 className="sbf-title">
                    Helping businesses find the financing they
                    {" "}
                    <em>actually need.</em>
                  </h2>
                  <p className="sbf-text">
                    Spectrum Financial helps small and medium-sized businesses find the right financing for
                    where they are today. Whether you need short-term working capital to keep operations
                    moving or equipment financing to grow, we match you with a solution through our network of
                    business lenders.
                  </p>
                  <p className="sbf-text">
                    Our clients complete a simple application — no tax returns or financial statements
                    required — and get a decision immediately instead of waiting weeks. It&apos;s why nearly
                    80% of the clients we fund come back to us for repeat loans.
                  </p>
                  <ul className="sbf-checklist">
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      No tax returns or financial statements
                    </li>
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      A decision immediately, not in weeks
                    </li>
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      Short-term and equipment financing
                    </li>
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      Serving businesses nationwide
                    </li>
                  </ul>
                  <div className="sbf-intro-callout">
                    <div className="sbf-intro-callout-icon">
                      <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                    </div>
                    <div>
                      <span className="sbf-intro-callout-label">Talk to a funding specialist today</span>
                      {" "}
                      <a href="tel:18002147498" className="sbf-intro-callout-phone">1-800-214-7498</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6 order-lg-1">
                <div className="sbf-intro-visual" data-sbf-reveal="" data-sbf-delay="100">
                  <div className="sbf-intro-photo-card">
                    <Image src="/img/about-partnership.jpg" alt="Business owners meeting with a Spectrum Financial funding specialist" width="560" height="580" loading="lazy" />
                    <div className="sbf-intro-photo-overlay" />
                  </div>
                  <div className="sbf-float-card sbf-float-card--approved">
                    <span className="sbf-float-icon"><svg className="sbf-icon"><use href="#sbf-i-user" /></svg></span>
                    <div>
                      <strong>Nearly 80% Return</strong>
                      {" "}
                      <span>Funded clients come back for repeat loans</span>
                    </div>
                  </div>
                  <div className="sbf-float-card sbf-float-card--funded">
                    <span className="sbf-float-label">Application to decision</span>
                    {" "}
                    <span className="sbf-float-amount">Immediate</span>
                    {" "}
                    <span className="sbf-float-bar"><span /></span>
                    {" "}
                    <span className="sbf-float-meta">
                      <svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg>
                      {" "}
                      No tax returns needed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ CORE SERVICES (DETAILED) ============ */}
        <section className="sbf-section sbf-svc">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">Services We Offer</span>
              <h2 className="sbf-title">Three ways to fund your business</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                Each program is structured around your revenue and goals. Not sure which one fits? A
                specialist will walk you through the options at no cost.
              </p>
            </div>
            {/* 01 · Line of Credit */}
            <article className="sbf-svc-row" id="line-of-credit">
              <div className="row align-items-center g-5">
                <div className="col-lg-6">
                  <div className="sbf-svc-visual" data-sbf-reveal="">
                    <div className="sbf-intro-photo-card sbf-svc-photo">
                      <Image src="/img/ind-retail.jpg" alt="Retail store owner at the counter" width="560" height="440" loading="lazy" />
                      <div className="sbf-intro-photo-overlay" />
                    </div>
                    <span className="sbf-svc-index" aria-hidden="true">01</span>
                    <div className="sbf-float-card sbf-float-card--approved sbf-svc-chip">
                      <span className="sbf-float-icon"><svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg></span>
                      <div>
                        <strong>Draw As Needed</strong>
                        {" "}
                        <span>Works like a credit card</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="sbf-svc-content" data-sbf-reveal="" data-sbf-delay="100">
                    <span className="sbf-svc-tag">
                      <svg className="sbf-icon"><use href="#sbf-i-card" /></svg>
                      {" "}
                      Flexible Credit
                    </span>
                    <h3 className="sbf-svc-title">Business Line of Credit</h3>
                    <p className="sbf-text">
                      A line of credit works like a credit card for your business. Draw funds as often as you
                      need, pay interest only on the amount you draw and only for as long as you have it, and
                      pay it back with minimum monthly payments — or pay more, or pay it all off.
                    </p>
                    <div className="sbf-svc-meta">
                      <div>
                        <small>Draws</small>
                        <strong>As Needed</strong>
                      </div>
                      <div>
                        <small>Interest</small>
                        <strong>On Amount Drawn</strong>
                      </div>
                      <div>
                        <small>Repayment</small>
                        <strong>Minimum Monthly</strong>
                      </div>
                    </div>
                    <ul className="sbf-checklist">
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Draw funds whenever you need them
                      </li>
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Pay interest only on what you draw
                      </li>
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Pay the minimum, more, or all of it
                      </li>
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Pay it back and draw again
                      </li>
                    </ul>
                    <div className="sbf-svc-actions">
                      <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold">
                        Apply Now
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                      {" "}
                      <Link href="/loan-types" className="sbf-link">
                        Compare loan types
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            {/* 02 · Unsecured Working Capital */}
            <article className="sbf-svc-row" id="working-capital">
              <div className="row align-items-center g-5">
                <div className="col-lg-6 order-lg-2">
                  <div className="sbf-svc-visual sbf-svc-visual--flip" data-sbf-reveal="">
                    <div className="sbf-intro-photo-card sbf-svc-photo">
                      <Image src="/img/ind-restaurant.jpg" alt="Restaurant business funded with unsecured working capital" width="560" height="440" loading="lazy" />
                      <div className="sbf-intro-photo-overlay" />
                    </div>
                    <span className="sbf-svc-index" aria-hidden="true">02</span>
                    <div className="sbf-float-card sbf-float-card--approved sbf-svc-chip">
                      <span className="sbf-float-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                      <div>
                        <strong>No Collateral</strong>
                        {" "}
                        <span>No personal assets pledged</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6 order-lg-1">
                  <div className="sbf-svc-content" data-sbf-reveal="" data-sbf-delay="100">
                    <span className="sbf-svc-tag">
                      <svg className="sbf-icon"><use href="#sbf-i-cash" /></svg>
                      {" "}
                      Most Requested
                    </span>
                    <h3 className="sbf-svc-title">Unsecured Working Capital Loans</h3>
                    <p className="sbf-text">
                      Short-term capital to cover payroll, pay down debt, restock or seize a new opportunity —
                      without putting up collateral. Funds are wired directly into your business checking
                      account, usually within 24 hours.
                    </p>
                    <div className="sbf-svc-meta">
                      <div>
                        <small>Amounts Up To</small>
                        <strong>$2,000,000</strong>
                      </div>
                      <div>
                        <small>Terms</small>
                        <strong>3 – 24 Months</strong>
                      </div>
                      <div>
                        <small>Collateral</small>
                        <strong>None Required</strong>
                      </div>
                    </div>
                    <ul className="sbf-checklist">
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Direct wire to business checking
                      </li>
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Fixed, transparent repayment
                      </li>
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Cover payroll &amp; operating costs
                      </li>
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        No tax returns to apply
                      </li>
                    </ul>
                    <div className="sbf-svc-actions">
                      <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold">
                        Apply Now
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                      {" "}
                      <Link href="/loan-types" className="sbf-link">
                        Compare loan types
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            {/* 03 · Equipment Loans & Leases */}
            <article className="sbf-svc-row" id="equipment-financing">
              <div className="row align-items-center g-5">
                <div className="col-lg-6">
                  <div className="sbf-svc-visual" data-sbf-reveal="">
                    <div className="sbf-intro-photo-card sbf-svc-photo">
                      <Image src="/img/ind-manufacturing.jpg" alt="Manufacturing equipment acquired through an equipment loan or lease" width="560" height="440" loading="lazy" />
                      <div className="sbf-intro-photo-overlay" />
                    </div>
                    <span className="sbf-svc-index" aria-hidden="true">03</span>
                    <div className="sbf-float-card sbf-float-card--approved sbf-svc-chip">
                      <span className="sbf-float-icon"><svg className="sbf-icon"><use href="#sbf-i-gear" /></svg></span>
                      <div>
                        <strong>Up to 100% Financed</strong>
                        {" "}
                        <span>New &amp; pre-owned equipment</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="sbf-svc-content" data-sbf-reveal="" data-sbf-delay="100">
                    <span className="sbf-svc-tag">
                      <svg className="sbf-icon"><use href="#sbf-i-gear" /></svg>
                      {" "}
                      Asset Financing
                    </span>
                    <h3 className="sbf-svc-title">Equipment Loans &amp; Leases</h3>
                    <p className="sbf-text">
                      Acquire the machinery, vehicles or technology your business runs on while keeping your
                      working capital free for day-to-day operations. The equipment itself serves as security,
                      so there&apos;s no need to pledge other assets.
                    </p>
                    <div className="sbf-svc-meta">
                      <div>
                        <small>Financing Up To</small>
                        <strong>100% of Invoice</strong>
                      </div>
                      <div>
                        <small>Terms</small>
                        <strong>Up to 60 Months</strong>
                      </div>
                      <div>
                        <small>Security</small>
                        <strong>The Equipment</strong>
                      </div>
                    </div>
                    <ul className="sbf-checklist">
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Loan or lease options
                      </li>
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        New and pre-owned equipment
                      </li>
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Possible Section 179 tax advantages
                      </li>
                      <li>
                        <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                        {" "}
                        Preserve cash for operations
                      </li>
                    </ul>
                    <div className="sbf-svc-actions">
                      <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold">
                        Apply Now
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                      {" "}
                      <Link href="/loan-types" className="sbf-link">
                        Compare loan types
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
        {/* ============ PROGRAMS TICKER ============ */}
        <div className="sbf-ticker mt-0" aria-label="Financing programs">
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
        {/* ============ SOLUTIONS (USE CASES FROM ORIGINAL SERVICES PAGE) ============ */}
        <section className="sbf-section sbf-solutions">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">Reliable &amp; Customized Solutions</span>
              <h2 className="sbf-title">What our clients use their funding for</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                Reliable, customized business financing for companies nationwide — whatever stage your
                business is at.
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
                    <ul className="sbf-solution-bullets">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Financing within 24 hours
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        No-hassle application
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        New locations, fit-outs &amp; marketing
                      </li>
                    </ul>
                    <div className="sbf-solution-foot">
                      <Link href="/apply-now" className="sbf-link">
                        Apply Now
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
                    <ul className="sbf-solution-bullets">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        No collateral needed
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Keep your cash flow healthy
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Stock up ahead of busy seasons
                      </li>
                    </ul>
                    <div className="sbf-solution-foot">
                      <Link href="/apply-now" className="sbf-link">
                        Apply Now
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
                    <ul className="sbf-solution-bullets">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Bridge the gap until you&apos;re paid
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Cover payroll and supplies
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Flexible short-term repayment
                      </li>
                    </ul>
                    <div className="sbf-solution-foot">
                      <Link href="/apply-now" className="sbf-link">
                        Apply Now
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
        {/* ============ PROCESS ============ */}
        <section className="sbf-section sbf-process">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">How It Works</span>
              <h2 className="sbf-title">
                From application to funding in
                {" "}
                <em>four steps</em>
              </h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                Every service follows the same simple process — no advance fees, no application costs and no
                waiting weeks for an answer.
              </p>
            </div>
            <div className="sbf-process-row" data-sbf-progress="">
              <div className="sbf-step" data-sbf-reveal="">
                <span className="sbf-step-icon">
                  <svg className="sbf-icon"><use href="#sbf-i-doc" /></svg>
                  <span className="sbf-step-num">1</span>
                </span>
                <h3 className="sbf-step-title">Apply in minutes</h3>
                <p className="sbf-step-text">
                  Complete one simple application — no tax returns or financial statements needed.
                </p>
              </div>
              <div className="sbf-step" data-sbf-reveal="" data-sbf-delay="100">
                <span className="sbf-step-icon">
                  <svg className="sbf-icon"><use href="#sbf-i-chart" /></svg>
                  <span className="sbf-step-num">2</span>
                </span>
                <h3 className="sbf-step-title">Get a decision</h3>
                <p className="sbf-step-text">We review your business revenue and give you a decision immediately.</p>
              </div>
              <div className="sbf-step" data-sbf-reveal="" data-sbf-delay="200">
                <span className="sbf-step-icon">
                  <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                  <span className="sbf-step-num">3</span>
                </span>
                <h3 className="sbf-step-title">Choose your service</h3>
                <p className="sbf-step-text">
                  A specialist matches you with the right program and walks you through the terms.
                </p>
              </div>
              <div className="sbf-step" data-sbf-reveal="" data-sbf-delay="300">
                <span className="sbf-step-icon">
                  <svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg>
                  <span className="sbf-step-num">4</span>
                </span>
                <h3 className="sbf-step-title">Get funded</h3>
                <p className="sbf-step-text">
                  Accept your offer and funds are wired to your business account, often within 24 hours.
                </p>
              </div>
            </div>
            <div className="text-center mt-5" data-sbf-reveal="">
              <Link href="/the-process" className="btn sbf-btn sbf-btn-outline">
                See the full process
                {" "}
                <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
              </Link>
            </div>
          </div>
        </section>
        {/* ============ PRE-APPROVED STRIP ============ */}
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
                  <h3 className="sbf-preapproved-title">
                    Over
                    {" "}
                    <em>$20,000</em>
                    {" "}
                    in monthly sales? You&apos;re pre-approved.
                  </h3>
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
        {/* ============ FAQ ============ */}
        <section className="sbf-section sbf-faq">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-5" data-sbf-reveal="">
                <span className="sbf-eyebrow">Services FAQ</span>
                <h2 className="sbf-title">Choosing the right service</h2>
                <p className="sbf-text">
                  Not sure which program fits your business? Here are the questions we hear most. Our funding
                  specialists are always a phone call away.
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
                <div className="accordion sbf-accordion" id="sbfSvcFaq">
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sbfSvcFaq0" aria-expanded="true" aria-controls="sbfSvcFaq0">
                        Which service is right for my business?
                      </button>
                    </h3>
                    <div id="sbfSvcFaq0" className="accordion-collapse collapse show" data-bs-parent="#sbfSvcFaq">
                      <div className="accordion-body">
                        It depends on how you plan to use the funds. A line of credit suits businesses that want
                        funds on hand to draw from as needs come up, unsecured working capital covers day-to-day
                        needs like payroll and inventory, and equipment financing is built for buying machinery, vehicles or
                        technology. A specialist will recommend the best fit after reviewing your application.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfSvcFaq1" aria-expanded="false" aria-controls="sbfSvcFaq1">
                        What do I need to apply?
                      </button>
                    </h3>
                    <div id="sbfSvcFaq1" className="accordion-collapse collapse" data-bs-parent="#sbfSvcFaq">
                      <div className="accordion-body">
                        Just a simple application. You don&apos;t need to provide tax returns or financial
                        statements to get started, and there are no advance or application fees.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfSvcFaq2" aria-expanded="false" aria-controls="sbfSvcFaq2">
                        How fast will I get a decision and funding?
                      </button>
                    </h3>
                    <div id="sbfSvcFaq2" className="accordion-collapse collapse" data-bs-parent="#sbfSvcFaq">
                      <div className="accordion-body">
                        You&apos;ll get a decision immediately rather than waiting weeks, and in most cases
                        funds are deposited into your business account within 24 hours.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfSvcFaq3" aria-expanded="false" aria-controls="sbfSvcFaq3">
                        Do I need collateral?
                      </button>
                    </h3>
                    <div id="sbfSvcFaq3" className="accordion-collapse collapse" data-bs-parent="#sbfSvcFaq">
                      <div className="accordion-body">
                        Our unsecured working capital programs don&apos;t require collateral. With equipment
                        loans and leases, the equipment itself serves as security.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfSvcFaq4" aria-expanded="false" aria-controls="sbfSvcFaq4">
                        Can I come back for additional funding later?
                      </button>
                    </h3>
                    <div id="sbfSvcFaq4" className="accordion-collapse collapse" data-bs-parent="#sbfSvcFaq">
                      <div className="accordion-body">
                        Yes. We aim to be your financing partner for the life of your business — nearly 80% of
                        the clients we fund return to us for repeat loans.
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
              <h2 className="sbf-cta-title">Reliable, customized business financing — nationwide.</h2>
              <p className="sbf-cta-text">
                Contact us today to find the right service for your business. No application fees and a
                decision immediately.
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
        {/* ============ REVIEWS WIDGET ============ */}
        <ReviewsSection />
      </main>
    </>
  );
}
