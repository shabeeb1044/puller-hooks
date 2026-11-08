import { z } from 'zod';
import { withAdmin, jsonOk, jsonError, readJson } from '@/lib/api';
import { getSocialLinks, setSocialLinks } from '@/lib/socialLinksStore';

const schema = z.object({
  whatsapp: z.string().max(40).optional().nullable(),
  facebook: z.string().max(500).optional().nullable(),
  instagram: z.string().max(500).optional().nullable(),
  youtube: z.string().max(500).optional().nullable(),
});

export async function GET() {
  return withAdmin(async () => {
    const socialLinks = await getSocialLinks();
    return jsonOk({ socialLinks });
  });
}

export async function PUT(request) {
  return withAdmin(async () => {
    const body = await readJson(request);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError('Invalid social link values.', 400);
    }
    const socialLinks = await setSocialLinks(parsed.data);
    return jsonOk({ socialLinks });
  });
}
