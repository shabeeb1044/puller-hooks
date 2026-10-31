/**
 * @typedef {import('./types.js').CTAButtonsProps} CTAButtonsProps
 */

/**
 * Primary + secondary CTA row.
 * @param {CTAButtonsProps} props
 * @returns {string}
 */
export function CTAButtons({
  primaryHref,
  primaryLabel = 'Shop Now',
  secondaryHref,
  secondaryLabel = 'View Specs',
}) {
  return `<div class="ph-cta">
    <a class="ph-btn ph-btn--primary" href="${escapeAttr(primaryHref)}">${escapeHtml(primaryLabel)}</a>
    <a class="ph-btn ph-btn--secondary" href="${escapeAttr(secondaryHref)}">${escapeHtml(secondaryLabel)}</a>
  </div>`;
}

/** @param {string} value */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** @param {string} value */
function escapeAttr(value) {
  return escapeHtml(value).replace(/'/g, '&#39;');
}
