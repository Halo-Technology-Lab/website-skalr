# Hannah London Colindale

Meta Ads landing page for Hannah London at Beaufort Park, Colindale.
Next.js 14 (App Router), TypeScript, Tailwind CSS, deployed on AWS Amplify.

Built to the Skalr mid-fidelity wireframe. `docs/wireframe-brief.md` records the
mapping from wireframe to build, the deliberate deviations, and what is still
outstanding before launch.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. With no CRM webhook configured, form submissions are
validated and logged to the console rather than sent anywhere.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |

## Layout

```
app/            Routes, layout, SEO files, the lead API route
components/     layout/ sections/ ui/ analytics/
lib/            content, site-config, lead validation, tracking, attribution
public/         Static assets (all placeholders for now)
docs/           Wireframe brief and build decisions
amplify.yml     Amplify build spec
next.config.js  Env inlining, security headers/CSP, redirects, images
```

## Where things live

- **Page copy**: `lib/content.ts`, verbatim from the approved claim set. Do not
  inline strings in components, and do not reword claims without a compliance
  check.
- **Clinic details and tracking IDs**: `lib/site-config.ts`.
- **Design tokens**: `tailwind.config.js` and the component classes in
  `app/globals.css`.

## Before launch

Placeholders that must be replaced, all listed in full in
`docs/wireframe-brief.md`:

- clinic phone number, legal name, registration and privacy policy link
- the founding places closing date, or drop the deadline
- five of the six FAQ answers
- practitioner name and registration
- hero asset, before and after pack, map
- the £750 / £1,500 price conflict with the live Alteon page

## Deployment

AWS Amplify, building from `main`. Full procedure, including domain, SSL and
post-deploy checks: `.claude/skills/ops/deploy-amplify.md`.

Environment variables are documented in `.env.example`. Server-only variables
must also be added to the `env` block of `next.config.js` - Amplify does not
pass runtime env vars to Lambda compute, so they are inlined at build time.
