/**
 * schema.org JSON-LD.
 *
 * Deliberately conservative: it describes the clinic, the address and the
 * questions on the page, and it makes no claim about outcomes. Only FAQ entries
 * with approved answers are included - a placeholder answer must never reach
 * search results.
 *
 * Offers are left out until the price conflict in section 01 of the wireframe
 * is resolved. Publishing structured pricing that contradicts the clinic's own
 * page would make the discrepancy machine-readable.
 */

import { faq, location } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

export function businessJsonLd(): Record<string, unknown> {
  const { clinic } = siteConfig;

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    name: clinic.legalName || siteConfig.name,
    url: siteConfig.url,
    ...(clinic.phoneHref ? { telephone: clinic.phoneHref } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${location.venue}, ${clinic.addressLine}`,
      addressLocality: clinic.city,
      postalCode: clinic.postcode,
      addressCountry: 'GB',
    },
    areaServed: 'North London',
  };
}

export function faqJsonLd(): Record<string, unknown> {
  const answered = faq.items.filter((item) => item.answer);

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: answered.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
