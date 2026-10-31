import ProductCatalog from '@/components/ProductCatalog';
import { parseJsonList } from '@/lib/cms';

export default function CategoryPage({
  category,
  subcategory = null,
  products = [],
  bannerVariant = 'default',
}) {
  const title = subcategory?.pageTitle || category?.pageTitle || subcategory?.name || category?.name;
  const lead = subcategory?.pageLead || category?.pageLead || subcategory?.description || category?.description || '';
  const image = subcategory?.image || category?.image;
  const bannerImage = subcategory?.bannerImage || category?.bannerImage;
  const eyebrow = subcategory ? `${category?.name || ''}`.trim() : 'PULLER Products';
  const aboutTitle = subcategory?.name || category?.name;

  const crumbs = [
    { href: '/', label: 'Home' },
    { href: '/#products', label: 'Products' },
  ];
  if (subcategory && category) {
    crumbs.push({ href: `/products/${category.slug}`, label: category.name });
    crumbs.push({ label: subcategory.name, current: true });
  } else if (category) {
    crumbs.push({ label: category.name, current: true });
  }

  const yellow = bannerVariant === 'yellow' || category?.slug === 'hard-body-lures' || subcategory?.slug === 'flash-striker';

  // Group vertical products by subcategory name when on a category page
  const verticalByGroup = {};
  const flatVertical = [];
  for (const p of products) {
    if (p.layout === 'vertical') {
      const group = p.subcategory?.name || 'Products';
      if (!verticalByGroup[group]) verticalByGroup[group] = [];
      verticalByGroup[group].push(p);
      flatVertical.push(p);
    }
  }
  const horizontal = products.filter((p) => p.layout !== 'vertical');
  const useGroupedHooks = !subcategory && flatVertical.length > 0 && Object.keys(verticalByGroup).length > 1;

  return (
    <main id="main">
      <section
        className={`page-banner flash-striker-banner${yellow ? ' page-banner--yellow' : ''}`}
        aria-labelledby="category-title"
      >
        {bannerImage && !yellow ? (
          <>
            <div className="page-banner-media" aria-hidden="true">
              <img src={bannerImage} alt="" width="1920" height="1080" decoding="async" fetchPriority="high" />
            </div>
            <div className="page-banner-shade" aria-hidden="true"></div>
          </>
        ) : null}
        <div className="container page-banner-inner">
          <nav className={`crumbs${bannerImage && !yellow ? ' crumbs--on-dark' : ''}`} aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} style={{ display: 'contents' }}>
                {i > 0 ? <span aria-hidden="true">/</span> : null}
                {c.current ? (
                  <span aria-current="page">{c.label}</span>
                ) : (
                  <a href={c.href}>{c.label}</a>
                )}
              </span>
            ))}
          </nav>
          <p className="section-eyebrow">{eyebrow || 'PULLER'}</p>
          <h1 id="category-title" className="section-title">
            {title}
          </h1>
          {lead ? <p className="page-banner-lead">{lead}</p> : null}
        </div>
      </section>

      {(image || subcategory?.description || category?.description) && (
        <section className={`range-intro${yellow ? ' range-intro--yellow' : ''}`} aria-labelledby="about-title">
          <div className="container range-intro-layout">
            <div className="range-copy reveal">
              <p className="section-eyebrow">{subcategory ? `${subcategory.name} Series` : 'Our Range'}</p>
              <h2 id="about-title" className="section-title">
                {aboutTitle}
              </h2>
              {(subcategory?.description || category?.description) && (
                <p className="range-lead">{subcategory?.description || category?.description}</p>
              )}
            </div>
            {image ? (
              <figure className={`range-figure${!yellow ? ' range-figure--light' : ''} reveal`}>
                <img src={image} alt="" width="800" height="800" loading="lazy" decoding="async" />
              </figure>
            ) : null}
          </div>
        </section>
      )}

      {useGroupedHooks ? (
        <section className="range-section" id="product-range" aria-labelledby="range-title">
          <div className="container">
            <header className="range-head reveal">
              <p className="section-eyebrow">Product Styles</p>
              <h2 id="range-title" className="section-title">
                Designed for every technique
              </h2>
            </header>
            <div className="hook-groups">
              {Object.entries(verticalByGroup).map(([group, list]) => (
                <div className="hook-group reveal" key={group}>
                  <h3 className="hook-group-title">{group}</h3>
                  <div className="hook-grid">
                    {list.map((product) => (
                      <a key={product.id} className="hook-item" href={product.ctaHref || '/contact'}>
                        <span>{product.name}</span>
                        <svg aria-hidden="true">
                          <use href="#i-arrow" />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {horizontal.length > 0 ? (
              <div style={{ marginTop: '2rem' }}>
                <ProductCatalog products={horizontal} showSearch={false} />
              </div>
            ) : null}
          </div>
        </section>
      ) : products.length > 0 ? (
        <ProductCatalog products={products} showSearch={false} />
      ) : (
        <section className="range-section">
          <div className="container">
            <p>Products coming soon. <a href="/contact">Contact us</a> for availability.</p>
          </div>
        </section>
      )}

      {/* Specs/features sample for first product with details when on subcategory with few items */}
      {subcategory && products[0] && (products[0].specifications || products[0].features) && products.length <= 3 ? (
        <section className="range-section">
          <div className="container">
            {parseJsonList(products[0].specifications).length > 0 ? (
              <>
                <h2 className="section-title">Specifications</h2>
                <ul>
                  {parseJsonList(products[0].specifications).map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="dealers" id="dealers" aria-labelledby="dealers-title">
        <div className="container dealers-inner reveal">
          <img className="dealers-logo" src="/images/logo.webp" alt="" width="640" height="320" loading="lazy" decoding="async" />
          <h2 id="dealers-title">Become a PULLER Authorized Dealer</h2>
          <p>
            PULLER works through a growing dealer network across all continents. Become an official dealer in your
            country or region and grow with a trusted fishing-products brand.
          </p>
          <a className="btn btn-outline-light" href="/dealers">
            Apply Now{' '}
            <svg className="btn-icon" aria-hidden="true">
              <use href="#i-arrow" />
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
