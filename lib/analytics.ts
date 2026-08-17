// Lightweight client-side GA4 (gtag.js) event helper.
//
// The gtag.js snippet is loaded in app/layout.tsx, which exposes window.gtag.
// This wrapper no-ops on the server and when analytics is not configured, so
// call sites do not need to guard for it.

declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

export function trackEvent(
  eventName: string,
  params?: Record<string, unknown>
): void {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}
