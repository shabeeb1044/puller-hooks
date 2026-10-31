import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';

const schema = z.object({ ids: z.array(z.string().min(1)).min(1) });

export async function PUT(request) {
  return withAdmin(async () => {
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError('ids array is required.', 400);
    await prisma.$transaction(
      parsed.data.ids.map((id, index) =>
        prisma.category.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    return jsonOk({ ok: true });
  });
}
