import { expect, test } from '@playwright/test';
import { PAGES, watchErrors } from './helpers';

test.describe('every page', () => {
  for (const p of PAGES) {
    test(`${p.path} loads with its content, metadata and no errors`, async ({ page }) => {
      const errors = watchErrors(page);
      const res = await page.goto(p.path, { waitUntil: 'networkidle' });
      expect(res?.status()).toBe(200);
      if (p.title) await expect(page).toHaveTitle(p.title);
      await expect(page.locator('h1').first()).toBeVisible();
      await expect(page.locator('#sbfHeader')).toBeVisible();
      await expect(page.locator('footer.sbf-footer')).toBeVisible();
      const canonical = await page.locator('link[rel=canonical]').getAttribute('href');
      // the site's domain since the client meeting of 2026-11-14
      expect(canonical).toBe(`https://spectrumbusinessloans.com${p.path === '/' ? '' : p.path}`.replace(/\/$/, '') || 'https://spectrumbusinessloans.com');
      expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
      // nothing points at the old .html pages any more
      const htmlLinks = await page.locator('a[href$=".html"], a[href*=".html#"]').count();
      expect(htmlLinks).toBe(0);
      // the active nav link matches the page
      if (['/', '/about', '/services', '/loan-types', '/testimonials', '/the-process', '/quote-request'].includes(p.path)) {
        await expect(page.locator('.sbf-nav .nav-link.active')).toHaveAttribute('href', p.path);
      }
      expect(errors).toEqual([]);
    });
  }

  test('old .html links redirect permanently to the new pages', async ({ request }) => {
    for (const p of PAGES) {
      const res = await request.get(p.legacy, { maxRedirects: 0 });
      expect([301, 308], p.legacy).toContain(res.status());
      expect(res.headers()['location']).toBe(p.path);
    }
  });

  test('sitemap and robots use the new URLs', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('https://spectrumbusinessloans.com/apply-now');
    expect(sitemap).not.toContain('.html');
    expect(sitemap.match(/<url>/g)).toHaveLength(11);
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toContain('Sitemap: https://spectrumbusinessloans.com/sitemap.xml');
  });

  test('unknown page returns 404', async ({ request }) => {
    expect((await request.get('/no-such-page')).status()).toBe(404);
  });

  test('API answers are never cached and the site sends basic security headers', async ({ request }) => {
    const res = await request.get('/');
    expect(res.headers()['x-content-type-options']).toBe('nosniff');
    expect(res.headers()['x-frame-options']).toBe('SAMEORIGIN');
    expect(res.headers()['strict-transport-security']).toBe('max-age=31536000');
    expect(res.headers()['x-powered-by']).toBeUndefined();
    const api = await request.post('/api/quote', { data: {} });
    expect(api.headers()['cache-control']).toContain('no-store');
  });
});

test.describe('the client changes of 2026-11-14 show on the pages', () => {
  test('no page markets a merchant cash advance any more', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'copy is the same at every width');
    for (const p of PAGES) {
      await page.goto(p.path);
      const text = await page.locator('body').innerText();
      expect(text, p.path).not.toMatch(/merchant cash|cash advance/i);
      expect(text, p.path).not.toMatch(/over a decade|10\+ years|over 10 years/i);
      await expect(page.locator('.sbf-footer-bottom'), p.path).toContainText('Tri-Cities Consulting LLC d/b/a Spectrum Financial. All rights reserved.');
    }
  });

  test('home: Line of Credit, $2,000,000 caps and 20 years', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'copy is the same at every width');
    await page.goto('/');
    await expect(page.locator('.sbf-ticker-group').first()).toContainText('Line of Credit');
    await expect(page.locator('.sbf-ticker-group').first()).toContainText('Term Loans');
    const pills = page.locator('.sbf-ind-pill');
    await expect(pills).toHaveCount(8);
    for (const text of await pills.allInnerTexts()) expect(text).toBe('Up to $2,000,000');
    await expect(page.locator('.sbf-loan-title').first()).toHaveText('Line of Credit');
    await expect(page.locator('.sbf-loan-card', { hasText: 'Unsecured Working Capital' })).toContainText('$2,000,000');
    const years = page.locator('[data-sbf-count="20"]').first();
    await years.scrollIntoViewIfNeeded();
    await expect(years).toHaveText('20');
  });

  test('without JavaScript the stat boxes still show the real numbers', async ({ browser }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'copy is the same at every width');
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    try {
      const page = await ctx.newPage();
      await page.goto('/');
      await expect(page.locator('[data-sbf-count="20"]').first()).toHaveText('20');
      await expect(page.locator('[data-sbf-count="24"]').first()).toHaveText('24');
    } finally {
      await ctx.close();
    }
  });

  test('with JavaScript the stat boxes count up to the real numbers', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'copy is the same at every width');
    await page.setViewportSize({ width: 1366, height: 400 }); // keep the stats below the fold
    await page.goto('/');
    const years = page.locator('[data-sbf-count="20"]').first();
    await expect(years).toHaveText('0'); // waiting below the fold
    await years.scrollIntoViewIfNeeded();
    await expect(years).toHaveText('20');
  });

  test('a stat box already on screen never flashes to 0', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'copy is the same at every width');
    await page.setViewportSize({ width: 1366, height: 2000 }); // the stats are on screen at load
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { sbfSeen: string[] }).sbfSeen = seen;
      new MutationObserver(() => {
        const el = document.querySelector('[data-sbf-count="20"]');
        if (el) seen.push(el.textContent ?? '');
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('[data-sbf-count="20"]').first()).toHaveText('20');
    const seen = await page.evaluate(() => (window as unknown as { sbfSeen: string[] }).sbfSeen);
    expect(seen).not.toContain('0');
  });

  test('services and loan types explain the line of credit', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'copy is the same at every width');
    for (const path of ['/services', '/loan-types']) {
      await page.goto(`${path}#line-of-credit`);
      await expect(page.locator('#line-of-credit h3')).toHaveText('Business Line of Credit');
      await expect(page.locator('#line-of-credit')).toContainText('credit card');
    }
  });
});

