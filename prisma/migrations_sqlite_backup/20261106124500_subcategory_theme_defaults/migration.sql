-- Prefer black defaults; keep Flash Striker on yellow
UPDATE "Subcategory"
SET
  "bannerTheme" = 'black',
  "modelsTheme" = 'black',
  "productsTheme" = 'black'
WHERE "slug" != 'flash-striker';

UPDATE "Subcategory"
SET
  "bannerTheme" = 'yellow',
  "modelsTheme" = 'yellow',
  "productsTheme" = 'yellow'
WHERE "slug" = 'flash-striker';
