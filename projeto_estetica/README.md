# Garage 765 Landing Page & Content Management

Mobile-first landing page and content management MVP for a premium auto detailing business, built with Next.js (App Router), Prisma, and Tailwind CSS.

## Features

- Landing page: services portfolio, vertical video carousel, testimonials, Instagram section.
- Customer booking: form builds a formatted message and redirects to a WhatsApp deep link (no data is stored).
- Admin dashboard: manage services, videos, and testimonials with real file uploads to Google Drive (database stores only the public file URLs). Replacing a media file overwrites it in Drive, keeping the URL stable.
- Mobile-first, premium/luxury UI.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dashboard is at http://localhost:3000/dashboard.

## Environment Variables

Copy `.env.example` to `.env` and adjust if needed. `DATABASE_URL` and the Google Drive variables are required for media uploads; everything else has development defaults.

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | — | PostgreSQL connection string (Prisma). |
| `TEST_DATABASE_URL` | — | Optional separate database used by Playwright E2E (falls back to `DATABASE_URL`). |
| `GOOGLE_CLIENT_ID` | — | OAuth2 client ID (drive:auth setup). |
| `GOOGLE_CLIENT_SECRET` | — | OAuth2 client secret. |
| `GOOGLE_REFRESH_TOKEN` | — | OAuth2 refresh token from `npm run drive:auth` (preferred auth). |
| `GOOGLE_CLIENT_EMAIL` | — | Workspace service account email (alternative auth). |
| `GOOGLE_PRIVATE_KEY` | — | Service account private key (keep the `\n` escapes, between double quotes). |
| `GOOGLE_DRIVE_FOLDER_ID` | — | Drive folder where uploaded media is stored. |
| `JWT_SECRET` | `garage765-secret-key-2024` | Secret used to sign admin session tokens. |
| `ADMIN_PHONE` | `19998740950` | Admin login phone. |
| `ADMIN_PASSWORD` | `password` | Admin login password (hashed with bcrypt at seed time). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5519998740950` | Business WhatsApp number for booking deep links. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://instagram.com/garage765` | Link for the Instagram section. |

## Database

```bash
npm run seed        # reset and seed the database (admin + demo content)
npx prisma migrate dev   # apply schema changes
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm run build` | Production build. |
| `npm run lint` | ESLint. |
| `npm run typecheck` | TypeScript check. |
| `npm run test:unit` | Unit tests (Node test runner). |
| `npm run test:e2e` | End-to-end tests (Playwright, starts its own seeded dev server on port 3456). Media-upload tests are skipped unless Drive credentials are configured. |
| `npm run seed` | Reset and seed the database. |
| `npm run drive:auth` | One-time Google authorization; prints the `GOOGLE_REFRESH_TOKEN` for `.env`. |

## Project Structure

- `src/app` - routes: landing page, dashboard, admin login, API routes (`/api/auth`, `/api/upload`, `/api/services`, `/api/videos`, `/api/reviews`).
- `src/components` - landing sections and shared UI.
- `src/lib` - Prisma client, auth helpers, WhatsApp link builder, Google Drive client, API helpers.
- `prisma` - schema, migrations, and seed script.
- `tests` - unit and Playwright e2e tests.

## Roadmap

- Phase 3 (pending): self-hosted deployment with the Google Drive folder shared publicly.
