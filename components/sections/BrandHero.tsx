import { BrandHeroVideo } from '@/components/sections/BrandHeroVideo';
import { CallbackForm } from '@/components/sections/CallbackForm';
import { hero } from '@/lib/content';

/** The sentinel HeaderScrollState watches to flip the header's state. */
export const HERO_SENTINEL = 'hero-top';

/**
 * The hero: the client's brand film behind the copy, under the sage scrim, with
 * the mark, the headline, the CTA and the call-back form on top.
 *
 * The client's own hero is purely cinematic - film, centred white mark, no text
 * at all. This one keeps that reading while doing the job a paid-social landing
 * page has to do, which is to put the form in front of someone who arrived from
 * an ad. So the fold carries both: mark and headline on the left, form card on
 * the right, film behind all of it.
 *
 * `hero-brand-frame` is the positioning context that decides how far the film
 * reaches - see .hero-brand-frame in globals.css. It is what keeps the CTA on
 * the film at every viewport height rather than at one.
 *
 * Note there is no horizontal padding on the grid: on mobile it lives on the
 * copy and on the form's own shell, so the frame runs edge to edge and the film
 * is genuinely full bleed. At lg it lives on .hero-brand-inner instead - OUTSIDE
 * the max-w-page measure, which is the convention Section uses. Putting it on
 * the grid (inside the measure) put the hero copy 32px right of every other
 * band's left edge.
 */
export function BrandHero() {
  return (
    <section className="hero-brand" aria-labelledby="hero-heading">
      <span id={HERO_SENTINEL} aria-hidden="true" className="absolute left-0 top-0 h-px w-px" />

      <div className="hero-brand-inner">
        <div className="mx-auto grid w-full max-w-page lg:grid-cols-[1.1fr_minmax(0,420px)] lg:items-center lg:gap-14 lg:pb-12 lg:pt-[118px]">
          <div className="hero-brand-frame">
            <BrandHeroVideo />

            <div className="hero-brand-copy">
              {/* The brand mark lives in the header now. It used to sit here
                  as well, and two lockups 80px apart read as an accident rather
                  than a decision - so the eyebrow is the entry point: location,
                  then claim. The header is fixed, so the mark is on screen at
                  every scroll position instead of only at the top. */}
              <p className="eyebrow text-white/80">{hero.eyebrow}</p>

              <h1 id="hero-heading" className="text-h1 text-white">
                {hero.headline}
              </h1>

              <p className="mt-4 max-w-prose text-lead text-white/90 lg:mt-6">{hero.body}</p>

              {/* Trust tiles invert on the scrim. A white-filled tile here would
                  read as a second card and compete with the real form. */}
              <ul className="mt-5 grid grid-cols-2 gap-2 lg:mt-8 lg:grid-cols-4">
                {hero.trust.map((item) => (
                  <li
                    key={item}
                    className="flex items-center justify-center rounded-tile border border-white/30 bg-white/10 p-2.5 text-center text-micro font-semibold leading-[1.35] text-white backdrop-blur-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>

              {/*
                There is deliberately no CTA button here.

                It used to carry a mobile-only "Book your consultation" that
                scrolled to the form - but StickyCtaBar is fixed to the bottom of
                every mobile viewport with the same label and the same target,
                which put the two buttons about 50px apart and made the hero one
                pure duplication. Worse, the copy is too tall to fit above the
                bar on a 392x741 phone, so the hero button rendered half behind
                it. Removing the duplicate is what makes the rest fit.

                Desktop never had one: the form is already in the fold there, so
                a button whose only job is to scroll to it would be noise.
              */}
              <p className="mt-4 max-w-prose text-micro text-white/75">{hero.micro}</p>
            </div>
          </div>

          <CallbackForm />
        </div>
      </div>
    </section>
  );
}
