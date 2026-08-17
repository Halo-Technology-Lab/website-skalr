import { CallLink } from '@/components/ui/CallLink';
import { MediaPlaceholder } from '@/components/ui/MediaPlaceholder';
import { PhoneIcon } from '@/components/ui/PhoneIcon';
import { finalCta, FORM_ANCHOR, location } from '@/lib/content';

/**
 * Location and final call to action (wireframe notes 9 and 10).
 *
 * Mobile keeps them as two separate sections in the drawn order. Desktop merges
 * them into the single closing band the desktop layout specifies: map beside
 * address, booking and phone.
 *
 * Northern line access and on site parking remove the practical friction for a
 * north London audience. The closing block repeats the booking action and adds
 * a phone option, because a meaningful share of clinic enquirers prefer to ring.
 */
export function ClosingBand() {
  return (
    <section
      aria-labelledby="closing-heading"
      className="lg:bg-soft lg:px-8 lg:py-20"
    >
      <div className="mx-auto max-w-page lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
        {/* Finding us */}
        <div className="mx-auto w-full border-b border-line bg-white px-[18px] py-5 md:max-w-2xl md:border-b-0 md:px-6 md:py-14 lg:max-w-none lg:bg-transparent lg:p-0">
          <h2 className="section-heading">{location.heading}</h2>

          {/* A static block, not an embedded map: a third-party map iframe is
              the single heaviest thing that could land on this page. Swap for a
              static map image, or a lazily mounted embed behind a tap, and add
              the provider to the CSP frame-src when you do. */}
          <MediaPlaceholder
            label={location.mapLabel}
            className="mt-2.5 h-24 md:h-auto"
            aspect="md:aspect-[16/9]"
          />

          <address className="mt-2.5 not-italic text-caption lg:mt-5 md:text-lead">
            <strong className="font-bold text-ink">{location.venue}</strong>
            <br />
            {location.address}
            <br />
            {location.travel}
          </address>
        </div>

        {/* Ready to see if Alteon suits your skin? */}
        <div className="mx-auto w-full bg-soft px-[18px] py-5 text-center md:max-w-2xl md:px-6 md:py-14 lg:max-w-none lg:bg-transparent lg:p-0 lg:text-left">
          <h2 id="closing-heading" className="section-heading">
            {finalCta.heading}
          </h2>
          <p className="mt-1.5 text-caption lg:mt-4 md:text-lead">{finalCta.body}</p>

          <div className="lg:flex lg:max-w-md lg:gap-4">
            <a href={`#${FORM_ANCHOR}`} className="btn mt-3 lg:mt-8">
              {finalCta.primary}
            </a>
            <CallLink
              source="final-cta"
              className="btn-alt mt-2.5 gap-2 lg:mt-8"
              label={finalCta.secondary}
            >
              {finalCta.secondary}
              <PhoneIcon className="h-4 w-4" />
            </CallLink>
          </div>
        </div>
      </div>
    </section>
  );
}
