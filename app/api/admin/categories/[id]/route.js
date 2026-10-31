import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';
import { slugify } from '@/lib/cms';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
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
    const category = await prisma.category.findUnique({
      where: { id },
      include: { subcategories: { orderBy: { sortOrder: 'asc' } } },
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
          pageTitle: data.pageTitle || null,
          pageLead: data.pageLead || null,
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