test.describe('header, menu and page effects', () => {
  test('mobile menu opens, traps focus, closes with Escape and on link click', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'desktop', 'the menu is inline on desktop');
    await page.goto('/');
    const toggler = page.getByRole('button', { name: 'Open menu' });
    await toggler.click();
    const menu = page.locator('#sbfMenu');
    await expect(menu).toHaveClass(/\bshow\b/);
    await expect(menu).toHaveAttribute('role', 'dialog');
    await expect(page.locator('.offcanvas-backdrop')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).not.toHaveClass(/\bshow\b/);
    await expect(toggler).toBeFocused();

    await toggler.click();
    await expect(menu).toHaveClass(/\bshow\b/);
    await menu.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(menu).not.toHaveClass(/\bshow\b/);
    await expect(page.locator('.offcanvas-backdrop')).toHaveCount(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('');
  });

  test('on phones and tablets the header blur is off, so the menu is not trapped inside the header', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'desktop', 'the rule only applies below 992px');
    await page.goto('/privacy-policy');
    // the CSS minifier once dropped `backdrop-filter: none` here (it kept only the -webkit- twin)
    expect(await page.locator('#sbfHeader').evaluate((el) => getComputedStyle(el).backdropFilter)).toBe('none');
    expect(await page.evaluate(() => document.body.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(0);
    await page.getByRole('button', { name: 'Open menu' }).click();
    const box = (await page.locator('#sbfMenu').boundingBox())!;
    expect(box.height).toBeGreaterThan(page.viewportSize()!.height - 2); // full-height panel, not header-height
  });

  test('FAQ accordion opens one answer at a time', async ({ page }) => {
    await page.goto('/');
    const q0 = page.locator('[data-bs-target="#sbfFaq0"]');
    const q1 = page.locator('[data-bs-target="#sbfFaq1"]');
    await q1.scrollIntoViewIfNeeded();
    await expect(page.locator('#sbfFaq0')).toBeVisible();
    await q1.click();
    await expect(page.locator('#sbfFaq1')).toBeVisible();
    await expect(page.locator('#sbfFaq0')).toBeHidden();
    await expect(q1).toHaveAttribute('aria-expanded', 'true');
    await expect(q0).toHaveAttribute('aria-expanded', 'false');
    await q1.click();
    await expect(page.locator('#sbfFaq1')).toBeHidden();
  });

  test('client-side navigation re-runs page effects (content becomes visible)', async ({ page }) => {
    await page.goto('/');
    await page.locator('footer').getByRole('link', { name: 'The Process' }).click();
    await expect(page).toHaveURL(/\/the-process$/);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    await expect.poll(() => page.locator('[data-sbf-reveal].is-revealed').count()).toBeGreaterThan(2);
  });

  test('legal page table of contents follows the reading position', async ({ page }) => {
    await page.goto('/privacy-policy');
    await page.locator('#how-to-contact-us').scrollIntoViewIfNeeded();
    await page.mouse.wheel(0, 200);
    await expect.poll(() => page.locator('.sbf-legal-toc a.is-active').getAttribute('href')).not.toBe('#consumer-privacy-disclosure');
  });
});
