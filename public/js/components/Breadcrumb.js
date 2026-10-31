/**
 * @typedef {import('./types.js').BreadcrumbProps} BreadcrumbProps
 */

/**
 * Accessible breadcrumb: Home / Products / Current
 * @param {BreadcrumbProps} props
 * @returns {string}
 */
export function Breadcrumb({ items }) {
  const listItems = items
    .map((item, index) => {
      const isLast = index === items.length - 1 || item.current;
      if (isLast || !item.href) {
        return `<li class="ph-breadcrumb__item ph-breadcrumb__item--current">
          <span aria-current="page">${escapeHtml(item.label)}</span>
        </li>`;
      }
      return `<li class="ph-breadcrumb__item">
        <a href="${escapeAttr(item.href)}">${escapeHtml(item.label)}</a>
      </li>`;
    })
    .join('');

  return `<nav class="ph-breadcrumb" aria-label="Breadcrumb">
    <ol class="ph-breadcrumb__list">${listItems}</ol>
  </nav>`;
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
