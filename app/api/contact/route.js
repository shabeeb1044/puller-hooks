import { z } from 'zod';
import { prisma } from '@/lib/db';
import { jsonError, jsonOk, readJson } from '@/lib/api';
import { notifySalesOfSubmission } from '@/lib/mail';
import { appendSubmissionToSheet } from '@/lib/googleSheet';

const schema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  company: z.string().max(200).optional().nullable(),
  topic: z.string().max(200).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  whatsapp: z.string().max(50).optional().nullable(),
  message: z.string().min(1).max(5000),
});

export async function POST(request) {
  const body = await readJson(request);
  const normalized = {
    ...body,
    whatsapp: body?.whatsapp || body?.whatsApp || null,
  };
  const parsed = schema.safeParse(normalized);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid form data.', 400);
  }

  const data = {
    name: parsed.data.name.trim(),
    email: parsed.data.email.trim().toLowerCase(),
    company: parsed.data.company?.trim() || null,
    topic: parsed.data.topic?.trim() || null,
    country: parsed.data.country?.trim() || null,
    phone: parsed.data.phone?.trim() || null,
    whatsapp: parsed.data.whatsapp?.trim() || null,
    message: parsed.data.message.trim(),
  };

  const inquiry = await prisma.contactInquiry.create({
    data: {
      ...data,
      status: 'new',
    },
  });

  const fields = {
    Name: data.name,
    Email: data.email,
    Company: data.company,
    Topic: data.topic,
    Country: data.country,
    Phone: data.phone,
    WhatsApp: data.whatsapp,
    Message: data.message,
    'Inquiry ID': inquiry.id,
  };

  await Promise.all([
    notifySalesOfSubmission({ type: 'contact', replyTo: data.email, fields }),
    appendSubmissionToSheet({ type: 'contact', fields }),
  ]);

  return jsonOk({ ok: true, id: inquiry.id }, { status: 201 });
}
