import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo';

// Same pages, priorities and dates as the static site's sitemap.xml, with the new URLs (no .html).
const LAST_MODIFIED = '2026-11-21'; // loan calculator added

const PAGES: { path: string; changeFrequency: 'weekly' | 'monthly' | 'yearly'; priority: number }[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/loan-types', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/loan-calculator', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/testimonials', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/the-process', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/quote-request', changeFrequency: 'monthly', priority: 0.8 },
  { path: '/apply-now', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/disclaimer', changeFrequency: 'yearly', priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map((p) => ({
    url: p.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${p.path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }));
}
