import { expect, test, type Page } from '@playwright/test';
import { PAGES } from './helpers';

// Visual baseline: every page is compared, pixel by pixel, with the screenshot approved after the
// client's changes of 2026-11-14 (tests/e2e/visual.spec.ts-snapshots). Until then the pages were
// compared with the old static site; that check passed on all 11 pages before the text changed.
// This catches layout, spacing and colour changes. Up to 1% of a page may differ, which can hide a
// single changed word or number, so the copy itself is checked in pages.spec.ts.
// After an intended visual change, review the new screenshots and refresh them with
//   npx playwright test tests/e2e/visual.spec.ts --update-snapshots
// Screenshots differ slightly between operating systems (fonts), so each OS keeps its own set.

test.use({ reducedMotion: 'reduce' });

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  // counters and fade-ins start when scrolled into view; walk the page once so they show their final state
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight / 2) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
  // The third-party testimonial widget loads its own content, whose height changes from one
  // load to the next (measured: 324 px vs 758 px for the same page).
  await page.addStyleTag({ content: '[data-storyproof-widget]{display:none!important}' });
  // Photos are fixed files that never change here, and as PNG they made the baselines ~50 MB.
  // Flat colour in their place keeps what this check is for (layout, text, colours) and keeps
  // the screenshots small.
  await page.addStyleTag({ content: '*,*::before,*::after{background-image:none!important}' });
  await page.waitForTimeout(600);
}

for (const p of PAGES) {
  test(`${p.path} matches its approved screenshot`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'tablet', 'desktop and mobile widths are enough for the visual check');
    // the footer shows the current year; keep it fixed so January does not break the baseline
    await page.clock.setFixedTime(new Date('2026-11-16T12:00:00'));
    await page.goto(p.path, { waitUntil: 'networkidle' });
    await settle(page);
    await expect(page).toHaveScreenshot(`${p.path === '/' ? 'home' : p.path.slice(1)}.png`, {
      fullPage: true,
      animations: 'disabled',
      scale: 'css',
      mask: [page.locator('img, video, iframe')],
      maskColor: '#c8ccd4',
      maxDiffPixelRatio: 0.01,
      threshold: 0.2,
      timeout: 20_000,
    });
  });
}
