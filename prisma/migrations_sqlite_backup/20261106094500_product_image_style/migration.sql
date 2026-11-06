-- Image card display: normal (fit as-is) or vertical (rotated pack art)
ALTER TABLE "Product" ADD COLUMN "imageStyle" TEXT NOT NULL DEFAULT 'normal';

-- Flash Striker pack photos stay on the rotated vertical layout
UPDATE "Product" SET "imageStyle" = 'vertical'
WHERE "layout" = 'horizontal'
  AND "image" IS NOT NULL
  AND "image" LIKE '%flash-striker%';
