'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/loan-types', label: 'Loan Types' },
  { href: '/loan-calculator', label: 'Loan Calculator' },
  { href: '/testimonials', label: 'Testimonials' },
  { href: '/the-process', label: 'The Process' },
  { href: '/quote-request', label: 'Quote Request' },
];

// Bootstrap's offcanvas timing; the panel slides with the classes Bootstrap's CSS expects.
const TRANSITION_MS = 300;
type Phase = 'closed' | 'showing' | 'shown' | 'hiding';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [phase, setPhase] = useState<Phase>('closed');
  const panelRef = useRef<HTMLDivElement>(null);
  const togglerRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const open = useCallback(() => {
    clearTimeout(timer.current);
    setPhase('showing');
    timer.current = setTimeout(() => setPhase('shown'), TRANSITION_MS);
  }, []);

  const close = useCallback((returnFocus = true) => {
    clearTimeout(timer.current);
    setPhase((p) => (p === 'closed' ? p : 'hiding'));
    timer.current = setTimeout(() => setPhase('closed'), TRANSITION_MS);
    if (returnFocus) togglerRef.current?.focus();
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const isOpen = phase === 'showing' || phase === 'shown';

  // While open: lock page scroll, focus the panel, Escape closes, Tab stays inside.
  useEffect(() => {
    if (!isOpen) return;
    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key !== 'Tab' || !panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    // The panel is a normal inline menu from 992px up; close it if the window grows.
    const desktop = window.matchMedia('(min-width: 992px)');
    const onResize = () => desktop.matches && close(false);
    document.addEventListener('keydown', onKey);
    desktop.addEventListener('change', onResize);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
      desktop.removeEventListener('change', onResize);
    };
  }, [isOpen, close]);

  const panelClass = ['offcanvas', 'offcanvas-end', 'sbf-offcanvas', phase === 'showing' && 'showing', phase === 'shown' && 'show', phase === 'hiding' && 'show hiding']
    .filter(Boolean)
    .join(' ');

  // Any link in the menu closes it (also when it points at the page already open).
  const onPanelClick = (e: React.MouseEvent) => {
    if (phase !== 'closed' && (e.target as HTMLElement).closest('a')) close(false);
  };

  return (
    <>
      <header className={`sbf-header${scrolled ? ' is-scrolled' : ''}`} id="sbfHeader">
        <nav className="navbar navbar-expand-lg sbf-navbar">
          <div className="container">
            <Link className="navbar-brand sbf-brand" href="/" aria-label="Spectrum Financial — home">
              <Image className="sbf-brand-logo sbf-brand-logo--light" src="/img/logo-white.png" alt="" width={178} height={61} loading="eager" />
              <Image className="sbf-brand-logo sbf-brand-logo--dark" src="/img/logo.png" alt="" width={404} height={150} loading="eager" />
            </Link>{' '}
            <button
              ref={togglerRef}
              className="navbar-toggler sbf-toggler"
              type="button"
              aria-controls="sbfMenu"
              aria-expanded={isOpen}
              aria-label="Open menu"
              onClick={open}
            >
              <span />
              <span />
              <span />
            </button>
            <div
              ref={panelRef}
              className={panelClass}
              tabIndex={-1}
              id="sbfMenu"
              aria-labelledby="sbfMenuLabel"
              {...(phase !== 'closed' ? { role: 'dialog', 'aria-modal': true } : {})}
              onClick={onPanelClick}
            >
              <div className="offcanvas-header">
                <Image id="sbfMenuLabel" className="sbf-offcanvas-logo" src="/img/logo.png" alt="Spectrum Financial" width={404} height={150} loading="eager" />{' '}
                <button type="button" className="btn-close" aria-label="Close" onClick={() => close()} />
              </div>
              <div className="offcanvas-body">
                <ul className="navbar-nav sbf-nav ms-lg-auto">
                  {NAV.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <li className="nav-item" key={item.href}>
                        <Link className={`nav-link${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined} href={item.href}>
                          {item.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <Link href="/apply-now" className="btn sbf-btn sbf-btn-gold sbf-nav-cta">
                  Apply Now <svg className="sbf-icon"><use href="#sbf-i-arrow" /></svg>
                </Link>
                <div className="sbf-offcanvas-contact d-lg-none">
                  <p className="sbf-eyebrow mb-2">Talk to a funding specialist</p>
                  <a href="tel:18002147498" className="sbf-offcanvas-phone">
                    1-800-214-7498
                  </a>
                </div>
              </div>
            </div>
            {/* Inside the header, next to the panel: the sticky header is its own stacking
                context, so a backdrop outside it would sit on top of the menu and swallow clicks. */}
            {phase !== 'closed' && <div className={`offcanvas-backdrop fade${isOpen ? ' show' : ''}`} onClick={() => close()} />}
          </div>
        </nav>
      </header>
    </>
  );
}
