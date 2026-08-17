import { CallLink } from '@/components/ui/CallLink';
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
      {/* Geometry as drawn: 9px/14px padding, 9px gap, 12px button padding on
          13px text, which lands the buttons at 44px. */}
      <div className="flex items-center gap-[9px] px-[14px] py-[9px]">
        <a
          href={`#${FORM_ANCHOR}`}
          className="flex flex-1 items-center justify-center rounded-md bg-ink p-3 text-center text-body font-bold text-white transition-colors duration-150 hover:bg-black"
        >
          {stickyBar.primary}
        </a>
        <CallLink
          source="sticky-bar"
          className="flex items-center rounded-md border-[1.5px] border-ink px-[14px] py-3 text-body font-bold text-ink"
        >
          {stickyBar.secondary}
        </CallLink>
      </div>
    </div>
  );
}
