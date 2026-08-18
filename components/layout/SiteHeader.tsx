import { BrandMark } from '@/components/ui/BrandMark';
import { CallLink } from '@/components/ui/CallLink';
import { PhoneIcon } from '@/components/ui/PhoneIcon';
import { siteConfig } from '@/lib/site-config';

/**
 * Sticky header: the brand mark and a call action, and nothing else.
 *
 * Brand reference build note 1 - this is a standalone campaign page, so the main
 * site navigation is stripped and the only paths out are book or call.
 *
 * Two states, driven by the `data-scrolled` attribute HeaderScrollState puts on
 * <html>. Both keep the content white, matching the client's own header, so the
 * only thing that changes is the background:
 *
 *   over the hero   transparent, sitting on the film's scrim
 *   scrolled        sage, the same colour the client's sticky header uses
 *
 * It is deeper than a typical bar - around 94px on mobile, 108px on desktop -
 * because it carries the stacked lockup. See the note on the mark below.
 *
 * Because the content never changes colour there is no state to get wrong if the
 * observer never runs: the default (no attribute) is the sage bar, which is the
 * legible one anywhere on the page.
 *
 * CONTRAST, on the record. White on sage measures 2.62:1. That is below WCAG AA
 * for the phone number (4.5:1) and below 1.4.11 for the mark (3:1). It is the
 * client's own header colour, taken from their live site and specifically
 * requested, so it ships - but `sage-deep` is a one-token swap here and measures
 * 6.05:1 if that trade is ever revisited.
 */
export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-sage transition-colors duration-300 [html[data-scrolled='false']_&]:bg-transparent">
      <div className="mx-auto flex w-full max-w-page items-center justify-between gap-4 px-[18px] py-3 lg:px-8">
        <a href="#main" className="flex items-center text-white">
          {/*
            The full stacked lockup, which used to sit in the hero. It is here
            rather than there so the brand is on screen at every scroll position
            instead of scrolling away, and so the page carries ONE mark - the
            header wordmark and the hero lockup together read as an accident.

            Sized for the fold, not for legibility of the small LONDON line. The
            mark is 1.365:1 and its bands measure out at 0.215H for HANNAH and
            0.075H for LONDON, so a readable 7px LONDON needs a ~117px header -
            and the header's height comes straight out of the desktop fold,
            because the hero's top padding has to clear it. At this size LONDON
            is about 5px and reads as texture; the cameo and HANNAH, which are
            what actually identify the brand, stay clear. Nothing depends on the
            small type: `title` carries the accessible name.
          */}
          <BrandMark name="lockup" className="w-[95px] lg:w-[115px]" title={siteConfig.name} />
        </a>

        {/* No min-height: that would deepen the bar over the hero. The
            pseudo-element gives the link a 44px tap target instead. */}
        <CallLink
          source="header"
          className="relative flex items-center gap-1.5 text-micro font-semibold text-white after:absolute after:-inset-x-3 after:-inset-y-[14px]"
        >
          {siteConfig.clinic.phoneDisplay}
          <PhoneIcon className="h-4 w-4" />
        </CallLink>
      </div>
    </header>
  );
}
