'use client';

import { useMemo, useState } from 'react';

export default function ProductCatalog({
  products,
  searchPlaceholder = 'Search products',
  showSearch = true,
  yellow = false,
  eyebrow = null,
  title = null,
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!showSearch) return products;
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const hay = `${p.name} ${p.slug} ${p.searchTerms || ''} ${p.description || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, query, showSearch]);

  const horizontal = filtered.filter((p) => p.layout !== 'vertical');
  const vertical = filtered.filter((p) => p.layout === 'vertical');

  return (
    <>
      {showSearch ? (
        <div className="product-filter-bar" id="product-filter-bar">
          <div className="product-filter-bar__inner">
            <form
              className="product-filter-bar__form"
              id="catalogSearch"
              role="search"
              onSubmit={(e) => e.preventDefault()}
            >
              <label className="visually-hidden" htmlFor="productSearch">
                Search products
              </label>
              <input
                id="productSearch"
                className="product-filter-bar__input"
                type="search"
                name="q"
                placeholder={searchPlaceholder}
                autoComplete="off"
                enterKeyHint="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          </div>
        </div>
      ) : null}

      <section
        className={`catalog${yellow ? ' catalog--yellow' : ''}`}
        id="catalog"
        aria-labelledby={title ? 'catalog-title' : undefined}
        aria-label={title ? undefined : 'Product listing'}
      >
        <div className="container">
          {(eyebrow || title) && (
            <header className="range-head reveal">
              {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
              {title ? (
                <h2 id="catalog-title" className="section-title">
                  {title}
                </h2>
              ) : null}
            </header>
          )}
          {horizontal.length > 0 ? (
            <div className="catalog-grid" id="catalogGrid">
              {horizontal.map((product) => (
                <a
                  key={product.id}
                  className="catalog-card"
                  href={product.ctaHref || '/dealers#apply'}
                  data-search={product.searchTerms || product.name}
                >
                  <span className="catalog-media">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.imageAlt || product.name}
                        width="1680"
                        height={product.imageHeight || 526}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : null}
                  </span>
                  <span className="catalog-info">
                    <span className="catalog-name">{product.name}</span>
                    <span className="catalog-btn">
                      {product.ctaLabel || 'Inquiry now'}{' '}
                      <svg aria-hidden="true">
                        <use href="#i-arrow" />
                      </svg>
                    </span>
                  </span>
                </a>
              ))}
            </div>
          ) : null}

          {vertical.length > 0 ? (
            <div className="hook-groups" style={{ marginTop: horizontal.length ? '2rem' : 0 }}>
              <div className="hook-group reveal">
                <div className="hook-grid">
                  {vertical.map((product) => (
                    <a key={product.id} className="hook-item" href={product.ctaHref || '/contact'}>
                      <span>{product.name}</span>
                      <svg aria-hidden="true">
                        <use href="#i-arrow" />
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          <p className="catalog-empty" id="catalogEmpty" hidden={filtered.length > 0}>
            No matching products.
          </p>
        </div>
      </section>
    </>
  );
}
