import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';
import { slugify } from '@/lib/cms';

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  specifications: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  features: z.union([z.string(), z.array(z.string())]).optional().nullable(),
  image: z.string().optional().nullable(),
  imageAlt: z.string().optional().nullable(),
  imageHeight: z.number().int().optional().nullable(),
  status: z.enum(['published', 'draft']).default('draft'),
  layout: z.enum(['horizontal', 'vertical']).default('horizontal'),
  sortOrder: z.number().int().optional(),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  searchTerms: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  subcategoryId: z.string().optional().nullable(),
});

function toJsonList(value) {
  if (value == null || value === '') return null;
  if (Array.isArray(value)) return JSON.stringify(value.filter(Boolean));
  if (typeof value === 'string') {
    const lines = value.split('\n').map((s) => s.trim()).filter(Boolean);
    return JSON.stringify(lines);
  }
  return JSON.stringify([String(value)]);
}

export async function GET(request) {
  return withAdmin(async () => {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim() || '';
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const subcategoryId = searchParams.get('subcategoryId') || '';

    const where = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { slug: { contains: q } },
        { searchTerms: { contains: q } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
    });
    return jsonOk({ products });
  });
}

export async function POST(request) {
  return withAdmin(async () => {
    const body = await readJson(request);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || 'Invalid product data.', 400);
    }

    const data = parsed.data;
    const slug = slugify(data.slug || data.name);
    if (!slug) return jsonError('Valid slug is required.', 400);

    const maxOrder = await prisma.product.aggregate({
      where: { categoryId: data.categoryId, subcategoryId: data.subcategoryId || null },
      _max: { sortOrder: true },
    });

    try {
      const product = await prisma.product.create({
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          specifications: toJsonList(data.specifications),
          features: toJsonList(data.features),
          image: data.image || null,
          imageAlt: data.imageAlt || null,
          imageHeight: data.imageHeight ?? null,
          status: data.status,
          layout: data.layout,
          sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
          ctaLabel: data.ctaLabel || 'Inquiry now',
          ctaHref: data.ctaHref || '/dealers#apply',
          searchTerms: data.searchTerms || `${data.name} ${slug}`.toLowerCase(),
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId || null,
        },
        include: {
          category: true,
          subcategory: true,
        },
      });
      return jsonOk({ product }, { status: 201 });
    } catch (e) {
      if (e.code === 'P2002') return jsonError('A product with this slug already exists in the category.', 409);
      throw e;
    }
  });
}
