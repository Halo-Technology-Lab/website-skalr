---
name: build-check
description: Run type checking, linting, and production build to catch errors
user_invocable: true
category: quality
---

# Build Check

Run a full build validation to catch TypeScript errors, lint issues, and build failures.

## Steps

### 1. Type Check
Run TypeScript compiler in check-only mode:
```bash
npx tsc --noEmit
```
Fix any type errors before proceeding.

### 2. Lint
Run the Next.js ESLint configuration:
```bash
npm run lint
```
Fix any lint warnings or errors.

### 3. Production Build
Run a full production build:
```bash
npm run build
```
This will catch:
- Import errors and missing modules
- Server/client component boundary issues
- Invalid metadata exports
- Build-time data fetching failures

### 4. Fix any errors
If errors are found in any step:
- Fix TypeScript errors (type mismatches, missing imports, strict mode violations)
- Fix lint errors (unused vars, missing deps in hooks, etc.)
- Fix build errors (check server/client boundaries, dynamic imports, env vars)
- Re-run the failing step to verify the fix

### 5. Confirm success
All three commands should complete without errors before considering the check passed.
