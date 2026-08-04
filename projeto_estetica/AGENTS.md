# Garage 765 Landing Page & Content Management MVP

## Business Requirements

- An MVP of a Landing Page and Content Management web application for a premium auto detailing business.
- Mobile-first approach is mandatory.
- Two main workflows:
  - Customer Booking Flow: Customers do NOT need to log in or create accounts. They fill out a booking form (selecting Service, Vehicle Details, Date, Time, and Name). No appointments are saved in the database. Upon submission, the system generates a formatted string and redirects the customer to a WhatsApp deep link to send the pre-filled message to the business.
  - Admin Content Flow: Admin logs in using predefined credentials. The Admin has access to a secure dashboard to manage dynamic content. (System configuration and API keys are strictly managed via environment variables, not the UI).
- Dynamic Content to be managed by Admin:
  - Services Portfolio: Add/update images for specific detailing services.
  - Short Videos: Add/update vertical videos to be displayed in a mobile-friendly carousel.
  - Testimonials: Add/edit curated Google My Business reviews (Reviewer Name, 5-Star Rating, Text) to display on the site for credibility.
- Static Integrations:
  - Include an Instagram section featuring a static mockup/screenshot of the business profile (showing name and followers) linking to the actual Instagram page.
- The priority is a slick, professional, and absolutely gorgeous UI/UX that conveys a "Premium/Luxury" feel.
- Keep it simple: NO complex user profiles, NO email verification, NO password recovery. MVP features only.

## Technical Details

- Implemented as a modern full-stack NextJS app (using App Router).
- The NextJS app should be created in a subdirectory `frontend`.
- Persistence/Storage Architecture:
  - Database: Use PostgreSQL (via Prisma) to store admin credentials, textual data (Google Reviews), and the file URLs/metadata.
  - File Storage: Use the Google Drive API to upload and store images and vertical videos. The database will only store the public Google Drive URLs.
- Use Tailwind CSS for the UI.
- Video playback must be optimized for mobile (muted by default, vertical aspect ratio, simple carousel navigation).
- As simple as possible but with an elegant, responsive UI.

## Strategy (Skeleton-First Approach)

1. Phase 1 - UI & Structure: Scaffolding the NextJS project, setting up the Tailwind design system, building the static Landing Page, and creating the Admin Dashboard UI. Use mock data/static placeholders for images and videos.
2. Phase 2 - Database Integration: Setup Prisma, define models (Admin, Content, Reviews), and implement local state/DB persistence for text-based content. 
3. Phase 3 - External API (Google Drive): Implement the actual file upload logic to Google Drive using environment variables for authentication, connecting the Admin UI file inputs to the cloud storage.
4. Phase 4 - Final Polish & Testing: Carry out rigorous integration testing, ensuring the hand-off between UI, DB, and Drive is seamless. Only complete when the MVP is finished and tested.

## Coding standards

1. Use latest versions of libraries and idiomatic approaches as of today.
2. Keep it simple - NEVER over-engineer, ALWAYS simplify, NO unnecessary defensive programming. No extra features - focus on simplicity.
3. Be concise. Keep README minimal. IMPORTANT: no emojis ever.