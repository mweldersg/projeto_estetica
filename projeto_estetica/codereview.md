# Code Review

Date: 2026-08-07
Scope: Landing page + content management MVP (Garage 765). Focus on the latest changes (black/red theme, editable FAQ) and the overall health of the codebase.

## Summary

The codebase is small, idiomatic Next.js 16 (App Router) + Tailwind v4 + Prisma 7, and generally well structured: clear separation between public landing page, admin dashboard, API routes, and lib helpers. The two recent features (red theme, DB-driven FAQ) are implemented consistently with the existing patterns and pass typecheck; 11/12 e2e tests pass (the failure is a stale test for a removed feature).

No critical or high-severity issues found. Findings below are medium/low severity, mostly pre-existing technical debt and consistency gaps introduced by the removal of the Google Drive integration.

## What was reviewed

- Theme: `src/app/globals.css` + all `garage-*` class usages
- FAQ feature: `prisma/schema.prisma`, `src/app/api/faqs/`, `src/app/page.tsx`, `src/components/LandingPage.tsx`, `src/components/FAQ.tsx`, `src/app/dashboard/page.tsx`, `prisma/seed.ts`, `current-data.json`
- Auth flow: `src/lib/auth.ts`, `src/app/api/auth/*`
- CRUD pattern: `src/app/api/{services,videos,reviews,faqs}/`, `src/lib/api.ts`, `src/components/ContentManager.tsx`
- Tests: `tests/` (unit + Playwright)
- Tooling: `package.json`, `playwright.config.ts`, `next.config.ts`, `.gitignore`

## Findings

### Medium

**M1. Stale unit test references removed module — `tests/unit/drive.test.ts`**
The test imports `isDriveUrl`, `extractFileId`, `getPublicUrl` from `src/lib/drive.ts`, but that file was emptied (all exports commented out) when Drive integration was removed. Result: `npm run typecheck` fails with `File '.../src/lib/drive.ts' is not a module` (pre-existing, not introduced by the FAQ/theme work). The test should be deleted or rewritten to match the current architecture.

**M2. E2E test asserts removed upload flow — `tests/e2e/dashboard.spec.ts:75`**
`creating a service is blocked until the required image is uploaded` expects `Envie o arquivo para habilitar.` and a disabled "Criar" button, but the Services tab no longer has an image field and `/api/upload` returns 501. This test fails on every run (`1 failed`). Either delete it or repurpose it to cover the current validation behavior (e.g. required title).

**M3. Prisma migrations out of sync with schema**
The committed migrations (`20260803152620_init`, `20260804100228_add_instagram_url_to_videos`) do not match `prisma/schema.prisma`:
- `20260803152620_init` still creates `Review.image`, which no longer exists in the schema
- The new `Faq` table was added via `prisma db push` with no migration file
- `prisma migrate status` reports both migrations as never applied

Consequences: a fresh setup with `npx prisma migrate dev`/`deploy` will fail or produce drift; `README.md` still documents `npx prisma migrate dev` as the workflow. Fix options: (a) clean up the migrations to match the schema and generate a proper `Faq` migration, or (b) document `prisma db push` as the canonical sync command. Since the DB holds real content and migrations were never applied, (b) is the lower-risk fix.

**M4. `current-data.json` is gitignored but is the seed source**
`prisma/seed.ts` imports `../current-data.json` (untracked, in `.gitignore`), and the `Faq` seed data was added there. A fresh clone cannot run `npm run seed` — it crashes with `Cannot read properties of undefined (reading 'upsert')` because the file/`faqs` key is missing. Either commit the file (it is the "database export" and arguably should be versioned), or move the seed data into `prisma/seed.ts`/a tracked fixture.

**M5. `scripts/export-db.ts` does not export FAQs**
`export-db.ts` exports `admin`, `services`, `videos`, `reviews` but not `faqs`, and still has the legacy `review as any` cleanup (`@typescript-eslint/no-explicit-any` error). The export/seed round-trip is now asymmetric (FAQ data added in seed, never exported; and export no longer round-trips FAQ). Add `faqs` to the export.

