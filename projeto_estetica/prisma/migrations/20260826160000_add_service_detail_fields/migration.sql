-- AddServiceDetailFields: optional editable "Saiba mais" modal content per service.
-- Additive only — null values keep the current built-in fallback copy.
ALTER TABLE "Service" ADD COLUMN "longDescription" TEXT;
ALTER TABLE "Service" ADD COLUMN "duration" TEXT;
ALTER TABLE "Service" ADD COLUMN "idealFor" TEXT;
ALTER TABLE "Service" ADD COLUMN "features" TEXT;
ALTER TABLE "Service" ADD COLUMN "includes" TEXT;
