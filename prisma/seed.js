/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function loadCatalog() {
  const catalogPath = path.join(__dirname, '..', 'lib', 'catalog.json');
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

async function ensureAdmin() {
  const email = (process.env.ADMIN_SETUP_EMAIL || 'sales@pullertackle.com').toLowerCase().trim();
  const password = process.env.ADMIN_SETUP_PASSWORD;
  if (!password) {
    throw new Error('ADMIN_SETUP_PASSWORD must be set in the environment for seeding.');
  }

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return existing;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: 'PULLER Sales',
      role: 'admin',
    },
  });
  console.log(`Created admin: ${email} (password stored as bcrypt hash only)`);
  return admin;
}

async function seedCategories() {
  const categories = [
    {
      name: 'Hard Body Lures',
      slug: 'hard-body-lures',
      description:
        'PULLER Lures are engineered to deliver reliable, high-performance results in both saltwater and freshwater.',
      image: '/images/product-hard-body-lures-black-bg.webp',
      bannerImage: null,
      visible: true,
      sortOrder: 0,
      pageTitle: 'Strong, Reliable, Built to Perform',
      pageLead:
        'PULLER Lures are engineered to deliver reliable, high-performance results in both saltwater and freshwater. Our range combines strength, durability, quality, and effective lure action.',
      subcategories: [
        {
          name: 'FLASH STRIKER',
          slug: 'flash-striker',
          description:
            'The PULLER FLASH STRIKER is a renowned series of hard-body trolling and casting lures, available in more than 100 different colour patterns.',
          image: '/images/product-hard-body-lures-black-bg.webp',
          visible: true,
          sortOrder: 0,
          pageTitle: 'Strong, Reliable, Built to Perform',
          pageLead:
            'PULLER Lures are engineered to deliver reliable, high-performance results in both saltwater and freshwater.',
        },
      ],
    },
    {
      name: 'Hooks',
      slug: 'hooks',
      description:
        'PULLER fishing hooks for saltwater and freshwater commercial and sport fishing.',
      image: '/images/product-hooks.webp',
      bannerImage: '/images/flash-striker-160-dd-banner.webp',
      visible: true,
      sortOrder: 1,
      pageTitle: 'Strong, Reliable, Built to Perform',
      pageLead:
        'High-strength fishing hooks for saltwater and freshwater — commercial and sport fishing.',
      subcategories: [
        {
          name: 'Round Bend',
          slug: 'round-bend',
          visible: true,
          sortOrder: 0,
        },
        {
          name: 'Bait & Specialty',
          slug: 'bait-specialty',
          visible: true,
          sortOrder: 1,
        },
        {
          name: 'Limerick Bend',
          slug: 'limerick-bend',
          visible: true,
          sortOrder: 2,
        },
        {
          name: 'Kirby Bend',
          slug: 'kirby-bend',
          visible: true,
          sortOrder: 3,
        },
      ],
    },
    {
      name: 'Metal Lures',
      slug: 'metal-lures',
      description: 'Metal lures for saltwater and freshwater fishing.',
      image: '/images/product-metal-lures.webp',
      visible: true,
      sortOrder: 2,
      pageTitle: 'Metal Lures',
      pageLead: 'Coming soon — inquire with our team for availability.',
      subcategories: [],
    },
    {
      name: 'Jigs',
      slug: 'jigs',
      description: 'Fishing jigs for saltwater and freshwater.',
      image: '/images/product-jigs.webp',
      visible: true,
      sortOrder: 3,
      pageTitle: 'Jigs',
      pageLead: 'Coming soon — inquire with our team for availability.',
      subcategories: [],
    },
  ];

  const created = {};

  for (const cat of categories) {
    const { subcategories, ...catData } = cat;
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: catData.name,
        description: catData.description,
        image: catData.image,
        bannerImage: catData.bannerImage,
        visible: catData.visible,
        sortOrder: catData.sortOrder,
        pageTitle: catData.pageTitle,
        pageLead: catData.pageLead,
      },
      create: catData,
    });
    created[cat.slug] = { category, subs: {} };

    for (const sub of subcategories) {
      const subcategory = await prisma.subcategory.upsert({
        where: {
          categoryId_slug: { categoryId: category.id, slug: sub.slug },
        },
        update: {
          name: sub.name,
          description: sub.description || null,
          image: sub.image || null,
          visible: sub.visible ?? true,
          sortOrder: sub.sortOrder ?? 0,
          pageTitle: sub.pageTitle || null,
          pageLead: sub.pageLead || null,
        },
        create: {
          ...sub,
          categoryId: category.id,
        },
      });
      created[cat.slug].subs[sub.slug] = subcategory;
    }
  }

  return created;
}

