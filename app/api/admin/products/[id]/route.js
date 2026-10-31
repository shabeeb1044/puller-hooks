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
  status: z.enum(['published', 'draft']),
  layout: z.enum(['horizontal', 'vertical']),
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

export async function GET(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, subcategory: true },
    });
    if (!product) return jsonError('Product not found.', 404);
    return jsonOk({ product });
  });
}

export async function PUT(request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await readJson(request);
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.issues[0]?.message || 'Invalid product data.', 400);
    }
    const data = parsed.data;
    const slug = slugify(data.slug || data.name);

    try {
      const product = await prisma.product.update({
        where: { id },
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
          sortOrder: data.sortOrder,
          ctaLabel: data.ctaLabel || 'Inquiry now',
          ctaHref: data.ctaHref || '/dealers#apply',
          searchTerms: data.searchTerms || null,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId || null,
        },
        include: { category: true, subcategory: true },
      });
      return jsonOk({ product });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Product not found.', 404);
      if (e.code === 'P2002') return jsonError('A product with this slug already exists in the category.', 409);
      throw e;
    }
  });
}

export async function DELETE(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    try {
      await prisma.product.delete({ where: { id } });
      return jsonOk({ ok: true });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Product not found.', 404);
      throw e;
    }
  });
}
