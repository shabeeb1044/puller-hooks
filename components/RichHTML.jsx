import DOMPurify from 'isomorphic-dompurify';

/** Brand text colors allowed from the CMS rich editor. */
const ALLOWED_COLORS = new Set([
  '#f7ed22',
  '#ffffff',
  '#fff',
  '#111111',
  '#111',
  '#000000',
  '#000',
  '#d81e37',
]);

/** True when CMS HTML is empty or only empty tags (e.g. `<p></p>`). */
export function isBlankRichText(value) {
  if (value == null) return true;
  const text = String(value)
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return !text;
}

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  'a',
  'ul',
  'ol',
  'li',
  'h2',
  'h3',
  'blockquote',
  'span',
];

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class', 'style'];

function looksLikeHtml(value) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Plain CMS text → paragraphs; preserve blank-line breaks. */
function plainTextToHtml(value) {
  const normalized = value.replace(/\r\n/g, '\n').trim();
  if (!normalized) return '';
  return normalized
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

/** Strip a single outer <p>…</p> so HTML can sit inside headings. */
function unwrapSingleParagraph(html) {
  const trimmed = html.trim();
  const match = trimmed.match(/^<p(?:\s[^>]*)?>([\s\S]*)<\/p>$/i);
  if (!match) return html;
  if (/<\/?p[\s>]/i.test(match[1])) return html;
  return match[1];
}

function prepareHtml(html) {
  return String(html)
    .replace(/<p(?:\s[^>]*)?>\s*(?:<br\s*\/?>|\u00a0|&nbsp;|\s)*<\/p>/gi, '')
    .trim();
}

function normalizeColor(value) {
  const v = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '');
  if (v === 'yellow') return '#f7ed22';
  if (v === 'white') return '#ffffff';
  if (v === 'black') return '#111111';
  if (v === 'red') return '#d81e37';

  // TipTap/DOM often serializes hex as rgb(r, g, b) — map back to hex.
  const rgb = v.match(/^rgba?\((\d+),(\d+),(\d+)(?:,[\d.]+)?\)$/);
  if (rgb) {
    return `#${[rgb[1], rgb[2], rgb[3]]
      .map((n) => Number(n).toString(16).padStart(2, '0'))
      .join('')}`;
  }
  return v;
}

function sanitizeColorStyles(html) {
  return String(html).replace(/\sstyle="([^"]*)"/gi, (full, styleValue) => {
    const colorMatch = String(styleValue).match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
    if (!colorMatch) return '';
    const color = normalizeColor(colorMatch[1]);
    if (!ALLOWED_COLORS.has(color)) return '';
    return ` style="color: ${color}"`;
  });
}

/**
 * Sanitize and render CMS HTML. Plain-text values are wrapped in <p> tags.
 * Use `inline` for heading fields so a wrapping <p> is not nested in <h1>/<h2>.
 */
export default function RichHTML({ html, className, as: Tag = 'div', inline = false, id }) {
  const raw = html == null ? '' : String(html);
  if (!raw.trim()) return null;

  let prepared = looksLikeHtml(raw) ? raw : plainTextToHtml(raw);
  prepared = prepareHtml(prepared);
  if (inline) prepared = unwrapSingleParagraph(prepared);

  const clean = sanitizeColorStyles(
    DOMPurify.sanitize(prepared, {
      ALLOWED_TAGS,
      ALLOWED_ATTR,
    })
  );

  if (!clean || clean === '<p></p>' || isBlankRichText(clean)) return null;

  return <Tag id={id} className={className} dangerouslySetInnerHTML={{ __html: clean }} />;
}
