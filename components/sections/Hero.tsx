import { HeroStills } from '@/components/sections/HeroStills';
import { HeroVideo } from '@/components/sections/HeroVideo';
import { FORM_ANCHOR, hero } from '@/lib/content';

/**
 * What the hero shows. Change this one line to switch.
 *
 *   'video'  - the treatment clip, autoplaying muted with a play/pause control.
 *              Costs ~1kB of JavaScript and a 2.4MB progressive download.
 *   'stills' - the three "after" frames, crossfading in pure CSS. No JavaScript
 *              and about 60kB.
 *
 * A build-time constant rather than a control on the page: which of the two the
 * hero shows is a decision about the campaign, not something a visitor should be
 * asked to make. Annotated with the union type on purpose, so both branches below
 * still typecheck rather than one being narrowed away as dead code.
 */
const HERO_MEDIA: 'video' | 'stills' = 'video';

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

      {/* Chosen by HERO_MEDIA above, not by the visitor. */}
      <div className="mt-3.5 lg:mt-7">
        {HERO_MEDIA === 'video' ? <HeroVideo /> : <HeroStills />}
      </div>

      {/* Grid items stretch to the tallest tile in the row, so each label is
          centred on both axes: without that, a one-line tile floats at the top
          while the tile beside it wraps to two. */}
      <ul className="mt-3.5 grid grid-cols-2 gap-[7px] lg:mt-7 lg:grid-cols-4">
        {hero.trust.map((item) => (
          <li
            key={item}
            className="flex items-center justify-center border border-line bg-white p-2 text-center text-micro font-semibold leading-[1.35] text-ink md:text-caption lg:p-3"
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
