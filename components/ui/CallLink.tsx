'use client';

import { siteConfig } from '@/lib/site-config';
import { newEventId, trackLead } from '@/lib/tracking';
import { cn } from '@/lib/utils';

/**
 * Every click to call on the page. Fires a Lead event, as section 06 requires,
 * because a phone enquiry converts exactly like a form submission and a
 * meaningful share of clinic enquirers ring rather than type.
 *
 * The click-to-call Lead carries no user data, so it is browser-only: there is
 * nothing to hash for a matching Conversions API event. The event ID is still
 * unique per click so repeated taps do not collapse into one conversion.
 */
export function CallLink({
  children,
  className,
  label = 'Call the clinic',
  source,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  /** Where on the page the tap happened, so the events are separable in Ads Manager. */
  source: 'header' | 'sticky-bar' | 'final-cta';
}) {
  return (
    <a
      href={`tel:${siteConfig.clinic.phoneHref}`}
      aria-label={label}
      className={cn(className)}
      onClick={() => trackLead(newEventId(), { lead_type: 'call', placement: source })}
    >
      {children}
    </a>
  );
}
