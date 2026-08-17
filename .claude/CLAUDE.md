# Alteon Colindale

Single-page Meta Ads landing page for the Alteon treatment at Beaufort Park,
Colindale. Built to the Skalr mid-fidelity wireframe (`docs/wireframe-brief.md`
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
  api/lead/route.ts     Form intake: validate, normalise, CRM webhook, Meta CAPI
  sitemap.ts robots.ts manifest.ts
components/
  layout/               SiteHeader, SiteFooter, StickyCtaBar
  sections/             One file per band of the page, in wireframe order
  ui/                   Section, MediaPlaceholder, CallLink, PhoneIcon, JsonLd
  analytics/MetaPixel.tsx
lib/
  content.ts            Every word on the page, verbatim from the wireframe
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
- Tokens are in `tailwind.config.js`, reproducing the wireframe palette and its
  390px type scale. Repeated patterns are component classes in `globals.css`.
- **Breakpoint roles**: `md` (768px) is the *typographic* step - it raises the
  type scale and caps the measure, because 13px copy across a full tablet width
  is unreadable. `lg` (1024px) is the *layout* step - two-column hero, three
  column how-it-works, the sticky form card, and the closing band.
- Minimum 44px tap targets on anything tappable. Form inputs are 16px on mobile
  or iOS Safari zooms the viewport on focus.
- Two colour tokens are a shade darker than the wireframe (`accent-ink`,
  `muted`) because the originals fail WCAG AA for small text, and they carry the
  legal micro-copy. Reasoning is in the `tailwind.config.js` header.

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
