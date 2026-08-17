import { CallLink } from '@/components/ui/CallLink';
import { PhoneIcon } from '@/components/ui/PhoneIcon';

/**
 * Sticky header: clinic wordmark and a call action, exactly as drawn.
 *
 * The wordmark is a dashed placeholder because the wireframe deliberately uses
 * no clinic logo. Replace the span with next/image once the asset arrives, and
 * give it explicit dimensions so the header does not shift on load.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/[.97] backdrop-blur-sm supports-[backdrop-filter]:bg-white/90">
      <div className="mx-auto flex w-full max-w-page items-center justify-between px-[14px] py-[10px] lg:px-8 lg:py-4">
        <span className="border border-dashed border-ghost px-2.5 py-1.5 text-[9px] uppercase tracking-[1.4px] text-muted-line md:text-[10px]">
          Clinic wordmark
        </span>

        {/* No min-height: that would push the bar past the drawn 49px. The
            pseudo-element gives the link a 44px tap target instead. */}
        <CallLink
          source="header"
          className="relative flex items-center gap-1.5 text-[11px] font-bold text-ink after:absolute after:-inset-x-3 after:-inset-y-[14px] md:text-caption"
        >
          Call
          <PhoneIcon className="h-4 w-4" />
        </CallLink>
      </div>
    </header>
  );
}
