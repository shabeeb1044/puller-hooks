'use client';

import { useEffect, useState } from 'react';
import { normalizeMenuLinkType } from '@/lib/menuLinks';

/**
 * Shared Category / Subcategory Products-menu link controls.
 * Options: own page | choose existing product | custom URL or # section id
 */
export default function MenuLinkFields({
  pageLabel = 'Own page',
  menuLinkType,
  menuAnchor,
  menuProductId,
  onChange,
}) {
  const type = normalizeMenuLinkType(menuLinkType);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    if (type !== 'product') return;
    setLoadingProducts(true);
    fetch('/api/admin/products')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoadingProducts(false));
  }, [type]);

  return (
    <>
      <div className="admin-field">
        <label>Products menu click goes to</label>
        <div className="admin-radio-row" role="radiogroup" aria-label="Menu link target">
          <label className="admin-radio">
            <input
              type="radio"
              name="menuLinkType"
              checked={type === 'page'}
              onChange={() => onChange({ menuLinkType: 'page' })}
            />
            {pageLabel}
          </label>
          <label className="admin-radio">
            <input
              type="radio"
              name="menuLinkType"
              checked={type === 'product'}
              onChange={() => onChange({ menuLinkType: 'product' })}
            />
            Choose existing product
          </label>
          <label className="admin-radio">
            <input
              type="radio"
              name="menuLinkType"
              checked={type === 'custom'}
              onChange={() => onChange({ menuLinkType: 'custom' })}
            />
            Custom URL / section
          </label>
        </div>
        <p className="hint">
          Own page, link to a product already in Products, or type any URL / home section id.
        </p>
      </div>

      {type === 'product' ? (
        <div className="admin-field">
          <label htmlFor="menuProductId">Product</label>
          <select
            id="menuProductId"
            value={menuProductId || ''}
            onChange={(e) => onChange({ menuProductId: e.target.value })}
            required
          >
            <option value="">{loadingProducts ? 'Loading…' : 'Select product'}</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.category?.name ? ` · ${p.category.name}` : ''}
                {p.status === 'draft' ? ' (draft)' : ''}
              </option>
            ))}
          </select>
          <p className="hint">Uses the product page when available (e.g. FLASH STRIKER), otherwise its CTA link.</p>
        </div>
      ) : null}

      {type === 'custom' ? (
        <div className="admin-field">
          <label htmlFor="menuAnchor">URL or section ID</label>
          <input
            id="menuAnchor"
            value={menuAnchor || ''}
            onChange={(e) => onChange({ menuAnchor: e.target.value })}
            placeholder="card-metal  or  /contact  or  https://…"
            required
          />
          <p className="hint">
            Full URL, site path (<code>/contact</code>), <code>#card-metal</code>, or bare id{' '}
            <code>card-metal</code> (auto-links to home section). Menu label stays the category /
            subcategory name above.
          </p>
        </div>
      ) : null}
    </>
  );
}
