import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { LoanCalculator } from '@/components/calculator/LoanCalculator';
import { ReviewsSection } from '@/components/ReviewSections';
import { pageMetadata } from '@/lib/seo';

const TITLE = 'Business Loan Calculator | Spectrum Financial';
const DESCRIPTION =
  'See how much your business could qualify for. Enter your monthly revenue and business start date to compare working capital, line of credit and equipment financing estimates.';

export const metadata: Metadata = pageMetadata({
  path: '/loan-calculator',
  title: TITLE,
  description: DESCRIPTION,
  image: '/img/bg-office.jpg',
});

// same shape as the other pages' structured data
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
      "@id": "https://spectrumbusinessloans.com/loan-calculator#webpage",
      "url": "https://spectrumbusinessloans.com/loan-calculator",
      "name": TITLE,
      "description": DESCRIPTION,
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/loan-calculator#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/loan-calculator#breadcrumb",
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
          "name": "Loan Calculator",
          "item": "https://spectrumbusinessloans.com/loan-calculator"
        }
      ]
    }
  ]
};

export default function LoanCalculatorPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* ============ HERO ============ */}
        <section className="sbf-hero sbf-svc-hero sbf-qr-hero">
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
                  <Link href="/">Home</Link> <svg className="sbf-icon"><use href="#sbf-i-chevron" /></svg>{' '}
                  <span aria-current="page">Loan Calculator</span>
                </nav>
                <span className="sbf-pill">
                  {' '}
                  <span className="sbf-pill-dot" /> Instant Estimate · No Obligation{' '}
                </span>
                <h1 className="sbf-hero-title">
                  How much could your <em>business qualify for?</em>
                </h1>
                <p className="sbf-hero-lead mx-auto" style={{ maxWidth: '680px' }}>
                  Enter your average monthly revenue and when your business started. You&apos;ll see the
                  loan programs you pre-qualify for, and you can finish your application right after.
                </p>
              </div>
            </div>
          </div>
        </section>
        <LoanCalculator />
        {/* ============ FINAL CTA ============ */}
        <section className="sbf-cta sbf-grain">
          <div className="sbf-parallax-bg" data-sbf-parallax="0.25" style={{ backgroundImage: "url('/img/bg-cta.jpg')" }} aria-hidden="true" />
          <div className="sbf-parallax-overlay sbf-parallax-overlay--cta" aria-hidden="true" />
          <div className="container position-relative">
            <div className="sbf-cta-inner" data-sbf-reveal="">
              <h2 className="sbf-cta-title">Prefer to talk it through?</h2>
              <p className="sbf-cta-text">
                A funding specialist can walk you through your options and answer any questions about the
                programs above.
              </p>
              <div className="sbf-hero-actions justify-content-center">
                <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                  Apply Now <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                </Link>{' '}
                <a href="tel:18002147498" className="btn sbf-btn sbf-btn-glass sbf-btn-lg">
                  <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg> 1-800-214-7498
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
