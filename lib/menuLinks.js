/** Shared Products-menu link helpers (safe for client + server). */

export function normalizeMenuLinkType(type) {
  if (type === 'product') return 'product';
  if (type === 'custom' || type === 'section') return 'custom';
  return 'page';
}

/** Custom field: full URL, site path, #id, or bare section id → usable href. */
export function resolveCustomHref(value, pathname = '/') {
  const v = String(value || '').trim();
  if (!v) return pathname === '/' ? '#products' : '/#products';
  if (/^https?:\/\//i.test(v)) return v;
  if (v.startsWith('/')) return v;
  const id = v.startsWith('#') ? v.slice(1).trim() : v;
  if (!id) return pathname === '/' ? '#products' : '/#products';
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
  if (type === 'custom' && item?.menuAnchor) {
    return resolveCustomHref(item.menuAnchor, pathname);
  }
  return pageHref || '/#products';
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
