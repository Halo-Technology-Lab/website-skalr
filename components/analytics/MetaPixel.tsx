import Script from 'next/script';
import { siteConfig } from '@/lib/site-config';

/**
 * Meta Pixel.
 *
 * Renders nothing at all unless NEXT_PUBLIC_META_PIXEL_ID is set, so local and
 * preview environments never touch the live pixel.
 *
 * ViewContent fires here rather than in a React effect, because the effect can
 * run before the pixel stub exists and the event would be dropped. Lead fires
 * from the form and from every click to call; Schedule is sent server-side once
 * the call team books the consultation.
 *
 * Loaded afterInteractive: the pixel must not compete with the hero for
 * bandwidth on a 4G phone, which is where this campaign's traffic lands.
 */
export function MetaPixel() {
  const pixelId = siteConfig.metaPixelId;
  if (!pixelId) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixelId}');
fbq('track','PageView');
fbq('track','ViewContent',{content_name:'Hannah London landing page'});`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
