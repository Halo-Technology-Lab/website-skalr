import { brandMarks, type BrandMarkName } from '@/lib/brand-marks';
import { cn } from '@/lib/utils';

/**
 * The client's brand marks, traced from the supplied artwork by
 * `npm run trace-brand`.
 *
 * Rendered as an SVG sprite rather than as <img> for two reasons. The mark has
 * to change colour with its surface - white over the hero video, sage-ink once
 * the header goes solid - which needs `currentColor` and therefore inline SVG.
 * And the same mark appears in the header and the hero, so a sprite puts the
 * (large) path data in the document once instead of once per use.
 *
 * SERVER COMPONENTS ONLY. `lib/brand-marks.ts` is around 76KB of path data; a
 * client component importing it would ship all of that to the browser.
 */

/**
 * The symbol definitions. Rendered exactly once, high in the document, before
 * anything that references it - a <use> pointing at a symbol later in the DOM
 * resolves in most browsers but can flash empty on first paint.
 */
export function BrandSprite({ marks }: { marks: readonly BrandMarkName[] }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      // Not `display: none`, which stops Safari resolving <use> against it.
      className="absolute h-0 w-0 overflow-hidden"
    >
      <defs>
        {/*
          <g>, not <symbol>. A <symbol> establishes its own viewport and scales
          its contents to fill whatever references it, which silently defeats the
          viewBox crop the header uses to show the wordmark alone. A <g> has no
          viewport of its own: the geometry lands in the referencing <svg>'s user
          coordinate system, so its viewBox crops exactly as expected.
        */}
        {marks.map((name) => (
          /* The fill rule is load-bearing, not decoration. Traced marks come out
             of potrace as one path whose nested contours are the holes - the
             face inside the cameo, the counters in the letterforms - and under
             nonzero every one of them fills in and the mark becomes a blob. The
             client's own vectors carry their own rule instead of being forced
             to evenodd, so they render exactly as they do on their site. */
          <g key={name} id={`brand-${name}`}>
            <path
              d={brandMarks[name].d}
              fill="currentColor"
              fillRule={brandMarks[name].fillRule}
            />
          </g>
        ))}
      </defs>
    </svg>
  );
}

type BrandMarkProps = {
  name: BrandMarkName;
  className?: string;
  /**
   * Accessible name. Pass this only where the mark STANDS IN for text - the
   * header, where it is the only thing naming the clinic. Where the brand name
   * is already in the copy beside it, leave it off so the mark is decorative
   * and a screen reader does not read the name twice.
   */
  title?: string;
  /**
   * Crop, as a viewBox over the same sprite geometry. Useful for drawing part of
   * a stacked mark - the cameo alone, say - without a second asset.
   */
  viewBox?: string;
};

export function BrandMark({ name, className, title, viewBox }: BrandMarkProps) {
  const mark = brandMarks[name];

  return (
    <svg
      viewBox={viewBox ?? mark.viewBox}
      className={cn('brand-mark', className)}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {title ? <title>{title}</title> : null}
      <use href={`#brand-${name}`} />
    </svg>
  );
}
