import type { Metadata } from 'next';
import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { ReviewsSection } from '@/components/ReviewSections';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  path: "/privacy-policy",
  title: "Privacy Policy | Spectrum Financial",
  description: "Read Spectrum Financial's privacy policy: what information we collect, how we use, share and protect it, and your California (CCPA) privacy rights.",
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
      "@id": "https://spectrumbusinessloans.com/privacy-policy#webpage",
      "url": "https://spectrumbusinessloans.com/privacy-policy",
      "name": "Privacy Policy | Spectrum Financial",
      "description": "Read Spectrum Financial's privacy policy: what information we collect, how we use, share and protect it, and your California (CCPA) privacy rights.",
      "isPartOf": {
        "@type": "WebSite",
        "name": "Spectrum Financial",
        "url": "https://spectrumbusinessloans.com/"
      },
      "about": {
        "@id": "https://spectrumbusinessloans.com/#organization"
      },
      "breadcrumb": {
        "@id": "https://spectrumbusinessloans.com/privacy-policy#breadcrumb"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://spectrumbusinessloans.com/privacy-policy#breadcrumb",
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
          "name": "Privacy Policy",
          "item": "https://spectrumbusinessloans.com/privacy-policy"
        }
      ]
    }
  ]
};

export default function PrivacyPolicyPage() {
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
          <svg className="sbf-legal-hero-icon" aria-hidden="true"><use href="#sbf-i-shield" /></svg>
          <div className="container position-relative">
            <div className="row">
              <div className="col-lg-9 col-xl-8 mx-auto text-center" data-sbf-reveal="">
                <nav className="sbf-breadcrumb" aria-label="Breadcrumb">
                  <Link href="/">Home</Link>
                  {" "}
                  <svg className="sbf-icon"><use href="#sbf-i-chevron" /></svg>
                  {" "}
                  <span aria-current="page">Privacy Policy</span>
                </nav>
                <span className="sbf-pill">
                  <span className="sbf-pill-dot" />
                  {" "}
                  Legal · Your Privacy Matters
                </span>
                <h1 className="sbf-hero-title">
                  Privacy
                  {" "}
                  <em>Policy</em>
                </h1>
                <p className="sbf-hero-lead mx-auto" style={{ maxWidth: "680px" }}>
                  How Spectrum Financial collects, uses, shares and protects your information — and the
                  privacy rights and choices available to you.
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
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-shield" /></svg></span>
                    <div>
                      <strong>We don’t sell your data</strong>
                      <span>We do not sell personal information.</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-lock" /></svg></span>
                    <div>
                      <strong>Safeguarded</strong>
                      <span>Physical, electronic &amp; procedural measures.</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-user" /></svg></span>
                    <div>
                      <strong>Your CCPA rights</strong>
                      <span>Information, access &amp; deletion.</span>
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 col-xl-3">
                  <div className="sbf-legal-hl">
                    <span className="sbf-stat-icon"><svg className="sbf-icon"><use href="#sbf-i-mail" /></svg></span>
                    <div>
                      <strong>Questions?</strong>
                      <span>
                        <a href="mailto:compliance@spectrumbusinessfinance.com">compliance@spectrumbusinessfinance.com</a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ============ POLICY ============ */}
        <section className="sbf-section sbf-legal">
          <div className="container">
            <div className="row g-3">
              <div className="col-xl-3">
                <nav className="sbf-legal-toc" aria-label="Privacy policy sections">
                  <details className="sbf-legal-toc-details" open>
                    <summary className="sbf-legal-toc-title">
                      On this page
                      {" "}
                      <svg className="sbf-icon sbf-legal-toc-chev" aria-hidden="true"><use href="#sbf-i-chevron" /></svg>
                    </summary>
                    <ol>
                      <li><a href="#consumer-privacy-disclosure">Consumer Privacy Disclosure</a></li>
                      <li><a href="#information-we-collect">Information We Collect</a></li>
                      <li><a href="#how-we-collect-information">How We Collect Information</a></li>
                      <li><a href="#how-we-use-information">How We Use Information</a></li>
                      <li><a href="#who-do-we-share-your-information-with">Who Do We Share Your Information With?</a></li>
                      <li><a href="#cookies-and-do-not-track">Cookies and Do Not Track</a></li>
                      <li><a href="#marketing-and-communications">Marketing and Communications</a></li>
                      <li>
                        <a href="#updating-and-accessing-your-information">Updating and Accessing Your Information</a>
                      </li>
                      <li><a href="#how-we-protect-your-information">How We Protect Your Information</a></li>
                      <li><a href="#changes-to-this-privacy-policy">Changes to this Privacy Policy</a></li>
                      <li>
                        <a href="#visiting-our-websites-from-outside-the-united-states">
                          Visiting our Websites From Outside the United States
                        </a>
                      </li>
                      <li>
                        <a href="#compliance-with-children-s-online-privacy-protection-rule">
                          Compliance with Children’s Online Privacy Protection Rule
                        </a>
                      </li>
                      <li><a href="#spectrum-financial-chatbot-disclosure">Spectrum Financial ChatBot Disclosure</a></li>
                      <li><a href="#online-tracking-opt-out-guide">Online Tracking Opt-Out Guide</a></li>
                      <li><a href="#how-to-contact-us">How to Contact Us</a></li>
                      <li><a href="#notice-to-california-residents">Notice to California Residents</a></li>
                      <li className="is-sub"><a href="#ccpa-scope-and-exclusions">CCPA Scope and Exclusions</a></li>
                      <li className="is-sub"><a href="#privacy-practices">Privacy Practices</a></li>
                      <li className="is-sub"><a href="#privacy-rights">Privacy Rights</a></li>
                      <li className="is-sub"><a href="#how-to-submit-a-request">How to Submit a Request</a></li>
                    </ol>
                  </details>
                  <div className="sbf-legal-toc-foot">
                    <span className="sbf-legal-toc-foot-icon">
                      <svg className="sbf-icon"><use href="#sbf-i-mail" /></svg>
                    </span>
                    {" "}
                    <span>
                      <small>Privacy questions?</small>
                      <a href="mailto:compliance@spectrumbusinessfinance.com">
                        Email us
                        {" "}
                        <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                      </a>
                    </span>
                  </div>
                </nav>
              </div>
              <div className="col-xl-9">
                <article className="sbf-legal-doc">
                  <div className="sbf-legal-meta">
                    <span className="sbf-legal-badge">
                      <svg className="sbf-icon"><use href="#sbf-i-clock" /></svg>
                      {" "}
                      Last Updated and Effective: 5/1/2023
                    </span>
                    {" "}
                    <span className="sbf-legal-badge">
                      <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                      {" "}
                      We do not sell personal information
                    </span>
                  </div>
                  <div className="sbf-legal-intro">
                    <span className="sbf-legal-intro-icon"><svg className="sbf-icon"><use href="#sbf-i-pin" /></svg></span>
                    <p>
                      This website is operated by Tri-Cities Consulting LLC, doing business as Spectrum Financial. Notice to California Residents (
                      <a href="#notice-to-california-residents">Click here</a>
                      {" "}
                      to learn more about your California Privacy Rights and for our Notice of Collection of
                      Personal Information).
                    </p>
                  </div>
                  <section className="sbf-legal-sec" aria-labelledby="consumer-privacy-disclosure">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-shield" /></svg>
                        <span className="sbf-legal-sec-num">01</span>
                      </span>
                      <h2 id="consumer-privacy-disclosure">Consumer Privacy Disclosure</h2>
                    </div>
                    <p>
                      You are visiting a website owned and operated by Spectrum Financial. Spectrum Financial
                      and its subsidiaries (collectively, “Spectrum Financial”, “us”, “we”, or “our”) are
                      committed to maintaining your confidence and trust as it relates to the privacy and
                      usage of your information. Please read below and learn how we collect, protect, share,
                      and use your information as part of our technology platforms, and all of our products
                      and services.
                    </p>
                    <p>
                      This privacy policy applies to www.spectrumbusinessloans.com and all websites and
                      mobile apps owned and operated by Spectrum Financial on which this privacy policy is
                      displayed (such websites and apps referred to hereafter as the “Website(s)” or
                      “Site(s)”, whether individually or collectively, or collectively as “Services”) as well
                      as Spectrum Financial affiliates.
                    </p>
                    <p>
                      Spectrum Financial’s commercial loan Websites are designed for businesses and are not
                      intended for individuals’ personal, family or household use. Accordingly, we treat all
                      personal information collected for commercial loan products, including information about
                      any visitors to our commercial loan Websites, as pertaining to individuals acting as
                      business representatives, rather than in their personal capacity.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="information-we-collect">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-doc" /></svg>
                        <span className="sbf-legal-sec-num">02</span>
                      </span>
                      <h2 id="information-we-collect">Information We Collect</h2>
                    </div>
                    <ol>
                      <li>
                        Identifying Information: We collect information that could identify you such as your
                        name, address, telephone number, mobile number, email address, and Social Security
                        Number. We may also collect this type of information from you about others, such as
                        co-borrowers.
                      </li>
                      <li>
                        Financial Information: We may also collect your credit history, credit scores, your
                        transaction history, and credit products, rates, and payments in the course of
                        processing any application for our financial company partners’ products or services.
                        For additional information relating to your choices about financial information
                        specifically, see our
                        {" "}
                        <a href="#consumer-privacy-disclosure">Consumer Privacy Disclosure</a>
                        .
                      </li>
                      <li>
                        Other Information: We also collect information such as demographic data, data about
                        your online activity, and other information that is not used to identify you.
                      </li>
                    </ol>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="how-we-collect-information">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-chart" /></svg>
                        <span className="sbf-legal-sec-num">03</span>
                      </span>
                      <h2 id="how-we-collect-information">How We Collect Information</h2>
                    </div>
                    <ol>
                      <li>
                        Information provided by you: We collect information from you when you enter it or
                        otherwise provide it in connection with an inquiry into our Services. This information
                        could be provided via an online form, over the phone, or via other means in which you
                        interact with our Services.
                      </li>
                      <li>
                        Information from third parties: Information is collected from credit bureaus, lead
                        generators and other partners who may have data on your financial profile, home, or
                        other demographic information.
                      </li>
                      <li>
                        Information from cookies and other tracking technologies: We use cookies, web beacons,
                        and similar technologies to record your preferences, track the use of our Site and
                        collect information. This information may include internet protocol (IP) addresses,
                        browser type, internet service provider (ISP), referring/exit pages, operating system,
                        date/time stamp, and/or clickstream data. We may combine this automatically collected
                        log information with other information we collect about you. You may choose to set
                        your web browser to refuse cookies, or to alert you when cookies are being sent. If
                        you do so, please note that some parts of our Sites may not function properly.
                      </li>
                    </ol>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="how-we-use-information">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-gear" /></svg>
                        <span className="sbf-legal-sec-num">04</span>
                      </span>
                      <h2 id="how-we-use-information">How We Use Information</h2>
                    </div>
                    <p>We may use collected information to:</p>
                    <ol>
                      <li>Deliver the products and services you requested</li>
                      <li>Improve customer service</li>
                      <li>Improve our Site</li>
                      <li>Personalize your user experience</li>
                      <li>Communicate with you about products or services that may be of interest to you</li>
                      <li>Manage our business</li>
                    </ol>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="who-do-we-share-your-information-with">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-user" /></svg>
                        <span className="sbf-legal-sec-num">05</span>
                      </span>
                      <h2 id="who-do-we-share-your-information-with">Who Do We Share Your Information With?</h2>
                    </div>
                    <p>
                      Spectrum Financial Affiliates: We may share information about you or provided by you
                      with the Spectrum Financial affiliates.
                    </p>
                    <p>
                      Network Partners: When you submit an inquiry or use another Service provided through the
                      Website, you direct Spectrum Financial to share information about you or provided by you
                      with lenders and other third parties in our network to deliver the products and services
                      you request (collectively, “Network Partners”).
                      {" "}
                      <strong>PLEASE NOTE:</strong>
                      {" "}
                      The Network Partners that interact with you may retain or use your information whether
                      or not you use their services, and their privacy and information sharing practices are
                      set forth in their respective privacy policies. Pursuant to the contracts between
                      Spectrum Financial and its Network Partners, if you select a Network Partner through our
                      Services, Spectrum Financial may also receive information about you from that Network
                      Partner including, but not limited to, the amount or disposition of your Loan. Spectrum
                      Financial and its Network Partners may exchange information about you, your loan terms,
                      and your accounts for the purpose of providing you with information about financial
                      services and products. Spectrum Financial may maintain this information to assist with
                      litigation, regulatory request(s), law enforcement requests, internal analytics,
                      marketing purposes, and any other legally permissible purpose.
                    </p>
                    <p>
                      Financial Companies: We may also share information about you with other Financial
                      Companies with whom we engage in joint marketing efforts, or who offer financial related
                      products or services that you may be interested in. These companies’ privacy and
                      information sharing practices are set forth in their respective privacy policies.
                    </p>
                    <p>
                      Other Business Partners: We also may share information about you with other business
                      partners who offer products and services that we believe you may be interested in. Their
                      privacy and information sharing practices are set forth in their respective privacy
                      policies.
                    </p>
                    <p>
                      Spectrum Financial Service Providers: We may share information with Service Providers
                      that perform certain services on our behalf including, but not limited to, credit
                      bureaus, marketing partners, or entities providing business analysis and/or Website or
                      product support.
                    </p>
                    <p>
                      Other Situations: We may also disclose information about you or provided by you at our
                      sole discretion:
                    </p>
                    <ol>
                      <li>
                        In response to a subpoena or similar investigative demand, a court order, a request
                        for cooperation from a law enforcement agency, self-regulatory body, or other
                        governmental agency; to establish or exercise our legal rights; to defend against
                        legal claims; or as we reasonably believe is required by law. In such cases, we may
                        raise or waive any legal objection or right available to us.
                      </li>
                      <li>
                        When we believe disclosure is appropriate in order to investigate, prevent, or take
                        action regarding actual or suspected illegal activity or other wrongdoing; to protect
                        and defend the rights, property, or safety of the Spectrum Financial business, our
                        users, our employees, or others; or to enforce our Site’s terms and conditions or
                        other agreements or policies.
                      </li>
                      <li>
                        In connection with a substantial corporate transaction involving the Spectrum
                        Financial business, such as a sale of Spectrum Financial or any entity, brand or
                        division thereof, a divestiture, merger, consolidation, asset sale, or bankruptcy.
                      </li>
                      <li>
                        In connection with state and/or federal licensing requirements regarding the reporting
                        of information contained in the loan inquiries we receive from you. You authorize
                        Spectrum Financial to obtain any and all required information from the entities with
                        whom you have interacted with in connection with Spectrum Financial in order for
                        Spectrum Financial to comply with current laws and regulations as well as with any
                        requests from state or federal regulators. This information could include, but is not
                        necessarily limited to, the loan you selected and the terms of the loan you selected.
                      </li>
                      <li>
                        We may share information with third parties that is not personally identifying, such
                        as aggregated or anonymized data, in our discretion, where not prohibited by law.
                      </li>
                    </ol>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="cookies-and-do-not-track">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-card" /></svg>
                        <span className="sbf-legal-sec-num">06</span>
                      </span>
                      <h2 id="cookies-and-do-not-track">Cookies and Do Not Track</h2>
                    </div>
                    <ol>
                      <li>
                        We may use cookies and other technologies such as web beacons and pixels to collect
                        information about your online activities over time and across third-party websites or
                        online services or which may allow a third party to track your online activities over
                        time and across different sites when you use the Websites.
                      </li>
                      <li>
                        The Websites may not respond to Do Not Track requests or headers from some or all
                        browsers.
                      </li>
                    </ol>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="marketing-and-communications">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-mail" /></svg>
                        <span className="sbf-legal-sec-num">07</span>
                      </span>
                      <h2 id="marketing-and-communications">Marketing and Communications</h2>
                    </div>
                    <ol>
                      <li>
                        Communications: You may adjust your communications preferences through your My
                        Spectrum Financial profile. You may also modify your preferences by clicking on an
                        unsubscribe link at the bottom of certain emails sent from Spectrum Financial.
                      </li>
                      <li>
                        Advertising on third party sites: We may use third-party tracking technology. This
                        technology allows targeted advertisements to you from Spectrum Financial businesses.
                        Please review the “Online Tracking and Opt-Out Guide” section of this Policy below for
                        a detailed list of choices on how to opt out of ad targeting.
                      </li>
                    </ol>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="updating-and-accessing-your-information">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-wrench" /></svg>
                        <span className="sbf-legal-sec-num">08</span>
                      </span>
                      <h2 id="updating-and-accessing-your-information">Updating and Accessing Your Information</h2>
                    </div>
                    <p>
                      The appropriate method(s) for accessing your information, if any, will depend on which
                      Site or Services you have used. Depending on the respective Site or Service, you may
                      have the ability to view or edit some of your information online using the respective
                      Site or Service’s interface. If you have submitted a loan request through us, you can
                      update your information by contacting our Customer Care Department at
                      {" "}
                      <a href="mailto:compliance@spectrumbusinessfinance.com">compliance@spectrumbusinessfinance.com</a>
                      . Our address is 11021 Winners Cir #103, Los Alamitos CA 90720.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="how-we-protect-your-information">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-lock" /></svg>
                        <span className="sbf-legal-sec-num">09</span>
                      </span>
                      <h2 id="how-we-protect-your-information">How We Protect Your Information</h2>
                    </div>
                    <p>
                      We maintain physical, electronic, and procedural measures designed to safeguard your
                      information from unauthorized access and disclosure. No system can be completely secure.
                      Therefore, although we take steps to secure your information, we cannot guarantee that
                      your information, searches, or other communication will always remain secure.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="changes-to-this-privacy-policy">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-clock" /></svg>
                        <span className="sbf-legal-sec-num">10</span>
                      </span>
                      <h2 id="changes-to-this-privacy-policy">Changes to this Privacy Policy</h2>
                    </div>
                    <p>
                      Spectrum Financial has the discretion to update this privacy policy at any time. When we
                      do, we will revise the date at the top of this page. We encourage you to frequently
                      check this page for any changes to stay informed about how we are helping to protect the
                      information we collect. You acknowledge and agree that it is your responsibility to
                      review this privacy policy periodically and become aware of modifications.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="visiting-our-websites-from-outside-the-united-states">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-pin" /></svg>
                        <span className="sbf-legal-sec-num">11</span>
                      </span>
                      <h2 id="visiting-our-websites-from-outside-the-united-states">
                        Visiting our Websites From Outside the United States
                      </h2>
                    </div>
                    <p>
                      The Site is designed to provide services in the United States and is governed by the
                      laws of the United States. We make no representation that the Sites are governed by or
                      operated in accordance with the laws of any other nation.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="compliance-with-children-s-online-privacy-protection-rule">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-user" /></svg>
                        <span className="sbf-legal-sec-num">12</span>
                      </span>
                      <h2 id="compliance-with-children-s-online-privacy-protection-rule">
                        Compliance with Children’s Online Privacy Protection Rule
                      </h2>
                    </div>
                    <p>
                      Our Services are not intended for individuals under 18 years of age, and we do not
                      knowingly collect personal information from individuals under 18. If we learn we have
                      collected or received personal information from a person under 18 without verification
                      of parental consent, we will delete the information.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="spectrum-financial-chatbot-disclosure">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-quote" /></svg>
                        <span className="sbf-legal-sec-num">13</span>
                      </span>
                      <h2 id="spectrum-financial-chatbot-disclosure">Spectrum Financial ChatBot Disclosure</h2>
                    </div>
                    <p>
                      Our Spectrum Financial chat bot is enabled by Microsoft Bot Framework. The Microsoft Bot
                      Framework is a set of web-services that enable intelligent services and connections
                      using conversation channels you authorize. As a service provider, Microsoft will
                      transmit content you provide to our bot/service in order to enable the service. For more
                      information about Microsoft privacy policies please see their privacy statement here:
                      {" "}
                      <a target="_blank" rel="noopener" href="https://go.microsoft.com/fwlink/?LinkId=521839">
                        http://go.microsoft.com/fwlink/?LinkId=521839
                      </a>
                      . In addition, your interactions with this bot/service are also subject to the
                      conversational channel’s applicable terms of use, privacy and data collection policies.
                      To report abuse when using a bot that uses the Microsoft Bot Framework, please visit the
                      Microsoft Bot Framework website at
                      {" "}
                      <a target="_blank" rel="noopener" href="https://www.botframework.com/">
                        https://www.botframework.com
                      </a>
                      {" "}
                      and use the “Report Abuse” link in the menu to contact Microsoft.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="online-tracking-opt-out-guide">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-x" /></svg>
                        <span className="sbf-legal-sec-num">14</span>
                      </span>
                      <h2 id="online-tracking-opt-out-guide">Online Tracking Opt-Out Guide</h2>
                    </div>
                    <p>
                      Like many companies online, we use services provided by Google, Facebook and other
                      companies that use tracking technology. These services rely on tracking technologies –
                      such as cookies and web beacons – to collect directly from your device information about
                      your browsing activities, your interactions with websites, and the device you are using
                      to connect to the Internet. There are a number of ways to opt out of having your online
                      activity and device data collected through these services, which we have summarized
                      below:
                    </p>
                    <p>
                      <strong>
                        Blocking cookies in your browser.
                        {" "}
                      </strong>
                      {" "}
                      Most browsers let you remove or reject cookies, including cookies used for
                      interest-based advertising. To do this, follow the instructions in your browser
                      settings. Many browsers accept cookies by default until you change your settings. For
                      more information about cookies, including how to see what cookies have been set on your
                      device and how to manage and delete them, visit
                      {" "}
                      <a target="_blank" rel="noopener" href="https://allaboutcookies.org/">
                        https://allaboutcookies.org/
                      </a>
                      .
                    </p>
                    <p>
                      <strong>Blocking advertising ID use in your mobile settings.</strong>
                      {" "}
                      Your mobile device settings may provide functionality to limit use of the advertising ID
                      associated with your mobile device for interest-based advertising purposes.
                    </p>
                    <p>
                      <strong>Using privacy plug-ins or browsers.</strong>
                      {" "}
                      You can block our websites from setting cookies used for interest-based ads by using a
                      browser with privacy features, like Brave, or installing browser plugins like Privacy
                      Badger, Ghostery or uBlock Origin, and configuring them to block third-party
                      cookies/trackers.
                    </p>
                    <p>
                      <strong>Platform opt-outs.</strong>
                      {" "}
                      The following advertising partners offer opt-out features that let you opt-out of use of
                      your information for interest-based advertising:
                    </p>
                    <p>
                      Google:
                      {" "}
                      <a target="_blank" rel="noopener" href="https://adssettings.google.com/">
                        https://adssettings.google.com
                      </a>
                    </p>
                    <p>
                      Facebook:
                      {" "}
                      <a target="_blank" rel="noopener" href="https://www.facebook.com/about/ads">
                        https://www.facebook.com/about/ads
                      </a>
                    </p>
                    <p>
                      Twitter:
                      {" "}
                      <a target="_blank" rel="noopener" href="https://twitter.com/personalization">
                        https://twitter.com/personalization
                      </a>
                    </p>
                    <p>
                      Tik Tok:
                      {" "}
                      <a target="_blank" rel="noopener" href="https://ads.tiktok.com/marketing_api/docs?rid=pywkyi6r9g&amp;id=1688307494867970">
                        https://ads.tiktok.com/marketing_api/docs?rid=pywkyi6r9g&amp;id=1688307494867970
                      </a>
                    </p>
                    <p>
                      <strong>Advertising industry opt-out tools.</strong>
                      {" "}
                      You can also use these opt-out options to limit use of your information for
                      interest-based advertising by participating companies:
                    </p>
                    <p>
                      Digital Advertising Alliance:
                      {" "}
                      <a target="_blank" rel="noopener" href="https://optout.aboutads.info/?c=2&amp;lang=EN">
                        http://optout.aboutads.info
                      </a>
                    </p>
                    <p>
                      Network Advertising Initiative:
                      {" "}
                      <a target="_blank" rel="noopener" href="http://optout.networkadvertising.org/?c=1">
                        http://optout.networkadvertising.org/?c=1
                      </a>
                    </p>
                    <p>
                      Note that because these opt-out mechanisms are specific to the device or browser on
                      which they are exercised, you will need to opt out on every browser and device that you
                      use.
                    </p>
                  </section>
                  <section className="sbf-legal-sec" aria-labelledby="how-to-contact-us">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg>
                        <span className="sbf-legal-sec-num">15</span>
                      </span>
                      <h2 id="how-to-contact-us">How to Contact Us</h2>
                    </div>
                    <p>
                      If you have any questions about this privacy policy, the practices of any Spectrum
                      Financial Business, or your dealings with a Spectrum Financial Business, please contact
                      us at:
                    </p>
                    <address className="sbf-legal-address">
                      <strong>Compliance Officer</strong>
                      <br />
                      Spectrum Financial
                      <br />
                      11021 Winners Cir #103
                      <br />
                      Los Alamitos CA 90720
                    </address>
                    <p>or</p>
                    <p>
                      <a href="mailto:compliance@spectrumbusinessfinance.com">compliance@spectrumbusinessfinance.com</a>
                      {" "}
                      or at
                      {" "}
                      <a href="tel:18002147498">1-800-214-7498</a>
                    </p>
                  </section>
                  <section className="sbf-legal-sec sbf-legal-sec--ca" aria-labelledby="notice-to-california-residents">
                    <div className="sbf-legal-sec-head">
                      <span className="sbf-legal-sec-icon" aria-hidden="true">
                        <svg className="sbf-icon"><use href="#sbf-i-star" /></svg>
                        <span className="sbf-legal-sec-num">16</span>
                      </span>
                      <h2 id="notice-to-california-residents">Notice to California Residents</h2>
                    </div>
                    <p>
                      We are required by the California Consumer Privacy Act of 2018 (“
                      <strong>CCPA</strong>
                      ”) to provide this
                      {" "}
                      <strong>CCPA Notice</strong>
                      {" "}
                      to California residents to explain how we collect, use and share their personal
                      Information, and the rights and choices we offer California residents regarding our
                      handling of their personal information.
                    </p>
                    <h3 id="ccpa-scope-and-exclusions">CCPA Scope and Exclusions</h3>
                    <p>
                      This CCPA Notice, including the description of our Privacy Practices and your Privacy
                      Rights, apply only to California residents whose interactions with us are limited to:
                    </p>
                    <ol>
                      <li>Visiting our consumer websites,</li>
                      <li>Signing up for email alerts,</li>
                      <li>Commenting on or contributing to our blogs,</li>
                      <li>Establishing an account that does not include financial products or services, or</li>
                      <li>
                        Applying for our job openings on our websites (however, note that the CCPA limits some
                        of the privacy rights for job applicants).
                      </li>
                    </ol>
                    <p>
                      This CCPA Notice does not apply to the personal information we collect, use or disclose
                      about:
                    </p>
                    <ol>
                      <li>
                        Consumers who initiate or complete the process of applying for financial products or
                        services. This is because this information is subject to the federal
                        Gramm-Leach-Bliley Act (“GLBA”) and implementing regulations, or the California
                        Financial Information Privacy Act (“FIPA”), or Representatives of businesses that seek
                        to obtain our products or services, or to provide products or services to us. For
                        additional information relating to your choices about this information specifically,
                        see our
                        {" "}
                        <a href="#consumer-privacy-disclosure">Consumer Privacy Disclosure</a>
                        .
                      </li>
                    </ol>
                    <h3 id="privacy-practices">Privacy Practices</h3>
                    <p className="sbf-legal-note">
                      <strong>We do not sell personal information.</strong>
                      {" "}
                      As we explain in our Privacy Policy:
                    </p>
                    <p>
                      We use cookies and other tracking technologies to analyze website traffic and facilitate
                      advertising. If you would like to learn how you may opt out of our (and our third party
                      advertising partners’) use of cookies and other tracking technologies, please review the
                      instructions provided in the Online Tracking Opt-out Guide.
                    </p>
                    <div className="sbf-legal-table-wrap">
                      <div className="table-responsive">
                        <table className="table sbf-legal-table">
                          <caption className="visually-hidden">
                            Personal information we collect from California residents, its sources, purposes
                            and sharing
                          </caption>
                          <thead>
                            <tr>
                              <th scope="col">How you interact with us</th>
                              <th scope="col">Personal information collection</th>
                              <th scope="col">CCPA-defined categories</th>
                              <th scope="col">Sources of personal information</th>
                              <th scope="col">Purposes for which we may collect and use the personal information</th>
                              <th scope="col">Sharing</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td data-label="How you interact with us">
                                <ul>
                                  <li>Sign up for email alerts</li>
                                  <li>Interact with our blogs</li>
                                  <li>Establish an account</li>
                                </ul>
                              </td>
                              <td data-label="Personal information collection">
                                <ul>
                                  <li>Name or alias</li>
                                  <li>Email address</li>
                                </ul>
                              </td>
                              <td data-label="CCPA-defined categories">
                                <ul>
                                  <li>Identifiers</li>
                                  <li>Online identifiers</li>
                                </ul>
                              </td>
                              <td data-label="Sources of personal information"><ul><li>You</li></ul></td>
                              <td data-label="Purposes for which we may collect and use the personal information">
                                <ul>
                                  <li>Operations</li>
                                  <li>Communications</li>
                                  <li>Research and development</li>
                                  <li>Marketing</li>
                                </ul>
                              </td>
                              <td data-label="Sharing">
                                <ul>
                                  <li>Shared with service providers</li>
                                  <li>Made public at your direction</li>
                                </ul>
                              </td>
                            </tr>
                            <tr>
                              <td data-label="How you interact with us">
                                <ul>
                                  <li>Visit our websites</li>
                                  <li>Receive and respond to marketing emails</li>
                                </ul>
                              </td>
                              <td data-label="Personal information collection">
                                <ul>
                                  <li>Device data</li>
                                  <li>Online activity data</li>
                                  <li>Information derived from device data and online activity data</li>
                                </ul>
                              </td>
                              <td data-label="CCPA-defined categories">
                                <ul>
                                  <li>Identifiers</li>
                                  <li>Inferences</li>
                                  <li>Internet or Network Information</li>
                                  <li>Online identifiers</li>
                                </ul>
                              </td>
                              <td data-label="Sources of personal information"><ul><li>Automatic collection</li></ul></td>
                              <td data-label="Purposes for which we may collect and use the personal information">
                                <ul>
                                  <li>Operations</li>
                                  <li>Communications</li>
                                  <li>Marketing</li>
                                  <li>Advertising</li>
                                  <li>Research and development</li>
                                </ul>
                              </td>
                              <td data-label="Sharing">
                                <ul>
                                  <li>Collected directly by or shared with our service providers</li>
                                  <li>Collected directly by advertising partners</li>
                                </ul>
                              </td>
                            </tr>
                            <tr>
                              <td data-label="How you interact with us">
                                <ul><li>Apply for our open positions on our website</li></ul>
                              </td>
                              <td data-label="Personal information collection">
                                <ul>
                                  <li>Contact information</li>
                                  <li>Professional credentials and skills</li>
                                  <li>Educational and work history</li>
                                  <li>Other resume data you provide</li>
                                  <li>Diversity information you voluntarily provide</li>
                                  <li>Disability information where necessary</li>
                                </ul>
                              </td>
                              <td data-label="CCPA-defined categories">
                                <ul>
                                  <li>Identifiers</li>
                                  <li>Online identifiers</li>
                                  <li>Educational information</li>
                                  <li>Professional or employment information</li>
                                  <li>Protected classification characteristics</li>
                                </ul>
                              </td>
                              <td data-label="Sources of personal information">
                                <ul>
                                  <li>You</li>
                                  <li>References</li>
                                  <li>Background check and/or drug testing companies</li>
                                  <li>Employment agencies or recruiters</li>
                                </ul>
                              </td>
                              <td data-label="Purposes for which we may collect and use the personal information">
                                <ul>
                                  <li>Facilitate recruitment activities</li>
                                  <li>Process employment applications</li>
                                  <li>Monitoring recruitment statistics</li>
                                </ul>
                              </td>
                              <td data-label="Sharing">
                                <ul>
                                  <li>Shared with service providers</li>
                                  <li>
                                    Collected directly by or shared with background check and drug testing
                                    companies
                                  </li>
                                </ul>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <p>
                      Please note that we may also disclose all personal information as described in the “Who
                      Do We Share Your Information With?” section of the Privacy Policy.
                    </p>
                    <h3 id="privacy-rights">Privacy Rights</h3>
                    <p>The CCPA grants individuals the following rights:</p>
                    <p>
                      <strong>Information.</strong>
                      {" "}
                      You can request information about how we have collected, used and shared your Personal
                      Information during the past 12 months.
                    </p>
                    <p>
                      <strong>Access.</strong>
                      {" "}
                      You can request a copy of the personal information that we maintain about you.
                    </p>
                    <p>
                      <strong>Deletion.</strong>
                      {" "}
                      You can ask us to delete the personal information that we collected or maintain about
                      you.
                    </p>
                    <p>
                      Please note that the CCPA limits these rights by, for example, prohibiting us from
                      providing certain sensitive information in response to an access request and limiting
                      the circumstances in which we must comply with a deletion request. We will also respond
                      to requests for information and access only to the extent we are able to associate with
                      a reasonable effort the information we maintain with the identifying details you provide
                      in your request. If we deny your request, we will communicate our decision to you. You
                      are entitled to exercise the rights described above free from discrimination.
                    </p>
                    <h3 id="how-to-submit-a-request">How to Submit a Request</h3>
                    <p>To request access to or deletion of personal information:</p>
                    <p>
                      Call
                      {" "}
                      <a href="tel:18002147498">1-800-214-7498</a>
                    </p>
                    <p>
                      Email:
                      {" "}
                      <a href="mailto:compliance@spectrumbusinessfinance.com">compliance@spectrumbusinessfinance.com</a>
                    </p>
                    <p>
                      <strong>Identity verification.</strong>
                      {" "}
                      The CCPA requires us to verify the identity of the individual submitting a request to
                      access or delete personal information before providing a substantive response to the
                      request. We will ask you to verify your identity when you submit a request.
                    </p>
                    <p>
                      <strong>
                        Authorized agents.
                        {" "}
                      </strong>
                      California residents can empower an “authorized agent” to submit requests on their
                      behalf. We will require the authorized agent to have a written authorization confirming
                      that authority.
                    </p>
                    <p>
                      <strong>
                        Notice of Collection of Personal Information.
                        {" "}
                      </strong>
                      We list the categories of your information that we collect and the business and
                      commercial purposes for our use as described in the detailed chart above.
                    </p>
                    <p className="sbf-legal-note">
                      We do not sell or share mobile or personal data with third parties, affiliates, or
                      partners for marketing or promotional purposes. We only share data with third parties
                      when it is strictly necessary to deliver our service and only under binding agreements
                      that ensure confidentiality. Under no circumstances will mobile data be shared or sold
                      for advertising or promotional use.
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
