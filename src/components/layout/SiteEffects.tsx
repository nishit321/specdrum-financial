'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// Page effects ported from the static site's js/javascript.js. They work on the
// page markup through data attributes, so they re-attach after every navigation.

const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function SiteEffects() {
  const pathname = usePathname();

  // FAQ accordions: Bootstrap's data-bs-toggle="collapse" markup, one listener for the whole document.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const trigger = (e.target as HTMLElement).closest<HTMLElement>('[data-bs-toggle="collapse"]');
      if (!trigger) return;
      e.preventDefault();
      toggleCollapse(trigger);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  useEffect(() => {
    const cleanups = [spotlight(), processLines(), parallax(), reveal(), counters(), legalToc()];
    return () => cleanups.forEach((fn) => fn());
  }, [pathname]);

  return null;
}

/* ---------- collapse ---------- */

const COLLAPSE_MS = 350;

function triggersFor(el: HTMLElement) {
  return document.querySelectorAll<HTMLElement>(`[data-bs-toggle="collapse"][data-bs-target="#${CSS.escape(el.id)}"]`);
}

function finishLater(el: HTMLElement, done: () => void) {
  if (reduceMotion()) return done();
  let finished = false;
  const finish = (e?: Event) => {
    // a child's own transition (e.g. a hover effect inside the answer) must not end the collapse
    if (e && e.target !== el) return;
    if (finished) return;
    finished = true;
    el.removeEventListener('transitionend', finish);
    done();
  };
  el.addEventListener('transitionend', finish);
  setTimeout(finish, COLLAPSE_MS + 50);
}

function showCollapse(el: HTMLElement) {
  if (el.classList.contains('show') || el.classList.contains('collapsing')) return;
  el.classList.remove('collapse');
  el.classList.add('collapsing');
  el.style.height = '0px';
  void el.offsetHeight; // reflow so the height change animates
  el.style.height = `${el.scrollHeight}px`;
  triggersFor(el).forEach((t) => {
    t.classList.remove('collapsed');
    t.setAttribute('aria-expanded', 'true');
  });
  finishLater(el, () => {
    el.classList.remove('collapsing');
    el.classList.add('collapse', 'show');
    el.style.height = '';
  });
}

function hideCollapse(el: HTMLElement) {
  if (!el.classList.contains('show') || el.classList.contains('collapsing')) return;
  el.style.height = `${el.getBoundingClientRect().height}px`;
  void el.offsetHeight;
  el.classList.add('collapsing');
  el.classList.remove('collapse', 'show');
  el.style.height = '';
  triggersFor(el).forEach((t) => {
    t.classList.add('collapsed');
    t.setAttribute('aria-expanded', 'false');
  });
  finishLater(el, () => {
    el.classList.remove('collapsing');
    el.classList.add('collapse');
  });
}

function toggleCollapse(trigger: HTMLElement) {
  const selector = trigger.getAttribute('data-bs-target');
  const target = selector ? document.querySelector<HTMLElement>(selector) : null;
  if (!target || target.classList.contains('collapsing')) return;
  if (target.classList.contains('show')) return hideCollapse(target);
  const parent = target.getAttribute('data-bs-parent');
  if (parent) {
    document.querySelectorAll<HTMLElement>(`${parent} .collapse.show`).forEach((open) => {
      if (open !== target && open.getAttribute('data-bs-parent') === parent) hideCollapse(open);
    });
  }
  showCollapse(target);
}

/* ---------- mouse spotlight on cards ---------- */

function spotlight() {
  if (!window.matchMedia('(hover: hover)').matches) return () => {};
  const cards = [...document.querySelectorAll<HTMLElement>('.sbf-spotlight')];
  const handlers = cards.map((card) => {
    const onMove = (e: PointerEvent) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--sbf-mx', `${e.clientX - r.left}px`);
      card.style.setProperty('--sbf-my', `${e.clientY - r.top}px`);
    };
    card.addEventListener('pointermove', onMove);
    return () => card.removeEventListener('pointermove', onMove);
  });
  return () => handlers.forEach((fn) => fn());
}

/* ---------- process line fill ---------- */

function processLines() {
  const rows = document.querySelectorAll<HTMLElement>('[data-sbf-progress]');
  if (!('IntersectionObserver' in window)) {
    rows.forEach((row) => row.classList.add('is-active'));
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-active');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 },
  );
  rows.forEach((row) => observer.observe(row));
  return () => observer.disconnect();
}

/* ---------- parallax backgrounds ---------- */

