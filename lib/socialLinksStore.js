import { prisma } from '@/lib/db';
import {
  DEFAULT_SOCIAL_LINKS,
  SOCIAL_LINKS_KEY,
  normalizeSocialLinks,
} from '@/lib/socialLinks';

export async function getSocialLinks() {
  try {
    const row = await prisma.setting.findUnique({ where: { key: SOCIAL_LINKS_KEY } });
    if (!row?.value) return { ...DEFAULT_SOCIAL_LINKS };
    const parsed = JSON.parse(row.value);
    return normalizeSocialLinks(parsed);
  } catch {
    return { ...DEFAULT_SOCIAL_LINKS };
  }
}

export async function setSocialLinks(input) {
  const links = normalizeSocialLinks(input);
  await prisma.setting.upsert({
    where: { key: SOCIAL_LINKS_KEY },
    create: { key: SOCIAL_LINKS_KEY, value: JSON.stringify(links) },
    update: { value: JSON.stringify(links) },
  });
  return links;
}
