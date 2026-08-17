/**
 * The lead payload and its validation, shared by the form and the API route.
 *
 * The same rules run in both places on purpose: the browser copy gives instant,
 * per-field feedback on blur, and the server copy is the one that actually
 * decides whether a lead is accepted.
 */

import { isValidUkPhone, parseUkPhone } from '@/lib/phone';
import { form as formCopy } from '@/lib/content';

export type LeadField =
  | 'concern'
  | 'firstName'
  | 'phone'
  | 'email'
  | 'timing'
  | 'consent';

export interface LeadInput {
  concern: string;
  firstName: string;
  phone: string;
  email: string;
  timing: string;
  consent: boolean;
  /** Attribution captured from the landing URL and Meta cookies. */
  attribution?: Record<string, string>;
  /** Shared with the browser pixel so the Conversions API can deduplicate. */
  eventId?: string;
}

export type LeadErrors = Partial<Record<LeadField, string>>;

/** Pragmatic email check: rejects the typos people actually make, nothing more. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

export const MAX_LENGTHS = {
  firstName: 60,
  phone: 32,
  email: 254,
  concern: 60,
  timing: 30,
} as const;

export function validateLead(input: Partial<LeadInput>): LeadErrors {
  const errors: LeadErrors = {};

  if (!input.concern) {
    errors.concern = 'Pick the one that fits best.';
  } else if (!(formCopy.concerns as readonly string[]).includes(input.concern)) {
    errors.concern = 'Pick one of the options shown.';
  }

  const firstName = (input.firstName ?? '').trim();
  if (!firstName) {
    errors.firstName = 'We need a first name to open the call.';
  } else if (firstName.length > MAX_LENGTHS.firstName) {
    errors.firstName = 'That is longer than we can store.';
  }

  const phone = (input.phone ?? '').trim();
  if (!phone) {
    errors.phone = 'We need a number to ring you on.';
  } else if (phone.length > MAX_LENGTHS.phone || !isValidUkPhone(phone)) {
    errors.phone = 'That does not look like a UK number. Any format is fine.';
  }

  const email = (input.email ?? '').trim();
  if (!email) {
    errors.email = 'We need an email in case we miss you on the phone.';
  } else if (email.length > MAX_LENGTHS.email || !EMAIL_RE.test(email)) {
    errors.email = 'Check the email address, it looks incomplete.';
  }

  if (!input.timing) {
    errors.timing = 'Tell us roughly when to call.';
  } else if (!(formCopy.timings as readonly string[]).includes(input.timing)) {
    errors.timing = 'Pick one of the options shown.';
  }

  if (!input.consent) {
    errors.consent = 'We need your permission before we can call you.';
  }

  return errors;
}

export function hasErrors(errors: LeadErrors): boolean {
  return Object.keys(errors).length > 0;
}

/** Field order used to focus the first problem and to build the summary line. */
export const FIELD_ORDER: LeadField[] = [
  'concern',
  'firstName',
  'phone',
  'email',
  'timing',
  'consent',
];

/** Server-side shaping: trim, lowercase the email, normalise the number. */
export function normaliseLead(input: LeadInput) {
  const parsed = parseUkPhone(input.phone);
  return {
    concern: input.concern.trim(),
    firstName: input.firstName.trim(),
    phone: parsed.ok ? parsed.e164 : input.phone.trim(),
    phoneNational: parsed.ok ? parsed.national : input.phone.trim(),
    email: input.email.trim().toLowerCase(),
    timing: input.timing.trim(),
    consent: input.consent === true,
    attribution: input.attribution ?? {},
    eventId: input.eventId ?? '',
  };
}

export type NormalisedLead = ReturnType<typeof normaliseLead>;
