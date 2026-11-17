import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/the-process",
  title: "How Our Business Loan Process Works | Spectrum Financial",
  description: "Our business loan process is simple: contact us, apply with minimal documentation, get approved in 24 hours or less and funded in under 24 hours.",
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
      "@id": "https://spectrumbusinessloans.com/the-process#webpage",
      "url": "https://spectrumbusinessloans.com/the-process",
      "name": "How Our Business Loan Process Works | Spectrum Financial",
      "description": "Our business loan process is simple: contact us, apply with minimal documentation, get approved in 24 hours or less and funded in under 24 hours.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/the-process#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/the-process#breadcrumb",
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
          "name": "The Process",
          "item": "https://spectrumbusinessloans.com/the-process"
        }
      ]
    },
    {
      "@type": "HowTo",
      "name": "How to get business funding with Spectrum Financial",
      "totalTime": "P1D",
      "step": [
        {
          "@type": "HowToStep",
          "position": 1,
          "name": "Contact us",
          "text": "Call 1-800-214-7498 or contact us online."
        },
        {
          "@type": "HowToStep",
          "position": 2,
          "name": "Complete a simple application",
          "text": "Apply with minimal documentation and no application fees."
        },
        {
          "@type": "HowToStep",
          "position": 3,
          "name": "Get approved",
          "text": "Most loans are approved within 24 hours or less."
        },
        {
          "@type": "HowToStep",
          "position": 4,
          "name": "Receive your funding",
          "text": "Funding can be made available in under 24 hours."
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How do I get started?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Simply call us at 1-800-214-7498 or contact us online through our quote request form. You can also start your application online right away."
          }
        },
        {
          "@type": "Question",
          "name": "How long does approval take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most loans are approved within 24 hours or less, and funding can be made available in under 24 hours."
          }
        },
        {
          "@type": "Question",
          "name": "What documents do I need?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Very little. Our programs require minimal documentation — there's no need to provide tax returns or financial statements to get started."
          }
        },
        {
          "@type": "Question",
          "name": "Will my personal credit score matter?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our programs are not based on personal credit scores, and bad credit is OK. We focus on the health and sales of your business."
          }
        },
        {
          "@type": "Question",
          "name": "Are there any fees to apply?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. There are no advance fees or application fees."
          }
        },
        {
          "@type": "Question",
          "name": "How do I know if I'm pre-approved?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "If your business does over $20,000 in monthly sales, you're pre-approved. Contact us to confirm your options and amount."
          }
        }
      ]
    }
  ]
};

