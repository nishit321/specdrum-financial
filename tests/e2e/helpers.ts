import fs from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';

export const MAIL_DIR = path.resolve(process.env.MAIL_SINK_DIR ?? 'tests/.output/mail');

export const PAGES = [
  { path: '/', legacy: '/index.html', title: 'Business Loans & Funding in 24 Hours | Spectrum Financial' },
  { path: '/about', legacy: '/about.html', title: 'About Us | Spectrum Financial Business Lending' },
  { path: '/services', legacy: '/services.html' },
  { path: '/loan-types', legacy: '/loan-types.html' },
  { path: '/testimonials', legacy: '/testimonials.html' },
  { path: '/the-process', legacy: '/the-process.html' },
  { path: '/quote-request', legacy: '/quote-request.html' },
  { path: '/apply-now', legacy: '/apply-now.html', title: 'Apply Now for Business Funding | Spectrum Financial' },
  { path: '/privacy-policy', legacy: '/privacy-policy.html' },
  { path: '/terms-of-service', legacy: '/terms-of-service.html' },
  { path: '/disclaimer', legacy: '/disclaimer.html' },
];

export type SinkMail = {
  id: string;
  envelope: { from: string; to: string[] };
  replyTo?: string;
  subject: string;
  text: string;
  attachments: { filename: string; contentType: string; size: number; file: string }[];
};

export function mailIds(): Set<string> {
  if (!fs.existsSync(MAIL_DIR)) return new Set();
  return new Set(fs.readdirSync(MAIL_DIR).filter((f) => f.endsWith('.json')));
}

/** Waits (max 20 s) for emails that were not in `before`. */
export async function waitForNewMail(before: Set<string>, count = 1): Promise<SinkMail[]> {
  const deadline = Date.now() + 20_000;
  while (Date.now() < deadline) {
    const fresh = [...mailIds()].filter((f) => !before.has(f)).sort();
    if (fresh.length >= count) return fresh.map((f) => JSON.parse(fs.readFileSync(path.join(MAIL_DIR, f), 'utf8')) as SinkMail);
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`no new email within 20 s in ${MAIL_DIR}`);
}

export const attachmentPath = (file: string) => path.join(MAIL_DIR, file);

/** Collects console errors and failed same-site requests while a page is used. */
export function watchErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    // the third-party testimonial widget is outside this app
    if (/storyproof/i.test(text) || /Failed to load resource/.test(text)) return;
    errors.push(text);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('response', (res) => {
    const url = new URL(res.url());
    if (['127.0.0.1', 'localhost'].includes(url.hostname) && res.status() >= 400 && !url.pathname.startsWith('/api/')) {
      errors.push(`${res.status()} ${url.pathname}`);
    }
  });
  return errors;
}

/** Draws a signature-like squiggle on the canvas with real mouse events. */
export async function drawSignature(page: Page) {
  const canvas = page.locator('#sbfSignCanvas');
  await canvas.scrollIntoViewIfNeeded();
  const box = (await canvas.boundingBox())!;
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + 30, y);
  await page.mouse.down();
  for (let i = 1; i <= 24; i++) {
    await page.mouse.move(box.x + 30 + i * 10, y + Math.sin(i / 2) * 22, { steps: 2 });
  }
  await page.mouse.up();
}
