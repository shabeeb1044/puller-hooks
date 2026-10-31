import { z } from 'zod';
import { prisma } from '@/lib/db';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';

const patchSchema = z.object({
  status: z.enum(['new', 'in_progress', 'completed']),
});

export async function GET(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const inquiry = await prisma.contactInquiry.findUnique({ where: { id } });
    if (!inquiry) return jsonError('Inquiry not found.', 404);
    return jsonOk({ inquiry });
  });
}

export async function PATCH(request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    const body = await readJson(request);
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) return jsonError('Invalid status.', 400);
    try {
      const inquiry = await prisma.contactInquiry.update({
        where: { id },
        data: { status: parsed.data.status },
      });
      return jsonOk({ inquiry });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Inquiry not found.', 404);
      throw e;
    }
  });
}

export async function DELETE(_request, { params }) {
  return withAdmin(async () => {
    const { id } = await params;
    try {
      await prisma.contactInquiry.delete({ where: { id } });
      return jsonOk({ ok: true });
    } catch (e) {
      if (e.code === 'P2025') return jsonError('Inquiry not found.', 404);
      throw e;
    }
  });
}
