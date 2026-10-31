import { NextResponse } from 'next/server';
import { requireAdmin } from './auth';

export function jsonOk(data, init = {}) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonError(message, status = 400, extra = {}) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function withAdmin(handler) {
  const user = await requireAdmin();
  if (!user) return jsonError('Unauthorized', 401);
  return handler(user);
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
