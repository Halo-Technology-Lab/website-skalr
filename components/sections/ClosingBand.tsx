import Image from 'next/image';

import { CallLink } from '@/components/ui/CallLink';
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
 *
 * The two halves are each their own landmark. They used to sit inside one
 * <section aria-labelledby> pointing at the final CTA heading, which left
 * "Finding us" - a heading with a map and an address under it - belonging to a
 * region named after something else.
 */
export function ClosingBand() {
  return (
    <div className="lg:bg-surface-sage lg:px-8 lg:py-20 lg:text-sage-ink">
      <div className="mx-auto max-w-page lg:grid lg:grid-cols-2 lg:items-center lg:gap-14">
        {/* Finding us */}
        <section
          aria-labelledby="finding-us-heading"
          className="mx-auto w-full border-b border-line bg-white px-[18px] py-5 md:max-w-2xl md:border-b-0 md:px-6 md:py-14 lg:max-w-none lg:bg-transparent lg:p-0"
        >
          <h2 id="finding-us-heading" className="section-heading">
            {location.heading}
          </h2>

          {/* A static image, not an embedded map. The SVG is generated from raw
              OpenStreetMap data by scripts/build-map.mjs and committed, so this
              costs one cached request and no third-party request at all - a map
              iframe is the single heaviest thing that could land on this page.

              The basemap carries no text; the two pins below are HTML on top of
              it, so their labels stay real text in the site font. The image
              itself is presentational and the alt text on it describes the whole
              picture, pins included. */}
          <div className="map">
            <Image
              src={location.map.src}
              alt={location.map.alt}
              width={location.map.width}
              height={location.map.height}
              className="map-image"
            />

            {location.map.pins.map((pin) => (
              <div
                key={pin.id}
                aria-hidden="true"
                className="map-pin"
                data-kind={pin.id}
                style={{ left: `${pin.left}%`, top: `${pin.top}%` }}
              >
                <span className="map-pin-label">
                  <strong>{pin.label}</strong>
                  <span className="map-pin-sub">{pin.sub}</span>
                </span>
                <span className="map-pin-dot" />
              </div>
            ))}
          </div>

          <p className="map-attribution">{location.map.attribution}</p>

          <address className="mt-2.5 not-italic text-body lg:mt-5">
            <strong className="font-semibold text-sage-ink">{location.venue}</strong>
            <br />
            {location.address}
            <br />
            {location.travel}
          </address>
        </section>

        {/* Ready to see if the treatment suits your skin? */}
        <section
          aria-labelledby="closing-heading"
          className="mx-auto w-full bg-surface-sage px-[18px] py-5 text-center text-sage-ink md:max-w-2xl md:px-6 md:py-14 lg:max-w-none lg:bg-transparent lg:p-0 lg:text-left"
        >
          <h2 id="closing-heading" className="section-heading">
            {finalCta.heading}
          </h2>
          <p className="mt-1.5 text-body lg:mt-4">{finalCta.body}</p>

          <div className="lg:flex lg:max-w-md lg:gap-4">
            <a href={`#${FORM_ANCHOR}`} className="btn mt-3 lg:mt-8">
              {finalCta.primary}
            </a>
            <CallLink
              source="final-cta"
              className="btn-alt mt-2.5 lg:mt-8"
              label={finalCta.secondary}
            >
              {finalCta.secondary}
            </CallLink>
          </div>
        </section>
      </div>
    </div>
  );
}
