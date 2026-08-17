import { cn } from '@/lib/utils';

/**
 * One band of the page.
 *
 * Mobile reproduces the wireframe frame exactly: 18px side padding, 20px top
 * and bottom, hairline rule between sections. Desktop drops the hairlines and
 * opens the band out, with the soft background carrying the rhythm instead.
 */
export function Section({
  id,
  soft = false,
  className,
  innerClassName,
  labelledBy,
  children,
}: {
  id?: string;
  soft?: boolean;
  className?: string;
  innerClassName?: string;
  labelledBy?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'scroll-mt-14 border-b border-line px-[18px] py-5 md:border-b-0 md:px-6 md:py-14 lg:scroll-mt-20 lg:px-8 lg:py-20',
        soft ? 'bg-soft' : 'bg-white',
        className
      )}
    >
      {/* The measure is capped at tablet widths: full-bleed 13px copy across a
          730px column is unreadable, and the two-column desktop layout does not
          start until lg. */}
      <div
        className={cn(
          'mx-auto w-full max-w-page md:max-w-2xl lg:max-w-page',
          innerClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
