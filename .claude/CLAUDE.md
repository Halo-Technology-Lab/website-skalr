# Hannah London Colindale

Single-page Meta Ads landing page for Hannah London at Beaufort Park,
Colindale. The treatment is no longer named on the page - see the de-branding
note at the top of `lib/content.ts` before reintroducing a device name. Built to the Skalr mid-fidelity wireframe (`docs/wireframe-brief.md`
records what it specified). Architecture is derived from the Halo Technology Lab
template; none of its styling or components are used.

## Tech Stack

- **Framework**: Next.js 14.2 (App Router)
- **Language**: TypeScript 5.3 (strict mode)
- **Styling**: Tailwind CSS 3.4, tokens taken from the wireframe
- **Hosting**: AWS Amplify (SSR / Next.js compute)
- **Package manager**: npm

No database and no auth. The only server code is `app/api/lead/route.ts`.

## Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run lint       # ESLint via Next.js
npm run typecheck  # tsc --noEmit
```

## Project Structure

```
app/
  layout.tsx            Fonts, metadata, GA4 + Meta Pixel, skip link
  page.tsx              The landing page, composing every section in order
  globals.css           Design tokens as component classes (.btn, .chip, .field-*)
  api/lead/route.ts     Form intake: validate, normalise, CRM webhook, email, Meta CAPI
  sitemap.ts robots.ts manifest.ts
components/
  layout/               SiteHeader, SiteFooter, StickyCtaBar
  sections/             One file per band of the page, in wireframe order
  ui/                   Section, MediaPlaceholder, CallLink, PhoneIcon, JsonLd
  analytics/MetaPixel.tsx
lib/
  content.ts            Every word on the page, verbatim from the wireframe
  email.ts              Resend client and the lead notification template
  site-config.ts        Brand, clinic contact details, tracking IDs
  lead.ts               Lead shape and validation, shared browser and server
  phone.ts              UK number parsing and E.164 normalisation
  tracking.ts           Pixel and GA event helpers, shared event IDs
  attribution.ts        UTM and click ID capture, held in sessionStorage
  meta-capi.ts          Conversions API client, hashing included
  structured-data.ts    JSON-LD for the clinic and the answered FAQs
