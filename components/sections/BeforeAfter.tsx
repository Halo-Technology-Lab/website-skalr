import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { Section } from '@/components/ui/Section';
import { beforeAfter } from '@/lib/content';

/**
 * Before and after, gated on evidence (wireframe note 6).
 *
 * The highest converting element on an aesthetics page and the highest risk
 * one. The slot is designed in with the qualifying line attached, and it stays
 * a placeholder until the consented, unretouched image pack exists. Flip
 * `imagePackApproved` in lib/content.ts once it is signed off, and the hold
 * sentence drops out of the caption.
 */
export function BeforeAfter() {
  return (
    <Section soft labelledBy="before-after-heading">
      <h2 id="before-after-heading" className="section-heading lg:text-center">
        {beforeAfter.heading}
      </h2>

      <div className="mt-2 lg:mx-auto lg:mt-10 lg:max-w-2xl">
        {beforeAfter.pairs.map((pair) => (
          <div key={pair.before} className="grid grid-cols-2 gap-[7px] lg:gap-4">
            <MediaPlaceholder label={pair.before} className="h-28 md:h-auto" aspect="md:aspect-[4/5]" />
            <MediaPlaceholder label={pair.after} className="h-28 md:h-auto" aspect="md:aspect-[4/5]" />
          </div>
        ))}

        <p className="micro">
          {beforeAfter.micro}
          {!beforeAfter.imagePackApproved && ` ${beforeAfter.hold}`}
        </p>
      </div>
    </Section>
  );
}
