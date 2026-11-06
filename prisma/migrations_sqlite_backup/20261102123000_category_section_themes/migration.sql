-- Per-section Yellow / Dark themes
ALTER TABLE "Category" ADD COLUMN "bannerTheme" TEXT NOT NULL DEFAULT 'black';
ALTER TABLE "Category" ADD COLUMN "introTheme" TEXT NOT NULL DEFAULT 'black';
ALTER TABLE "Category" ADD COLUMN "productsTheme" TEXT NOT NULL DEFAULT 'black';

-- Seed from legacy pageTheme when present
UPDATE "Category" SET
  "bannerTheme" = COALESCE(NULLIF("pageTheme", ''), 'black'),
  "introTheme" = COALESCE(NULLIF("pageTheme", ''), 'black'),
  "productsTheme" = COALESCE(NULLIF("pageTheme", ''), 'black');
