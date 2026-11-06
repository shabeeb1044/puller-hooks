import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';
import { slugify } from '@/lib/cms';

const schema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: z.string().optional(),
  sortOrder: z.number().int().optional(),
  visible: z.boolean().optional(),
});

export async function GET(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const region = await prisma.dealerRegion.findUnique({
      where: { id },
      include: { _count: { select: { dealers: true } } },
    });
    if (!region) return jsonError('Region not found.', 404);
    return jsonOk({ region });
  });
}

export async function PUT(request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError('Invalid region data.', 400);
    const data = parsed.data;
    const existing = await prisma.dealerRegion.findUnique({ where: { id } });
    if (!existing) return jsonError('Region not found.', 404);

    try {
      const region = await prisma.dealerRegion.update({
        where: { id },
        data: {
          name: data.name?.trim() || existing.name,
          slug: data.slug !== undefined ? slugify(data.slug || data.name || existing.name) : undefined,
          sortOrder: data.sortOrder ?? undefined,
          visible: data.visible ?? undefined,
        },
      });
      return jsonOk({ region });
    } catch (e) {
      if (e.code === 'P2002') return jsonError('A region with this slug already exists.', 409);
      throw e;
    }
  });
}

export async function DELETE(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    try {
      await prisma.dealerRegion.delete({ where: { id } });
      return jsonOk({ ok: true });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Region not found.', 404);
      throw e;
    }
  });
}
