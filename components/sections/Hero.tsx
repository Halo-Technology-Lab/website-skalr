import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { FORM_ANCHOR, hero } from '@/lib/content';

/**
 * Hero, earning the scroll in one screen (wireframe note 1).
 *
 * Location sits above the headline because the campaign runs on a five to eight
 * mile radius and proximity is the first question a Meta visitor has. The four
 * trust tiles answer the four objections that would otherwise force a scroll:
 * time, downtime, invasiveness and who performs it.
 */
export function Hero() {
  return (
    <div className="mx-auto w-full border-b border-line px-[18px] py-5 md:max-w-2xl md:border-b-0 md:px-6 md:py-12 lg:max-w-none lg:p-0">
      <p className="eyebrow">{hero.eyebrow}</p>

      <h1 className="text-h1 font-extrabold text-ink md:text-h1-lg">{hero.headline}</h1>

      <p className="mt-2.5 max-w-prose lg:mt-5 md:text-lead">{hero.body}</p>

      {/* Above the fold, so this is the one asset that must not lazy load.
          Replace with next/image priority, or a muted autoplay clip with a
          poster frame, keeping the 16/9 box so nothing below it shifts. */}
      <MediaPlaceholder
        label={hero.mediaLabel}
        className="mt-3.5 h-[150px] md:h-auto lg:mt-7"
        aspect="md:aspect-[16/9]"
      />

      <ul className="mt-3.5 grid grid-cols-2 gap-[7px] lg:mt-7 lg:grid-cols-4">
        {hero.trust.map((item) => (
          <li
            key={item}
            className="border border-line bg-white p-2 text-center text-micro font-semibold leading-[1.35] text-ink md:text-caption lg:p-3"
          >
            {item}
          </li>
        ))}
      </ul>

      <a href={`#${FORM_ANCHOR}`} className="btn mt-3 lg:mt-7 lg:max-w-xs">
        {hero.cta}
      </a>

      <p className="micro max-w-prose">{hero.micro}</p>
    </div>
  );
}
