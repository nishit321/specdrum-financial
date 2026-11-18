import fs from 'node:fs';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { MAIL_DIR } from './helpers';

// Renders the emails saved by the mail sink in Chrome and saves screenshots
// (EMAIL_PREVIEW_DIR), to check the template at desktop and phone widths.

const OUT = process.env.EMAIL_PREVIEW_DIR;

test('saved emails render without broken layout', async ({ page }, testInfo) => {
  test.skip(!OUT, 'set EMAIL_PREVIEW_DIR to save previews');
  test.skip(testInfo.project.name === 'tablet');
  const files = fs.existsSync(MAIL_DIR) ? fs.readdirSync(MAIL_DIR).filter((f) => f.endsWith('.html')) : [];
  test.skip(files.length === 0, 'no saved emails');
  fs.mkdirSync(OUT!, { recursive: true });
  for (const f of files) {
    await page.goto(`file:///${path.join(MAIL_DIR, f).replace(/\\/g, '/')}`);
    // nothing in the email may be wider than the screen
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, f).toBeLessThanOrEqual(1);
    await page.screenshot({ path: path.join(OUT!, `${testInfo.project.name}-${f.replace('.html', '.png')}`), fullPage: true });
  }
});
