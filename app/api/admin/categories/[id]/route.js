import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';
import { slugify } from '@/lib/cms';
import { menuLinkPayload } from '@/lib/menuLinks';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  bannerImage: z.string().optional().nullable(),
  visible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  menuLinkType: z.enum(['page', 'product', 'custom', 'section']).optional(),
  menuAnchor: z.string().optional().nullable(),
  menuProductId: z.string().optional().nullable(),
  pageSubtitle: z.string().optional().nullable(),
  pageTitle: z.string().optional().nullable(),
  pageLead: z.string().optional().nullable(),
  introSubtitle: z.string().optional().nullable(),
  introTitle: z.string().optional().nullable(),
  productsSubtitle: z.string().optional().nullable(),
  productsTitle: z.string().optional().nullable(),
  productsLead: z.string().optional().nullable(),
  bannerTheme: z.enum(['yellow', 'black']).optional(),
  introTheme: z.enum(['yellow', 'black']).optional(),
  productsTheme: z.enum(['yellow', 'black']).optional(),
  pageTheme: z.enum(['yellow', 'black']).optional(),
});

export async function GET(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        subcategories: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { products: true } },
      },
    });
    if (!category) return jsonError('Category not found.', 404);
    return jsonOk({ category });
  });
}

export async function PUT(request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError('Invalid category data.', 400);
    const data = parsed.data;

    try {
      const category = await prisma.category.update({
        where: { id },
        data: {
          name: data.name,
          slug: slugify(data.slug || data.name),
          description: data.description || null,
          image: data.image || null,
          bannerImage: data.bannerImage || null,
          visible: data.visible,
          sortOrder: data.sortOrder,
          ...menuLinkPayload(data),
          pageSubtitle: data.pageSubtitle || null,
          pageTitle: data.pageTitle || null,
          pageLead: data.pageLead || null,
          introSubtitle: data.introSubtitle || null,
          introTitle: data.introTitle || null,
          productsSubtitle: data.productsSubtitle || null,
          productsTitle: data.productsTitle || null,
          productsLead: data.productsLead || null,
          bannerTheme: data.bannerTheme || 'black',
          introTheme: data.introTheme || 'black',
          productsTheme: data.productsTheme || data.pageTheme || 'black',
          pageTheme: data.productsTheme || data.pageTheme || 'black',
        },
      });
      return jsonOk({ category });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Category not found.', 404);
      if (e.code === 'P2002') return jsonError('A category with this slug already exists.', 409);
      throw e;
    }
  });
}

export async function DELETE(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    try {
      await prisma.category.delete({ where: { id } });
      return jsonOk({ ok: true });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Category not found.', 404);
      throw e;
    }
  });
}
