import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { ReviewsSection } from '@/components/ReviewSections';
import { StoryproofWidget } from '@/components/StoryproofWidget';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/testimonials",
  title: "Client Testimonials & Reviews | Spectrum Financial",
  description: "Read testimonials from business owners Spectrum Financial has funded with working capital, equipment financing and business loans over the past 20 years.",
  image: "/img/bg-preapproved.jpg",
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
      "@id": "https://spectrumbusinessloans.com/testimonials#webpage",
      "url": "https://spectrumbusinessloans.com/testimonials",
      "name": "Client Testimonials & Reviews | Spectrum Financial",
      "description": "Read testimonials from business owners Spectrum Financial has funded with working capital, equipment financing and business loans over the past 20 years.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/testimonials#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/testimonials#breadcrumb",
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
          "name": "Testimonials",
          "item": "https://spectrumbusinessloans.com/testimonials"
        }
      ]
    }
  ]
};

export default function TestimonialsPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <main>
        {/* ============ HERO ============ */}
        <section className="sbf-hero sbf-svc-hero">
          <div className="sbf-hero-media">
            <div className="sbf-hero-media-bg" style={{ backgroundImage: "url('/img/bg-preapproved.jpg')" }} />
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
                  <span aria-current="page">Testimonials</span>
                </nav>
                <span className="sbf-pill">
                  {" "}
                  <span className="sbf-pill-dot" />
                  {" "}
                  Client Testimonials · Real Business Owners
                  {" "}
                </span>
                <h1 className="sbf-hero-title">
                  What our clients say about
                  {" "}
                  <em>working with us.</em>
                </h1>
                <p className="sbf-hero-lead mx-auto" style={{ maxWidth: "700px" }}>
                  For 20 years, we have been helping businesses of all sizes across the nation secure the
                  business financing they need. Here&apos;s what some of them have to say.
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
                <div className="sbf-tm-hero-avatars">
                  <div className="sbf-avatar-stack">
                    <Image src="/img/testi-rudy.jpg" alt="Rudy S." width="36" height="36" loading="eager" />
                    {" "}
                    <Image src="/img/testi-greg.jpg" alt="Greg P." width="36" height="36" loading="eager" />
                    {" "}
                    <Image src="/img/testi-butch.jpg" alt="Butch H." width="36" height="36" loading="eager" />
                    {" "}
                    <Image src="/img/testi-david.jpg" alt="Dr. David S." width="36" height="36" loading="eager" />
                  </div>
                  <span>Trusted by business owners nationwide</span>
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
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-user" /></svg></span>
                    {" "}
                    <span className="sbf-stat-num">
                      <small>~</small>
                      <span data-sbf-count="80">80</span>
                      <small>%</small>
                    </span>
                    {" "}
                    <span className="sbf-stat-label">Of funded clients return</span>
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
        {/* ============ REVIEW GRID ============ */}
        <section className="sbf-section sbf-review-grid" id="review-grid">
          <div className="container">
            <div className="sbf-section-head text-center" data-sbf-reveal="">
              <span className="sbf-eyebrow">In Their Own Words</span>
              <h2 className="sbf-title">Stories from the businesses we&apos;ve funded</h2>
              <p className="sbf-text sbf-text-narrow mx-auto">
                From distributors and contractors to medical practices, here&apos;s what business owners say
                about working with Spectrum Financial.
              </p>
            </div>
            <div className="sbf-review-grid-widget" data-sbf-reveal="" data-sbf-delay="100">
              <StoryproofWidget widgetId="6afab4c431fe707090371321" />
            </div>
          </div>
        </section>
        {/* ============ WHY CLIENTS COME BACK ============ */}
        <section className="sbf-section sbf-tm-why">
          <div className="container">
            <div className="row align-items-end g-4 sbf-section-head">
              <div className="col-lg-6" data-sbf-reveal="">
                <span className="sbf-eyebrow">Why Clients Come Back</span>
                <h2 className="sbf-title mb-0">What business owners value most</h2>
              </div>
              <div className="col-lg-5 offset-lg-1" data-sbf-reveal="" data-sbf-delay="100">
                <p className="sbf-text mb-0">
                  The same three things come up again and again in our clients&apos; feedback — and
                  they&apos;re why nearly 80% of the businesses we fund return for repeat loans.
                </p>
              </div>
            </div>
            <div className="row g-4">
              <div className="col-md-4" data-sbf-reveal="">
                <div className="sbf-tm-why-card">
                  <span className="sbf-tm-why-icon"><svg className="sbf-icon"><use href="#sbf-i-doc" /></svg></span>
                  <h3 className="sbf-tm-why-title">A simple process</h3>
                  <p>
                    No tax returns or financial statements — just one simple application and a decision
                    immediately.
                  </p>
                  <q>This was a very simple process and the professionalism was top notch.</q>
                  {" "}
                  <span className="sbf-tm-why-by">— Garry P.</span>
                </div>
              </div>
              <div className="col-md-4" data-sbf-reveal="" data-sbf-delay="100">
                <div className="sbf-tm-why-card">
                  <span className="sbf-tm-why-icon"><svg className="sbf-icon"><use href="#sbf-i-bolt" /></svg></span>
                  <h3 className="sbf-tm-why-title">A fast, flexible response</h3>
                  <p>
                    Funding is often in place within 24 hours, structured around what your business actually
                    needs.
                  </p>
                  <q>We were very impressed with the flexibility and quick response.</q>
                  {" "}
                  <span className="sbf-tm-why-by">— Butch H.</span>
                </div>
              </div>
              <div className="col-md-4" data-sbf-reveal="" data-sbf-delay="200">
                <div className="sbf-tm-why-card">
                  <span className="sbf-tm-why-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                  <h3 className="sbf-tm-why-title">A team that delivers</h3>
                  <p>
                    A dedicated specialist who learns your business and stays your financing partner for the
                    long term.
                  </p>
                  <q>You delivered exactly what you said you would and that goes a long way for us.</q>
                  {" "}
                  <span className="sbf-tm-why-by">— Rudy S.</span>
                </div>
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
        {/* ============ FINAL CTA ============ */}
        <section className="sbf-cta sbf-grain">
          <div className="sbf-parallax-bg" data-sbf-parallax="0.25" style={{ backgroundImage: "url('/img/bg-cta.jpg')" }} aria-hidden="true" />
          <div className="sbf-parallax-overlay sbf-parallax-overlay--cta" aria-hidden="true" />
          <div className="container position-relative">
            <div className="sbf-cta-inner" data-sbf-reveal="">
              <h2 className="sbf-cta-title">Experience the Spectrum Financial difference.</h2>
              <p className="sbf-cta-text">
                Business Lines of Credit, Unsecured Working Capital Loans and Equipment Loans / Leases —
                reliable, customized business financing for businesses nationwide.
              </p>
              <div className="sbf-hero-actions justify-content-center">
                <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-btn-lg">
                  Apply Now
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                </Link>
                {" "}
                <Link href="/quote-request" className="btn sbf-btn sbf-btn-glass sbf-btn-lg">Contact Us</Link>
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
