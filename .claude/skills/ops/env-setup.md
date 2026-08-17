---
name: env-setup
description: Add or change an environment variable correctly across local, next.config.js and Amplify
user_invocable: true
category: ops
---

# Environment Variable Setup

Adding a variable takes up to four edits. Missing one of them produces a
variable that works locally and is `undefined` in production.

## The rule

| Variable type | Read by | Where it must be declared |
|---------------|---------|---------------------------|
| `NEXT_PUBLIC_*` | Browser and server | `.env.example`, `.env.local`, Amplify console |
| Everything else | Server only | `.env.example`, `.env.local`, Amplify console, **`next.config.js` `env` block** |

Amplify's Lambda compute does not receive runtime environment variables, so
server-only vars are inlined into the server bundle at build time by the `env`
block in `next.config.js`. That block is the step people forget.

## Steps

### 1. Add to `.env.example`

Document it with a comment saying what it is and whether it is required. Never
put a real secret in this file - it is committed.

### 2. Add to `.env.local`

Local value. This file is gitignored.

### 3. If server-only, add to `next.config.js`

```js
env: {
  MY_NEW_SECRET: process.env.MY_NEW_SECRET,
},
```

**Security**: values in this block are embedded in server bundles. They reach
the browser only if a `'use client'` component imports a module that reads them.
Keep secret-reading modules server-side and never import them from client
components.

### 4. Add to the Amplify console

App settings > Environment variables, for every branch that needs it. Then
redeploy - inlining happens at build time, so an existing deployment will not
pick up the new value.

### 5. Verify

```bash
npm run build
```

Then check the value is present where it is used, in a deployed preview rather
than just locally.

## Checklist

- [ ] Added to `.env.example` with a comment
- [ ] Added to `.env.local`
- [ ] Added to `next.config.js` `env` (server-only vars)
- [ ] Added to the Amplify console for each branch
- [ ] No secret-reading module imported from a `'use client'` component
- [ ] Redeployed and verified in production
