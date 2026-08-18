import type { Metadata, Viewport } from 'next';
import { Gelasio, Nunito_Sans } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { MetaPixel } from '@/components/analytics/MetaPixel';
import { siteConfig } from '@/lib/site-config';

/**
 * The brand reference's two families, and it is explicit that there is no third.
 *
 * Loaded through next/font rather than the <link> the reference supplies. That
 * snippet points at fonts.googleapis.com and fonts.gstatic.com; the CSP in
 * next.config.js sets `style-src 'self' 'unsafe-inline'` and `font-src 'self'`,
 * so it would be blocked on both counts and the page would silently render in
 * Georgia and Verdana. next/font self-hosts the files at build time, which
 * satisfies the CSP unchanged and also removes the render-blocking stylesheet
 * and the layout shift.
 *
 * Both are variable fonts, so the whole weight range the reference asks for
 * costs one file each: Gelasio 400-700, Nunito Sans 300-700 with italics.
 */
const gelasio = Gelasio({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-gelasio',
  fallback: ['Georgia', 'Times New Roman', 'serif'],
});

const nunito = Nunito_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-nunito',
  fallback: ['Verdana', 'Arial', 'sans-serif'],
  // next/font has no metric overrides for Nunito Sans, so it cannot generate a
  // size-adjusted fallback face and warns on every build. Turning the feature
  // off says so explicitly and hands the fallback to the stack above, which is
  // the one the brand reference specifies.
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | ${siteConfig.tagline}`,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  // Generated from the traced brand mark by npm run build-icons. The favicon is
  // the crest alone - at 32px the oval cameo's ring closes into a blob and the
  // wordmark under it is unreadable.
  icons: {
    icon: [
      { url: '/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/favicons/apple-touch-icon.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#506766',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-GB"
      className={`${gelasio.variable} ${nunito.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen" suppressHydrationWarning>
        {/*
          Sets the header's state BEFORE first paint.

          HeaderScrollState's IntersectionObserver is what keeps this in step
          while scrolling, but an effect only runs after the first paint - so on
          its own it means every single load paints one frame of the solid white
          header on top of the hero film before flipping it transparent. That
          flash is on 100% of visits.

          Two lines inline, ahead of the hero in document order, removes it. With
          JavaScript off the attribute is never set at all and the header falls
          back to its solid state, which is the legible one.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "document.documentElement.dataset.scrolled=window.scrollY>0?'true':'false'",
          }}
        />

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-sage-deep focus:px-4 focus:py-2 focus:text-body focus:font-semibold focus:text-white"
        >
          Skip to content
        </a>

        {children}

        {siteConfig.analyticsId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${siteConfig.analyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${siteConfig.analyticsId}');`}
            </Script>
          </>
        )}
        <MetaPixel />
      </body>
    </html>
  );
}
