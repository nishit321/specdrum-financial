import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { ApplyForm } from '@/components/apply/ApplyForm';
import { StoryproofWidget } from '@/components/StoryproofWidget';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/apply-now",
  title: "Apply Now for Business Funding | Spectrum Financial",
  socialTitle: "Apply for Business Funding | Spectrum Financial",
  description: "Apply online for business financing with Spectrum Financial. A secure 4-step application with a soft credit review and approvals within 24 hours.",
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
      "@type": "WebPage",
      "@id": "https://spectrumbusinessloans.com/apply-now#webpage",
      "url": "https://spectrumbusinessloans.com/apply-now",
      "name": "Apply Now for Business Funding | Spectrum Financial",
      "description": "Apply online for business financing with Spectrum Financial. A secure 4-step application with a soft credit review and approvals within 24 hours.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/apply-now#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/apply-now#breadcrumb",
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
          "name": "Apply Now",
          "item": "https://spectrumbusinessloans.com/apply-now"
        }
      ]
    }
  ]
};

export default function ApplyNowPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* ============ HERO ============ */}
        <section className="sbf-hero" style={{ padding: "64px 0 104px" }}>
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
              <div className="col-lg-8 mx-auto text-center" data-sbf-reveal="">
                <span className="sbf-pill">
                  {" "}
                  <span className="sbf-pill-dot" />
                  {" "}
                  Fast 24-Hour Digital Application
                  {" "}
                </span>
                <h1 className="sbf-hero-title">
                  Apply for business funding
                  {" "}
                  <em>in 4 easy steps.</em>
                </h1>
                <ul className="sbf-hero-trust justify-content-center" style={{ marginTop: "28px" }}>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    Funding within 24 hrs
                  </li>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    Over 80% approval rate
                  </li>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    256-Bit SSL Encrypted
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        {/* ============ MULTI-STEP APPLICATION ============ */}
        <section className="sbf-app-section sbf-app-section--overlap">
          <div className="container">
            <div className="sbf-app-card">
              {/* Top info strip */}
              <div className="sbf-app-header-strip">
                <ul className="sbf-app-assure">
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                    {" "}
                    256-Bit Bank-Grade SSL
                  </li>
                  <li>
                    <svg className="sbf-icon"><use href="#sbf-i-check" /></svg>
                    {" "}
                    No hard credit pull
                  </li>
                </ul>
                <a className="sbf-app-help" href="tel:18002147498">
                  <span>Need help?</span>
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                  {" "}
                  (800) 214-7498
                </a>
              </div>
              {/* Progress Step Indicator */}
              <ApplyForm />
              {/* Footer credit */}
              <div className="sbf-app-card-footer">
                Powered by SmartyApp · Secured by Spectrum Financial Underwriting Network
              </div>
            </div>
          </div>
        </section>
        {/* ============ TESTIMONIALS / CLIENT STORIES ============ */}
        <section className="sbf-section sbf-testimonials sbf-testimonials--apply" id="testimonials">
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
      </main>
    </>
  );
}
