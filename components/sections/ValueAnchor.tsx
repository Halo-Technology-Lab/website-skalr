import { Section } from '@/components/ui/Section';
import { valueAnchor } from '@/lib/content';

/**
 * Anchor the price before showing the price (wireframe note 3).
 *
 * £750 reads as expensive in isolation and as a bargain next to the £2,000 that
 * comparable platforms command. Framed as a technology difference rather than a
 * discount, which protects the premium position of the treatment.
 */
export function ValueAnchor() {
  return (
    <Section labelledBy="value-anchor-heading">
      <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
        <div>
          <p className="eyebrow">{valueAnchor.eyebrow}</p>
          <h2 id="value-anchor-heading" className="section-heading">
            {valueAnchor.heading}
          </h2>
          <p className="mt-2 max-w-prose lg:mt-4 md:text-lead">{valueAnchor.body}</p>
        </div>

        <div className="mt-3 lg:mt-0">
          <div className="border border-line">
            <div className="flex items-center justify-between border-b border-line bg-white px-2.5 py-2.5 lg:px-5 lg:py-4">
              <span className="text-micro text-muted md:text-lead">
                {valueAnchor.comparisonLabel}
              </span>
              <span className="text-caption text-muted line-through md:text-lead">
                {valueAnchor.comparisonPrice}
              </span>
            </div>
            <div className="flex items-center justify-between bg-soft px-2.5 py-2.5 lg:px-5 lg:py-4">
              <span className="text-micro font-bold text-ink md:text-lead">
                {valueAnchor.ourLabel}
              </span>
              <span className="text-body-lg font-extrabold text-ink md:text-price">
                {valueAnchor.ourPrice}
              </span>
            </div>
          </div>
          <p className="micro">{valueAnchor.micro}</p>
        </div>
      </div>
    </Section>
  );
}
