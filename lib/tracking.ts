/**
 * Client-side event tracking, per section 06 of the wireframe.
 *
 *   ViewContent  on page load
 *   Lead         on form submission and on a click to call
 *   Schedule     when the consultation is booked
 *
 * Every event carries an event ID. The browser sends it as `eventID` and the
 * server sends the same value as `event_id` to the Conversions API, which is
 * what lets Meta deduplicate the pair. Without the shared ID, every lead counts
 * twice.
 *
 * Schedule is exported but not fired from this page: booking happens on the
 * call, so it is sent server-side from the CRM once the consultation is in the
 * diary. Wire it to `sendCapiEvent` in the API route when that hook exists.
 */

type PixelArgs =
  | [command: 'init', pixelId: string]
  | [command: 'track', event: string, params?: Record<string, unknown>, options?: { eventID: string }]
  | [command: 'trackCustom', event: string, params?: Record<string, unknown>];

declare global {
  interface Window {
    fbq?: ((...args: PixelArgs) => void) & { callMethod?: (...args: unknown[]) => void; queue?: unknown[] };
    gtag?: (
      command: string,
      eventName: string,
      params?: Record<string, unknown>
    ) => void;
  }
}

/** RFC 4122 v4 where available, with a plain fallback for older browsers. */
export function newEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `evt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function pixel(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string
): void {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  if (eventId) {
    window.fbq('track', event, params, { eventID: eventId });
  } else {
    window.fbq('track', event, params);
  }
}

function ga(event: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
  window.gtag('event', event, params);
}

// ViewContent is fired inside the pixel snippet itself (components/analytics/
// MetaPixel.tsx). A React effect can run before the pixel stub exists, which
// would silently drop the event.

export function trackLead(
  eventId: string,
  params: Record<string, unknown> = {}
): void {
  pixel('Lead', params, eventId);
  ga('generate_lead', { ...params, event_id: eventId });
}

export function trackSchedule(
  eventId: string,
  params: Record<string, unknown> = {}
): void {
  pixel('Schedule', params, eventId);
  ga('schedule', { ...params, event_id: eventId });
}

/** Reads the Meta browser cookies so the server can attach them to the CAPI event. */
export function readMetaCookies(): { fbp?: string; fbc?: string } {
  if (typeof document === 'undefined') return {};
  const jar = Object.fromEntries(
    document.cookie
      .split(';')
      .map((part) => part.trim().split('='))
      .filter((pair) => pair.length === 2) as Array<[string, string]>
  );
  const out: { fbp?: string; fbc?: string } = {};
  if (jar._fbp) out.fbp = decodeURIComponent(jar._fbp);
  if (jar._fbc) out.fbc = decodeURIComponent(jar._fbc);
  return out;
}
