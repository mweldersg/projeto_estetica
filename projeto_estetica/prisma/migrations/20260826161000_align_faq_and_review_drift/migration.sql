-- AlignFaqAndReviewDrift: brings the recorded migrations in line with schema.prisma.
--
-- The Faq table was previously created out-of-band (prisma db push), so fresh
-- databases deployed only via `prisma migrate deploy` were missing it, which
-- broke `npm run seed`. Review.image was removed from the schema but never
-- dropped by a migration. Both are corrected here idempotently.
CREATE TABLE IF NOT EXISTS "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Review" DROP COLUMN IF EXISTS "image";