```

## Core Conventions

### Copy
- **All page copy lives in `lib/content.ts`.** Never inline a string in a
  component.
- The wireframe's copy is the CAP-reviewed claim set. Rewording any claim needs
  a fresh compliance check - this is medical advertising, and the wireframe is
  explicit that the softened wording is what makes the page defensible.
- Unanswered FAQs and unconfirmed details render a visible `[TO CONFIRM]`
  placeholder. Do not invent replacements.

### Brand values
- Clinic name, address, phone and tracking IDs come from `lib/site-config.ts`.
  Never hardcode them in a component.

### Styling
- **The Hannah London brand reference supersedes the wireframe on type and
  colour.** The wireframe now governs STRUCTURE and COPY only. Its palette was
  always a declared stand-in, and its 13px mobile type scale is gone: the
  reference sets a 16px mobile body floor and supplies the clamp scale that
  replaced the fixed one. Do not "restore" the wireframe's geometry.
- Tokens are in `tailwind.config.js`, taken from the brand reference. Every
  deliberate departure from it is listed with its measured contrast ratio in
  that file's header. Repeated patterns are component classes in `globals.css`.
- Two families, no third: **Gelasio** for headings at weight 400, **Nunito Sans**
  for everything else with 400 as the weight floor. Both are self-hosted through
  `next/font` in `app/layout.tsx`. The reference supplies a `<link>` to Google
  Fonts - do NOT use it, the CSP sets `font-src 'self'` and the page would fall
  back to Georgia and Verdana.
- Brand marks are traced from the client's artwork by `npm run trace-brand`,
  which writes `public/brand/*.svg` and the generated `lib/brand-marks.ts`.
  They render through an SVG sprite (`components/ui/BrandMark.tsx`) so the path
  data appears in the document once and inherits `currentColor`. The paths need
  `fill-rule="evenodd"` or the cameo and every letter counter fill solid.
  `lib/brand-marks.ts` is ~76KB, so it must stay out of client components.
- **Breakpoint roles**: the type scale is now clamp-based and sizes itself, so
  `md` (768px) is only a measure cap. `lg` (1024px) is still the *layout* step -
  the hero's form column, three-column how-it-works, and the closing band.
- Body copy is `copy` on white and steps to `sage-ink` on the tinted bands;
  `copy` measures 4.37:1 on `surface-sage`, just under AA. `Section soft` sets
  that for its whole band, so most components inherit it and need nothing.
- Where a drawn element is smaller than a comfortable tap target (the 35px chips,
  the header call link), a transparent `::after` extends the tappable area
  instead of the box growing. Keep that pattern - do not "fix" it by adding
  min-height.
- Form inputs are 16px on mobile or iOS Safari zooms the viewport on focus.
- Toasts live in `components/ui/Toast.tsx`: a `useToasts` hook plus a
  `ToastViewport`, no provider and no dependency. Toasts are keyed by id so a
  repeat replaces rather than stacks, and they announce politely because the
  form already moves focus to the first invalid field. They are a supplement to
  inline field errors, never a replacement - a toast that has timed out cannot
  tell anyone what is still wrong.
- `copy-mute` (#8e8e8e) is the live site's body colour and is 3.28:1 on white.
  It is for 24px+ text and decoration only, never micro-copy. Same story for
  `line-soft` as a control border: it fails WCAG 1.4.11, so inputs and chips use
  `field`. All of it is reasoned in the `tailwind.config.js` header.

### Performance
- Server components by default. The only client components are the form, the
  click-to-call links and the pixel. Keep it that way: mobile load time is a
  conversion input on paid social.
- Every image and the map are CSS placeholders (`MediaPlaceholder`), so the page
  currently makes no image requests. When real assets land, use `next/image`
  with explicit dimensions, `priority` on the hero only, and keep the aspect
  ratio so nothing shifts.
- The FAQ accordion is native `details`/`summary`. No JavaScript.
- Do not add a third-party map embed. Use a static image, or mount an embed
  behind a tap, and add the provider to the CSP `frame-src`.

### Email
- Every lead is emailed to the call team through Resend as well as posted to the
  CRM, so an unconfigured or failing CRM never means a missed enquiry. Both are
  best-effort: the visitor gets a success response either way, and failures are
  logged for CloudWatch.
- `RESEND_API_KEY` is the shared Halo Technology Lab key. `EMAIL_FROM` must stay
  on a domain verified in Resend (`support@halotechlab.com`) or every send
  bounces. `LEAD_NOTIFICATION_EMAIL` is the recipient; unset means no email.
- `lib/email.ts` reads secrets, so it must never be imported by a client
  component. Anything a visitor typed is escaped before it goes into the HTML.
- There is no auto-reply to the visitor. Writing one means writing new copy, and
  copy on this page is CAP-reviewed - see the Copy rules above.

### Tracking
- `ViewContent` fires in the pixel snippet, `Lead` on form success and on every
  click to call, `Schedule` server-side once the call team books.
- Every Lead carries an event ID shared between the browser pixel and the
  Conversions API, so Meta deduplicates the pair. Break that and every lead is
  counted twice.
- Concern and preferred time go to the CRM with the lead so the call team sees
  them before dialling.

## Amplify Deployment

1. **Server-only env vars must be listed in the `env` block of
   `next.config.js`.** Amplify does not pass runtime env vars to Lambda compute,
   so they are inlined at build time. A var set only in the console is
   `undefined` in server code.
2. **Security headers and the CSP live in `next.config.js`.** Any new
   third-party script, font, image host or endpoint needs an explicit entry.

`www` to apex redirection is configured at the Amplify edge, not in
`next.config.js` - both together create a redirect loop.

Environment variables: see `.env.example`. Deployment procedure:
`.claude/skills/ops/deploy-amplify.md`.
