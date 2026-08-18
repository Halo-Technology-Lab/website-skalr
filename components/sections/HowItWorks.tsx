import { TreatmentVideo } from '@/components/sections/TreatmentVideo';
import { Section } from '@/components/ui/Section';
import { howItWorks } from '@/lib/content';

/**
 * Substance, for the sceptical reader (wireframe note 5).
 *
 * Written as mechanism rather than outcome, which keeps it clear of the
 * substantiation problem that outcome claims create.
 *
 * The practitioner clip lives here since the rebrand moved the client's brand
 * film into the hero, and it is a better home for it than the hero was: a
 * practitioner explaining what the device does, beside the three steps that
 * describe the same thing. The clip is 9:16, so at desktop it takes a fixed
 * narrow column and the steps stack beside it rather than under it.
 *
 * Desktop is an editorial split, and every part of it is about the clip being
 * 533px tall against roughly 300px of copy:
 *
 *  - The band caps at 5xl. Every other band caps its measure (Offer at 3xl,
 *    Before and after at 2xl); left at the full page width this one read as a
 *    stranded column with a dead right-hand third.
 *  - The heading sits in the text column rather than on a full-width row above
 *    it, which is what closes most of the height difference against the clip.
 *  - The steps are a divided list filling the rest of that column: each row
 *    takes an equal share of the remaining height with its content centred, so
 *    the two columns finish level instead of the list floating in the middle.
 *
 * DOM order is heading, clip, steps, which is the mobile order. Desktop only
 * moves the cells, so nothing has to be re-read to follow it.
 */
export function HowItWorks() {
  return (
    <Section labelledBy="how-it-works-heading">
      {/* The cap sits here rather than on Section's innerClassName: `cn` is
          twMerge, which does not recognise the custom `max-w-page` as part of
          the max-w group, so an override there loses to Tailwind's own class
          order and silently does nothing. */}
      <div className="lg:mx-auto lg:grid lg:max-w-5xl lg:grid-cols-[300px_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12">
        <div className="lg:col-start-2 lg:row-start-1 lg:pb-6">
          <p className="eyebrow">{howItWorks.eyebrow}</p>
          <h2 id="how-it-works-heading" className="section-heading">
            {howItWorks.heading}
          </h2>
        </div>

        <div className="mx-auto mt-6 max-w-[280px] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mx-0 lg:mt-0 lg:max-w-none">
          <TreatmentVideo />
        </div>

        <ol className="mt-8 divide-y divide-line border-t border-line lg:col-start-2 lg:row-start-2 lg:mt-0 lg:flex lg:h-full lg:flex-col">
          {howItWorks.steps.map((step, index) => (
            <li
              key={step.title}
              className="lg:flex lg:flex-1 lg:flex-col lg:justify-center"
            >
              {/* The row centres itself in its share of the column height, but
                  the numeral stays level with the title rather than with the
                  middle of a two-line step. */}
              <div className="flex gap-4 py-5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-surface-sage text-body font-semibold text-sage-deep"
                >
                  {index + 1}
                </span>
                <div>
                  <strong className="block font-serif text-h3 font-normal text-sage-ink">
                    {step.title}
                  </strong>
                  <span className="mt-1.5 block">{step.body}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}
