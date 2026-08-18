/**
 * Single source of truth for brand, contact and tracking values.
 *
 * The clinic block is taken from section 03 of the Hannah London brand
 * reference, cross-checked against the footer of the live site. Nothing else in
 * the codebase should hardcode a phone number, address or brand name.
 *
 * The reference is emphatic that this campaign page carries the COLINDALE
 * clinic only. Hannah London also trades from Harley Street; that address must
 * not appear anywhere on this page.
 */

const PLACEHOLDER_URL = 'https://example.com'; // TODO: replace with the live campaign domain

export const siteConfig = {
  /** Brand name as it should appear to visitors. The clinic brand, not the treatment. */
  name: 'Hannah London',

  /** Short name for the web app manifest and tight spaces. */
  shortName: 'Hannah London',

  /**
   * Appended to the brand name for the document and Open Graph titles, as
   * `${name} | ${tagline}`.
   *
   * NOT simply "Hannah London at Beaufort Park" - the brand name is already the
   * first half, so that would render "Hannah London | Hannah London at Beaufort
   * Park, Colindale". It names the treatment instead, using the same wording as
   * the approved hero headline.
   *
   * Deliberately factual - a treatment name and a location, no efficacy claim.
   * The title tag is a claim surface like any other, and the CAP-reviewed set
   * covers the page body, not the metadata.
   */
  tagline: 'The Korean Magic Lift at Beaufort Park, Colindale',

  /** Meta description for the campaign landing page. */
  description:
    'The Korean Magic Lift at Hannah London, Beaufort Park, Colindale. Dual wavelength laser and radiofrequency to lift, tighten and sculpt without surgery or needles. Request a call back.',

  /** Canonical URL, no trailing slash. Set NEXT_PUBLIC_SITE_URL in the environment. */
  url: (process.env.NEXT_PUBLIC_SITE_URL || PLACEHOLDER_URL).replace(/\/$/, ''),

  /** Open Graph image, relative to /public. */
  ogImage: '/og-image.png',

  clinic: {
    legalName: 'Hannah London Beauty Limited',
    /** Shown in the footer legal block as the trading name. */
    tradingName: 'Hannah London',
    /** Companies House number, England and Wales. */
    companyNumber: '09903147',
    /** ICO data protection register entry. */
    icoRegistration: 'ZB595688',

    venue: 'Beaufort Park',
    addressLine: '12 Boulevard Drive',
    city: 'London',
    postcode: 'NW9 5QF',

    /** Display form of the number, used as link text. */
    phoneDisplay: '020 8202 6187',
    /** E.164 form, used in tel: links. */
    phoneHref: '+442082026187',

    /**
     * General enquiries address, for structured data and the closing band.
     * NOT the lead notification recipient - that stays LEAD_NOTIFICATION_EMAIL.
     */
    email: 'info@hannahlondon.com',

    privacyUrl: 'https://hannahlondon.com/privacy-policy/',
    /**
     * The brand reference flags this slug as unverified. It resolves today, but
     * confirm it with the client before go-live.
     */
    termsUrl: 'https://hannahlondon.com/terms-and-conditions/',
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
