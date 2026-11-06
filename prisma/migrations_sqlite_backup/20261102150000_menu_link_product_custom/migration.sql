-- Category: link menu to an existing product
ALTER TABLE "Category" ADD COLUMN "menuProductId" TEXT;

-- Normalize legacy section → custom (same behaviour, clearer admin label)
UPDATE "Category" SET "menuLinkType" = 'custom' WHERE "menuLinkType" = 'section';

-- Subcategory: same menu link options as Category
ALTER TABLE "Subcategory" ADD COLUMN "menuLinkType" TEXT NOT NULL DEFAULT 'page';
ALTER TABLE "Subcategory" ADD COLUMN "menuAnchor" TEXT;
ALTER TABLE "Subcategory" ADD COLUMN "menuProductId" TEXT;