export default function TheProcessPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* ============ HERO ============ */}
        <section className="sbf-hero sbf-svc-hero">
          <div className="sbf-hero-media">
            <div className="sbf-hero-media-bg" style={{ backgroundImage: "url('/img/hero-bg.jpg')" }} />
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
                  <span aria-current="page">The Process</span>
                </nav>
                <span className="sbf-pill">
                  {" "}
                  <span className="sbf-pill-dot" />
                  {" "}
                  The Process · Our Philosophy Is Simple
                  {" "}
                </span>
                <h1 className="sbf-hero-title">
                  Business funding should be
                  {" "}
                  <em>easy, not difficult.</em>
                </h1>
                <p className="sbf-hero-lead mx-auto" style={{ maxWidth: "700px" }}>
                  Our philosophy is pretty simple. Just contact us by phone or online, complete a quick
                  application with minimal documentation, and most loans are approved within 24 hours or less.
                </p>
                <div className="sbf-hero-actions justify-content-center">
                  <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                    {" "}
                    Start Your Application
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
                    Minimal documentation
                  </li>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    No collateral required
                  </li>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    No application fees
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* ============ TIMELINE STATS ============ */}
        <section className="sbf-stats">
          <div className="container">
            <div className="sbf-stats-card">
              <div className="row g-0">
                <div className="col-6 col-lg-3">
                  <div className="sbf-stat">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                    {" "}
                    <span className="sbf-stat-num">
                      <span data-sbf-count="24">24</span>
                      <small>hrs</small>
                    </span>
                    {" "}
                    <span className="sbf-stat-label">Most loans approved within</span>
                  </div>
                </div>
                <div className="col-6 col-lg-3">
                  <div className="sbf-stat">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg></span>
                    {" "}
                    <span className="sbf-stat-num">
                      <small>&lt;</small>
                      <span data-sbf-count="24">24</span>
                      <small>hrs</small>
                    </span>
                    {" "}
                    <span className="sbf-stat-label">Funding can be available in</span>
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
                <div className="col-6 col-lg-3">
                  <div className="sbf-stat">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-chart" /></svg></span>
                    {" "}
                    <span className="sbf-stat-num">
                      <span data-sbf-count="80">80</span>
                      <small>%+</small>
                    </span>
                    {" "}
                    <span className="sbf-stat-label">Approval rate</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ STEP-BY-STEP TIMELINE ============ */}
        <section className="sbf-section sbf-pr">
          <div className="container">
            <div className="row g-5">
              <div className="col-lg-4">
                <div className="sbf-pr-aside" data-sbf-reveal="">
                  <span className="sbf-eyebrow">How It Works</span>
                  <h2 className="sbf-title">From first call to funding in four simple steps</h2>
                  <p className="sbf-text">
                    No weeks of back-and-forth and no stacks of paperwork. Here&apos;s exactly what happens
                    when you work with Spectrum Financial.
                  </p>
                  <div className="sbf-pr-start">
                    <span className="sbf-pr-start-label">Ready to begin?</span>
                    {" "}
                    <a href="tel:18002147498" className="sbf-pr-start-phone">
                      <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                      {" "}
                      1-800-214-7498
                    </a>
                    {" "}
                    <Link href="/quote-request" className="sbf-link">
                      Or contact us online
                      {" "}
                      <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-8">
                <ol className="sbf-pr-timeline">
                  <li className="sbf-pr-item" data-sbf-reveal="">
                    <span className="sbf-pr-marker"><svg className="sbf-icon"><use href="#sbf-i-phone" /></svg></span>
                    <div className="sbf-pr-card">
                      <div className="sbf-pr-card-head">
                        <span className="sbf-pr-step">Step 01</span>
                        {" "}
                        <span className="sbf-pr-time">
                          <svg className="sbf-icon"><use href="#sbf-i-clock" /></svg>
                          {" "}
                          A few minutes
                        </span>
                      </div>
                      <h3 className="sbf-pr-title">Contact us</h3>
                      <p>
                        Call us at
                        {" "}
                        <a href="tel:18002147498">1-800-214-7498</a>
                        {" "}
                        or
                        {" "}
                        <Link href="/quote-request">contact us online</Link>
                        . A funding specialist will learn about your business and what you need the funds for.
                      </p>
                    </div>
                  </li>
                  <li className="sbf-pr-item" data-sbf-reveal="" data-sbf-delay="80">
                    <span className="sbf-pr-marker"><svg className="sbf-icon"><use href="#sbf-i-doc" /></svg></span>
                    <div className="sbf-pr-card">
                      <div className="sbf-pr-card-head">
                        <span className="sbf-pr-step">Step 02</span>
                        {" "}
                        <span className="sbf-pr-time">
                          <svg className="sbf-icon"><use href="#sbf-i-clock" /></svg>
                          {" "}
                          About 2 minutes
                        </span>
                      </div>
                      <h3 className="sbf-pr-title">Complete a simple application</h3>
                      <p>
                        Our loan programs are quick and simple, with minimal documentation. There are no
                        advance fees or application fees to apply.
                      </p>
                      <ul className="sbf-pr-points">
                        <li>
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                          {" "}
                          Minimal documentation
                        </li>
                        <li>
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                          {" "}
                          No application fees
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li className="sbf-pr-item" data-sbf-reveal="" data-sbf-delay="160">
                    <span className="sbf-pr-marker"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                    <div className="sbf-pr-card">
                      <div className="sbf-pr-card-head">
                        <span className="sbf-pr-step">Step 03</span>
                        {" "}
                        <span className="sbf-pr-time">
                          <svg className="sbf-icon"><use href="#sbf-i-clock" /></svg>
                          {" "}
                          24 hours or less
                        </span>
                      </div>
                      <h3 className="sbf-pr-title">Get approved</h3>
                      <p>
                        Most loans are approved within 24 hours or less. Approval is based on your business —
                        not your personal credit score — and if your business does over $20,000 in monthly
                        sales, you&apos;re pre-approved.
                      </p>
                      <ul className="sbf-pr-points">
                        <li>
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                          {" "}
                          Not based on personal credit
                        </li>
                        <li>
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                          {" "}
                          No collateral required
                        </li>
                      </ul>
                    </div>
                  </li>
                  <li className="sbf-pr-item" data-sbf-reveal="" data-sbf-delay="240">
                    <span className="sbf-pr-marker sbf-pr-marker--gold">
                      <svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg>
                    </span>
                    <div className="sbf-pr-card sbf-pr-card--final">
                      <div className="sbf-pr-card-head">
                        <span className="sbf-pr-step">Step 04</span>
                        {" "}
                        <span className="sbf-pr-time">
                          <svg className="sbf-icon"><use href="#sbf-i-clock" /></svg>
                          {" "}
                          Under 24 hours
                        </span>
                      </div>
                      <h3 className="sbf-pr-title">Receive your funding</h3>
                      <p>
                        Accept your offer and funding can be made available in under 24 hours, deposited
                        directly into your business account.
                      </p>
                      <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold">
                        Apply Now
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
        {/* ============ PROGRAM FEATURES (7 POINTS FROM ORIGINAL PAGE) ============ */}
        <section className="sbf-section sbf-loans sbf-grain sbf-pr-features">
          <div className="sbf-parallax-bg" data-sbf-parallax="0.25" style={{ backgroundImage: "url('/img/bg-city-skyline.jpg')" }} aria-hidden="true" />
          <div className="sbf-parallax-overlay sbf-parallax-overlay--loans" aria-hidden="true" />
          <div className="container">
            <div className="row align-items-end g-4 sbf-section-head">
              <div className="col-lg-7" data-sbf-reveal="">
                <span className="sbf-eyebrow sbf-eyebrow-light">Why It&apos;s So Simple</span>
                <h2 className="sbf-title sbf-title-light">Loan programs designed to remove the hassle</h2>
              </div>
              <div className="col-lg-5" data-sbf-reveal="" data-sbf-delay="100">
                <p className="sbf-text sbf-text-light mb-0">
                  Everything about our programs is built around speed and simplicity — so you can focus on
                  running your business, not chasing a loan.
                </p>
              </div>
            </div>
            <div className="sbf-pr-feature-grid">
              <div className="sbf-pr-feature sbf-spotlight" data-sbf-reveal="">
                <span className="sbf-pr-feature-icon"><svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg></span>
                <h3>Quick &amp; simple</h3>
                <p>Our loan programs are quick and simple from start to finish.</p>
              </div>
              <div className="sbf-pr-feature sbf-spotlight" data-sbf-reveal="" data-sbf-delay="60">
                <span className="sbf-pr-feature-icon"><svg className="sbf-icon"><use href="#sbf-i-lock" /></svg></span>
                <h3>100% unsecured</h3>
                <p>No collateral required — your assets stay yours.</p>
              </div>
              <div className="sbf-pr-feature sbf-spotlight" data-sbf-reveal="" data-sbf-delay="120">
                <span className="sbf-pr-feature-icon"><svg className="sbf-icon"><use href="#sbf-i-doc" /></svg></span>
                <h3>Minimal documentation</h3>
                <p>No stacks of paperwork, tax returns or financial statements.</p>
              </div>
              <div className="sbf-pr-feature sbf-spotlight" data-sbf-reveal="" data-sbf-delay="180">
                <span className="sbf-pr-feature-icon"><svg className="sbf-icon"><use href="#sbf-i-user" /></svg></span>
                <h3>Not credit-score based</h3>
                <p>Not based on personal credit scores — a credit report will not be used.</p>
              </div>
              <div className="sbf-pr-feature sbf-spotlight" data-sbf-reveal="">
                <span className="sbf-pr-feature-icon"><svg className="sbf-icon"><use href="#sbf-i-clock" /></svg></span>
                <h3>Funded in under 24 hours</h3>
                <p>Funding can be made available in under 24 hours.</p>
              </div>
              <div className="sbf-pr-feature sbf-spotlight" data-sbf-reveal="" data-sbf-delay="60">
                <span className="sbf-pr-feature-icon"><svg className="sbf-icon"><use href="#sbf-i-cash" /></svg></span>
                <h3>No upfront fees</h3>
                <p>No advance fees or application fees — ever.</p>
              </div>
              <div className="sbf-pr-feature sbf-spotlight" data-sbf-reveal="" data-sbf-delay="120">
                <span className="sbf-pr-feature-icon"><svg className="sbf-icon"><use href="#sbf-i-chart" /></svg></span>
                <h3>$20K+ sales? Pre-approved</h3>
                <p>If your business does over $20,000 in monthly sales, you&apos;re pre-approved.</p>
              </div>
              <div className="sbf-pr-feature sbf-pr-feature--highlight" data-sbf-reveal="" data-sbf-delay="180">
                <span className="sbf-pr-feature-big">80%+</span>
                <h3>Approval rate</h3>
                <p>No collateral needed. Bad credit OK!</p>
              </div>
            </div>
          </div>
        </section>
        {/* ============ APPROVAL BANNER ============ */}
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
                    Bad Credit OK
                  </span>
                  <h2 className="sbf-preapproved-title">
                    Over
                    {" "}
                    <em>80%</em>
                    {" "}
                    approval rate. No collateral needed.
                  </h2>
                  <p className="sbf-preapproved-text">
                    Contact us today and experience the Spectrum Financial difference — reliable, customized
                    business financing for businesses nationwide.
                  </p>
                </div>
                <div className="col-lg-4 text-lg-end">
                  <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                    Apply Now
                    {" "}
                    <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ SOLUTIONS (USE CASES FROM ORIGINAL PAGE) ============ */}
        <section className="sbf-section sbf-solutions">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">What You Can Fund</span>
              <h2 className="sbf-title">Put fast funding to work</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                However you plan to use it, the process stays just as simple.
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
                      <Link href="/quote-request" className="sbf-link">
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
                      <Link href="/quote-request" className="sbf-link">
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
                <span className="sbf-eyebrow">Process FAQ</span>
                <h2 className="sbf-title">Questions about the process</h2>
                <p className="sbf-text">
                  What to expect from application to funding. Have a question that isn&apos;t answered here?
                  We&apos;re a phone call away.
                </p>
                <div className="sbf-faq-help">
                  <span className="sbf-faq-help-icon"><svg className="sbf-icon"><use href="#sbf-i-phone" /></svg></span>
                  <div>
                    <strong>Talk to a specialist</strong>
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
                <div className="accordion sbf-accordion" id="sbfPrFaq">
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#sbfPrFaq0" aria-expanded="true" aria-controls="sbfPrFaq0">
                        How do I get started?
                      </button>
                    </h3>
                    <div id="sbfPrFaq0" className="accordion-collapse collapse show" data-bs-parent="#sbfPrFaq">
                      <div className="accordion-body">
                        Simply call us at 1-800-214-7498 or contact us online through our quote request form.
                        You can also start your application online right away.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfPrFaq1" aria-expanded="false" aria-controls="sbfPrFaq1">
                        How long does approval take?
                      </button>
                    </h3>
                    <div id="sbfPrFaq1" className="accordion-collapse collapse" data-bs-parent="#sbfPrFaq">
                      <div className="accordion-body">
                        Most loans are approved within 24 hours or less, and funding can be made available in
                        under 24 hours.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfPrFaq2" aria-expanded="false" aria-controls="sbfPrFaq2">
                        What documents do I need?
                      </button>
                    </h3>
                    <div id="sbfPrFaq2" className="accordion-collapse collapse" data-bs-parent="#sbfPrFaq">
                      <div className="accordion-body">
                        Very little. Our programs require minimal documentation — there&apos;s no need to
                        provide tax returns or financial statements to get started.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfPrFaq3" aria-expanded="false" aria-controls="sbfPrFaq3">
                        Will my personal credit score matter?
                      </button>
                    </h3>
                    <div id="sbfPrFaq3" className="accordion-collapse collapse" data-bs-parent="#sbfPrFaq">
                      <div className="accordion-body">
                        Our programs are not based on personal credit scores, and bad credit is OK. We focus
                        on the health and sales of your business.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfPrFaq4" aria-expanded="false" aria-controls="sbfPrFaq4">
                        Are there any fees to apply?
                      </button>
                    </h3>
                    <div id="sbfPrFaq4" className="accordion-collapse collapse" data-bs-parent="#sbfPrFaq">
                      <div className="accordion-body">No. There are no advance fees or application fees.</div>
                    </div>
                  </div>
                  <div className="accordion-item sbf-faq-item">
                    <h3 className="accordion-header">
                      <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#sbfPrFaq5" aria-expanded="false" aria-controls="sbfPrFaq5">
                        How do I know if I&apos;m pre-approved?
                      </button>
                    </h3>
                    <div id="sbfPrFaq5" className="accordion-collapse collapse" data-bs-parent="#sbfPrFaq">
                      <div className="accordion-body">
                        If your business does over $20,000 in monthly sales, you&apos;re pre-approved. Contact
                        us to confirm your options and amount.
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
              <h2 className="sbf-cta-title">Easy funding starts with one call.</h2>
              <p className="sbf-cta-text">
                Unsecured Working Capital Loans and Equipment Loans / Leases approved in 24 hours or less,
                plus Business Lines of Credit, for businesses nationwide.
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
      </main>
    </>
  );
}
