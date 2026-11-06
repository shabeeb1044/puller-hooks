import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';

const schema = z.object({
  name: z.string().min(1).max(200).optional(),
  address: z.string().min(1).max(2000).optional(),
  country: z.string().max(120).optional().nullable(),
  regionId: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
  visible: z.boolean().optional(),
});

export async function GET(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const dealer = await prisma.dealerLocation.findUnique({
      where: { id },
      include: { region: { select: { id: true, name: true, slug: true } } },
    });
    if (!dealer) return jsonError('Dealer not found.', 404);
    return jsonOk({ dealer });
  });
}

export async function PUT(request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError('Invalid dealer data.', 400);
    const data = parsed.data;

    const existing = await prisma.dealerLocation.findUnique({ where: { id } });
    if (!existing) return jsonError('Dealer not found.', 404);

    if (data.regionId) {
      const region = await prisma.dealerRegion.findUnique({ where: { id: data.regionId } });
      if (!region) return jsonError('Region not found.', 400);
    }

    const dealer = await prisma.dealerLocation.update({
      where: { id },
      data: {
        name: data.name?.trim() || undefined,
        address: data.address?.trim() || undefined,
        country: data.country !== undefined ? data.country?.trim() || null : undefined,
        regionId: data.regionId || undefined,
        sortOrder: data.sortOrder ?? undefined,
        visible: data.visible ?? undefined,
      },
      include: { region: { select: { id: true, name: true, slug: true } } },
    });
    return jsonOk({ dealer });
  });
}

export async function DELETE(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    try {
      await prisma.dealerLocation.delete({ where: { id } });
      return jsonOk({ ok: true });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Dealer not found.', 404);
      throw e;
    }
  });
}
