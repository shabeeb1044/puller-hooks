import { z } from 'zod';
import { prisma } from '@/lib/db';
import { jsonError, jsonOk, readJson } from '@/lib/api';

const schema = z.object({
  company: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  email: z.string().email().max(200),
  businessType: z.string().max(200).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  postalCode: z.string().max(50).optional().nullable(),
  city: z.string().max(200).optional().nullable(),
  website: z.string().max(300).optional().nullable(),
  interest: z.string().max(500).optional().nullable(),
  message: z.string().max(5000).optional().nullable(),
});

export async function POST(request) {
  const body = await readJson(request);
  // Accept alternate field names from existing forms
  const normalized = {
    company: body?.company || body?.business_name || '',
    name: body?.name || '',
    email: body?.email || '',
    businessType: body?.businessType || body?.business_type || null,
    country: body?.country || null,
    phone: body?.phone || null,
    address: body?.address || body?.store_address || null,
    postalCode: body?.postalCode || body?.postal_code || null,
    city: body?.city || body?.region || null,
    website: body?.website || null,
    interest: body?.interest || null,
    message: body?.message || null,
  };

  const parsed = schema.safeParse(normalized);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Invalid form data.', 400);
  }

  const inquiry = await prisma.dealerInquiry.create({
    data: {
      company: parsed.data.company.trim(),
      name: parsed.data.name.trim(),
      email: parsed.data.email.trim().toLowerCase(),
      businessType: parsed.data.businessType?.trim() || null,
      country: parsed.data.country?.trim() || null,
      phone: parsed.data.phone?.trim() || null,
      address: parsed.data.address?.trim() || null,
      postalCode: parsed.data.postalCode?.trim() || null,
      city: parsed.data.city?.trim() || null,
      website: parsed.data.website?.trim() || null,
      interest: parsed.data.interest?.trim() || null,
      message: parsed.data.message?.trim() || null,
      status: 'new',
    },
  });

  return jsonOk({ ok: true, id: inquiry.id }, { status: 201 });
}
