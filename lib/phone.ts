/**
 * UK number handling.
 *
 * Wireframe build requirement: "Accept UK mobile numbers in any format, with or
 * without spaces, leading zero or country code, and normalise on the way into
 * the CRM rather than rejecting the entry."
 *
 * So the parser is permissive about formatting and about number type - a
 * visitor who gives a landline is still a lead worth calling - and strict only
 * about the number being a plausible UK number.
 */

export type ParsedPhone =
  | { ok: true; e164: string; national: string }
  | { ok: false; reason: 'empty' | 'invalid' };

/** Strips everything a person might type around the digits. */
function digitsOnly(input: string): string {
  return input.replace(/[^\d+]/g, '');
}

export function parseUkPhone(input: string): ParsedPhone {
  const raw = digitsOnly(input.trim());
  if (!raw) return { ok: false, reason: 'empty' };

  let national: string | null = null;

  if (raw.startsWith('+44')) {
    national = raw.slice(3);
  } else if (raw.startsWith('0044')) {
    national = raw.slice(4);
  } else if (raw.startsWith('44') && raw.length >= 11) {
    national = raw.slice(2);
  } else if (raw.startsWith('0')) {
    national = raw.slice(1);
  } else if (/^[1-9]\d{8,9}$/.test(raw)) {
    // Typed without the leading zero or country code.
    national = raw;
  }

  if (!national) return { ok: false, reason: 'invalid' };

  // A UK national number after the trunk prefix is 9 or 10 digits: mobiles are
  // 7xxxxxxxxx (10), geographic numbers are 9 or 10.
  if (!/^[1-9]\d{8,9}$/.test(national)) return { ok: false, reason: 'invalid' };

  return { ok: true, e164: `+44${national}`, national: `0${national}` };
}

export function isValidUkPhone(input: string): boolean {
  return parseUkPhone(input).ok;
}

/** True for 07xxxxxxxxx / +447xxxxxxxxx. Used only to label the lead, never to reject it. */
export function isUkMobile(input: string): boolean {
  const parsed = parseUkPhone(input);
  return parsed.ok && /^\+447\d{9}$/.test(parsed.e164);
}
