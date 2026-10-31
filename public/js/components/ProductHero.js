import { Breadcrumb } from './Breadcrumb.js';
import { StatBadge } from './StatBadge.js';
import { SpecChips } from './SpecChips.js';
import { CTAButtons } from './CTAButtons.js';

/**
 * @typedef {import('./types.js').ProductHeroProps} ProductHeroProps
 */

/**
 * Product page hero: copy column + floating product image.
 * All product data is passed in as props — nothing is hardcoded here.
 * @param {ProductHeroProps} props
 * @returns {string}
 */
export function ProductHero({
  title,
  category,
  tagline,
  imageSrc,
  imageAlt,
  breadcrumbs,
  stat,
  specs,
  cta,
}) {
  return `<section class="product-hero" aria-labelledby="product-hero-title">
    <div class="product-hero__container">
      <div class="product-hero__media">
        <div class="product-hero__glow" aria-hidden="true"></div>
        <img
          class="product-hero__image"
          src="${escapeAttr(imageSrc)}"
          alt="${escapeAttr(imageAlt)}"
          width="1680"
          height="524"
          decoding="async"
          fetchpriority="high"
        />
      </div>
      <div class="product-hero__copy">
        <div class="product-hero__reveal" style="--ph-delay: 0ms">${Breadcrumb({ items: breadcrumbs })}</div>
        <p class="product-hero__category product-hero__reveal" style="--ph-delay: 100ms">${escapeHtml(category)}</p>
        <h1 id="product-hero-title" class="product-hero__title product-hero__reveal" style="--ph-delay: 200ms">${escapeHtml(title)}</h1>
        <div class="product-hero__reveal" style="--ph-delay: 300ms">${StatBadge(stat)}</div>
        <p class="product-hero__tagline product-hero__reveal" style="--ph-delay: 400ms">${escapeHtml(tagline)}</p>
        <div class="product-hero__reveal" style="--ph-delay: 500ms">${SpecChips({ specs })}</div>
        <div class="product-hero__reveal" style="--ph-delay: 600ms">${CTAButtons(cta)}</div>
      </div>
    </div>
  </section>`;
}

/**
 * Mount ProductHero into a DOM node and kick off entrance animation.
 * @param {HTMLElement | null} root
 * @param {ProductHeroProps} props
 */
export function mountProductHero(root, props) {
  if (!root) return;
  root.innerHTML = ProductHero(props);
  requestAnimationFrame(() => {
    root.querySelector('.product-hero')?.classList.add('is-ready');
  });
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
