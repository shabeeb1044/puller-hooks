'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M6 6l12 12M18 6L6 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d="M5 12h14M13 6l6 6-6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconChevron({ dir = 'next' }) {
  const isPrev = dir === 'prev';
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d={
          isPrev
            ? 'M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z'
            : 'M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z'
        }
      />
    </svg>
  );
}

export default function ProductCatalog({
  products,
  searchPlaceholder = 'Search products',
  showSearch = true,
  yellow = false,
  eyebrow = null,
  title = null,
  lead = null,
}) {
  const [query, setQuery] = useState('');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const filtered = useMemo(() => {
    if (!showSearch) return products;
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const hay = `${p.name} ${p.slug} ${p.searchTerms || ''} ${p.description || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, query, showSearch]);

  // Image cards need an image; name-only / vertical products render as red bars
  const horizontal = filtered.filter((p) => p.layout !== 'vertical' && p.image);
  const vertical = filtered.filter((p) => p.layout === 'vertical' || !p.image);

  const lightboxOpen = lightboxIndex !== null && horizontal.length > 0;
  const activeProduct = lightboxOpen ? horizontal[lightboxIndex] : null;
  const isVerticalPack = activeProduct?.imageStyle === 'vertical';

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || !horizontal.length) return i;
      return (i - 1 + horizontal.length) % horizontal.length;
    });
  }, [horizontal.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((i) => {
      if (i === null || !horizontal.length) return i;
      return (i + 1) % horizontal.length;
    });
  }, [horizontal.length]);

  useEffect(() => {
    if (!lightboxOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.classList.add('modal-open');
    document.body.style.overflow = 'hidden';

    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [lightboxOpen, closeLightbox, showPrev, showNext]);

  // Keep index valid if filtered list shrinks while open
  useEffect(() => {
    if (lightboxIndex === null) return;
    if (!horizontal.length) {
      setLightboxIndex(null);
      return;
    }
    if (lightboxIndex >= horizontal.length) {
      setLightboxIndex(horizontal.length - 1);
    }
  }, [horizontal.length, lightboxIndex]);

  const lightbox =
    mounted && lightboxOpen && activeProduct
      ? createPortal(
          <div
            className="catalog-lightbox is-open"
            role="dialog"
            aria-modal="true"
            aria-label={`${activeProduct.name} gallery`}
          >
            <div
              className="catalog-lightbox-backdrop"
              aria-hidden="true"
              onClick={closeLightbox}
            />
            <div
              className={`catalog-lightbox-dialog${isVerticalPack ? ' catalog-lightbox-dialog--vertical' : ''}`}
              role="document"
            >
              <button
                type="button"
                className="catalog-lightbox-close"
                aria-label="Close"
                onClick={closeLightbox}
              >
                <IconClose />
              </button>

              {horizontal.length > 1 ? (
                <>
                  <button
                    type="button"
                    className="catalog-lightbox-nav catalog-lightbox-nav--prev"
                    aria-label="Previous product"
                    onClick={showPrev}
                  >
                    <IconChevron dir="prev" />
                  </button>
                  <button
                    type="button"
                    className="catalog-lightbox-nav catalog-lightbox-nav--next"
                    aria-label="Next product"
                    onClick={showNext}
                  >
                    <IconChevron dir="next" />
                  </button>
                </>
              ) : null}

              <div
                className={`catalog-lightbox-media${isVerticalPack ? ' catalog-lightbox-media--vertical' : ''}`}
              >
                <img
                  key={activeProduct.id}
                  src={activeProduct.image}
                  alt={activeProduct.imageAlt || activeProduct.name}
                  decoding="async"
                />
              </div>

              <div className="catalog-lightbox-footer">
                <div className="catalog-lightbox-meta">
                  <p className="catalog-lightbox-name">{activeProduct.name}</p>
                  {horizontal.length > 1 ? (
                    <p className="catalog-lightbox-count" aria-live="polite">
                      {lightboxIndex + 1} / {horizontal.length}
                    </p>
                  ) : null}
                </div>
                <a
                  className="catalog-btn catalog-lightbox-cta"
                  href={activeProduct.ctaHref || '/dealers#apply'}
                >
                  {activeProduct.ctaLabel || 'Inquiry now'} <IconArrow />
                </a>
              </div>
            </div>
          </div>,
          document.body
        )
      : null;

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
          {(eyebrow || title || lead) && (
            <header className="range-head reveal">
              {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
              {title ? (
                <h2 id="catalog-title" className="section-title">
                  {title}
                </h2>
              ) : null}
              {lead ? <p>{lead}</p> : null}
            </header>
          )}
          {horizontal.length > 0 ? (
            <div className="catalog-grid" id="catalogGrid">
              {horizontal.map((product, index) => {
                const style = product.imageStyle === 'vertical' ? 'vertical' : 'contain';
                return (
                  <article
                    key={product.id}
                    className={`catalog-card catalog-card--${style}`}
                    data-search={product.searchTerms || product.name}
                  >
                    <button
                      type="button"
                      className="catalog-media"
                      aria-label={`View ${product.name} larger`}
                      onClick={() => setLightboxIndex(index)}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.imageAlt || product.name}
                          width={product.imageStyle === 'vertical' ? 120 : 640}
                          height={product.imageHeight || (product.imageStyle === 'vertical' ? 380 : 640)}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : null}
                    </button>
                    <div className="catalog-info">
                      <span className="catalog-name">{product.name}</span>
                      <a
                        className="catalog-btn"
                        href={product.ctaHref || '/dealers#apply'}
                      >
                        {product.ctaLabel || 'Inquiry now'} <IconArrow />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : null}

          {vertical.length > 0 ? (
            <div className="hook-groups" style={{ marginTop: horizontal.length ? '2rem' : 0 }}>
              <div className="hook-group reveal">
                <div className="hook-grid">
                  {vertical.map((product) => (
                    <a key={product.id} className="hook-item" href={product.ctaHref || '#'}>
                      <span>{product.name}</span>
                      <IconArrow />
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

      {lightbox}
    </>
  );
}
