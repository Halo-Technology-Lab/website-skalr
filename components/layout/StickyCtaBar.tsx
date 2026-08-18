import { CallLink } from '@/components/ui/CallLink';
import { FORM_ANCHOR, stickyBar } from '@/lib/content';

/**
 * Booking and call within thumb reach at every scroll position - the wireframe
 * calls this the single biggest mobile conversion gain on a page like this.
 *
 * Mobile and tablet only. On desktop the form card is pinned beside the hero,
 * so the action is already permanently visible and a bar would just cover
 * content.
 *
 * The padding is 19px on all four sides, which is what the bottom used to come
 * to once its two parts were added up (9px on the row plus 10px on the shell).
 * The other three sides were 12px and 14px, so the bar read bottom-heavy.
 *
 * The safe-area inset stays on the outer shell, OUTSIDE that 19px. The inset
 * alone would put the buttons flush against the top of the iOS home indicator,
 * which both looks cramped and puts a tap target right where the system
 * swipe-up gesture lives; keeping it outside means the padding still reads as
 * 19px all round on a device that has one, and on a device with no inset
 * nothing changes at all.
 */
export function StickyCtaBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] shadow-bar lg:hidden">
      {/* 9px gap and 12px button padding on 13px text, which lands the buttons
          at 44px. */}
      <div className="flex items-center gap-[9px] p-[19px]">
        <a
          href={`#${FORM_ANCHOR}`}
          className="flex flex-1 items-center justify-center rounded-control bg-sage-deep p-3 text-center text-body font-semibold text-white transition-colors duration-150 hover:bg-sage-deeper"
        >
          {stickyBar.primary}
        </a>
        <CallLink
          source="sticky-bar"
          className="flex items-center rounded-control border-[1.5px] border-sage-deep px-[14px] py-3 text-body font-semibold text-sage-ink"
        >
          {stickyBar.secondary}
        </CallLink>
      </div>
    </div>
  );
}
