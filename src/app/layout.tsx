import type { Metadata, Viewport } from 'next';
import { BackToTop } from '@/components/layout/BackToTop';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { SiteEffects } from '@/components/layout/SiteEffects';
import { SvgSprite } from '@/components/layout/SvgSprite';
import { TopBar } from '@/components/layout/TopBar';
import { SITE_URL } from '@/lib/seo';
import '@/styles/bootstrap.min.css';
import '@/styles/style.css';
import '@/styles/responsive.css';
import '@/styles/controls.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: '/img/favicon.png', apple: '/img/favicon.png' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a1f3c',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // sbf-js is added before paint (same as the static site) so reveal animations start hidden.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('sbf-js')" }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="sbf-body">
        <SvgSprite />
        <ScrollProgress />
        <TopBar />
        <Header />
        {children}
        <Footer />
        <BackToTop />
        <SiteEffects />
      </body>
    </html>
  );
}
