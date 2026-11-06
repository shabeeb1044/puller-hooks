import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';
import { slugify } from '@/lib/cms';

const schema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().optional(),
  sortOrder: z.number().int().optional(),
  visible: z.boolean().optional(),
});

export async function GET() {
  return withAdmin(async () => {
    const regions = await prisma.dealerRegion.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { dealers: true } } },
    });
    return jsonOk({ regions });
  });
}

export async function POST(request) {
  return withAdmin(async () => {
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError('Region name is required.', 400);
    const data = parsed.data;
    const slug = slugify(data.slug || data.name);
    if (!slug) return jsonError('Region name is required.', 400);
    const maxOrder = await prisma.dealerRegion.aggregate({ _max: { sortOrder: true } });

    try {
      const region = await prisma.dealerRegion.create({
        data: {
          name: data.name.trim(),
          slug,
          visible: data.visible ?? true,
          sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? -1) + 1,
        },
      });
      return jsonOk({ region }, { status: 201 });
    } catch (e) {
      if (e.code === 'P2002') return jsonError('A region with this slug already exists.', 409);
      throw e;
    }
  });
}
