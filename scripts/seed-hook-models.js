/**
 * Create vertical (name-button) models for the Hooks category.
 * These appear in the Available Models section above the product catalog.
 * Usage: node --env-file=.env scripts/seed-hook-models.js
 */
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const HOOK_MODELS = [
  { name: 'Round Bend Flat Hook', slug: 'model-round-bend-flat-hook', productSlug: 'round-bend-flat-hook', sort: 0 },
  { name: 'Round Bend Ringed Hook', slug: 'model-round-bend-ringed-hook', productSlug: 'round-bend-ringed-hook', sort: 1 },
  { name: 'Round Bend Flat Matt Hook', slug: 'model-round-bend-flat-matt-hook', productSlug: 'round-bend-flat-matt-hook', sort: 2 },
  { name: 'Round Bend Ringed Matt Hook', slug: 'model-round-bend-ringed-matt-hook', productSlug: 'round-bend-ringed-matt-hook', sort: 3 },
  { name: 'In-Line Single Hook', slug: 'model-in-line-single-hook', productSlug: 'in-line-single-hook', sort: 4 },
  { name: 'Beak Bait Hook', slug: 'model-beak-bait-hook', productSlug: 'beak-bait-hook', sort: 5 },
  { name: 'Octopus Hook', slug: 'model-octopus-hook', productSlug: 'octopus-hook', sort: 6 },
  {
    name: 'Limerick Bend Ringed Black Hook',
    slug: 'model-limerick-bend-ringed-black-hook',
    productSlug: 'limerick-bend-ringed-black-hook',
    sort: 7,
  },
  {
    name: 'Limerick Bend Ringed Golden Hook',
    slug: 'model-limerick-bend-ringed-golden-hook',
    productSlug: 'limerick-bend-ringed-golden-hook',
    sort: 8,
  },
  {
    name: 'Limerick Bend Flat Black Hook',
    slug: 'model-limerick-bend-flat-black-hook',
    productSlug: 'limerick-bend-flat-black-hook',
    sort: 9,
  },
  {
    name: 'Kirby Bend Ringed Bronze Hook',
    slug: 'model-kirby-bend-ringed-bronze-hook',
    productSlug: 'kirby-bend-ringed-bronze-hook',
    sort: 10,
  },
  { name: 'Kirby Bend Flat Hook', slug: 'model-kirby-bend-flat-hook', productSlug: 'kirby-bend-flat-hook', sort: 11 },
  { name: 'Kirby Bend Ringed Hook', slug: 'model-kirby-bend-ringed-hook', productSlug: 'kirby-bend-ringed-hook', sort: 12 },
  {
    name: 'Kirby Bend Flat Blue Hook',
    slug: 'model-kirby-bend-flat-blue-hook',
    productSlug: 'kirby-bend-flat-blue-hook',
    sort: 13,
  },
];

async function main() {
  const category = await prisma.category.findUnique({ where: { slug: 'hooks' } });
  if (!category) throw new Error('Hooks category not found. Run seed first.');

  await prisma.category.update({
    where: { id: category.id },
    data: {
      modelsSubtitle: category.modelsSubtitle || 'Available Models',
      modelsTitle: category.modelsTitle || 'Hook styles',
      modelsLead:
        category.modelsLead ||
        'Choose the bend, eye and finish that match your technique — then browse the product photos below.',
      modelsTheme: category.modelsTheme || 'black',
      modelsVisible: true,
    },
  });

  for (const model of HOOK_MODELS) {
    const data = {
      name: model.name.toUpperCase(),
      description: null,
      image: null,
      imageAlt: null,
      imageHeight: null,
      imageStyle: 'contain',
      status: 'published',
      layout: 'vertical',
      sortOrder: model.sort,
      ctaLabel: 'View product',
      ctaHref: `/products/hooks#product-${model.productSlug}`,
      searchTerms: `${model.name} puller hook model`,
      categoryId: category.id,
      subcategoryId: null,
    };

    const row = await prisma.product.upsert({
      where: { categoryId_slug: { categoryId: category.id, slug: model.slug } },
      update: data,
      create: { ...data, slug: model.slug },
    });
    console.log(`model: ${row.name}`);
  }

  console.log(`Done — ${HOOK_MODELS.length} hook models ready.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
