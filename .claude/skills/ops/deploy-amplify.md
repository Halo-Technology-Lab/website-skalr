---
name: deploy-amplify
description: Deploy the site to AWS Amplify with domain, SSL and environment config
user_invocable: true
category: ops
---

# Deploy to AWS Amplify

End-to-end deployment of this Next.js site to Amplify Hosting (SSR compute).

## Prerequisites

- Repository pushed to a Git provider Amplify can connect to
- AWS account with Amplify access
- Domain purchased and DNS access available
- `npm run build` passing locally (see `/build-check`)

## Steps

### 1. Create the Amplify app

1. Amplify Console > New app > Host web app
2. Connect the repository and branch (`main` for production)
3. Amplify detects Next.js SSR automatically
4. Build settings: it will offer to generate an `amplify.yml`. **Use the one in
   this repo instead** - it pins Node 20, uses `npm ci`, and caches
   `.next/cache`, which keeps incremental builds fast
5. Add all environment variables **before** the first build (step 2)

### 2. Environment variables

Set these in App settings > Environment variables. See `.env.example` for the
current list.

| Variable | Required | Notes |
|----------|:--------:|-------|
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://<domain>` - no trailing slash |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | No | GA4 measurement ID; analytics is skipped if unset |

> **Server-only vars**: any variable without a `NEXT_PUBLIC_` prefix must also
> be added to the `env` block in `next.config.js`. Amplify does not pass runtime
> env vars to Lambda compute, so they are inlined at build time. Setting one in
> the console alone leaves it `undefined` in server code - a failure that only
> shows up in production.

### 3. Domain and SSL

1. Amplify Console > Domain management > Add domain
2. Add the apex domain and the `www` subdomain
3. Follow the DNS instructions at the registrar

```
Type    Name    Value
CNAME   @       <app-id>.amplifyapp.com
CNAME   www     <app-id>.amplifyapp.com
```

SSL is provisioned automatically via ACM. Propagation can take up to 48 hours:

```bash
dig +short <domain>
```

### 4. Canonical host redirect

Set `https://www.<domain>` -> `https://<domain>` (301) under Hosting > Rewrites
and redirects. Do **not** also add a www rule to `next.config.js` - the two
together cause a redirect loop, and the edge rule runs before compute.

### 5. Deploy

Amplify builds on every push to the connected branch:

```bash
git push origin main
```

Or trigger a manual build from the console.

### 6. Post-deployment verification

1. Site loads over HTTPS with no mixed-content warnings
2. Every route in `app/sitemap.ts` returns 200
3. `/sitemap.xml` and `/robots.txt` render with the correct domain
4. Response headers include the CSP and HSTS from `next.config.js`
5. Browser console is free of CSP violations (third-party scripts, fonts and
   image hosts each need an explicit CSP entry)
6. GA4 real-time shows the visit, if analytics is configured
7. Lighthouse >= 90 on performance and accessibility
8. Mobile layout matches the wireframe

## Rollback

Amplify Console > Hosting > Deployments > select a previous successful build >
Redeploy this version. Or revert the code:

```bash
git revert HEAD && git push
```

## Checklist

- [ ] Amplify app created and branch connected
- [ ] `amplify.yml` from the repo is in use
- [ ] All environment variables set (and server-only ones added to `next.config.js`)
- [ ] Domain added, DNS configured, SSL active
- [ ] www -> apex redirect set at the Amplify edge only
- [ ] Site loads on the production domain
- [ ] Sitemap and robots.txt correct
- [ ] No CSP violations in the console
- [ ] Analytics verified (if configured)
- [ ] Lighthouse and mobile checks passed
