import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { ReviewsSection } from '@/components/ReviewSections';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/disclaimer",
  title: "Website Disclaimer & Terms of Use | Spectrum Financial",
  description: "Terms of use for the Spectrum Financial website, including governing law, limitation of liability and how information collected on this site is used.",
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
      "@id": "https://spectrumbusinessloans.com/disclaimer#webpage",
      "url": "https://spectrumbusinessloans.com/disclaimer",
      "name": "Website Disclaimer & Terms of Use | Spectrum Financial",
      "description": "Terms of use for the Spectrum Financial website, including governing law, limitation of liability and how information collected on this site is used.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/disclaimer#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/disclaimer#breadcrumb",
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
          "name": "Disclaimer",
          "item": "https://spectrumbusinessloans.com/disclaimer"
        }
      ]
    }
  ]
};

export default function DisclaimerPage() {
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
                  <span aria-current="page">Disclaimer</span>
                </nav>
                <span className="sbf-pill">
                  <span className="sbf-pill-dot" />
                  {" "}
                  Legal · Website Terms of Use
                </span>
                <h1 className="sbf-hero-title">
                  Website
                  {" "}
                  <em>Disclaimer</em>
                </h1>
                <p className="sbf-hero-lead mx-auto" style={{ maxWidth: "680px" }}>
                  Please read these terms carefully. By accessing our pages, you agree to the terms of this
                  agreement.
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
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-pin" /></svg></span>
                    <div>
                      <strong>California law</strong>
                      <span>Governs any disputes.</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                    <div>
                      <strong>Orange County, CA</strong>
                      <span>Venue for California State Courts.</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-clock" /></svg></span>
                    <div>
                      <strong>Subject to change</strong>
                      <span>Offers &amp; info may change without notice.</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-user" /></svg></span>
                    <div>
                      <strong>Your information</strong>
                      <span>May be used for direct communication.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ DISCLAIMER ============ */}
        <section className="sbf-section sbf-legal">
          <div className="container">
            <div className="row">
              <div className="col-lg-11 mx-auto">
                <article className="sbf-legal-doc">
                  <div className="sbf-legal-meta">
                    <span className="sbf-legal-badge">
                      <svg className="sbf-icon"><use href="#sbf-i-doc" /></svg>
                      {" "}
                      Terms of Use
                    </span>
                    {" "}
                    <span className="sbf-legal-badge">
                      <svg className="sbf-icon"><use href="#sbf-i-pin" /></svg>
                      {" "}
                      Governed by the laws of the State of California
                    </span>
                  </div>
                  <div className="sbf-legal-intro">
                    <span className="sbf-legal-intro-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                    <p>This website is operated by Tri-Cities Consulting LLC, doing business as Spectrum Financial.</p>
                  </div>
                  <section className="sbf-legal-sec" aria-labelledby="terms-of-access">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-doc" /></svg>
                        <span className="sbf-legal-sec-num">01</span>
                      </span>
                      <h2 id="terms-of-access">Terms of access</h2>
                    </div>
                    <p>
                      Welcome to our website. Permission to access this information is restricted to people
                      who accept the terms of this agreement; By accessing our pages, you agree
                    </p>
                    <ol className="sbf-legal-terms">
                      <li>
                        <span className="sbf-legal-term-num" aria-hidden="true">01</span>
                        <span className="sbf-legal-term-icon" aria-hidden="true">
                          <svg className="sbf-icon"><use href="#sbf-i-pin" /></svg>
                        </span>
                        <span className="sbf-legal-term-title">Governing law</span>
                        that any disputes arising from your accessing our pages, or relating to the
                        information contained in our pages, shall be governed exclusively by the procedural
                        and substantive laws of the State of California;
                      </li>
                      <li>
                        <span className="sbf-legal-term-num" aria-hidden="true">02</span>
                        <span className="sbf-legal-term-icon" aria-hidden="true">
                          <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                        </span>
                        <span className="sbf-legal-term-title">Where disputes are heard</span>
                        that any litigation arising through your accessing our pages, or relating to the
                        information contained in our pages, shall be brought exclusively in the United States
                        District with jurisdiction in Southern California or in the California State Courts
                        located in Orange County, California; and
                      </li>
                      <li>
                        <span className="sbf-legal-term-num" aria-hidden="true">03</span>
                        <span className="sbf-legal-term-icon" aria-hidden="true">
                          <svg className="sbf-icon"><use href="#sbf-i-cash" /></svg>
                        </span>
                        <span className="sbf-legal-term-title">Legal fees</span>
                        that in the event of any such litigation, the prevailing party shall be entitled to
                        collect its reasonable attorney’s fees and litigation expenses, from the
                        non-prevailing party.
                      </li>
                    </ol>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="limitation-of-liability">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                        <span className="sbf-legal-sec-num">02</span>
                      </span>
                      <h2 id="limitation-of-liability">Limitation of liability</h2>
                    </div>
                    <p>
                      In no event will Spectrum Financial and its owners, officers, board members, employees
                      and investors be liable to any party for any claim attributable to errors, omissions, or
                      other inaccuracies in the materials or information available on or through our website
                      pages. Any offer or information found on this website is subject to changes, errors or
                      omissions without notice.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="use-of-information">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-user" /></svg>
                        <span className="sbf-legal-sec-num">03</span>
                      </span>
                      <h2 id="use-of-information">Use of information</h2>
                    </div>
                    <p className="sbf-legal-note">
                      Please note any information collected via this website may be utilized by Spectrum
                      Financial for direct communication including sales, customer service, customer support
                      and other topics including marketing matters.
                    </p>
                    <p>
                      For details on how we collect, use and protect your information, please read our
                      {" "}
                      <Link href="/privacy-policy">Privacy Policy</Link>
                      .
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
                  <Link href="/quote-request">
                    {" "}
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-mail" /></svg></span>
                    {" "}
                    <span>
                      <small>Get in touch</small>
                      <strong>Request a Quote</strong>
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
        {/* ============ REVIEWS WIDGET ============ */}
        <ReviewsSection />
      </main>
    </>
  );
}
