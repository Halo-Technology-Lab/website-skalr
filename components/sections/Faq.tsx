import { Section } from '@/components/ui/Section';
import { faq } from '@/lib/content';

/**
 * FAQ as objection handling (wireframe note 8).
 *
 * The six questions are the ones that stop a booking, in the order the
 * wireframe sets. Built on native details/summary, so the accordion works with
 * no JavaScript at all - it opens instantly, it is keyboard and screen reader
 * accessible for free, and it costs the page nothing.
 *
 * Only the downtime answer exists in the approved claim set. The other five
 * render a visible placeholder rather than invented copy: these are medical
 * advertising claims and must come from the CAP-reviewed wording.
 */
export function Faq() {
  return (
    <Section soft labelledBy="faq-heading">
      <h2 id="faq-heading" className="section-heading lg:text-center">
        {faq.heading}
      </h2>

      <div className="mt-2 lg:mx-auto lg:mt-10 lg:max-w-3xl">
        {faq.items.map((item, index) => (
          <details
            key={item.question}
            open={index === 0}
            className="group border-b border-line"
          >
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2.5 py-[11px] text-question font-semibold text-ink marker:content-none md:text-lead lg:py-4">
              {item.question}
              <span
                aria-hidden="true"
                className="flex-none text-body-lg font-bold leading-none text-accent-ink transition-transform duration-150 group-open:rotate-45 md:text-h3"
              >
                +
              </span>
            </summary>
            <div className="pb-3 text-micro lg:pb-5 md:text-lead">
              {item.answer ?? (
                <span className="text-accent-ink">{faq.placeholderAnswer}</span>
              )}
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
