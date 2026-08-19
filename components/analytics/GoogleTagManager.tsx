import Script from 'next/script';
import { siteConfig } from '@/lib/site-config';

/**
 * Google Tag Manager container.
 *
 * The client's snippet asks to be pasted "as high in the <head> as possible".
 * The App Router gives no way to hand-place a raw <script> in the head, and
 * beforeInteractive - the one strategy that would land it there - injects a
 * render-blocking script ahead of everything else, including the hero. Mobile
 * load time is a conversion input on paid social, so this loads
 * afterInteractive instead, matching GA4 and the Meta Pixel. The snippet seeds
 * window.dataLayer itself, so anything pushed before the container finishes
 * loading is still picked up and nothing is lost by not being first in the head.
 *
 * Mounted first in <body> so the noscript iframe sits where GTM expects it. The
 * iframe is what records a visit with JavaScript off, and the CSP in
 * next.config.js carries a frame-src entry for googletagmanager.com for it -
 * without that, default-src 'self' blocks the frame and the fallback is inert.
 *
 * Renders nothing at all unless a container ID is set. See siteConfig.gtmId for
 * when that is.
 *
 * IMPORTANT: the CSP allows the container itself, not the tags it injects. Any
 * tag added inside GTM that loads a script, sends a beacon or mounts an iframe
 * from a host not already listed in next.config.js will be blocked in
 * production - and will still work in GTM's preview mode, which does not go
 * through the site's headers. Widen the CSP at the same time as adding the tag.
 */
export function GoogleTagManager() {
  const gtmId = siteConfig.gtmId;
  if (!gtmId) return null;

  return (
    <>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`}
      </Script>
    </>
  );
}
