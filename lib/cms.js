import { prisma } from './db';

const menuProductSelect = {
  id: true,
  slug: true,
  name: true,
  ctaHref: true,
  category: { select: { slug: true } },
  subcategory: { select: { slug: true } },
};

export async function getNavCategories() {
  return prisma.category.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      menuProduct: { select: menuProductSelect },
      subcategories: {
        where: { visible: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          sortOrder: true,
          menuLinkType: true,
          menuAnchor: true,
          menuProductId: true,
          menuProduct: { select: menuProductSelect },
        },
      },
    },
  });
}

export async function getCategoryBySlug(slug) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      subcategories: {
        where: { visible: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
}

export async function getSubcategoryBySlugs(categorySlug, subcategorySlug) {
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return null;
  const subcategory = await prisma.subcategory.findFirst({
    where: { categoryId: category.id, slug: subcategorySlug },
    include: { category: true },
  });
  return subcategory;
}

export async function getPublishedProducts({ categoryId, subcategoryId } = {}) {
  const where = { status: 'published' };
  if (categoryId) where.categoryId = categoryId;
  if (subcategoryId) where.subcategoryId = subcategoryId;

  return prisma.product.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    include: {
      category: { select: { id: true, name: true, slug: true } },
      subcategory: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function getProductBySlug(categorySlug, productSlug, subcategorySlug) {
  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return null;

  const where = {
    categoryId: category.id,
    slug: productSlug,
    status: 'published',
  };

  if (subcategorySlug) {
    const sub = await prisma.subcategory.findFirst({
      where: { categoryId: category.id, slug: subcategorySlug },
    });
    if (!sub) return null;
    where.subcategoryId = sub.id;
  }

  return prisma.product.findFirst({
    where,
    include: {
      category: true,
      subcategory: true,
    },
  });
}

export async function getProductById(id) {
  return prisma.product.findFirst({
    where: { id, status: 'published' },
    include: {
      category: true,
      subcategory: true,
    },
  });
}

export async function getPublishedProductsForListing(categorySlug, subcategorySlug) {
  if (subcategorySlug) {
    const sub = await getSubcategoryBySlugs(categorySlug, subcategorySlug);
    if (!sub || !sub.visible || !sub.category.visible) return { category: null, subcategory: null, products: [] };
    const products = await getPublishedProducts({
      categoryId: sub.categoryId,
      subcategoryId: sub.id,
    });
    return { category: sub.category, subcategory: sub, products };
  }

  const category = await getCategoryBySlug(categorySlug);
  if (!category || !category.visible) return { category: null, subcategory: null, products: [] };
  const products = await getPublishedProducts({ categoryId: category.id });
  return { category, subcategory: null, products };
}

export function parseJsonList(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [String(parsed)];
  } catch {
    return String(value)
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
  }
}

export function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

/** Visible regions with visible dealers for the public dealer directory. */
export async function getDealerDirectory() {
  return prisma.dealerRegion.findMany({
    where: { visible: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      dealers: {
        where: { visible: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          address: true,
          country: true,
        },
      },
    },
  });
}
