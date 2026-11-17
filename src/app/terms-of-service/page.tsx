import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/terms-of-service",
  title: "Terms of Service | Spectrum Financial",
  description: "Spectrum Financial terms of service for our communications: consent to calls, emails and SMS, message frequency, opting out, privacy and changes to terms.",
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
      "email": "compliance@spectrumbusinessfinance.com",
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
      "@id": "https://spectrumbusinessloans.com/terms-of-service#webpage",
      "url": "https://spectrumbusinessloans.com/terms-of-service",
      "name": "Terms of Service | Spectrum Financial",
      "description": "Spectrum Financial terms of service for our communications: consent to calls, emails and SMS, message frequency, opting out, privacy and changes to terms.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/terms-of-service#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/terms-of-service#breadcrumb",
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
          "name": "Terms of Service",
          "item": "https://spectrumbusinessloans.com/terms-of-service"
        }
      ]
    }
  ]
};

export default function TermsOfServicePage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* ============ HERO ============ */}
        <section className="sbf-hero sbf-legal-hero">
          <div className="sbf-hero-media">
            <div className="sbf-hero-media-bg" style={{ backgroundImage: "url('/img/bg-city-skyline.jpg')" }} />
          </div>
          <div className="sbf-hero-overlay" />
          <div className="sbf-hero-grid" />
          <svg className="sbf-legal-hero-icon" aria-hidden="true"><use href="#sbf-i-doc" /></svg>
          <div className="container position-relative">
            <div className="row">
              <div className="col-lg-9 col-xl-8 mx-auto text-center" data-sbf-reveal="">
                <nav className="sbf-breadcrumb" aria-label="Breadcrumb">
                  <Link href="/">Home</Link>
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-chevron" /></svg>
                  {" "}
                  <span aria-current="page">Terms of Service</span>
                </nav>
                <span className="sbf-pill">
                  <span className="sbf-pill-dot" />
                  {" "}
                  Legal · Communication Terms
                </span>
                <h1 className="sbf-hero-title">
                  Terms of
                  {" "}
                  <em>Service</em>
                </h1>
                <p className="sbf-hero-lead mx-auto" style={{ maxWidth: "680px" }}>
                  By opting into our communications, you agree to the following terms. Please read them
                  carefully.
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* ============ KEY POINTS (overlaps hero) ============ */}
        <section className="sbf-stats sbf-legal-hl-wrap">
          <div className="container">
            <div className="sbf-stats-card" data-sbf-reveal="">
              <div className="row g-0">
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-phone" /></svg></span>
                    <div>
                      <strong>Calls, email &amp; SMS</strong>
                      <span>Consent to receive communications.</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-check" /></svg></span>
                    <div>
                      <strong>Not required to buy</strong>
                      <span>Consent is not a condition of purchase.</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-x" /></svg></span>
                    <div>
                      <strong>Opt out anytime</strong>
                      <span>Reply STOP to any text, or HELP for help.</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                    <div>
                      <strong>Your privacy</strong>
                      <span>Data used per our Privacy Policy.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ TERMS OF SERVICE ============ */}
        <section className="sbf-section sbf-legal">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 col-xl-9 mx-auto">
                <article className="sbf-legal-doc">
                  <div className="sbf-legal-meta">
                    <span className="sbf-legal-badge">
                      <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                      {" "}
                      Communication Terms
                    </span>
                    {" "}
                    <span className="sbf-legal-badge">
                      <svg className="sbf-icon"><use href="#sbf-i-x" /></svg>
                      {" "}
                      Reply STOP to opt out · HELP for help
                    </span>
                  </div>
                  <div className="sbf-legal-intro">
                    <span className="sbf-legal-intro-icon"><svg className="sbf-icon"><use href="#sbf-i-doc" /></svg></span>
                    <p>
                      This website is operated by Tri-Cities Consulting LLC, doing business as Spectrum Financial. By opting into our communications, you agree to the following terms:
                    </p>
                  </div>
                  <section className="sbf-legal-sec" aria-labelledby="consent-to-communications">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                        <span className="sbf-legal-sec-num">01</span>
                      </span>
                      <h2 id="consent-to-communications">Consent to Communications</h2>
                    </div>
                    <p>
                      You hereby consent to receive communication from our company through emails, autodialed
                      and/or pre-recorded telemarketing calls, AI calls, and text messages (including SMS and
                      MMS) from or on behalf of Spectrum Financial and our affiliated partners at the
                      telephone number provided, including your wireless number, if applicable.
                    </p>
                    <p className="sbf-legal-note">You understand that consent is not a condition of purchase.</p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="frequency-of-messages">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-clock" /></svg>
                        <span className="sbf-legal-sec-num">02</span>
                      </span>
                      <h2 id="frequency-of-messages">Frequency of Messages</h2>
                    </div>
                    <p>
                      You acknowledge that the frequency of messages from Spectrum Financial may vary.
                      Standard message and data rates may apply to text messages.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="third-party-communication">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-user" /></svg>
                        <span className="sbf-legal-sec-num">03</span>
                      </span>
                      <h2 id="third-party-communication">Third-Party Communication</h2>
                    </div>
                    <p>
                      You agree that Spectrum Financial and its trusted partners may contact you for
                      marketing, promotional, and other purposes related to the services or products you have
                      expressed interest in or that we believe may be of interest to you.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="opt-out-option">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-x" /></svg>
                        <span className="sbf-legal-sec-num">04</span>
                      </span>
                      <h2 id="opt-out-option">Opt-Out Option</h2>
                    </div>
                    <p>
                      You understand that you can withdraw your consent at any time by replying STOP to any
                      text message or by contacting us at
                      {" "}
                      <a href="mailto:compliance@spectrumbusinessfinance.com">compliance@spectrumbusinessfinance.com</a>
                      {" "}
                      or
                      {" "}
                      <a href="tel:18002147498">1-800-214-7498</a>
                      . For assistance, you can reply HELP.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="privacy-policy">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                        <span className="sbf-legal-sec-num">05</span>
                      </span>
                      <h2 id="privacy-policy">Privacy Policy</h2>
                    </div>
                    <p>
                      Your information will be used in accordance with our Privacy Policy, which explains how
                      we collect, use, and protect your data, as well as how we share it with trusted third
                      parties. Please review our
                      {" "}
                      <Link href="/privacy-policy">Privacy Policy</Link>
                      {" "}
                      for more information.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="changes-to-terms">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-doc" /></svg>
                        <span className="sbf-legal-sec-num">06</span>
                      </span>
                      <h2 id="changes-to-terms">Changes to Terms</h2>
                    </div>
                    <p>
                      We reserve the right to amend these terms at any time. Your continued participation in
                      our communications program following any changes signifies your acceptance of those
                      changes.
                    </p>
                  </section>
                </article>
                <div className="sbf-legal-help">
                  <div>
                    <strong>Questions about this page?</strong>
                    {" "}
                    <span>
                      Contact our Compliance Officer at
                      {" "}
                      <a href="mailto:compliance@spectrumbusinessfinance.com" style={{ color: "var(--sbf-gold-300)" }}>
                        compliance@spectrumbusinessfinance.com
                      </a>
                    </span>
                  </div>
                  <div className="sbf-legal-help-actions">
                    <a href="tel:18002147498" className="btn sbf-btn sbf-btn-gold">
                      <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                      {" "}
                      1-800-214-7498
                    </a>
                  </div>
                </div>
                <nav className="sbf-legal-related" aria-label="Related pages">
                  <Link href="/privacy-policy">
                    {" "}
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                    {" "}
                    <span>
                      <small>Legal</small>
                      <strong>Privacy Policy</strong>
                    </span>
                    {" "}
                    <svg className="sbf-icon sbf-legal-rel-arrow"><use href="#sbf-i-arrow" /></svg>
                    {" "}
                  </Link>
                  {" "}
                  <Link href="/disclaimer">
                    {" "}
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-doc" /></svg></span>
                    {" "}
                    <span>
                      <small>Legal</small>
                      <strong>Website Disclaimer</strong>
                    </span>
                    {" "}
                    <svg className="sbf-icon sbf-legal-rel-arrow"><use href="#sbf-i-arrow" /></svg>
                    {" "}
                  </Link>
                  {" "}
                  <Link href="/apply-now">
                    {" "}
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg></span>
                    {" "}
                    <span>
                      <small>Get started</small>
                      <strong>Apply Now</strong>
                    </span>
                    {" "}
                    <svg className="sbf-icon sbf-legal-rel-arrow"><use href="#sbf-i-arrow" /></svg>
                    {" "}
                  </Link>
                </nav>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
