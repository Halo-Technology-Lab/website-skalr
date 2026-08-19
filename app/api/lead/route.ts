/**
 * Lead intake.
 *
 * Section 06 of the wireframe: "The form posts into our CRM and tags the
 * contact with its source and campaign on arrival, so the call team works one
 * list." This route is that post. It:
 *
 *   1. revalidates everything the browser validated
 *   2. normalises the phone number into E.164 for the CRM
 *   3. forwards the lead to the LeadConnector (GoHighLevel) inbound webhook
 *      with concern, timing and attribution
 *   4. emails the lead to the call team through Resend, so a missing or
 *      unconfigured CRM never means a missed enquiry
 *   5. sends the server half of the Meta Lead event, sharing the browser's
 *      event ID so the Conversions API deduplicates
 *
 * The CRM forward, the notification email and the CAPI call are all best-effort:
 * if any fails the visitor still gets a success response, because the lead has
 * been captured and the alternative is asking a real person to fill the form in
 * twice. Failures are logged loudly so they surface in CloudWatch.
 */

import { NextResponse } from 'next/server';
import { sendLeadNotification } from '@/lib/email';
import { hasErrors, normaliseLead, validateLead, type LeadInput } from '@/lib/lead';
import { sendCapiEvent } from '@/lib/meta-capi';
import { absoluteUrl } from '@/lib/site-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Minimum time a genuine visitor takes to complete the form. Below this it is a bot. */
const MIN_FILL_MS = 2500;

/**
 * LeadConnector (GoHighLevel) inbound webhook that opens the call-back workflow.
 * Unauthenticated by design on their side, so it is a default rather than a
 * secret - set CRM_WEBHOOK_URL to point a preview or a staging build elsewhere.
 */
const DEFAULT_CRM_WEBHOOK_URL =
  'https://services.leadconnectorhq.com/hooks/4rcsRqytXSR2iTMQjnvo/webhook-trigger/767bafa1-f6ad-4774-9d0a-6c3a66aac104';

/** Value the CRM tags every lead from this page with. Agreed with the call team. */
const LEAD_SOURCE = 'Alteon LP';

/**
 * The page the lead was filled in on. The browser sends its own location, which
 * is the only thing that knows the real host; the stored landing path and then
 * the configured site URL are the fallbacks for a client that sent neither.
 */
function pageUrl(fromBrowser?: string, landingPath?: string): string {
  if (fromBrowser && /^https?:\/\//i.test(fromBrowser)) return fromBrowser.slice(0, 500);
  return absoluteUrl(landingPath || '/');
}

function clientIp(request: Request): string | undefined {
  // Netlify puts the real client IP in a single-value header of its own, which is
  // not spoofable by the caller the way x-forwarded-for is. Prefer it where it
  // exists so Meta CAPI gets a clean match signal.
  const netlify = request.headers.get('x-nf-client-connection-ip');
  if (netlify) return netlify.trim() || undefined;

  const forwarded = request.headers.get('x-forwarded-for');
  if (!forwarded) return undefined;
  // Amplify appends the real client IP as the last hop it controls; take the first
  // entry, which is the client as seen by CloudFront.
  return forwarded.split(',')[0]?.trim() || undefined;
}

export async function POST(request: Request) {
  let body: (LeadInput & {
    /** Honeypot: hidden from people, irresistible to bots. */
    website?: string;
    /** Milliseconds between the form mounting and submission. */
    elapsedMs?: number;
    /** Origin and path of the page the form was submitted from. */
    pageUrl?: string;
    fbp?: string;
    fbc?: string;
  }) | null = null;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Malformed request.' }, { status: 400 });
  }

  // Silent spam rejections: return success so bots do not learn what tripped.
  if (body.website || (typeof body.elapsedMs === 'number' && body.elapsedMs < MIN_FILL_MS)) {
    return NextResponse.json({ ok: true });
  }

  const errors = validateLead(body);
  if (hasErrors(errors)) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const lead = normaliseLead(body);
  const receivedAt = new Date().toISOString();

  // 1. CRM. The LeadConnector (GoHighLevel) inbound webhook below is the live
  // endpoint; CRM_WEBHOOK_URL overrides it so a preview environment can be
  // pointed somewhere harmless. The body shape is fixed by the workflow trigger
  // on the other end - GoHighLevel maps these keys onto contact fields the first
  // time it sees them, so renaming one silently unmaps it.
  const webhook = process.env.CRM_WEBHOOK_URL || DEFAULT_CRM_WEBHOOK_URL;
  if (webhook) {
    try {
      const response = await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(process.env.CRM_WEBHOOK_TOKEN
            ? { Authorization: `Bearer ${process.env.CRM_WEBHOOK_TOKEN}` }
            : {}),
        },
        body: JSON.stringify({
          firstName: lead.firstName,
          phone: lead.phone,
          email: lead.email,
          concern: lead.concern,
          bestTimeToCall: lead.timing,
          source: LEAD_SOURCE,
          // Always present, empty when the visitor arrived without them, so the
          // trigger sees a stable set of fields on every lead.
          utm_source: lead.attribution.utm_source ?? '',
          utm_medium: lead.attribution.utm_medium ?? '',
          utm_campaign: lead.attribution.utm_campaign ?? '',
          utm_content: lead.attribution.utm_content ?? '',
          pageUrl: pageUrl(body.pageUrl, lead.attribution.landing_path),
          // Consent is validated as true above, so the moment the lead arrived
          // is the moment permission was given.
          consentAt: receivedAt,
        }),
        cache: 'no-store',
      });
      if (!response.ok) {
        console.error('[lead] CRM webhook rejected the lead', response.status, await response.text().catch(() => ''));
      }
    } catch (error) {
      console.error('[lead] CRM webhook failed', error);
    }
  } else {
    // Without a CRM configured the lead must still be recoverable.
    console.warn('[lead] CRM webhook is not configured. Lead captured in logs only.', {
      received_at: receivedAt,
      first_name: lead.firstName,
      phone: lead.phone,
      email: lead.email,
      concern: lead.concern,
      preferred_time: lead.timing,
    });
  }

  // 2. Notification email to the call team.
  try {
    const sent = await sendLeadNotification(lead, { receivedAt });
    if (!sent.success && sent.error !== 'Email not configured' && sent.error !== 'Recipient not configured') {
      console.error('[lead] notification email failed', sent.error);
    }
  } catch (error) {
    console.error('[lead] notification email threw', error);
  }

  // 3. Meta Conversions API, sharing the browser event ID.
  if (lead.eventId) {
    try {
      await sendCapiEvent({
        eventName: 'Lead',
        eventId: lead.eventId,
        eventSourceUrl: absoluteUrl('/'),
        user: {
          email: lead.email,
          phone: lead.phone,
          firstName: lead.firstName,
          fbp: body.fbp,
          fbc: body.fbc,
          clientIp: clientIp(request),
          userAgent: request.headers.get('user-agent') ?? undefined,
        },
        customData: {
          content_name: 'Hannah London landing page',
          concern: lead.concern,
          preferred_time: lead.timing,
        },
      });
    } catch (error) {
      console.error('[lead] Conversions API failed', error);
    }
  }

  return NextResponse.json({ ok: true });
}
