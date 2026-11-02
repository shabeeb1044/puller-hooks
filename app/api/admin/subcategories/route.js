import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';
import { slugify } from '@/lib/cms';
import { menuLinkPayload } from '@/lib/menuLinks';

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  categoryId: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  bannerImage: z.string().optional().nullable(),
  visible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  menuLinkType: z.enum(['page', 'product', 'custom', 'section']).optional(),
  menuAnchor: z.string().optional().nullable(),
  menuProductId: z.string().optional().nullable(),
  pageTitle: z.string().optional().nullable(),
  pageLead: z.string().optional().nullable(),
});

export async function GET(request) {
  return withAdmin(async () => {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId') || '';
    const where = categoryId ? { categoryId } : {};
    const subcategories = await prisma.subcategory.findMany({
      where,
      orderBy: [{ categoryId: 'asc' }, { sortOrder: 'asc' }],
      include: {
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
    });
    return jsonOk({ subcategories });
  });
}

export async function POST(request) {
  return withAdmin(async () => {
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError('Name and category are required.', 400);
    const data = parsed.data;
    const slug = slugify(data.slug || data.name);
    const maxOrder = await prisma.subcategory.aggregate({
      where: { categoryId: data.categoryId },
      _max: { sortOrder: true },
    });

    try {
      const subcategory = await prisma.subcategory.create({
        data: {
          name: data.name,
          slug,
          categoryId: data.categoryId,
          description: data.description || null,
          image: data.image || null,
          bannerImage: data.bannerImage || null,
          visible: data.visible ?? true,
          sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
          ...menuLinkPayload(data),
          pageTitle: data.pageTitle || null,
          pageLead: data.pageLead || null,
        },
        include: { category: true },
      });
      return jsonOk({ subcategory }, { status: 201 });
    } catch (e) {
      if (e.code === 'P2002') return jsonError('A subcategory with this slug already exists in the category.', 409);
      throw e;
    }
  });
}
