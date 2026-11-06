/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

console.log('Seeding MySQL (DATABASE_URL)…');
const prisma = new PrismaClient();

function loadCatalog() {
  const catalogPath = path.join(__dirname, '..', 'lib', 'catalog.json');
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}

async function ensureAdmin() {
  const email = (process.env.ADMIN_SETUP_EMAIL || 'sales@pullertackle.com').toLowerCase().trim();
  const password = process.env.ADMIN_SETUP_PASSWORD;

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return existing;
  }

  if (!password) {
    console.warn(
      'ADMIN_SETUP_PASSWORD not set — skipping admin create. Set it and re-run seed to create the first admin.'
    );
    return null;
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
            'Choose the FLASH STRIKER size that matches your water, target species and technique. FLASH STRIKER is available now in 38 colour patterns.',
          image: '/images/product-hard-body-lures-black-bg.webp',
          visible: true,
          sortOrder: 0,
          pageSubtitle: 'PULLER Lures',
          pageTitle: 'Strong, Reliable, Built to Perform',
          pageLead:
            'PULLER Lures are engineered to deliver reliable, high-performance results in both saltwater and freshwater.',
          modelsSubtitle: 'Available Models',
          modelsTitle: 'Seven sizes. One series.',
          modelsLead:
            'Choose the FLASH STRIKER size that matches your water, target species and technique. FLASH STRIKER is available now in 38 colour patterns.',
          productsSubtitle: 'Colour Patterns',
          productsTitle: 'FLASH STRIKER 160 DD',
          productsLead: '38 colour patterns · 2m+ dive depth. Available now.',
          bannerTheme: 'yellow',
          modelsTheme: 'yellow',
          productsTheme: 'yellow',
        },
      ],
    },
    {
      name: 'Hooks',
      slug: 'hooks',
      description:
        'PULLER Hooks are engineered to deliver reliable performance in both saltwater and freshwater environments. Built with durable materials and precision manufacturing, our hooks provide strength, sharpness, and consistency for commercial and sport fishing applications.',
      image: '/images/product-hooks.webp',
      bannerImage: '/images/flash-striker-160-dd-banner.webp',
      visible: true,
      sortOrder: 1,
      pageSubtitle: 'PULLER Products',
      pageTitle: 'Strong, Reliable, Built to Perform',
      pageLead:
        'High-strength fishing hooks for saltwater and freshwater — commercial and sport fishing.',
      introSubtitle: 'Our Range',
      introTitle: 'Hooks',
      productsSubtitle: 'Hook Styles',
      productsTitle: 'Designed for every technique',
      productsLead:
        'From classic round bend patterns to specialty bait hooks, limerick, and kirby styles — choose the point and bend that match your technique.',
      bannerTheme: 'black',
      introTheme: 'black',
      productsTheme: 'black',
      pageTheme: 'black',
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
      menuLinkType: 'custom',
      menuAnchor: 'card-metal',
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
      menuLinkType: 'custom',
      menuAnchor: 'card-jigs',
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
        menuLinkType: catData.menuLinkType || 'page',
        menuAnchor: catData.menuAnchor || null,
        pageSubtitle: catData.pageSubtitle || null,
        pageTitle: catData.pageTitle,
        pageLead: catData.pageLead,
        introSubtitle: catData.introSubtitle || null,
        introTitle: catData.introTitle || null,
        productsSubtitle: catData.productsSubtitle || null,
        productsTitle: catData.productsTitle || null,
        productsLead: catData.productsLead || null,
        bannerTheme: catData.bannerTheme || catData.pageTheme || 'black',
        introTheme: catData.introTheme || catData.pageTheme || 'black',
        productsTheme: catData.productsTheme || catData.pageTheme || 'black',
        pageTheme: catData.productsTheme || catData.pageTheme || 'black',
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
          pageSubtitle: sub.pageSubtitle || null,
          pageTitle: sub.pageTitle || null,
          pageLead: sub.pageLead || null,
          modelsSubtitle: sub.modelsSubtitle || null,
          modelsTitle: sub.modelsTitle || null,
          modelsLead: sub.modelsLead || sub.description || null,
          productsSubtitle: sub.productsSubtitle || null,
          productsTitle: sub.productsTitle || null,
          productsLead: sub.productsLead || null,
          bannerTheme: sub.bannerTheme || 'black',
          modelsTheme: sub.modelsTheme || 'black',
          productsTheme: sub.productsTheme || 'black',
        },
        create: {
          ...sub,
          modelsLead: sub.modelsLead || sub.description || null,
          bannerTheme: sub.bannerTheme || 'black',
          modelsTheme: sub.modelsTheme || 'black',
          productsTheme: sub.productsTheme || 'black',
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
        imageStyle: 'vertical',
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

async function seedDealerDirectory() {
  const regions = [
    {
      name: 'Europe',
      slug: 'europe',
      sortOrder: 0,
      dealers: [
        {
          name: 'Golden Catch',
          country: 'Ukraine',
          address: 'Dmitrievskaya Street, 59, Odessa, Ukraine',
          sortOrder: 0,
        },
        {
          name: 'Kiddy Wholesale Ltd',
          country: 'United Kingdom',
          address: '9 Barton Road, St Marys Buildings, Torquay, Devon, TQ1 4DP, United Kingdom',
          sortOrder: 1,
        },
        {
          name: 'Pesca Norte',
          country: 'Portugal',
          address: 'Rua do Comércio 12, Porto, Portugal',
          sortOrder: 2,
        },
        {
          name: 'Alpine Tackle',
          country: 'Austria',
          address: 'Fischergasse 8, Salzburg, Austria',
          sortOrder: 3,
        },
      ],
    },
    {
      name: 'Asia',
      slug: 'asia',
      sortOrder: 1,
      dealers: [],
    },
    {
      name: 'Americas',
      slug: 'americas',
      sortOrder: 2,
      dealers: [],
    },
  ];

  for (const region of regions) {
    const saved = await prisma.dealerRegion.upsert({
      where: { slug: region.slug },
      update: {
        name: region.name,
        sortOrder: region.sortOrder,
        visible: true,
      },
      create: {
        name: region.name,
        slug: region.slug,
        sortOrder: region.sortOrder,
        visible: true,
      },
    });

    for (const dealer of region.dealers) {
      const existing = await prisma.dealerLocation.findFirst({
        where: { regionId: saved.id, name: dealer.name },
      });
      if (existing) {
        await prisma.dealerLocation.update({
          where: { id: existing.id },
          data: {
            address: dealer.address,
            country: dealer.country,
            sortOrder: dealer.sortOrder,
            visible: true,
          },
        });
      } else {
        await prisma.dealerLocation.create({
          data: {
            name: dealer.name,
            address: dealer.address,
            country: dealer.country,
            sortOrder: dealer.sortOrder,
            visible: true,
            regionId: saved.id,
          },
        });
      }
    }
  }
  console.log(`Seeded ${regions.length} dealer regions.`);
}

async function main() {
  await ensureAdmin();
  const tree = await seedCategories();
  await seedFlashStrikerProducts(tree);
  await seedDealerDirectory();
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
