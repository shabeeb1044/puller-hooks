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
      return jsonOk({ category }, { status: 201 });
    } catch (e) {
      if (e.code === 'P2002') return jsonError('A category with this slug already exists.', 409);
      throw e;
    }
  });
}
