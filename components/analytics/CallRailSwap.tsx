import Script from 'next/script';
import { siteConfig } from '@/lib/site-config';

/**
 * CallRail dynamic number insertion.
 *
 * swap.js rewrites the clinic number wherever it appears - the header call
 * link, the sticky bar, the closing band - to a per-source tracking number, so
 * a call can be attributed back to the ad that produced it. It matches on the
 * rendered number, which means CallRail's account must hold
 * siteConfig.clinic.phoneDisplay as the source number or nothing swaps and the
 * page silently keeps showing the untracked one.
 *
 * afterInteractive rather than lazyOnload: the swap has to land before a
 * visitor reads or taps a number, and lazyOnload waits for idle - on a slow
 * phone that is long enough to show the wrong number first. It is still off the
 * critical path, which matters on a paid-social landing page.
 *
 * This does NOT replace the click-to-call Lead event. CallRail edits the href
 * in place, so CallLink's onClick still fires on the same tap; the two count
 * different things - Meta needs the click, the clinic needs the call - and both
 * are wanted.
 *
 * Renders nothing unless a script URL is set. See siteConfig.callRailSwapSrc.
 */
export function CallRailSwap() {
  const src = siteConfig.callRailSwapSrc;
  if (!src) return null;

  return <Script id="callrail-swap" src={src} strategy="afterInteractive" />;
}
