import { z } from 'zod';
import { prisma } from '@/lib/db';
import { jsonError, jsonOk, readJson } from '@/lib/api';

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  company: z.string().min(1).max(200),
  topic: z.string().max(200).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  message: z.string().min(1).max(5000),
});

export async function POST(request) {
  const body = await readJson(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid form data.', 400);
  }

  const inquiry = await prisma.contactInquiry.create({
    data: {
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      company: parsed.data.company.trim(),
      topic: parsed.data.topic?.trim() || null,
      country: parsed.data.country?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      message: parsed.data.message.trim(),
      status: 'new',
    },
  });

  return jsonOk({ ok: true, id: inquiry.id }, { status: 201 });
}
