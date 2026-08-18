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

import { faq, hours, location } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

export function businessJsonLd(): Record<string, unknown> {
  const { clinic } = siteConfig;

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    // The public-facing brand, with the registered entity alongside it. Search
    // results should show what the ad showed, not the Companies House name.
    name: siteConfig.name,
    legalName: clinic.legalName,
    url: siteConfig.url,
    telephone: clinic.phoneHref,
    email: clinic.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: `${location.venue}, ${clinic.addressLine}`,
      addressLocality: clinic.city,
      postalCode: clinic.postcode,
      addressCountry: 'GB',
    },
    // Only published once the clinic has confirmed them. The brand reference
    // took these off the booking calendar, and hours that send someone to a shut
    // door are worse than no hours at all.
    ...(hours.confirmed
      ? {
          openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '08:00',
            closes: '17:00',
          },
        }
      : {}),
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
