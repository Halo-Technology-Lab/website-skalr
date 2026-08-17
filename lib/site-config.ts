/**
 * Single source of truth for brand, contact and tracking values.
 *
 * Everything the wireframe leaves open (section 07) is marked TODO. Nothing
 * else in the codebase should hardcode a phone number, address or brand name.
 */

const PLACEHOLDER_URL = 'https://example.com'; // TODO: replace with the live campaign domain

export const siteConfig = {
  /** Brand name as it should appear to visitors. */
  name: 'Alteon at Colindale',

  /** Short name for the web app manifest and tight spaces. */
  shortName: 'Alteon',

  /** Meta description for the campaign landing page. */
  description:
    'Alteon at Beaufort Park, Colindale. Dual wavelength laser and radiofrequency to lift, tighten and sculpt without surgery or needles. Request a call back.',

  /** Canonical URL, no trailing slash. Set NEXT_PUBLIC_SITE_URL in the environment. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || PLACEHOLDER_URL).replace(/\/$/, ''),

  /** Open Graph image, relative to /public. */
  ogImage: '/og-image.png', // PLACEHOLDER: flat 1200x630 card

  clinic: {
    // TODO: clinic legal name and registration (wireframe section 07, item 5).
    legalName: '',
    venue: 'Beaufort Park',
    addressLine: '12 Boulevard Drive',
    city: 'London',
    postcode: 'NW9 5QF',
    /** Display form of the number, used as link text. */
    phoneDisplay: '020 0000 0000', // TODO: real clinic number
    /** E.164 form, used in tel: links. */
    phoneHref: '+442000000000', // TODO: real clinic number
    /** TODO: privacy policy URL (wireframe section 07, item 5). */
    privacyUrl: '',
  },

  /** GA4 measurement ID. Analytics is skipped entirely when unset. */
  analyticsId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,

  /** Meta Pixel ID. The pixel is not loaded at all when unset. */
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
} as const;

export type SiteConfig = typeof siteConfig;

/** Absolute URL helper for canonical tags, sitemaps and JSON-LD. */
export function absoluteUrl(path = '/'): string {
  return `${siteConfig.url}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Full address on one line, for structured data and the location section. */
export function formattedAddress(): string {
  const { addressLine, city, postcode } = siteConfig.clinic;
  return `${addressLine}, ${city} ${postcode}`;
}
