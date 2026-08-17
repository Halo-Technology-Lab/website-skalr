/**
 * Attribution capture.
 *
 * Section 06 of the wireframe: the page carries the house UTM parameters so
 * paid traffic is separable from organic, and the CRM tags the contact with its
 * source and campaign on arrival. This reads those parameters off the landing
 * URL and stores them for the length of the session, so a visitor who scrolls,
 * reloads or comes back in the same tab still submits with the right campaign
 * attached.
 */

const KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'fbclid',
  'gclid',
] as const;

const STORAGE_KEY = 'alteon.attribution';

export type Attribution = Record<string, string>;

function read(): Attribution {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch {
    return {};
  }
}

/**
 * Captures parameters from the current URL, merging over anything already
 * stored, and returns the full set. Safe to call on every mount.
 */
export function captureAttribution(): Attribution {
  if (typeof window === 'undefined') return {};

  const stored = read();
  const params = new URLSearchParams(window.location.search);
  const found: Attribution = {};

  for (const key of KEYS) {
    const value = params.get(key);
    if (value) found[key] = value.slice(0, 200);
  }

  if (!stored.landing_path) {
    found.landing_path = window.location.pathname;
  }
  if (!stored.referrer && document.referrer) {
    found.referrer = document.referrer.slice(0, 300);
  }

  const merged = { ...stored, ...found };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Private mode or storage disabled - the in-memory value still works.
  }

  return merged;
}
