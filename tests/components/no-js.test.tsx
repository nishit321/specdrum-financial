import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ApplyForm } from '@/components/apply/ApplyForm';
import { HomeQuoteForm } from '@/components/forms/HomeQuoteForm';
import { QuoteRequestForm } from '@/components/forms/QuoteRequestForm';

// B6 (breaker): without JavaScript, or before the page has hydrated, a submit must never put
// the visitor's details (an SSN on Apply Now) into the URL.
describe('server-rendered forms before JavaScript runs', () => {
  it.each([
    ['quote request', <QuoteRequestForm key="q" />, 'sbfQuoteForm'],
    ['home quote', <HomeQuoteForm key="h" />, 'sbfQuoteForm'],
    ['apply', <ApplyForm key="a" />, 'sbfApplyForm'],
  ])('%s: posts (never GET), submit is disabled, and a no-JS message is there', (_, ui, id) => {
    const html = renderToString(ui);
    const form = new RegExp(`<form[^>]*id="${id}"[^>]*>`).exec(html)?.[0] ?? '';
    expect(form).toMatch(/method="post"/);
    const submit = /<button[^>]*type="submit"[^>]*>/.exec(html)?.[0] ?? '';
    expect(submit).toMatch(/disabled=""/);
    expect(html).toMatch(/<noscript>[\s\S]*1-800-214-7498[\s\S]*<\/noscript>/);
  });

  // delta-2 #10: JavaScript is on but the page's script never ran (blocked, failed to load)
  it.each([
    ['quote request', <QuoteRequestForm key="q" />],
    ['home quote', <HomeQuoteForm key="h" />],
    ['apply', <ApplyForm key="a" />],
  ])('%s: a "still loading" hint is in the page, and the no-JS notice hides it', (_, ui) => {
    const html = renderToString(ui);
    expect(html).toMatch(/<p class="sbf-late-hint">[^<]*Still loading\?[\s\S]*?1-800-214-7498/);
    expect(html).toMatch(/<noscript>[\s\S]*\.sbf-late-hint\{display:none\}[\s\S]*<\/noscript>/);
  });

  it('the hint takes no space and stays invisible for the first seconds', () => {
    const css = fs.readFileSync(path.join(import.meta.dirname, '../../src/styles/controls.css'), 'utf8');
    const rule = /\.sbf-late-hint \{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(rule).toMatch(/visibility: hidden/);
    expect(rule).toMatch(/max-height: 0/);
    expect(rule).toMatch(/animation: sbf-late-hint [^;]* 8s forwards/);
  });
});
