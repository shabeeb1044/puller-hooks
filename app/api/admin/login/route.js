import { z } from 'zod';
import { loginWithCredentials } from '@/lib/auth';
import { jsonError, jsonOk, readJson } from '@/lib/api';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request) {
  const body = await readJson(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Email and password are required.', 400);
  }

  const result = await loginWithCredentials(parsed.data.email, parsed.data.password);
  if (!result.ok) return jsonError(result.error, 401);
  return jsonOk({ user: result.user });
}
