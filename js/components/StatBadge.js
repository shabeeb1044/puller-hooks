/**
 * @typedef {import('./types.js').StatBadgeProps} StatBadgeProps
 */

/**
 * Large accent numeral with a short caption.
 * @param {StatBadgeProps} props
 * @returns {string}
 */
export function StatBadge({ value, label }) {
  return `<div class="ph-stat" role="group" aria-label="${escapeAttr(value)} ${escapeAttr(label)}">
    <p class="ph-stat__value">${escapeHtml(value)}</p>
    <p class="ph-stat__label">${escapeHtml(label)}</p>
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
