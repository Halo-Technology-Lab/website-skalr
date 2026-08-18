import Image from 'next/image';

import { BrandMark } from '@/components/ui/BrandMark';
import { Section } from '@/components/ui/Section';
import { practitioner } from '@/lib/content';

/**
 * The lead clinician band, directly after the hero.
 *
 * Modelled on the equivalent band on the client's home page: a tinted card with
 * the quote on the left and the figure bleeding off the right edge, cropping at
 * the card boundary rather than sitting in a box of its own. That bleed is the
 * whole visual idea, which is why the card is overflow-hidden and the image is
 * absolutely positioned at desktop instead of being a grid cell.
 *
 * The copy is the client's own with one claim-bearing sentence removed - read
 * the compliance note on `practitioner` in lib/content.ts before touching it.
 */
export function Practitioner() {
  const { quote, name, role, registration, photo } = practitioner;

  return (
    <Section labelledBy="practitioner-heading">
      <div className="practitioner-card">
        <div className="flex flex-col lg:block">
          <div className="p-6 lg:w-[60%] lg:p-12">
            {/* The name is the heading. It is what the band is about, and it
                keeps the document outline honest without inventing a title. */}
            <h2 id="practitioner-heading" className="sr-only">
              {name}, {role}
            </h2>

            <blockquote className="text-lead text-sage-ink">
              {quote.map((para) => (
                <p key={para} className="mt-4 first:mt-0">
                  {para}
                </p>
              ))}
            </blockquote>

            <footer className="mt-8">
              <BrandMark name="signature" className="w-[150px] text-sage-ink lg:w-[180px]" />
              <p className="mt-3 text-body font-semibold text-sage-ink">{name}</p>
              <p className="text-micro text-sage-ink">
                {role}
                {registration ? ` · ${registration}` : ''}
              </p>
            </footer>
          </div>

          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            className="practitioner-figure"
          />
        </div>
      </div>
    </Section>
  );
}
