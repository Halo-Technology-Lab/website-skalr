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
      <div className="mx-auto flex h-14 w-full max-w-page items-center justify-between px-[18px] lg:h-16 lg:px-8">
        <span className="border border-dashed border-ghost px-2.5 py-1.5 text-[9px] uppercase tracking-[1.4px] text-muted md:text-[10px]">
          Clinic wordmark
        </span>

        <CallLink
          source="header"
          className="-mr-2 flex min-h-[44px] items-center gap-1.5 px-2 text-micro font-bold text-ink md:text-caption"
        >
          Call
          <PhoneIcon className="h-4 w-4" />
        </CallLink>
      </div>
    </header>
  );
}
