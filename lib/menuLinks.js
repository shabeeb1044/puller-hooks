/** Shared Products-menu link helpers (safe for client + server). */

export function normalizeMenuLinkType(type) {
  if (type === 'product') return 'product';
  if (type === 'custom' || type === 'section') return 'custom';
  return 'page';
}

/** True when href should not navigate (dropdown / label only). */
export function isMenuHrefPlaceholder(href) {
  const v = String(href || '').trim();
  // Bare "#", empty, or "/#" — label only, never a real destination
  return !v || v === '#' || v === '/#';
}

/** Custom field: full URL, site path, #id, or bare section id → usable href. */
export function resolveCustomHref(value, pathname = '/') {
  const v = String(value || '').trim();
  // Empty or bare "#" → no navigation (parent menus / coming-soon items)
  if (!v || v === '#') return '#';
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('/')) return v;
  const id = v.startsWith('#') ? v.slice(1).trim() : v;
  if (!id) return '#';
  return pathname === '/' ? `#${id}` : `/#${id}`;
}

export function productPublicHref(product) {
  if (!product) return '/#products';
  const cat = product.category?.slug;
  const sub = product.subcategory?.slug;
  if (cat === 'hard-body-lures' || sub === 'flash-striker') {
    return `/products/flash-striker/${product.slug}`;
  }
  if (product.ctaHref) return product.ctaHref;
  if (cat) return `/products/${cat}`;
  return '/#products';
}

export function categoryPageHref(category) {
  if (category?.slug === 'hard-body-lures') {
    const flash = category.subcategories?.find((s) => s.slug === 'flash-striker');
    if (flash) return '/products/flash-striker';
  }
  return `/products/${category.slug}`;
}

export function subcategoryPageHref(category, subcategory) {
  if (category?.slug === 'hard-body-lures' && subcategory?.slug === 'flash-striker') {
    return '/products/flash-striker';
  }
  return `/products/${category.slug}/${subcategory.slug}`;
}

/**
 * Resolve nav href for a category or subcategory menu row.
 * @param {object} item - category or subcategory with menu* fields
 * @param {object} opts
 * @param {string} opts.pathname
 * @param {string} opts.pageHref - fallback own-page URL
 */
export function resolveMenuHref(item, { pathname = '/', pageHref } = {}) {
  const type = normalizeMenuLinkType(item?.menuLinkType);
  if (type === 'product' && item?.menuProduct) {
    return productPublicHref(item.menuProduct);
  }
  if (type === 'custom') {
    return resolveCustomHref(item?.menuAnchor, pathname);
  }
  return pageHref || '/#products';
}

/**
 * Home product-grid card href — same rules as header menu.
 * Custom "#" / empty → "#". Custom "card-jigs" → "#card-jigs". Real URL → that URL.
 * Categories without a public product page (metal-lures, jigs) never fall back to /products/{slug}.
 */
export function resolveHomeProductCardHref(category, pathname = '/') {
  const slug = category?.slug || '';
  const defaults = {
    'hard-body-lures': '/products/flash-striker',
    hooks: '/products/hooks',
    'metal-lures': '#',
    jigs: '#',
  };
  const pageHref = defaults[slug] ?? (slug ? `/products/${slug}` : '#');
  const href = resolveMenuHref(category, { pathname, pageHref });
  if (isMenuHrefPlaceholder(href)) return pageHref;
  return href;
}

/** Persist helper — clean fields by type. */
export function menuLinkPayload({ menuLinkType, menuAnchor, menuProductId }) {
  const type = normalizeMenuLinkType(menuLinkType);
  if (type === 'product') {
    return {
      menuLinkType: 'product',
      menuProductId: menuProductId || null,
      menuAnchor: null,
    };
  }
  if (type === 'custom') {
    const raw = String(menuAnchor || '').trim();
    return {
      menuLinkType: 'custom',
      menuAnchor: raw || null,
      menuProductId: null,
    };
  }
  return {
    menuLinkType: 'page',
    menuAnchor: null,
    menuProductId: null,
  };
}
