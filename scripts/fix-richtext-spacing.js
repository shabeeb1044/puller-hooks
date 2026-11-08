/**
 * Replace old br-based CMS copy with tight paragraph HTML (minimal Enter gaps).
 * Run: node --env-file=.env scripts/fix-richtext-spacing.js
 */
const { PrismaClient } = require('@prisma/client');

function tidyRichHtml(html) {
  let out = String(html || '');
  out = out.replace(/(?:<br\s*\/?>\s*){2,}/gi, '<br>');
  out = out.replace(/<p(?:\s[^>]*)?>\s*-{3,}\s*<\/p>/gi, '');
  out = out.replace(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi, (match, inner) => {
    if (!/<br\s*\/?>/i.test(inner)) return match;
    const parts = String(inner)
      .split(/<br\s*\/?>/i)
      .map((part) => part.trim())
      .filter((part) => part.replace(/&nbsp;/gi, '').trim().length > 0);
    if (parts.length <= 1) return match;
    return parts.map((part) => `<p>${part}</p>`).join('');
  });
  // Plain text with literal <br/> (old CMS style)
  if (!/^</.test(out.trim()) && /<br\s*\/?>/i.test(out)) {
    const parts = out
      .split(/<br\s*\/?>/i)
      .map((part) => part.trim())
      .filter(Boolean);
    out = parts.map((part) => `<p>${part}</p>`).join('');
  }
  out = out.replace(
    /<\/(p|h[23]|li|blockquote)>\s*(?:<p(?:\s[^>]*)?>\s*(?:<br\s*\/?>|&nbsp;|\u00a0|\s)*<\/p>\s*)+(?=<(?:p|h[23]|ul|ol|blockquote)\b)/gi,
    '</$1>'
  );
  out = out.replace(/<(h[23])(?:\s[^>]*)?>\s*(?:<br\s*\/?>|&nbsp;|\u00a0|\s)*<\/\1>/gi, '');
  out = out.replace(/(?:<p(?:\s[^>]*)?>\s*(?:<br\s*\/?>|&nbsp;|\u00a0|\s)*<\/p>\s*){2,}$/i, '<p></p>');
  return out.trim();
}

/** Promote known title lines to <h2> after split. */
function promoteTitles(html) {
  return String(html || '').replace(/<p>(FLASH STRIKER Series)<\/p>/gi, '<h2>$1</h2>');
}

const FIELDS = [
  'pageTitle',
  'pageLead',
  'modelsTitle',
  'modelsLead',
  'productsTitle',
  'productsLead',
  'description',
  'introTitle',
];

async function fixModel(prisma, model, label) {
  const rows = await prisma[model].findMany();
  let changed = 0;
  for (const row of rows) {
    const data = {};
    for (const field of FIELDS) {
      if (!(field in row) || row[field] == null || row[field] === '') continue;
      let next = tidyRichHtml(row[field]);
      if (field === 'pageLead' || field === 'description' || field.endsWith('Lead')) {
        next = promoteTitles(next);
      }
      if (next !== row[field]) data[field] = next;
    }
    if (Object.keys(data).length === 0) continue;
    await prisma[model].update({ where: { id: row.id }, data });
    changed += 1;
    console.log(`[${label}] updated ${row.slug || row.name || row.id}`, Object.keys(data));
  }
  console.log(`[${label}] ${changed}/${rows.length} rows updated`);
}

async function main() {
  const prisma = new PrismaClient();
  try {
    await fixModel(prisma, 'subcategory', 'subcategory');
    await fixModel(prisma, 'category', 'category');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
