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

      <div className="mt-3 grid gap-2.5 lg:mx-auto lg:mt-10 lg:max-w-4xl lg:grid-cols-2 lg:gap-6">
        {suitability.columns.map((column) => (
          <div key={column.title} className="border border-line bg-white p-3 lg:p-6">
            <h3 className="mb-1.5 text-caption font-bold text-ink md:text-h3">
              {column.title}
            </h3>
            <p className="text-micro md:text-lead">{column.body}</p>
          </div>
        ))}
      </div>

      <p className="micro lg:mx-auto lg:max-w-4xl lg:text-center">{suitability.micro}</p>
    </Section>
  );
}
