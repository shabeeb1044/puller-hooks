import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';
import { slugify } from '@/lib/cms';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  categoryId: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  bannerImage: z.string().optional().nullable(),
  visible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  pageTitle: z.string().optional().nullable(),
  pageLead: z.string().optional().nullable(),
});

export async function GET(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const subcategory = await prisma.subcategory.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!subcategory) return jsonError('Subcategory not found.', 404);
    return jsonOk({ subcategory });
  });
}

export async function PUT(request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError('Invalid subcategory data.', 400);
    const data = parsed.data;

    try {
      const subcategory = await prisma.subcategory.update({
        where: { id },
        data: {
          name: data.name,
          slug: slugify(data.slug || data.name),
          categoryId: data.categoryId,
          description: data.description || null,
          image: data.image || null,
          bannerImage: data.bannerImage || null,
          visible: data.visible,
          sortOrder: data.sortOrder,
          pageTitle: data.pageTitle || null,
          pageLead: data.pageLead || null,
        },
        include: { category: true },
      });
      return jsonOk({ subcategory });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Subcategory not found.', 404);
      if (e.code === 'P2002') return jsonError('A subcategory with this slug already exists in the category.', 409);
      throw e;
    }
  });
}

export async function DELETE(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    try {
      await prisma.subcategory.delete({ where: { id } });
      return jsonOk({ ok: true });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Subcategory not found.', 404);
      throw e;
    }
  });
}
