-- Subcategory page sections: Banner / Available Models / Products
ALTER TABLE "Subcategory" ADD COLUMN "pageSubtitle" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN "modelsSubtitle" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN "modelsTitle" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN "modelsLead" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN "productsSubtitle" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN "productsTitle" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN "productsLead" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN "bannerTheme" TEXT NOT NULL DEFAULT 'yellow';
ALTER TABLE "Subcategory" ADD COLUMN "modelsTheme" TEXT NOT NULL DEFAULT 'yellow';
ALTER TABLE "Subcategory" ADD COLUMN "productsTheme" TEXT NOT NULL DEFAULT 'yellow';

-- Backfill models copy from legacy description when present
UPDATE "Subcategory"
SET "modelsLead" = "description"
WHERE "description" IS NOT NULL
  AND TRIM("description") != ''
  AND ("modelsLead" IS NULL OR TRIM("modelsLead") = '');
