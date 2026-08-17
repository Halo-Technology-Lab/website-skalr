import { Section } from '@/components/ui/Section';
import { howItWorks } from '@/lib/content';

/**
 * Substance, for the sceptical reader (wireframe note 5).
 *
 * Written as mechanism rather than outcome, which keeps it clear of the
 * substantiation problem that outcome claims create. Three columns on desktop,
 * as the desktop layout specifies.
 */
export function HowItWorks() {
  return (
    <Section labelledBy="how-it-works-heading">
      <p className="eyebrow">{howItWorks.eyebrow}</p>
      <h2 id="how-it-works-heading" className="section-heading">
        {howItWorks.heading}
      </h2>

      <ol className="mt-3 lg:mt-10 lg:grid lg:grid-cols-3 lg:gap-8">
        {howItWorks.steps.map((step, index) => (
          <li key={step.title} className="mb-3 flex gap-2.5 last:mb-0 lg:mb-0 lg:block">
            <span
              aria-hidden="true"
              className="flex h-[25px] w-[25px] flex-none items-center justify-center rounded-full bg-accent-soft text-micro font-extrabold text-accent-ink lg:h-9 lg:w-9 md:text-body-lg"
            >
              {index + 1}
            </span>
            <div className="lg:mt-4">
              <strong className="font-bold text-ink lg:block md:text-h3">
                {step.title}
              </strong>
              <br className="lg:hidden" />
              <span className="lg:mt-2 lg:block md:text-lead">{step.body}</span>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
