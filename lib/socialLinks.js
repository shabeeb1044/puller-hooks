export const SOCIAL_LINKS_KEY = 'social_links';

export const DEFAULT_SOCIAL_LINKS = {
  whatsapp: '919539470261',
  facebook: 'https://facebook.com',
  instagram: 'https://instagram.com',
  youtube: 'https://youtube.com',
};

const WHATSAPP_MESSAGE =
  'Hello PULLER, I would like to inquire about your fishing tackle.';

/** Digits only for wa.me; accepts full URLs or raw numbers. */
export function normalizeWhatsAppNumber(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const fromUrl = raw.match(/(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/?(\d+)/i);
  if (fromUrl) return fromUrl[1];
  return raw.replace(/\D/g, '');
}

export function buildWhatsAppUrl(whatsapp, { withMessage = true } = {}) {
  const number = normalizeWhatsAppNumber(whatsapp);
  if (!number) return 'https://wa.me/';
  if (!withMessage) return `https://wa.me/${number}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

function normalizeUrl(value, fallback = '') {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function normalizeSocialLinks(input = {}) {
  const whatsapp =
    normalizeWhatsAppNumber(input.whatsapp) || DEFAULT_SOCIAL_LINKS.whatsapp;

  return {
    whatsapp,
    facebook: normalizeUrl(input.facebook, DEFAULT_SOCIAL_LINKS.facebook),
    instagram: normalizeUrl(input.instagram, DEFAULT_SOCIAL_LINKS.instagram),
    youtube: normalizeUrl(input.youtube, DEFAULT_SOCIAL_LINKS.youtube),
  };
}
