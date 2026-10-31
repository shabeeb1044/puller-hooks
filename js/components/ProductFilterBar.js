/**
 * @typedef {import('./types.js').ProductFilterBarProps} ProductFilterBarProps
 */

/**
 * Sticky search bar (lives below the hero).
 * @param {ProductFilterBarProps} props
 * @returns {string}
 */
export function ProductFilterBar({
  searchId,
  placeholder,
  formId = 'catalogSearch',
}) {
  return `<div class="product-filter-bar" id="product-filter-bar">
    <div class="product-filter-bar__inner">
      <form class="product-filter-bar__form" id="${escapeAttr(formId)}" role="search">
        <label class="visually-hidden" for="${escapeAttr(searchId)}">Search products</label>
        <input
          id="${escapeAttr(searchId)}"
          class="product-filter-bar__input"
          type="search"
          name="q"
          placeholder="${escapeAttr(placeholder)}"
          autocomplete="off"
          enterkeyhint="search"
        />
      </form>
    </div>
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
