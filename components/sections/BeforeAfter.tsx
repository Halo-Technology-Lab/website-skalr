import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { Section } from '@/components/ui/Section';
import { beforeAfter } from '@/lib/content';

/**
 * Before and after, gated on evidence (wireframe note 6).
 *
 * The highest converting element on an aesthetics page and the highest risk
 * one. The slot is designed in with the qualifying line attached, and it stays
 * a placeholder until the consented, unretouched image pack exists. Flip
 * `imagePackApproved` in lib/content.ts once it is signed off; until then the
 * section renders with an explicit hold notice so nobody publishes by accident.
 */
export function BeforeAfter() {
  return (
    <Section soft labelledBy="before-after-heading">
      <h2 id="before-after-heading" className="section-heading lg:text-center">
        {beforeAfter.heading}
      </h2>

      <div className="mt-3 lg:mx-auto lg:mt-10 lg:max-w-2xl">
        {beforeAfter.pairs.map((pair) => (
          <div key={pair.before} className="grid grid-cols-2 gap-[7px] lg:gap-4">
            <MediaPlaceholder label={pair.before} className="h-28 md:h-auto" aspect="md:aspect-[4/5]" />
            <MediaPlaceholder label={pair.after} className="h-28 md:h-auto" aspect="md:aspect-[4/5]" />
          </div>
        ))}

        <p className="micro">{beforeAfter.micro}</p>

        {!beforeAfter.imagePackApproved && (
          <p className="mt-2 border-l-2 border-accent-ink bg-white px-3 py-2 text-micro font-semibold text-accent-ink md:text-caption">
            Hold: do not publish until the consent and image pack is signed off.
          </p>
        )}
      </div>
    </Section>
  );
}
