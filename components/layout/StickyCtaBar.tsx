import { CallLink } from '@/components/ui/CallLink';
import { PhoneIcon } from '@/components/ui/PhoneIcon';
import { FORM_ANCHOR, stickyBar } from '@/lib/content';

/**
 * Booking and call within thumb reach at every scroll position - the wireframe
 * calls this the single biggest mobile conversion gain on a page like this.
 *
 * Mobile and tablet only. On desktop the form card is pinned beside the hero,
 * so the action is already permanently visible and a bar would just cover
 * content. Sits above the iOS home indicator via the safe-area inset.
 */
export function StickyCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-bar lg:hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2.5">
        <a href={`#${FORM_ANCHOR}`} className="btn flex-1">
          {stickyBar.primary}
        </a>
        <CallLink
          source="sticky-bar"
          className="flex min-h-[48px] items-center gap-1.5 rounded-md border-[1.5px] border-ink px-4 text-body font-bold text-ink"
        >
          {stickyBar.secondary}
          <PhoneIcon className="h-4 w-4" />
        </CallLink>
      </div>
    </div>
  );
}
