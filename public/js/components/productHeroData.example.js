/**
 * Example props payload for ProductHero + ProductFilterBar.
 * Pass real data in — never hardcode product values inside the components.
 *
 * @type {import('./types.js').ProductHeroProps}
 */
export const flashStriker160DDHero = {
  title: 'FLASH STRIKER',
  category: 'HARD BODY LURES',
  tagline: 'YOUR PERFECT CATCHER',
  imageSrc: '../images/products/flash-striker-160-dd-01.webp',
  imageAlt: 'FLASH STRIKER hard-body fishing lure, dive depth 2m+',
  breadcrumbs: [
    { label: 'Home', href: '../index.html' },
    { label: 'Products', href: '../index.html#products' },
    { label: 'Flash Striker', current: true },
  ],
  stat: { value: '2m+', label: 'Dive depth' },
  specs: ['160 mm', 'Dive depth: 2m+', '38 colour patterns'],
  cta: {
    primaryHref: '../index.html#contact',
    primaryLabel: 'Shop Now',
    secondaryHref: '#product-specs',
    secondaryLabel: 'View Specs',
  },
};

/**
 * @type {import('./types.js').ProductFilterBarProps}
 */
export const flashStriker160DDFilter = {
  searchId: 'productSearch',
  placeholder: 'Search Flash Striker',
  formId: 'catalogSearch',
};
