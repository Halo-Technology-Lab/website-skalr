import Image from 'next/image';

import { Section } from '@/components/ui/Section';
import { beforeAfter } from '@/lib/content';

const { pairs, imageWidth, imageHeight } = beforeAfter;

/**
 * Before and after (wireframe note 6).
 *
 * The highest converting element on an aesthetics page and the highest risk one.
 * The consented, unretouched pack was signed off, so `imagePackApproved` is true
 * and the hold sentence no longer renders - but the qualifying caption below the
 * images is CAP-reviewed copy and is what makes the section defensible. It stays.
 *
 * Stepping through the pairs is done with radio inputs and sibling selectors, no
 * JavaScript, following the two patterns already in this repo: the native
 * details/summary FAQ and the chip radio group in CallbackForm. That keeps the
 * client-component list closed (see CLAUDE.md) and costs nothing on a 4G phone.
 * It also gets better keyboard behaviour than buttons would, because a native
 * radio group already supports arrow-key navigation between the pairs.
 *
 * All the state-dependent CSS lives in globals.css under "Before and after
 * carousel", including which panel shows and which prev/next label is offered.
 * Those rules are indexed by position, not by pair id, so nothing here has to
 * agree with a hardcoded selector - but there is one rule per pair, and
 * globals.css covers up to six. Add a pair beyond that and the CSS needs a line.
 */
export function BeforeAfter() {
  const label = (n: number) =>
    beforeAfter.pairLabel.replace('{n}', String(n)).replace('{total}', String(pairs.length));

  return (
    <Section soft labelledBy="before-after-heading">
      <h2 id="before-after-heading" className="section-heading lg:text-center">
        {beforeAfter.heading}
      </h2>

      <div className="mt-2 lg:mx-auto lg:mt-10 lg:max-w-5xl">
        <div className="ba" role="group" aria-label={beforeAfter.groupLabel}>
          {/* The radios come first so every panel and control below is a later
              sibling and can be selected from the checked state. */}
          {pairs.map((pair, i) => (
            <input
              key={pair.id}
              type="radio"
              name="ba-pair"
              id={pair.id}
              className="ba-input sr-only"
              defaultChecked={i === 0}
              aria-label={label(i + 1)}
            />
          ))}

          <div className="ba-track">
            {pairs.map((pair) => (
              <div key={pair.id} className="ba-panel">
                {/* Two figures rather than two bare images: the Before and After
                    captions have to be attached to the pictures they describe,
                    not floating above the grid. The mobile box is 4:5 like the
                    desktop one - the wireframe's 112px band cropped a face to a
                    strip across the eyes. */}
                <figure className="ba-figure">
                  <Image
                    src={pair.before}
                    alt={pair.beforeAlt}
                    width={imageWidth}
                    height={imageHeight}
                    className="ba-image"
                  />
                  <figcaption className="ba-caption">{beforeAfter.beforeLabel}</figcaption>
                </figure>
                <figure className="ba-figure">
                  <Image
                    src={pair.after}
                    alt={pair.afterAlt}
                    width={imageWidth}
                    height={imageHeight}
                    className="ba-image"
                  />
                  <figcaption className="ba-caption">{beforeAfter.afterLabel}</figcaption>
                </figure>
              </div>
            ))}
          </div>

          <div className="ba-nav">
            {/* Prev and next are labels for the neighbouring radio. Each one is
                rendered for every pair and CSS reveals only the ones that apply
                to the checked pair, which is how a stateless carousel knows what
                "next" means. They wrap, so the toggle never dead-ends. */}
            <div className="ba-arrows">
              {pairs.map((pair, i) => (
                <label
                  key={`prev-${pair.id}`}
                  htmlFor={pairs[(i - 1 + pairs.length) % pairs.length].id}
                  className="ba-arrow"
                >
                  <span className="sr-only">{beforeAfter.previous}</span>
                  <Chevron direction="left" />
                </label>
              ))}
            </div>

            <div className="ba-dots">
              {pairs.map((pair, i) => (
                <label key={`dot-${pair.id}`} htmlFor={pair.id} className="ba-dot">
                  <span className="sr-only">{label(i + 1)}</span>
                </label>
              ))}
            </div>

            <div className="ba-arrows">
              {pairs.map((pair, i) => (
                <label
                  key={`next-${pair.id}`}
                  htmlFor={pairs[(i + 1) % pairs.length].id}
                  className="ba-arrow"
                >
                  <span className="sr-only">{beforeAfter.next}</span>
                  <Chevron direction="right" />
                </label>
              ))}
            </div>
          </div>
        </div>

        <p className="micro">
          {beforeAfter.micro}
          {!beforeAfter.imagePackApproved && ` ${beforeAfter.hold}`}
        </p>
      </div>
    </Section>
  );
}

function Chevron({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d={direction === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
    </svg>
  );
}
