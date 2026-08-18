import { Section } from '@/components/ui/Section';
import { FORM_ANCHOR, offer } from '@/lib/content';
import { cn } from '@/lib/utils';

/**
 * Two options, one recommended (wireframe note 4).
 *
 * Two choices rather than three, because a landing page decision should be
 * simple. The course is marked as most chosen and broken down to £500 a session
 * so the better value is obvious without discount language. The no obligation
 * line stays close to every price, which is what the cosmetic interventions
 * guidance expects.
 */
export function Offer() {
  return (
    <Section soft labelledBy="offer-heading">
      <h2 id="offer-heading" className="section-heading lg:text-center">
        {offer.heading}
      </h2>

      <div className="mt-6 lg:mx-auto lg:mt-10 lg:grid lg:max-w-5xl lg:grid-cols-2 lg:items-start lg:gap-6">
        {offer.cards.map((card) => (
          <div
            key={card.name}
            className={cn(
              'relative mb-[9px] rounded-card border border-line bg-white p-3.5 lg:mb-0 lg:p-8',
              card.recommended && 'border-2 border-sage-deep'
            )}
          >
            {card.recommended && 'badge' in card && (
              <span className="absolute -top-3 left-4 rounded-tile bg-sage-deep px-2.5 py-1 text-micro font-semibold uppercase tracking-[1px] text-white">
                {card.badge}
              </span>
            )}
            <p className="mb-[3px] text-body font-semibold text-sage-ink">
              {card.name}
            </p>
            <p className="text-price font-semibold text-sage-ink">
              {card.price}
            </p>
            <p className="mt-1 text-body">{card.body}</p>
          </div>
        ))}
      </div>

      <div className="lg:mx-auto lg:max-w-5xl">
        <p className="micro">{offer.micro}</p>
        <a href={`#${FORM_ANCHOR}`} className="btn-alt mt-3 lg:mx-auto lg:mt-8 lg:max-w-xs">
          {offer.cta}
        </a>
      </div>
    </Section>
  );
}
