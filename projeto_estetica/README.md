# Garage 765 Landing Page & Content Management

Mobile-first landing page and content management MVP for a premium auto detailing business, built with Next.js (App Router), Prisma, and Tailwind CSS.

## Features

- Landing page: services portfolio, vertical video carousel, testimonials with Google Maps CTA, Instagram section.
- Customer booking: form builds a formatted message and redirects to a WhatsApp deep link (no data is stored).
- Admin dashboard: manage services, videos, and testimonials with text-only content (images are provided via external URLs or served locally for the navbar avatar).
- Mobile-first, premium/luxury UI with name-initial avatar fallbacks for all reviews.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The dashboard is at http://localhost:3000/dashboard.

## Environment Variables

Copy `.env.example` to `.env` and adjust if needed. `DATABASE_URL` is required; everything else has development defaults.

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | — | PostgreSQL connection string (Prisma). |
| `TEST_DATABASE_URL` | — | Optional separate database used by Playwright E2E (falls back to `DATABASE_URL`). |
| `JWT_SECRET` | `garage765-secret-key-2024` | Secret used to sign admin session tokens. |
| `ADMIN_PHONE` | `19998740950` | Admin login phone. |
| `ADMIN_PASSWORD` | `password` | Admin login password (hashed with bcrypt at seed time). |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | `5519998740950` | Business WhatsApp number for booking deep links. |
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://instagram.com/garage765sp` | Link for the Instagram section. |

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
| `npm run test:e2e` | End-to-end tests (Playwright, starts its own seeded dev server on port 3456). |
| `npm run seed` | Reset and seed the database. |

## Project Structure

- `src/app` - routes: landing page, dashboard, admin login, API routes (`/api/auth`, `/api/services`, `/api/videos`, `/api/reviews`).
- `src/components` - landing sections and shared UI.
- `src/lib` - Prisma client, auth helpers, WhatsApp link builder, API helpers.
- `public/images/` - local static assets (avatar.png for navbar).
- `prisma` - schema, migrations, and seed script (using current-data.json export).
- `scripts/` - database export utility and other utilities.
- `tests` - unit and Playwright e2e tests.

## Roadmap

The Google Drive integration has been removed as part of a architectural shift to text-only content management. The system is now focused on clean, performance-optimized delivery of content through external URLs and local static assets.
