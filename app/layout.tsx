import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { MetaPixel } from '@/components/analytics/MetaPixel';
import { siteConfig } from '@/lib/site-config';

/**
 * Inter, matching the wireframe's stack. next/font self-hosts the files at
 * build time, so there is no third-party font request, no render-blocking
 * stylesheet and no layout shift - and it satisfies the CSP, which allows
 * font-src 'self' only.
 */
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | The Korean Magic Lift in North London`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} | The Korean Magic Lift in North London`,
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
  // PLACEHOLDER assets: a flat mark and a flat OG card, so nothing 404s
  // before the real brand assets arrive.
  icons: {
    icon: [{ url: '/favicons/favicon.svg', type: 'image/svg+xml' }],
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
  themeColor: '#FFFFFF',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-body-lg focus:font-bold focus:text-white"
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
