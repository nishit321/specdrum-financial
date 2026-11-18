import type { NextConfig } from 'next';

// Old static-site URLs (about.html, apply-now.html, ...) keep working through permanent redirects.
const legacyPages = [
  'about',
  'apply-now',
  'disclaimer',
  'loan-types',
  'privacy-policy',
  'quote-request',
  'services',
  'terms-of-service',
  'testimonials',
  'the-process',
];

const nextConfig: NextConfig = {
  // Self-contained Node server in .next/standalone for AWS (EC2 / ECS / Amplify).
  output: 'standalone',
  poweredByHeader: false,
  // Images are served as-is, exactly like the static site (no resizing service on the server).
  images: { unoptimized: true },
  // Server-only libraries that must not be bundled by webpack/turbopack.
  serverExternalPackages: ['@react-pdf/renderer', 'nodemailer'],
  // The PDF font is read from disk at runtime; make sure the standalone build carries it.
  outputFileTracingIncludes: { '/api/apply': ['./src/server/pdf/fonts/*.ttf'] },
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      ...legacyPages.map((page) => ({ source: `/${page}.html`, destination: `/${page}`, permanent: true })),
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Browsers only honour this over HTTPS, so it is harmless on local HTTP.
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Form submissions carry personal data: never cache them anywhere.
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
