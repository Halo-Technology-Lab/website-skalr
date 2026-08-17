/**
 * Next.js configuration for the Alteon Colindale site.
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
  },

  reactStrictMode: true,

  images: {
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
              `connect-src ${connectSrc}`,
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
