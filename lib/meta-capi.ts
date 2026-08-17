/**
 * Meta Conversions API.
 *
 * Sends the server half of the pair described in section 06 of the wireframe.
 * The browser pixel fires Lead with an event ID; this sends the same event with
 * the same `event_id`, and Meta discards the duplicate. If either half is
 * missing an ID, leads get counted twice and the cost per lead reported in Ads
 * Manager becomes fiction.
 *
 * No-ops unless META_PIXEL_ID and META_CAPI_ACCESS_TOKEN are both set, so local
 * and preview environments never write to the live pixel.
 */

import { createHash } from 'crypto';

const API_VERSION = 'v21.0';

/** Meta requires user data to be SHA-256 hashed, lowercased and trimmed first. */
function hash(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const normalised = value.trim().toLowerCase();
  if (!normalised) return undefined;
  return createHash('sha256').update(normalised).digest('hex');
}

export interface CapiUserData {
  email?: string;
  /** E.164, digits only - Meta expects no plus sign. */
  phone?: string;
  firstName?: string;
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
}

export interface CapiEvent {
  eventName: 'Lead' | 'Schedule' | 'ViewContent';
  eventId: string;
  eventSourceUrl: string;
  user: CapiUserData;
  customData?: Record<string, unknown>;
}

export function isCapiConfigured(): boolean {
  return Boolean(process.env.META_PIXEL_ID && process.env.META_CAPI_ACCESS_TOKEN);
}

export async function sendCapiEvent(event: CapiEvent): Promise<void> {
  if (!isCapiConfigured()) return;

  const pixelId = process.env.META_PIXEL_ID as string;
  const token = process.env.META_CAPI_ACCESS_TOKEN as string;

  const payload = {
    data: [
      {
        event_name: event.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.eventId,
        event_source_url: event.eventSourceUrl,
        action_source: 'website',
        user_data: {
          em: hash(event.user.email),
          ph: hash(event.user.phone?.replace(/\D/g, '')),
          fn: hash(event.user.firstName),
          fbp: event.user.fbp,
          fbc: event.user.fbc,
          client_ip_address: event.user.clientIp,
          client_user_agent: event.user.userAgent,
        },
        custom_data: event.customData,
      },
    ],
    ...(process.env.META_CAPI_TEST_CODE
      ? { test_event_code: process.env.META_CAPI_TEST_CODE }
      : {}),
  };

  const response = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${pixelId}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Conversions API responded ${response.status}: ${detail.slice(0, 500)}`);
  }
}
