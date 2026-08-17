import { cn } from '@/lib/utils';

/**
 * Stands in for every image, clip and map until the real assets exist.
 *
 * Drawn entirely in CSS, so a page full of them costs zero network requests and
 * zero layout shift. When an asset lands, swap the element for next/image with
 * explicit width and height (or a poster-framed <video> for the hero clip) and
 * keep the same aspect ratio so nothing below it moves.
 */
export function MediaPlaceholder({
  label,
  className,
  aspect,
}: {
  label: string;
  className?: string;
  /** Tailwind aspect utility, e.g. "aspect-[16/9]". Prefer this over a fixed height. */
  aspect?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Placeholder: ${label}`}
      className={cn('media-placeholder', aspect, className)}
    >
      <span aria-hidden="true">{label}</span>
    </div>
  );
}
