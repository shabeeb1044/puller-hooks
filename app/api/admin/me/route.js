import { requireAdmin } from '@/lib/auth';
import { jsonError, jsonOk } from '@/lib/api';

export async function GET() {
  const user = await requireAdmin();
  if (!user) return jsonError('Unauthorized', 401);
  return jsonOk({ user });
}
