import { z } from 'zod';
import { prisma } from '@/lib/db';
import { hashPassword, requireAdmin, verifyPassword } from '@/lib/auth';
import { jsonError, jsonOk, readJson } from '@/lib/api';

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(request) {
  const user = await requireAdmin();
  if (!user) return jsonError('Unauthorized', 401);

  const body = await readJson(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Current password and a new password (8+ chars) are required.', 400);
  }

  const dbUser = await prisma.adminUser.findUnique({ where: { id: user.id } });
  if (!dbUser) return jsonError('User not found.', 404);

  const ok = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash);
  if (!ok) return jsonError('Current password is incorrect.', 400);

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return jsonOk({ ok: true });
}
