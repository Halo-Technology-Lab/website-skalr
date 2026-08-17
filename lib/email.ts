/**
 * Transactional email, sent through Resend.
 *
 * Mirrors the pattern used across the Halo Technology Lab estate: one lazily
 * constructed client, one `sendEmail` helper, and templates that return both an
 * HTML and a plain text body. Sending is always best-effort - a lead is never
 * rejected because the mail provider is down.
 *
 * Three environment variables, all server-only, all listed in the `env` block of
 * `next.config.js` so Amplify inlines them at build time:
 *
 *   RESEND_API_KEY           the shared Halo Resend key. Unset: sending is skipped.
 *   EMAIL_FROM               sender. Must stay on a domain verified in Resend.
 *   LEAD_NOTIFICATION_EMAIL  where lead notifications land. Unset: no email is sent.
 *
 * This module reads secrets, so it must never be imported by a client component.
 */

import { Resend } from 'resend';
import { form as formCopy } from '@/lib/content';
import { siteConfig, formattedAddress } from '@/lib/site-config';
import type { NormalisedLead } from '@/lib/lead';

// ============================================
// Resend client (lazy initialisation)
// ============================================

let _resend: Resend | null | undefined;

function getResend(): Resend | null {
  if (_resend === undefined) {
    _resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  }
  return _resend;
}

/**
 * Sender address. `support@halotechlab.com` is the verified Resend identity for
 * this account - changing the domain here needs a matching domain verification
 * in Resend or every send bounces.
 */
function getEmailFrom(): string {
  return process.env.EMAIL_FROM || 'Alteon at Colindale <support@halotechlab.com>';
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

export async function sendEmail(
  options: SendEmailOptions
): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not configured - skipping email send');
    return { success: false, error: 'Email not configured' };
  }

  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
    });

    if (error) {
      console.error('[email] Resend API error', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[email] send failed', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// ============================================
// Layout
// ============================================

/**
 * Escapes anything a visitor typed. The lead fields are echoed straight into the
 * notification, so an unescaped angle bracket would break the markup and a
 * crafted value could inject arbitrary HTML into the clinic's inbox.
 */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Palette lifted from tailwind.config.js. Email clients cannot see the
// stylesheet, so every colour is inline and duplicated here on purpose.
const INK = '#1A1A1A';
const COPY = '#4A4A4A';
const MUTED = '#6E675F';
const LINE = '#E3E0DC';
const SOFT = '#F6F4F1';
const ACCENT = '#7A5C42';

function emailLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(siteConfig.name)}</title>
</head>
<body style="margin:0; padding:0; background-color:${SOFT}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${SOFT};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">
          <tr>
            <td style="background-color:${INK}; padding:24px 32px; border-radius:12px 12px 0 0;">
              <span style="font-size:18px; font-weight:600; color:#ffffff; letter-spacing:-0.01em;">${esc(siteConfig.name)}</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff; padding:32px; border-left:1px solid ${LINE}; border-right:1px solid ${LINE};">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff; padding:20px 32px 28px; border:1px solid ${LINE}; border-top:none; border-radius:0 0 12px 12px;">
              <p style="margin:0; font-size:12px; line-height:1.6; color:${MUTED};">
                ${esc(formattedAddress())}<br>
                Sent automatically by the ${esc(siteConfig.name)} landing page.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** One label-and-value row. */
function field(label: string, value: string, href?: string): string {
  const shown = href
    ? `<a href="${esc(href)}" style="font-size:15px; color:${ACCENT}; text-decoration:none;">${esc(value)}</a>`
    : `<span style="font-size:15px; color:${INK};">${esc(value)}</span>`;

  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
      <tr>
        <td>
          <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:${MUTED};">${esc(label)}</span>
        </td>
      </tr>
      <tr>
        <td style="padding-top:4px;">${shown}</td>
      </tr>
    </table>`;
}

// ============================================
// Templates
// ============================================

/**
 * Lead notification, sent to the clinic's call team.
 *
 * Ordered the way the team works the lead: who to ring, on what number, when
 * they asked to be called, and what they want to talk about. Attribution sits at
 * the bottom, because it matters for reporting rather than for the call.
 */
export function leadNotificationEmail(
  lead: NormalisedLead,
  meta: { receivedAt: string }
): { html: string; text: string } {
  const receivedAt = new Date(meta.receivedAt).toLocaleString('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/London',
  });

  const attribution = Object.entries(lead.attribution).filter(([, v]) => Boolean(v));

  const attributionHtml = attribution.length
    ? `
      <h2 style="margin:28px 0 12px; padding-top:24px; border-top:1px solid ${LINE}; font-size:14px; font-weight:600; color:${INK};">Attribution</h2>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${attribution
          .map(
            ([key, value]) => `
        <tr>
          <td style="padding:4px 12px 4px 0; font-size:13px; color:${MUTED}; white-space:nowrap;">${esc(key)}</td>
          <td style="padding:4px 0; font-size:13px; color:${COPY}; word-break:break-all;">${esc(value)}</td>
        </tr>`
          )
          .join('')}
      </table>`
    : '';

  const html = emailLayout(`
    <h1 style="margin:0 0 4px; font-size:22px; font-weight:700; color:${INK};">New call back request</h1>
    <p style="margin:0 0 28px; font-size:13px; color:${MUTED};">Received ${esc(receivedAt)}</p>

    ${field('First name', lead.firstName)}
    ${field('Mobile number', lead.phoneNational, `tel:${lead.phone}`)}
    ${field('Email', lead.email, `mailto:${lead.email}`)}
    ${field(formCopy.concernLabel, lead.concern)}
    ${field(formCopy.timingLabel, lead.timing)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr>
        <td style="background-color:${SOFT}; border:1px solid ${LINE}; border-radius:10px; padding:16px 18px;">
          <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.08em; color:${MUTED};">Consent</span>
          <p style="margin:6px 0 0; font-size:13px; line-height:1.6; color:${COPY};">
            ${lead.consent ? '&#10003; Given' : 'Not given'} - &ldquo;${esc(formCopy.consent)}&rdquo;
          </p>
        </td>
      </tr>
    </table>
    ${attributionHtml}
  `);

  const text = `New call back request
Received ${receivedAt}

First name: ${lead.firstName}
Mobile number: ${lead.phoneNational} (${lead.phone})
Email: ${lead.email}
${formCopy.concernLabel} ${lead.concern}
${formCopy.timingLabel} ${lead.timing}

Consent: ${lead.consent ? 'Given' : 'Not given'} - "${formCopy.consent}"
${
  attribution.length
    ? `\nAttribution:\n${attribution.map(([k, v]) => `  ${k}: ${v}`).join('\n')}\n`
    : ''
}
Sent automatically by the ${siteConfig.name} landing page.`;

  return { html, text };
}

/**
 * Sends the lead notification to LEAD_NOTIFICATION_EMAIL.
 *
 * Reply-to is the visitor's address, so hitting reply in the inbox reaches the
 * person who filled the form rather than the shared sending mailbox.
 */
export async function sendLeadNotification(
  lead: NormalisedLead,
  meta: { receivedAt: string }
): Promise<{ success: boolean; error?: string }> {
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!to) {
    console.warn('[email] LEAD_NOTIFICATION_EMAIL not configured - skipping lead notification');
    return { success: false, error: 'Recipient not configured' };
  }

  const { html, text } = leadNotificationEmail(lead, meta);

  return sendEmail({
    to,
    subject: `New call back request: ${lead.firstName} - ${lead.concern}`,
    html,
    text,
    replyTo: lead.email,
  });
}
