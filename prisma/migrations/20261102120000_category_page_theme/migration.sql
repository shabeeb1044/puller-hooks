-- AlterTable
ALTER TABLE "Category" ADD COLUMN "productsLead" TEXT;
ALTER TABLE "Category" ADD COLUMN "pageTheme" TEXT NOT NULL DEFAULT 'black';

-- Preserve yellow look for hard-body lure pages; hooks default black (admin can switch)
UPDATE "Category" SET "pageTheme" = 'yellow' WHERE "slug" = 'hard-body-lures';
