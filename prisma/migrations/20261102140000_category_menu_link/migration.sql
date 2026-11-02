-- Categories: choose Products menu target — category page OR home section/anchor
ALTER TABLE "Category" ADD COLUMN "menuLinkType" TEXT NOT NULL DEFAULT 'page';
ALTER TABLE "Category" ADD COLUMN "menuAnchor" TEXT;

-- Match static site: Metal Lures / Jigs scroll to home product cards
UPDATE "Category" SET "menuLinkType" = 'section', "menuAnchor" = 'card-metal' WHERE "slug" = 'metal-lures';
UPDATE "Category" SET "menuLinkType" = 'section', "menuAnchor" = 'card-jigs' WHERE "slug" = 'jigs';
