---
name: add-route
description: Add a new public page with metadata, sitemap entry and structured data
user_invocable: true
category: seo
---

# Add a Route

Every new public page needs the same four things. Do all of them in one go, or
the page ships without metadata and never gets indexed.

## Steps

### 1. Create the page

`app/<route>/page.tsx`. Server component by default - add `'use client'` only
if the page itself needs hooks or event handlers, and prefer pushing that into
a small child component so the page stays a server component.

```tsx
import type { Metadata } from 'next';
import { siteConfig, absoluteUrl } from '@/lib/site-config';

export const metadata: Metadata = {
  title: '<Page title>',            // template appends the brand name
  description: '<150-160 chars>',
  alternates: { canonical: absoluteUrl('/<route>') },
  openGraph: {
    title: '<Page title>',
    description: '<same description>',
    url: absoluteUrl('/<route>'),
    siteName: siteConfig.name,
    images: [siteConfig.ogImage],
  },
};

export default function Page() {
  return <div>...</div>;
}
```

For dynamic routes use `generateMetadata({ params })` instead, and add
`generateStaticParams()` if the set of slugs is known at build time.

### 2. Add it to the sitemap

`app/sitemap.ts` - add an entry to the `routes` array with a sensible
`changeFrequency` and `priority`. Dynamic routes: fetch the slugs in that file
and append them.

### 3. Add structured data if it fits a schema.org type

```tsx
import { JsonLd } from '@/components/ui/JsonLd';

<JsonLd data={{ '@context': 'https://schema.org', '@type': '...', ... }} />
```

### 4. Link to it

An orphan page with a sitemap entry still ranks poorly. Link it from the
navigation, the footer or a related page.

## Checklist

- [ ] `metadata` or `generateMetadata` exported, with a canonical URL
- [ ] Title under ~60 characters, description 150-160
- [ ] Open Graph fields set
- [ ] Entry added to `app/sitemap.ts`
- [ ] JSON-LD added where a schema.org type applies
- [ ] Page linked from somewhere in the site
- [ ] `/build-check` passes
