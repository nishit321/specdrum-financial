import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { QuoteRequestForm } from '@/components/forms/QuoteRequestForm';
import { StoryproofWidget } from '@/components/StoryproofWidget';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/quote-request",
  title: "Request a Free Business Loan Quote | Spectrum Financial",
  description: "Request a free, no-obligation business loan quote from Spectrum Financial. Complete our short form for an expedited response. Serving businesses nationwide.",
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
      "@id": "https://spectrumbusinessloans.com/quote-request#webpage",
      "url": "https://spectrumbusinessloans.com/quote-request",
      "name": "Request a Free Business Loan Quote | Spectrum Financial",
      "description": "Request a free, no-obligation business loan quote from Spectrum Financial. Complete our short form for an expedited response. Serving businesses nationwide.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/quote-request#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/quote-request#breadcrumb",
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
          "name": "Quote Request",
          "item": "https://spectrumbusinessloans.com/quote-request"
        }
      ]
    },
    {
      "@type": "ContactPage",
      "name": "Quote Request",
      "url": "https://spectrumbusinessloans.com/quote-request"
    }
  ]
};

export default function QuoteRequestPage() {
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
                  <Link href="/">Home</Link>
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-chevron" /></svg>
                  {" "}
                  <span aria-current="page">Quote Request</span>
                </nav>
                <span className="sbf-pill">
                  {" "}
                  <span className="sbf-pill-dot" />
                  {" "}
                  Free Quote · No Obligation · No Fees
                  {" "}
                </span>
                <h1 className="sbf-hero-title">
                  Request your free
                  {" "}
                  <em>business loan quote.</em>
                </h1>
                <p className="sbf-hero-lead mx-auto" style={{ maxWidth: "680px" }}>
                  It is our pleasure to welcome your quote request. Please complete the form below for an
                  expedited response. Headquartered in Orange County, CA, we serve clients nationwide.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* ============ QUOTE FORM (overlaps hero) ============ */}
        <section className="sbf-qr-wrap" id="quote">
          <div className="container">
            <div className="sbf-quote-card" data-sbf-reveal="">
              <div className="row g-0">
                <div className="col-lg-5 order-2 order-lg-1">
                  <div className="sbf-quote-aside">
                    <span className="sbf-eyebrow sbf-eyebrow-light">Quote Request</span>
                    <h2 className="sbf-quote-title">Find out what your business qualifies for</h2>
                    <p className="sbf-text sbf-text-light">
                      Tell us a little about your business and a funding specialist will get back to you
                      quickly with your options.
                    </p>
                    <ul className="sbf-quote-points">
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg>
                        {" "}
                        Expedited response from a real specialist
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                        {" "}
                        No collateral, no application fees
                      </li>
                      <li>
                        <svg className="sbf-icon"><use href="#sbf-i-chart" /></svg>
                        {" "}
                        Over $20K monthly sales? You&apos;re pre-approved
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
                <div className="col-lg-7 order-1 order-lg-2"><QuoteRequestForm /></div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ WHAT HAPPENS NEXT ============ */}
        <section className="sbf-section sbf-qr-next">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">What Happens Next</span>
              <h2 className="sbf-title">After you send your request</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                Our philosophy is simple: business funding should be easy, not difficult. Here&apos;s what to
                expect.
              </p>
            </div>
            <div className="row g-4">
              <div className="col-md-4" data-sbf-reveal="">
                <div className="sbf-qr-next-card">
                  <span className="sbf-qr-next-num">01</span>
                  {" "}
                  <span className="sbf-qr-next-icon"><svg className="sbf-icon"><use href="#sbf-i-phone" /></svg></span>
                  <h3>We reach out</h3>
                  <p>A funding specialist reviews your request and contacts you with an expedited response.</p>
                </div>
              </div>
              <div className="col-md-4" data-sbf-reveal="" data-sbf-delay="100">
                <div className="sbf-qr-next-card">
                  <span className="sbf-qr-next-num">02</span>
                  {" "}
                  <span className="sbf-qr-next-icon"><svg className="sbf-icon"><use href="#sbf-i-doc" /></svg></span>
                  <h3>We find your options</h3>
                  <p>
                    We match your business with the right loan type through our network of lenders — with
                    minimal documentation.
                  </p>
                </div>
              </div>
              <div className="col-md-4" data-sbf-reveal="" data-sbf-delay="200">
                <div className="sbf-qr-next-card">
                  <span className="sbf-qr-next-num">03</span>
                  {" "}
                  <span className="sbf-qr-next-icon"><svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg></span>
                  <h3>You get funded</h3>
                  <p>
                    Most loans are approved within 24 hours or less, with funding often available in under 24
                    hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ TESTIMONIALS / CLIENT STORIES ============ */}
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
        {/* ============ CONTACT OPTIONS ============ */}
        <section className="sbf-section sbf-qr-contact">
          <div className="container">
            <div className="row g-4">
              <div className="col-md-6 col-lg-4" data-sbf-reveal="">
                <a href="tel:18002147498" className="sbf-qr-contact-card">
                  {" "}
                  <span className="sbf-qr-contact-icon"><svg className="sbf-icon"><use href="#sbf-i-phone" /></svg></span>
                  {" "}
                  <span className="sbf-qr-contact-body">
                    {" "}
                    <small>Prefer to talk?</small>
                    {" "}
                    <strong>1-800-214-7498</strong>
                    {" "}
                    <span>Call for funding within 24 hours</span>
                    {" "}
                  </span>
                  {" "}
                </a>
              </div>
              <div className="col-md-6 col-lg-4" data-sbf-reveal="" data-sbf-delay="100">
                <div className="sbf-qr-contact-card">
                  <span className="sbf-qr-contact-icon"><svg className="sbf-icon"><use href="#sbf-i-pin" /></svg></span>
                  {" "}
                  <span className="sbf-qr-contact-body">
                    {" "}
                    <small>Headquarters</small>
                    {" "}
                    <strong>Orange County, CA</strong>
                    {" "}
                    <span>11021 Winners Cir #103, Los Alamitos, CA 90720</span>
                    {" "}
                  </span>
                </div>
              </div>
              <div className="col-md-12 col-lg-4" data-sbf-reveal="" data-sbf-delay="200">
                <Link href="/apply-now" className="sbf-qr-contact-card sbf-qr-contact-card--gold">
                  {" "}
                  <span className="sbf-qr-contact-icon"><svg className="sbf-icon"><use href="#sbf-i-doc" /></svg></span>
                  {" "}
                  <span className="sbf-qr-contact-body">
                    {" "}
                    <small>Ready to apply?</small>
                    {" "}
                    <strong>Start your application</strong>
                    {" "}
                    <span>Secure online application in 4 easy steps</span>
                    {" "}
                  </span>
                  {" "}
                  <svg className="sbf-icon sbf-qr-contact-arrow"><use href="#sbf-i-arrow" /></svg>
                  {" "}
                </Link>
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
              <h2 className="sbf-cta-title">Serving businesses nationwide.</h2>
              <p className="sbf-cta-text">
                Business Lines of Credit, Unsecured Working Capital Loans and Equipment Loans / Leases —
                reliable, customized business financing.
              </p>
              <div className="sbf-hero-actions justify-content-center">
                <a href="#quote" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                  Request a Quote
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                </a>
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
