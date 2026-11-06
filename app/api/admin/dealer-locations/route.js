import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';

const schema = z.object({
  name: z.string().min(1).max(200),
  address: z.string().min(1).max(2000),
  country: z.string().max(120).optional().nullable(),
  regionId: z.string().min(1),
  sortOrder: z.number().int().optional(),
  visible: z.boolean().optional(),
});

export async function GET(request) {
  return withAdmin(async () => {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId') || '';
    const q = searchParams.get('q')?.trim() || '';
    const where = {};
    if (regionId) where.regionId = regionId;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { address: { contains: q } },
        { country: { contains: q } },
      ];
    }
    const dealers = await prisma.dealerLocation.findMany({
      where,
      orderBy: [{ region: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      include: { region: { select: { id: true, name: true, slug: true } } },
    });
    return jsonOk({ dealers });
  });
}

export async function POST(request) {
  return withAdmin(async () => {
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.issues[0]?.message || 'Invalid dealer data.', 400);
    const data = parsed.data;

    const region = await prisma.dealerRegion.findUnique({ where: { id: data.regionId } });
    if (!region) return jsonError('Region not found.', 400);

    const maxOrder = await prisma.dealerLocation.aggregate({
      where: { regionId: data.regionId },
      _max: { sortOrder: true },
    });

    const dealer = await prisma.dealerLocation.create({
      data: {
        name: data.name.trim(),
        address: data.address.trim(),
        country: data.country?.trim() || null,
        regionId: data.regionId,
        visible: data.visible ?? true,
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
      },
      include: { region: { select: { id: true, name: true, slug: true } } },
    });
    return jsonOk({ dealer }, { status: 201 });
  });
}
