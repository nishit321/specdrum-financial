import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { ReviewsSection } from '@/components/ReviewSections';
import { StoryproofWidget } from '@/components/StoryproofWidget';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/about",
  title: "About Us | Spectrum Financial Business Lending",
  socialTitle: "About Spectrum Financial",
  description: "For 20 years, Spectrum Financial has helped businesses nationwide secure working capital, equipment financing and lines of credit.",
  image: "/img/about-team.jpg",
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
      "@type": "AboutPage",
      "@id": "https://spectrumbusinessloans.com/about#webpage",
      "url": "https://spectrumbusinessloans.com/about",
      "name": "About Us | Spectrum Financial Business Lending",
      "description": "For 20 years, Spectrum Financial has helped businesses nationwide secure working capital, equipment financing and lines of credit.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/about#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/about#breadcrumb",
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
          "name": "About",
          "item": "https://spectrumbusinessloans.com/about"
        }
      ]
    }
  ]
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* ============ HERO ============ */}
        <section className="sbf-hero">
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
            <div className="row align-items-center g-5">
              <div className="col-lg-7">
                <div className="sbf-hero-content" data-sbf-reveal="">
                  <span className="sbf-pill">
                    {" "}
                    <span className="sbf-pill-dot" />
                    {" "}
                    About Spectrum Financial · 20 Years of Lending Excellence
                    {" "}
                  </span>
                  <h1 className="sbf-hero-title">
                    Business financing built on
                    {" "}
                    <em>trust &amp; speed.</em>
                  </h1>
                  <p className="sbf-hero-lead">
                    For 20 years, our highly experienced team has been helping businesses all across the
                    country secure their urgently needed business loans. With our vast network of business
                    lenders, we customize solutions that fit your business at this time — with approvals in 24
                    hours or less.
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
                      Funding within 24 hours
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Over 80% approval rate
                    </li>
                    <li>
                      <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                      {" "}
                      Zero advance or application fees
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
              {/* Hero Visual side */}
              <div className="col-lg-5">
                <div className="sbf-hero-visual" data-sbf-reveal="" data-sbf-delay="120">
                  <div className="sbf-hero-chip sbf-hero-chip--photo sbf-hero-chip--top d-none d-lg-flex" aria-hidden="true">
                    <Image src="/img/testi-greg.jpg" alt="Greg P." width="300" height="300" loading="eager" />
                    {" "}
                    <span>
                      <strong>20 Years Helping Businesses</strong>
                      <small>Nationwide lender network</small>
                    </span>
                  </div>
                  <div className="sbf-intro-photo-card" style={{ boxShadow: "0 24px 60px rgba(0,0,0,.5)", border: "1px solid rgba(255,255,255,.15)" }}>
                    <Image src="/img/about-team.jpg" alt="Spectrum Financial lending advisory team" width="560" height="420" style={{ height: "380px", objectFit: "cover" }} loading="eager" />
                    <div className="sbf-intro-photo-overlay" />
                  </div>
                  <div className="sbf-hero-chip sbf-hero-chip--bottom d-none d-lg-flex" aria-hidden="true">
                    <span className="sbf-hero-chip-icon"><svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg></span>
                    {" "}
                    <span>
                      <strong>$500M+ Deployed</strong>
                      <small>Approvals in 24 hours</small>
                    </span>
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
                  <span className="sbf-eyebrow">Our Story &amp; Purpose</span>
                  <h2 className="sbf-title">
                    Unlike bureaucratic banks, you are not just another
                    {" "}
                    <em>transaction to us.</em>
                  </h2>
                  <p className="sbf-text">
                    For 20 years, our highly experienced team has been helping businesses all across the
                    country secure their urgently needed business loans. With our vast network of business
                    lenders, we can customize a solution or type of financing that is ideal for your company
                    at this time. In addition, we can get you an approval in 24 hours or less in most
                    scenarios.
                  </p>
                  <p className="sbf-text">
                    We invest ourselves to learn about your business so that we can serve as your business
                    financing solutions partner for the life of your business. Our clients benefit by
                    completing a simple application without the need for tax returns and financial statements,
                    and getting a decision immediately rather than waiting weeks and weeks. We offer the
                    lowest industry rates, quickest turnaround time, and highest customer satisfaction.
                  </p>
                  <ul className="sbf-checklist">
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      Simple application without tax returns or extensive statements
                    </li>
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      Approvals in 24 hours or less in most scenarios
                    </li>
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      Lowest industry rates &amp; quickest turnaround time
                    </li>
                    <li>
                      <span className="sbf-check"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                      {" "}
                      Customized solutions for businesses nationwide
                    </li>
                  </ul>
                  <div className="sbf-intro-callout">
                    <div className="sbf-intro-callout-icon">
                      <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                    </div>
                    <div>
                      <span className="sbf-intro-callout-label">Experience the Spectrum Financial difference</span>
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
                      <strong>20 Years</strong>
                      {" "}
                      <span>Serving businesses nationwide</span>
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
        {/* ============ SOLUTIONS (3 GROWTH USE CASES FROM ORIGINAL ABOUT PAGE) ============ */}
        <section className="sbf-section sbf-solutions">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">Reliable &amp; Customized Solutions</span>
              <h2 className="sbf-title">Capital that keeps your business moving</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                We serve businesses nationwide with tailored loan structures designed to address immediate
                operational goals and long-term expansion.
              </p>
            </div>
            <div className="row g-4">
              {/* Card 1: Expand Your Business */}
              <div className="col-md-6 col-lg-4">
                <article className="sbf-solution-card" data-sbf-reveal="">
                  <div className="sbf-solution-img-wrapper">
                    <Image src="/img/sol-expand.jpg" alt="Expand Your Business" width="400" height="260" loading="lazy" />
                    <div className="sbf-solution-overlay" />
                    <span className="sbf-solution-tag-top">Growth &amp; Locations</span>
                    {" "}
                    <span className="sbf-solution-limit">Up to $500,000</span>
                  </div>
                  <div className="sbf-solution-body">
                    <span className="sbf-solution-badge"><svg className="sbf-icon"><use href="#sbf-i-chart" /></svg></span>
                    <h3 className="sbf-card-title">Expand Your Business</h3>
                    <p className="sbf-card-text">
                      Need to grow your business? Secure financing within 24 hours to make your dreams a
                      reality. Contact us regarding our no hassle application process.
                    </p>
                    <ul className="sbf-solution-bullets">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Fast 24-hour decisioning
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        No hassle digital application
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Capital for store fit-outs &amp; marketing
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
              {/* Card 2: Secure New Inventory */}
              <div className="col-md-6 col-lg-4">
                <article className="sbf-solution-card" data-sbf-reveal="" data-sbf-delay="100">
                  <div className="sbf-solution-img-wrapper">
                    <Image src="/img/sol-inventory.jpg" alt="Secure New Inventory" width="400" height="260" loading="lazy" />
                    <div className="sbf-solution-overlay" />
                    <span className="sbf-solution-tag-top">Supply &amp; Stock</span>
                    {" "}
                    <span className="sbf-solution-limit">Up to $350,000</span>
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
                        Zero asset collateral required
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Maintain healthy daily cash flow
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Capture bulk order supplier discounts
                      </li>
                    </ul>
                    <div className="sbf-solution-foot">
                      <Link href="/apply-now" className="sbf-link">
                        Learn More
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
              {/* Card 3: Short-Term Loans Available */}
              <div className="col-md-6 col-lg-4">
                <article className="sbf-solution-card" data-sbf-reveal="" data-sbf-delay="200">
                  <div className="sbf-solution-img-wrapper">
                    <Image src="/img/sol-equipment.jpg" alt="Short-Term Loans Available" width="400" height="260" loading="lazy" />
                    <div className="sbf-solution-overlay" />
                    <span className="sbf-solution-tag-top">Bridge Capital</span>
                    {" "}
                    <span className="sbf-solution-limit">Up to $500,000</span>
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
                        Bridge receivables and contracts
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Cover payroll and immediate supply costs
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        {" "}
                        Flexible short-term repayment terms
                      </li>
                    </ul>
                    <div className="sbf-solution-foot">
                      <Link href="/apply-now" className="sbf-link">
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
        {/* ============ LOAN TYPES (SPECIALTIES FROM ORIGINAL ABOUT PAGE) ============ */}
        <section className="sbf-section sbf-loans sbf-grain">
          <div className="sbf-parallax-bg" data-sbf-parallax="0.25" style={{ backgroundImage: "url('/img/bg-city-skyline.jpg')" }} aria-hidden="true" />
          <div className="sbf-parallax-overlay sbf-parallax-overlay--loans" aria-hidden="true" />
          <div className="container">
            <div className="row align-items-end g-4 sbf-section-head">
              <div className="col-lg-7" data-sbf-reveal="">
                <span className="sbf-eyebrow sbf-eyebrow-light">Our Specialized Programs</span>
                <h2 className="sbf-title sbf-title-light">We specialize in these types of loans</h2>
              </div>
              <div className="col-lg-5" data-sbf-reveal="" data-sbf-delay="100">
                <p className="sbf-text sbf-text-light mb-0">
                  If you need a different financing solution, be sure to contact us. We customize each
                  structure to your revenue model.
                </p>
              </div>
            </div>
            <div className="row g-4">
              {/* Line of Credit */}
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
              {/* Working Capital */}
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
              {/* Equipment Loans */}
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
        {/* ============ BANK VS SPECTRUM COMPARISON ============ */}
        <section className="sbf-section sbf-compare">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-compare-pill">Clear Distinction</span>
              {" "}
              <span className="sbf-eyebrow">Traditional Banks vs. Spectrum Financial</span>
              <h2 className="sbf-title">Why business owners choose us over the bank</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                See how our streamlined, revenue-based process removes the friction of old-school lending.
              </p>
            </div>
            <div className="sbf-compare-card" data-sbf-reveal="">
              <div className="table-responsive">
                <table className="table sbf-compare-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: "32%" }}>Lending Criteria</th>
                      <th scope="col" className="sbf-compare-head-them" style={{ width: "34%" }}>
                        Traditional Commercial Banks
                      </th>
                      <th scope="col" className="sbf-compare-head-us" style={{ width: "34%" }}>
                        <Image src="/img/logo.png" alt="Spectrum Financial" className="sbf-compare-logo" width="404" height="150" loading="eager" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">Approval Speed</th>
                      <td className="sbf-compare-them">3 to 6 weeks of waiting &amp; review committees</td>
                      <td className="sbf-compare-us">
                        <span className="sbf-compare-yes">
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        </span>
                        {" "}
                        Decisions in 2–4 hours (Funded within 24h)
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Required Documentation</th>
                      <td className="sbf-compare-them">
                        3+ years tax returns, P&amp;L statements &amp; audited financials
                      </td>
                      <td className="sbf-compare-us">
                        <span className="sbf-compare-yes">
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        </span>
                        {" "}
                        Simple 1-page form &amp; recent bank statements
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Collateral Requirement</th>
                      <td className="sbf-compare-them">Demands real estate, heavy liens or personal guarantees</td>
                      <td className="sbf-compare-us">
                        <span className="sbf-compare-yes">
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        </span>
                        {" "}
                        Zero collateral required for most programs
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Approval Rate</th>
                      <td className="sbf-compare-them">Under 30% for small &amp; mid-sized businesses</td>
                      <td className="sbf-compare-us">
                        <span className="sbf-compare-yes">
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        </span>
                        {" "}
                        Over 80% consistent approval rate
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Credit Score Impact</th>
                      <td className="sbf-compare-them">Hard credit inquiries that lower your personal score</td>
                      <td className="sbf-compare-us">
                        <span className="sbf-compare-yes">
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        </span>
                        {" "}
                        Soft review that never impacts your credit score
                      </td>
                    </tr>
                    <tr>
                      <th scope="row">Relationship Model</th>
                      <td className="sbf-compare-them">Anonymous call centers and rigid automated rejection</td>
                      <td className="sbf-compare-us">
                        <span className="sbf-compare-yes">
                          <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                        </span>
                        {" "}
                        Dedicated financing specialist for the life of your business
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
        {/* ============ FINAL CTA ============ */}
        <section className="sbf-cta sbf-grain">
          <div className="sbf-parallax-bg" data-sbf-parallax="0.25" style={{ backgroundImage: "url('/img/bg-cta.jpg')" }} aria-hidden="true" />
          <div className="sbf-parallax-overlay sbf-parallax-overlay--cta" aria-hidden="true" />
          <div className="container position-relative">
            <div className="sbf-cta-inner" data-sbf-reveal="">
              <h2 className="sbf-cta-title">Ready to experience the Spectrum Financial difference?</h2>
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
        {/* ============ REVIEWS WIDGET ============ */}
        <ReviewsSection />
      </main>
    </>
  );
}
