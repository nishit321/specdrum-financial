import type { Metadata } from 'next';

/** The website's own domain (email addresses stay on spectrumbusinessfinance.com). */
export const SITE_DOMAIN = 'spectrumbusinessloans.com';
export const SITE_URL = `https://${SITE_DOMAIN}`;
export const SITE_NAME = 'Spectrum Financial';

type PageMeta = {
  path: string;
  title: string;
  /** Open Graph / Twitter title when it differs from the browser title. */
  socialTitle?: string;
  description: string;
  image: string;
};

/** Same tags every static page carried: canonical, robots, Open Graph and Twitter card. */
export function pageMetadata({ path, title, socialTitle, description, image }: PageMeta): Metadata {
  const social = socialTitle ?? title;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: social,
      description,
      url: path,
      images: [image],
      locale: 'en_US',
    },
    twitter: { card: 'summary_large_image', title: social, description, images: [image] },
  };
}
