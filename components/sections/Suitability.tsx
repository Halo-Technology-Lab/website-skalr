import { Section } from '@/components/ui/Section';
import { suitability } from '@/lib/content';

/**
 * Disqualification improves lead quality (wireframe note 7).
 *
 * Telling the wrong people not to book protects the call team's time and raises
 * the show rate, and it puts the safety information in front of the booking
 * rather than after it.
 */
export function Suitability() {
  return (
    <Section labelledBy="suitability-heading">
      <h2 id="suitability-heading" className="section-heading lg:text-center">
        {suitability.heading}
      </h2>

      <div className="mt-2 grid gap-[9px] lg:mx-auto lg:mt-10 lg:max-w-5xl lg:grid-cols-2 lg:gap-6">
        {suitability.columns.map((column) => (
          <div key={column.title} className="rounded-card border border-line bg-white p-[11px] lg:p-6">
            {/* The heading sits in its own bordered box inside the card, as
                drawn. It takes the tile radius rather than the card one: a 15px
                box inside a 15px box reads as a mistake, because the inner
                corner should always be tighter than the one containing it. */}
            <h3 className="mb-[5px] rounded-tile border border-line bg-white p-[11px] text-h3 font-semibold text-sage-ink lg:mb-3 lg:p-4">
              {column.title}
            </h3>
            <p className="text-body">{column.body}</p>
          </div>
        ))}
      </div>

      <p className="micro lg:mx-auto lg:max-w-5xl lg:text-center">{suitability.micro}</p>
    </Section>
  );
}
