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
  pageSubtitle: z.string().optional().nullable(),
  pageTitle: z.string().optional().nullable(),
  pageLead: z.string().optional().nullable(),
  modelsSubtitle: z.string().optional().nullable(),
  modelsTitle: z.string().optional().nullable(),
  modelsLead: z.string().optional().nullable(),
  productsSubtitle: z.string().optional().nullable(),
  productsTitle: z.string().optional().nullable(),
  productsLead: z.string().optional().nullable(),
  bannerTheme: z.enum(['yellow', 'black']).optional(),
  modelsTheme: z.enum(['yellow', 'black']).optional(),
  productsTheme: z.enum(['yellow', 'black']).optional(),
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
      const links = menuLinkPayload(data);
      const { menuProductId, ...linkFields } = links;
      // Use relation connect/disconnect (checked input). Mixing categoryId scalar
      // with relation-style fields trips Prisma XOR validation and 500s with an empty body.
      const subcategory = await prisma.subcategory.update({
        where: { id },
        data: {
          name: data.name,
          slug: slugify(data.slug || data.name),
          category: { connect: { id: data.categoryId } },
          description: data.description || data.modelsLead || null,
          image: data.image || null,
          bannerImage: data.bannerImage || null,
          visible: data.visible,
          sortOrder: data.sortOrder,
          ...linkFields,
          menuProduct: menuProductId
            ? { connect: { id: menuProductId } }
            : { disconnect: true },
          pageSubtitle: data.pageSubtitle || null,
          pageTitle: data.pageTitle || null,
          pageLead: data.pageLead || null,
          modelsSubtitle: data.modelsSubtitle || null,
          modelsTitle: data.modelsTitle || null,
          modelsLead: data.modelsLead || data.description || null,
          productsSubtitle: data.productsSubtitle || null,
          productsTitle: data.productsTitle || null,
          productsLead: data.productsLead || null,
          bannerTheme: data.bannerTheme || 'black',
          modelsTheme: data.modelsTheme || 'black',
          productsTheme: data.productsTheme || 'black',
        },
        include: { category: true },
      });
      return jsonOk({ subcategory });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Subcategory not found.', 404);
      if (e.code === 'P2002') return jsonError('A subcategory with this slug already exists in the category.', 409);
      console.error('[admin/subcategories PUT]', e);
      return jsonError(e.message || 'Failed to update subcategory.', 500);
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
