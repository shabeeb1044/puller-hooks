/**
 * Copy provided hook product photos into public/ and upsert CMS products.
 * Usage: node scripts/import-hook-images.js
 */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const ASSETS_DIR = path.join(
  process.env.USERPROFILE || '',
  '.cursor',
  'projects',
  'c-shabeeb-fish-hook-fish-hook',
  'assets'
);

const OUT_DIR = path.join(__dirname, '..', 'public', 'images', 'products', 'hooks');

/** Map asset index prefix → product + subcategory */
const HOOKS = [
  { asset: 0, name: 'Round Bend Flat Hook', slug: 'round-bend-flat-hook', sub: 'round-bend', sort: 0 },
  { asset: 1, name: 'Round Bend Ringed Hook', slug: 'round-bend-ringed-hook', sub: 'round-bend', sort: 1 },
  { asset: 2, name: 'Round Bend Flat Matt Hook', slug: 'round-bend-flat-matt-hook', sub: 'round-bend', sort: 2 },
  { asset: 3, name: 'Round Bend Ringed Matt Hook', slug: 'round-bend-ringed-matt-hook', sub: 'round-bend', sort: 3 },
  { asset: 4, name: 'In-Line Single Hook', slug: 'in-line-single-hook', sub: 'bait-specialty', sort: 4 },
  { asset: 5, name: 'Beak Bait Hook', slug: 'beak-bait-hook', sub: 'bait-specialty', sort: 5 },
  { asset: 6, name: 'Octopus Hook', slug: 'octopus-hook', sub: 'bait-specialty', sort: 6 },
  { asset: 7, name: 'Limerick Bend Ringed Black Hook', slug: 'limerick-bend-ringed-black-hook', sub: 'limerick-bend', sort: 7 },
  { asset: 8, name: 'Limerick Bend Ringed Golden Hook', slug: 'limerick-bend-ringed-golden-hook', sub: 'limerick-bend', sort: 8 },
  { asset: 9, name: 'Limerick Bend Flat Black Hook', slug: 'limerick-bend-flat-black-hook', sub: 'limerick-bend', sort: 9 },
  { asset: 10, name: 'Kirby Bend Ringed Bronze Hook', slug: 'kirby-bend-ringed-bronze-hook', sub: 'kirby-bend', sort: 10 },
  { asset: 11, name: 'Kirby Bend Flat Hook', slug: 'kirby-bend-flat-hook', sub: 'kirby-bend', sort: 11 },
  { asset: 12, name: 'Kirby Bend Ringed Hook', slug: 'kirby-bend-ringed-hook', sub: 'kirby-bend', sort: 12 },
  { asset: 13, name: 'Kirby Bend Flat Blue Hook', slug: 'kirby-bend-flat-blue-hook', sub: 'kirby-bend', sort: 13 },
];

const SUBCATEGORIES = [
  { name: 'Round Bend', slug: 'round-bend', sortOrder: 0 },
  { name: 'Bait & Specialty', slug: 'bait-specialty', sortOrder: 1 },
  { name: 'Limerick Bend', slug: 'limerick-bend', sortOrder: 2 },
  { name: 'Kirby Bend', slug: 'kirby-bend', sortOrder: 3 },
];

function findAssetFile(index) {
  const files = fs.readdirSync(ASSETS_DIR);
  const match = files.find((f) => new RegExp(`^${index}-.*\\.jpe?g$`, 'i').test(f));
  if (!match) throw new Error(`Missing asset for index ${index} in ${ASSETS_DIR}`);
  return path.join(ASSETS_DIR, match);
}

function jpegSize(filePath) {
  const buf = fs.readFileSync(filePath);
  for (let i = 0; i < buf.length - 9; i++) {
    if (buf[i] === 0xff && (buf[i + 1] === 0xc0 || buf[i + 1] === 0xc2)) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
  }
  return { width: 640, height: 800 };
}

async function main() {
  if (!fs.existsSync(ASSETS_DIR)) {
    throw new Error(`Assets folder not found: ${ASSETS_DIR}`);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const category = await prisma.category.findUnique({ where: { slug: 'hooks' } });
  if (!category) throw new Error('Hooks category not found. Run seed first.');

  const subs = {};
  for (const sub of SUBCATEGORIES) {
    const row = await prisma.subcategory.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: sub.slug } },
      update: { name: sub.name, visible: true, sortOrder: sub.sortOrder },
      create: {
        name: sub.name,
        slug: sub.slug,
        visible: true,
        sortOrder: sub.sortOrder,
        categoryId: category.id,
        bannerTheme: 'black',
        modelsTheme: 'black',
        productsTheme: 'black',
      },
    });
    subs[sub.slug] = row;
    console.log(`subcategory: ${row.name}`);
  }

  for (const hook of HOOKS) {
    const src = findAssetFile(hook.asset);
    const destName = `${hook.slug}.jpg`;
    const dest = path.join(OUT_DIR, destName);
    fs.copyFileSync(src, dest);
    const { width, height } = jpegSize(dest);
    const imagePath = `/images/products/hooks/${destName}`;

    const data = {
      name: hook.name.toUpperCase(),
      description: null,
      image: imagePath,
      imageAlt: hook.name,
      imageHeight: height || 800,
      imageStyle: 'contain',
      status: 'published',
      layout: 'horizontal',
      sortOrder: hook.sort,
      ctaLabel: 'Inquiry now',
      ctaHref: '/dealers#apply',
      searchTerms: `${hook.name} puller hook`,
      categoryId: category.id,
      subcategoryId: subs[hook.sub].id,
    };

    const product = await prisma.product.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: hook.slug } },
      update: data,
      create: { ...data, slug: hook.slug },
    });

    console.log(`product: ${product.name} → ${imagePath} (${width}x${height})`);
  }

  console.log(`Done. Imported ${HOOKS.length} hook products.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