### Low

**L1. Hardcoded fallback credentials and secrets**
- `src/lib/auth.ts:4` — `JWT_SECRET` falls back to a public literal (`garage765-secret-key-2024`), also duplicated in `.env.example`. In production, unset `JWT_SECRET` silently uses a known secret.
- `src/app/api/auth/login/route.ts:6` — `ADMIN_PHONE` falls back to the real admin number.
- The live `.env` contains a Google Drive service-account private key and refresh token for a removed feature — harmless today but should be cleaned up.
Recommended: fail fast in production if `JWT_SECRET`/`ADMIN_PHONE` are missing, and purge the dead Drive env vars.

**L2. Cookie not marked `Secure` and no explicit `SameSite` on logout**
`Set-Cookie` in `login/route.ts:54` and `logout/route.ts` lacks `Secure` (fine for local http, wrong for https prod) and logout omits `SameSite`. Minor, but worth a quick fix when deploying.

**L3. JWT payload contains `role` but it is never enforced**
`TokenPayload.role` is set to `'admin'` but authorization only checks `getUserFromRequest` (valid session = admin). Harmless at this scale (single admin), but the field is dead weight / misleading.

**L4. Lint errors (pre-existing, 4 errors / 5 warnings)**
- `react/no-unescaped-entities` — `Testimonials.tsx:39` (double quotes)
- `prefer-const` — `src/lib/instagram.ts:2`
- `no-explicit-any` — `scripts/export-db.ts:24` (tied to M5)
- Warnings: unused `formatInstagramEmbedUrl` import in `seed.ts`, unused `fileId` in the media route, three `no-img-element` warnings.
`npm run lint` does not currently pass; either fix or scope it down.

**L5. `Video` model order values are duplicated in seed data**
`current-data.json` videos all have `order: 0` (seed re-indexes on upsert, so runtime order is fine — but the source data is inconsistent).

**L6. Booking form state update during render**
`BookingForm.tsx:20-23` calls `setService` during render (derived-state pattern). Works in React 19, but the idiomatic approach is to key the component or use `useEffect`. Cosmetic; no bug observed.

**L7. `next.config.ts` has stray dev comments**
Comment `// Deixei esse também para não quebrar...` — minor noise; also the Google Drive remote patterns are dead config.

**L8. Inconsistent placeholder/service flow**
`current-data.json` `Service.value` holds a display string like `"Vitrificação de Pintura"` used as the booking select value, while `Service` also has `title`. Duplicated but harmless.

## Positives

- FAQ feature follows the existing Reviews pattern exactly (model → API routes → generic `ContentManager` → dashboard tab → props to landing page), keeping the codebase uniform.
- `FAQ.tsx` correctly renders nothing when the list is empty (no broken section in the UI).
- Public GET routes are unauthenticated by design (correct for a landing page); all mutations are behind `requireAdmin`.
- Password is bcrypt-hashed, never returned by `me`/login routes (spread with `password: undefined`).
- WhatsApp deep-link builder is a pure function, unit-tested.
- Prisma client singleton pattern with dev hot-reload guard (`src/lib/prisma.ts`).
- No secrets are committed (`.env` ignored; verified no env files in git).

## Recommended actions (priority order)

1. Fix or delete the two stale tests (M1, M2) so `npm run typecheck` and `npm run test:e2e` pass cleanly.
2. Resolve the migrations-vs-schema drift and document the sync workflow (M3).
3. Make seeding work from a fresh clone — commit `current-data.json` or inline the seed data (M4).
4. Add `faqs` to `scripts/export-db.ts` and drop the `any` cast (M5).
5. Fail fast on missing `JWT_SECRET`/`ADMIN_PHONE` in production (L1).
6. Clean up dead Drive config: env vars, `next.config.ts` patterns, `api/media` + `api/upload` + `drive.ts` stubs, `media.spec.ts` (all skipped anyway).
7. Fix the lint errors (L4).