function parallax() {
  const els = [...document.querySelectorAll<HTMLElement>('[data-sbf-parallax]')];
  if (!els.length || reduceMotion()) return () => {};
  let ticking = false;
  const update = () => {
    const vh = window.innerHeight;
    els.forEach((el) => {
      const section = el.parentElement;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const speed = parseFloat(el.getAttribute('data-sbf-parallax') ?? '') || 0.3;
      const offset = rect.top + rect.height / 2 - vh / 2;
      el.style.transform = `translate3d(0,${(offset * -speed).toFixed(1)}px,0)`;
    });
    ticking = false;
  };
  const request = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  update();
  return () => {
    window.removeEventListener('scroll', request);
    window.removeEventListener('resize', request);
  };
}

/* ---------- reveal on scroll ---------- */

function reveal() {
  const els = document.querySelectorAll<HTMLElement>('[data-sbf-reveal]:not(.is-revealed)');
  if (!('IntersectionObserver' in window) || reduceMotion()) {
    els.forEach((el) => el.classList.add('is-revealed'));
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        const delay = parseInt(el.getAttribute('data-sbf-delay') ?? '', 10) || 0;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('is-revealed');
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  els.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
}

/* ---------- counters ---------- */

function counters() {
  // The HTML carries the real numbers, for search engines and visitors without JavaScript.
  // Counters already on screen keep them (resetting would flash the number, then 0); the ones
  // further down start from 0 and count up when scrolled into view, if motion is allowed.
  const onScreen = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
  };
  const els = reduceMotion() ? [] : [...document.querySelectorAll<HTMLElement>('[data-sbf-count]')].filter((el) => !onScreen(el));
  els.forEach((el) => (el.textContent = '0'));
  const frames = new Set<number>();
  const run = (el: HTMLElement) => {
    const target = parseInt(el.getAttribute('data-sbf-count') ?? '', 10) || 0;
    if (reduceMotion() || target === 0) {
      el.textContent = String(target);
      return;
    }
    const duration = 1600;
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) frames.add(requestAnimationFrame(step));
    };
    frames.add(requestAnimationFrame(step));
  };
  if (!('IntersectionObserver' in window)) {
    els.forEach(run);
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        run(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => observer.observe(el));
  return () => {
    observer.disconnect();
    frames.forEach((id) => cancelAnimationFrame(id));
  };
}

/* ---------- legal pages: table of contents highlight + reading progress ---------- */

function legalToc() {
  const toc = document.querySelector<HTMLElement>('.sbf-legal-toc');
  const doc = document.querySelector<HTMLElement>('.sbf-legal-doc');
  if (!toc || !doc) return () => {};
  const cleanups: (() => void)[] = [];

  // Collapsible below 1200px (starts closed); always open on desktop.
  const details = toc.querySelector<HTMLDetailsElement>('.sbf-legal-toc-details');
  const mq = window.matchMedia('(max-width: 1199.98px)');
  if (details) {
    const sync = () => {
      details.open = !mq.matches;
    };
    sync();
    mq.addEventListener('change', sync);
    const summary = details.querySelector('summary');
    const onSummary = (e: Event) => {
      if (!mq.matches) e.preventDefault();
    };
    const onLink = (e: Event) => {
      if (mq.matches && (e.target as HTMLElement).closest('a')) details.open = false;
    };
    summary?.addEventListener('click', onSummary);
    details.addEventListener('click', onLink);
    cleanups.push(() => {
      mq.removeEventListener('change', sync);
      summary?.removeEventListener('click', onSummary);
      details.removeEventListener('click', onLink);
    });
  }

  const links = [...toc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const targets = links.map((a) => document.getElementById(a.getAttribute('href')!.slice(1)));
  const bar = toc.querySelector<HTMLElement>('.sbf-legal-toc-progress span');
  const list = toc.querySelector<HTMLElement>('ol');
  let ticking = false;

  const update = () => {
    const offset = 140;
    let current = 0;
    targets.forEach((el, i) => {
      if (el && el.getBoundingClientRect().top - offset <= 0) current = i;
    });
    links.forEach((a, i) => a.classList.toggle('is-active', i === current));

    // keep the active item visible inside the (scrollbar-free) list
    const act = links[current];
    if (list && act && list.scrollHeight > list.clientHeight) {
      const top = act.offsetTop - list.offsetTop;
      if (top < list.scrollTop || top + act.offsetHeight > list.scrollTop + list.clientHeight) {
        list.scrollTop = top - list.clientHeight / 2 + act.offsetHeight / 2;
      }
    }

    if (bar) {
      const r = doc.getBoundingClientRect();
      const total = r.height - window.innerHeight + offset;
      const done = Math.min(Math.max(-r.top + offset, 0), Math.max(total, 1));
      bar.style.width = `${((done / Math.max(total, 1)) * 100).toFixed(1)}%`;
    }
    ticking = false;
  };
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update();
  cleanups.push(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', update);
  });
  return () => cleanups.forEach((fn) => fn());
}
