import Image from 'next/image';
import Link from 'next/link';
import { CurrentYear } from './CurrentYear';

const QUICK_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/loan-types', label: 'Loan Types' },
  { href: '/testimonials', label: 'Testimonials' },
];

const RESOURCES = [
  { href: '/the-process', label: 'The Process' },
  { href: '/disclaimer', label: 'Disclaimer' },
  { href: '/apply-now', label: 'Apply Now' },
  { href: '/quote-request', label: 'Quote Request' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
];

function LinkList({ links }: { links: { href: string; label: string }[] }) {
  return (
    <ul className="sbf-footer-links">
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href}>
            <svg className="sbf-icon"><use href="#sbf-i-chevron" /></svg>
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function Footer() {
  return (
    <footer className="sbf-footer sbf-grain">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-4">
            <Link href="/" className="sbf-footer-brand">
              <Image src="/img/logo-white.png" alt="Spectrum Financial" className="sbf-footer-logo" width={178} height={61} loading="lazy" />
            </Link>
            <p className="sbf-footer-text">
              For 20 years, Spectrum Financial has helped businesses of all sizes across the nation secure the financing they
              need — fast.
            </p>
            <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold">
              Apply Now <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
            </Link>
          </div>
          <div className="col-6 col-lg-2 offset-lg-1">
            <h4 className="sbf-footer-title">Quick Links</h4>
            <LinkList links={QUICK_LINKS} />
          </div>
          <div className="col-6 col-lg-2">
            <h4 className="sbf-footer-title">Resources</h4>
            <LinkList links={RESOURCES} />
          </div>
          <div className="col-lg-3">
            <h4 className="sbf-footer-title">Get in touch</h4>
            <ul className="sbf-footer-contact">
              <li>
                <svg className="sbf-icon"><use href="#sbf-i-pin" /></svg>{' '}
                <span>
                  11021 Winners Cir #103
                  <br />
                  Los Alamitos, CA 90720
                </span>
              </li>
              <li>
                <svg className="sbf-icon"><use href="#sbf-i-phone" /></svg> <a href="tel:18002147498">1-800-214-7498</a>
              </li>
              <li>
                <svg className="sbf-icon"><use href="#sbf-i-clock" /></svg> <span>Funding within 24 hours</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="sbf-footer-bottom">
          <p className="mb-0">
            &copy; <CurrentYear /> Tri-Cities Consulting LLC d/b/a Spectrum Financial. All rights reserved.
          </p>
          <p className="mb-0">
            <Link href="/privacy-policy">Privacy Policy</Link> <span className="sbf-sep">·</span> <Link href="/disclaimer">Disclaimer</Link>
          </p>
        </div>
        <div className="sbf-footer-watermark" aria-hidden="true">
          Spectrum
        </div>
      </div>
    </footer>
  );
}
