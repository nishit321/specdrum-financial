import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { QuoteSpotlightSection, ReviewsSection } from '@/components/ReviewSections';

// The final HTML design of 2026-11-17 (legacy-html/ holds it): StoryProof review sections.

const ROOT = path.join(import.meta.dirname, '../..');
// line endings depend on the checkout (CRLF on Windows, LF in CI)
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8').replaceAll('\r\n', '\n');
const PAGES = ['', 'about', 'apply-now', 'disclaimer', 'loan-types', 'privacy-policy', 'quote-request', 'services', 'terms-of-service', 'testimonials', 'the-process'].map(
  (p) => (p ? `src/app/${p}/page.tsx` : 'src/app/page.tsx'),
);

const REVIEWS = '6afaae8531fe707090371314';
const SPOTLIGHT = '6afac29131fe707090371333';
const CLIENT_STORIES = '6af49fb191f9b7a0112848fe';
const REVIEW_GRID = '6afab4c431fe707090371321';

describe('"Reviews" widget at the end of every page', () => {
  it.each(PAGES)('%s ends its main content with it', (file) => {
    expect(read(file)).toMatch(/<ReviewsSection( variant="apply")? \/>\n\s*<\/main>/);
  });

  it('matches the final HTML markup; Apply Now has its own background', () => {
    const html = renderToString(<ReviewsSection />);
    expect(html).toContain('<section class="sbf-section sbf-reviews" id="reviews">');
    expect(html).toContain(`data-storyproof-widget="${REVIEWS}"`);
    expect(renderToString(<ReviewsSection variant="apply" />)).toContain('class="sbf-section sbf-reviews sbf-reviews--apply"');
    expect(read('src/app/apply-now/page.tsx')).toContain('<ReviewsSection variant="apply" />');
  });
});

describe('"Quote spotlight" widget', () => {
  it.each([
    ['services', 'INTRO'],
    ['loan-types', 'LOAN TYPES — DETAILED'],
    ['the-process', 'STEP-BY-STEP TIMELINE'],
  ])('%s has it right before the %s section, like the final HTML', (page, next) => {
    expect(read(`src/app/${page}/page.tsx`)).toContain(`<QuoteSpotlightSection />\n        {/* ============ ${next} ============ */}`);
  });

  it('matches the final HTML markup', () => {
    const html = renderToString(<QuoteSpotlightSection />);
    expect(html).toContain('<section class="sbf-spotlight" aria-label="Client review spotlight">');
    expect(html).toContain(`<div class="sbf-spotlight-widget" data-sbf-reveal="">`);
    expect(html).toContain(`data-storyproof-widget="${SPOTLIGHT}"`);
  });
});

describe('About and Testimonials use the review widgets instead of fixed testimonial cards', () => {
  it('About: "Client stories" with 20 years (client change), no "Borrower Stories" cards', () => {
    const src = read('src/app/about/page.tsx');
    expect(src).toContain(`<StoryproofWidget widgetId="${CLIENT_STORIES}" />`);
    expect(src).toContain('<h2 className="sbf-title">20 years of satisfied clients</h2>');
    // the removed section and its two fixed cards (the hero photo of Greg P. stays)
    expect(src).not.toMatch(/Borrower Stories|sbf-testi sbf-grain|sbf-testi-card|\$250,000 Funded|\$185,000 Funded/);
  });

  it('Testimonials: "Client stories" and "Review Grid", no fixed cards', () => {
    const src = read('src/app/testimonials/page.tsx');
    expect(src).toContain(`<StoryproofWidget widgetId="${CLIENT_STORIES}" />`);
    expect(src).toContain(`<StoryproofWidget widgetId="${REVIEW_GRID}" />`);
    expect(src).toContain('<h2 className="sbf-title">20 years of satisfied clients</h2>');
    expect(src).not.toMatch(/sbf-tm-featured|sbf-tm-grid-section|Featured Story|sbf-tm-cta-title/);
  });
});

describe('styles', () => {
  it('the review section rules are the same as in the final HTML', () => {
    const final = read('legacy-html/css/style.css');
    const block = final.slice(final.indexOf('/* Reviews widget section (before footer, all pages) */'), final.indexOf('/* Apply Now page dedicated testimonials presentation */'));
    expect(block.length).toBeGreaterThan(500);
    expect(read('src/styles/style.css').replaceAll('\r\n', '\n')).toContain(block.replaceAll('\r\n', '\n'));
  });
});
