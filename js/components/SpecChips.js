/**
 * @typedef {import('./types.js').SpecChipsProps} SpecChipsProps
 */

/**
 * Outlined spec pills.
 * @param {SpecChipsProps} props
 * @returns {string}
 */
export function SpecChips({ specs }) {
  const chips = specs
    .map(
      (spec) =>
        `<li class="ph-specs__chip"><span>${escapeHtml(spec)}</span></li>`
    )
    .join('');

  return `<ul class="ph-specs" id="product-specs" aria-label="Product specifications">
    ${chips}
  </ul>`;
}

/** @param {string} value */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
