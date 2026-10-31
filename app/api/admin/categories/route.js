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

export async function GET() {
  return withAdmin(async () => {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true, subcategories: true } },
      },
    });
    return jsonOk({ categories });
  });
}

export async function POST(request) {
  return withAdmin(async () => {
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError('Name is required.', 400);
    const data = parsed.data;
    const slug = slugify(data.slug || data.name);
    const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });

    try {
      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug,
          description: data.description || null,
          image: data.image || null,
          bannerImage: data.bannerImage || null,
          visible: data.visible ?? true,
          sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
          pageTitle: data.pageTitle || null,
          pageLead: data.pageLead || null,
        },
      });
      return jsonOk({ category }, { status: 201 });
    } catch (e) {
      if (e.code === 'P2002') return jsonError('A category with this slug already exists.', 409);
      throw e;
    }
  });
}
