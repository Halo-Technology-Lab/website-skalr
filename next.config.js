/**
 * Next.js configuration for the Hannah London Colindale site.
 *
 * Two things here are load-bearing for AWS Amplify and should not be removed:
 *
 *  1. The `env` block. Amplify does not pass runtime environment variables to
 *     the Lambda compute that runs server components and API routes, so any
 *     server-only var (one without a NEXT_PUBLIC_ prefix) has to be inlined at
 *     build time. Add every new server-only var here as well as in the Amplify
 *     console, or it will be undefined in production.
 *
 *     SECURITY: values listed here are embedded in server bundles only. They
 *     leak to the browser if a 'use client' component imports a module that
 *     reads them, so keep secret-reading modules server-side.
 *
 *  2. The security headers, including the Content Security Policy. Amplify
 *     serves whatever Next.js emits, so this file is the only place these are
 *     defined. Widen the CSP deliberately: every third-party script, font, or
 *     API the wireframe introduces needs an explicit entry.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Server-only env vars, inlined at build time for Amplify. Add new ones here.
  env: {
    CRM_WEBHOOK_URL: process.env.CRM_WEBHOOK_URL,
    CRM_WEBHOOK_TOKEN: process.env.CRM_WEBHOOK_TOKEN,
    META_PIXEL_ID: process.env.META_PIXEL_ID,
    META_CAPI_ACCESS_TOKEN: process.env.META_CAPI_ACCESS_TOKEN,
    META_CAPI_TEST_CODE: process.env.META_CAPI_TEST_CODE,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    LEAD_NOTIFICATION_EMAIL: process.env.LEAD_NOTIFICATION_EMAIL,
  },

  reactStrictMode: true,

  images: {
    // Every image on this page is pre-optimised to the exact size its box
    // renders at by `npm run optimize-images`, and committed as WebP. So there is
    // nothing for a runtime optimiser to do, and on Amplify there is a positive
    // reason to avoid one: its Next.js image Lambda is slow and fails quietly.
    //
    // Consequence to know about: with this set, next/image emits a single src and
    // no srcset, and `sizes` is ignored. That is the right trade for fixed-size
    // boxes. If genuinely responsive sources are ever needed, turn this off and
    // hand-write <picture> rather than relying on the Lambda.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    // Add a { protocol, hostname } entry for every external image host.
    remotePatterns: [],
    minimumCacheTTL: 31536000,
  },

  async redirects() {
    return [
      // NOTE: www -> apex canonicalisation is handled at the Amplify edge
      // (Hosting > Rewrites and redirects), not here. Doing it in both places
      // causes a redirect loop.
      //
      // Add 301s here for any URL that changes after launch, so search engines
      // and existing links keep working.
    ];
  },

  async headers() {
    const isDev = process.env.NODE_ENV !== 'production';

    // Dev needs 'unsafe-eval' for fast refresh and a websocket for HMR.
    // Production stays strict.
    const scriptSrc = [
      "'self'",
      "'unsafe-inline'",
      isDev && "'unsafe-eval'",
      'https://www.googletagmanager.com',
      // Meta Pixel loader.
      'https://connect.facebook.net',
      // CallRail's number-swap script, and the extra files it pulls in itself.
      'https://cdn.callrail.com',
    ]
      .filter(Boolean)
      .join(' ');

    const connectSrc = [
      "'self'",
      isDev && 'ws://localhost:* ws://127.0.0.1:*',
      // GA4 beacons go to region-specific hosts, so wildcards are required.
      'https://*.google-analytics.com',
      'https://*.analytics.google.com',
      'https://*.googletagmanager.com',
      // Meta Pixel beacons.
      'https://www.facebook.com',
      'https://connect.facebook.net',
      // CallRail resolves the number to show and reports the session back; it
      // uses more than one subdomain, so this has to be a wildcard.
      'https://*.callrail.com',
    ]
      .filter(Boolean)
      .join(' ');

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src ${scriptSrc}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "media-src 'self'",
              "font-src 'self'",
              // Google Tag Manager's <noscript> fallback iframe. See
              // components/analytics/GoogleTagManager.tsx.
              'frame-src https://www.googletagmanager.com',
              `connect-src ${connectSrc}`,
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },

      // Static assets are content-addressed by hand: the filenames under
      // /images are stable and their contents only change when the pack is
      // regenerated, at which point the filename should change too. Safe to
      // cache for a year, and worth it - the map SVG and the six results images
      // are the bulk of this page's bytes.
      {
        source: '/images/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/fonts/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      // The hero clip is the single largest asset on the page, so it is the one
      // that most wants to be fetched exactly once.
      {
        source: '/video/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

module.exports = nextConfig;