async function seedFlashStrikerProducts(tree) {
  const catalog = loadCatalog();
  const category = tree['hard-body-lures'].category;
  const subcategory = tree['hard-body-lures'].subs['flash-striker'];
  const existing = await prisma.product.count({
    where: { subcategoryId: subcategory.id },
  });
  if (existing > 0) {
    console.log(`Flash Striker products already seeded (${existing}). Skipping.`);
    return;
  }

  const heightById = Object.fromEntries(catalog.items.map((i) => [i.id, i.height]));

  let sortOrder = 0;
  for (const id of catalog.order) {
    const height = heightById[id] || 526;
    await prisma.product.create({
      data: {
        name: 'FLASH STRIKER',
        slug: id,
        description: '2m +. YOUR PERFECT CATCHER.',
        specifications: JSON.stringify(['2m + dive depth', 'Hard-body trolling & casting', '160 DD']),
        features: JSON.stringify(['Durable construction', 'Effective lure action', 'Saltwater & freshwater']),
        image: `/images/products/flash-striker-160-dd-${id}.webp`,
        imageAlt: `FLASH STRIKER, 2m +`,
        imageHeight: height,
        status: 'published',
        layout: 'horizontal',
        sortOrder: sortOrder++,
        ctaLabel: 'Inquiry now',
        ctaHref: '/dealers#apply',
        searchTerms: `${id} flash striker 2m + your perfect catcher`,
        categoryId: category.id,
        subcategoryId: subcategory.id,
      },
    });
  }
  console.log(`Seeded ${catalog.order.length} Flash Striker colourways.`);
}

async function seedHookProducts(tree) {
  const hooks = [
    { name: 'Round Bend Flat Hook', sub: 'round-bend', slug: 'round-bend-flat-hook' },
    { name: 'Round Bend Ringed Hook', sub: 'round-bend', slug: 'round-bend-ringed-hook' },
    { name: 'Round Bend Flat Matt Hook', sub: 'round-bend', slug: 'round-bend-flat-matt-hook' },
    { name: 'Round Bend Ringed Matt Hook', sub: 'round-bend', slug: 'round-bend-ringed-matt-hook' },
    { name: 'In-Line Single Hook', sub: 'bait-specialty', slug: 'in-line-single-hook' },
    { name: 'Beak Bait Hook', sub: 'bait-specialty', slug: 'beak-bait-hook' },
    { name: 'Octopus Hook', sub: 'bait-specialty', slug: 'octopus-hook' },
    { name: 'Limerick Bend Ringed Black Hook', sub: 'limerick-bend', slug: 'limerick-bend-ringed-black-hook' },
    { name: 'Limerick Bend Ringed Golden Hook', sub: 'limerick-bend', slug: 'limerick-bend-ringed-golden-hook' },
    { name: 'Limerick Bend Flat Black Hook', sub: 'limerick-bend', slug: 'limerick-bend-flat-black-hook' },
    { name: 'Kirby Bend Ringed Bronze Hook', sub: 'kirby-bend', slug: 'kirby-bend-ringed-bronze-hook' },
    { name: 'Kirby Bend Flat Hook', sub: 'kirby-bend', slug: 'kirby-bend-flat-hook' },
    { name: 'Kirby Bend Ringed Hook', sub: 'kirby-bend', slug: 'kirby-bend-ringed-hook' },
    { name: 'Kirby Bend Flat Blue Hook', sub: 'kirby-bend', slug: 'kirby-bend-flat-blue-hook' },
  ];

  const category = tree.hooks.category;
  let sortOrder = 0;
  for (const hook of hooks) {
    const subcategory = tree.hooks.subs[hook.sub];
    await prisma.product.upsert({
      where: {
        categoryId_slug: { categoryId: category.id, slug: hook.slug },
      },
      update: {
        name: hook.name,
        status: 'published',
        layout: 'vertical',
        subcategoryId: subcategory.id,
        sortOrder: sortOrder++,
        ctaHref: '/contact',
        ctaLabel: 'Inquire',
      },
      create: {
        name: hook.name,
        slug: hook.slug,
        description: 'High-strength fishing hook for saltwater and freshwater.',
        status: 'published',
        layout: 'vertical',
        sortOrder: sortOrder++,
        image: '/images/product-hooks.webp',
        imageAlt: hook.name,
        ctaHref: '/contact',
        ctaLabel: 'Inquire',
        searchTerms: hook.name.toLowerCase(),
        categoryId: category.id,
        subcategoryId: subcategory.id,
      },
    });
  }
  console.log(`Seeded ${hooks.length} hook products.`);
}

async function main() {
  await ensureAdmin();
  const tree = await seedCategories();
  await seedFlashStrikerProducts(tree);
  await seedHookProducts(tree);
  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
