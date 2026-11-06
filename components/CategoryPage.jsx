import ProductCatalog from '@/components/ProductCatalog';
import { parseJsonList } from '@/lib/cms';

function modelSizeLabel(product) {
  const match = String(product.name || '').match(/(\d+)\s*DD/i);
  if (match) return `${match[1]} DD`;
  const specs = parseJsonList(product.specifications);
  const fromSpec = specs.find((s) => /\d+\s*DD/i.test(s));
  if (fromSpec) {
    const m = fromSpec.match(/(\d+)\s*DD/i);
    if (m) return `${m[1]} DD`;
  }
  return null;
}

function isFeaturedModel(product) {
  const href = product.ctaHref || '';
  return href.startsWith('#') || /featured|colour|color/i.test(product.ctaLabel || '');
}

export default function CategoryPage({
  category,
  subcategory = null,
  products = [],
  bannerVariant = 'default',
}) {
  const isSubcategoryPage = Boolean(subcategory);

  const title = subcategory?.pageTitle || category?.pageTitle || subcategory?.name || category?.name;
  const lead = subcategory?.pageLead || category?.pageLead || (!isSubcategoryPage ? subcategory?.description || category?.description : '') || '';
  const bannerImage = subcategory?.bannerImage || category?.bannerImage;
  const image = category?.image;

  const eyebrow = isSubcategoryPage
    ? subcategory?.pageSubtitle || category?.pageSubtitle || 'PULLER'
    : category?.pageSubtitle || 'PULLER Products';

  const aboutEyebrow = category?.introSubtitle || 'Our Range';
  const aboutTitle = category?.introTitle || category?.name;

  const modelsEyebrow = subcategory?.modelsSubtitle || 'Available Models';
  const modelsTitle = subcategory?.modelsTitle || (subcategory ? `${subcategory.name}` : 'Available Models');
  const modelsLead = subcategory?.modelsLead || subcategory?.description || '';

  const productsEyebrow =
    subcategory?.productsSubtitle || category?.productsSubtitle || (isSubcategoryPage ? 'Products' : 'Product Styles');
  const productsHeading =
    subcategory?.productsTitle || category?.productsTitle || (isSubcategoryPage ? subcategory.name : 'Designed for every technique');
  const productsLead = subcategory?.productsLead || category?.productsLead || '';

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

  const legacyYellow =
    bannerVariant === 'yellow' ||
    category?.pageTheme === 'yellow' ||
    category?.slug === 'hard-body-lures' ||
    category?.slug === 'hooks' ||
    subcategory?.slug === 'flash-striker';

  const resolveTheme = (sectionTheme, fallbackTheme) => {
    if (sectionTheme === 'yellow' || sectionTheme === 'black') return sectionTheme === 'yellow';
    if (fallbackTheme === 'yellow' || fallbackTheme === 'black') return fallbackTheme === 'yellow';
    return legacyYellow;
  };

  const bannerYellow = resolveTheme(subcategory?.bannerTheme, category?.bannerTheme);
  const introYellow = resolveTheme(category?.introTheme);
  const modelsYellow = resolveTheme(subcategory?.modelsTheme, category?.productsTheme);
  const productsYellow = resolveTheme(subcategory?.productsTheme, category?.productsTheme);

  // Name buttons: vertical layout, or any product without an image
  const isNameButton = (p) => p.layout === 'vertical' || !p.image;
  const verticalByGroup = {};
  const flatVertical = [];
  for (const p of products) {
    if (isNameButton(p)) {
      const group = p.subcategory?.name || 'Products';
      if (!verticalByGroup[group]) verticalByGroup[group] = [];
      verticalByGroup[group].push(p);
      flatVertical.push(p);
    }
  }
  const horizontal = products.filter((p) => !isNameButton(p));
  const useGroupedHooks = !subcategory && flatVertical.length > 0 && Object.keys(verticalByGroup).length > 1;

  return (
    <main id="main">
      {/* Section 01 — Banner */}
      <section
        className={`page-banner flash-striker-banner${bannerYellow ? ' page-banner--yellow' : ''}`}
        aria-labelledby="category-title"
      >
        {bannerImage && !bannerYellow ? (
          <>
            <div className="page-banner-media" aria-hidden="true">
              <img src={bannerImage} alt="" width="1920" height="1080" decoding="async" fetchPriority="high" />
            </div>
            <div className="page-banner-shade" aria-hidden="true"></div>
          </>
        ) : null}
        <div className="container page-banner-inner">
          <nav className={`crumbs${bannerImage && !bannerYellow ? ' crumbs--on-dark' : ''}`} aria-label="Breadcrumb">
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

      {/* Category pages keep intro (copy + image). Subcategory pages skip it. */}
      {!isSubcategoryPage && (image || category?.description) ? (
        <section className={`range-intro${introYellow ? ' range-intro--yellow' : ''}`} aria-labelledby="about-title">
          <div className="container range-intro-layout">
            <div className="range-copy reveal">
              <p className="section-eyebrow">{aboutEyebrow}</p>
              <h2 id="about-title" className="section-title">
                {aboutTitle}
              </h2>
              {category?.description ? <p className="range-lead">{category.description}</p> : null}
            </div>
            {image ? (
              <figure className={`range-figure${!introYellow ? ' range-figure--light' : ''} reveal`}>
                <img src={image} alt="" width="800" height="800" loading="lazy" decoding="async" />
              </figure>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Section 02 — Available Models (subcategory only; text options, no images) */}
      {isSubcategoryPage && flatVertical.length > 0 ? (
        <section
          className={`range-section${modelsYellow ? ' range-section--yellow' : ''}`}
          id="models"
          aria-labelledby="models-title"
        >
          <div className="container">
            <header className="range-head reveal">
              <p className="section-eyebrow">{modelsEyebrow}</p>
              <h2 id="models-title" className="section-title">
                {modelsTitle}
              </h2>
              {modelsLead ? <p>{modelsLead}</p> : null}
            </header>
            <div className="model-grid">
              {flatVertical.map((product) => {
                const size = modelSizeLabel(product);
                const featured = isFeaturedModel(product);
                return (
                  <a
                    key={product.id}
                    className={`model-card reveal${featured ? ' model-card--featured' : ''}`}
                    href={product.ctaHref || '#'}
                  >
                    {size ? <span className="model-size">{size}</span> : null}
                    <h3 className="model-name">{product.name}</h3>
                    {product.description ? <p className="model-note">{product.description}</p> : null}
                    <span className="model-cta">
                      {product.ctaLabel || 'Inquire'}{' '}
                      <svg aria-hidden="true">
                        <use href="#i-circle-arrow" />
                      </svg>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* Section 03 — Products */}
      {useGroupedHooks ? (
        <section
          className={`range-section${productsYellow ? ' range-section--yellow' : ''}`}
          id="product-range"
          aria-labelledby="range-title"
        >
          <div className="container">
            <header className="range-head reveal">
              <p className="section-eyebrow">{productsEyebrow}</p>
              <h2 id="range-title" className="section-title">
                {productsHeading}
              </h2>
              {productsLead ? <p>{productsLead}</p> : null}
            </header>
            <div className="hook-groups">
              {Object.entries(verticalByGroup).map(([group, list]) => (
                <div className="hook-group reveal" key={group}>
                  <h3 className="hook-group-title">{group}</h3>
                  <div className="hook-grid">
                    {list.map((product) => (
                      <a key={product.id} className="hook-item" href={product.ctaHref || '#'}>
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
                <ProductCatalog products={horizontal} showSearch={false} yellow={productsYellow} />
              </div>
            ) : null}
          </div>
        </section>
      ) : isSubcategoryPage ? (
        horizontal.length > 0 ? (
          <ProductCatalog
            products={horizontal}
            showSearch={false}
            yellow={productsYellow}
            eyebrow={productsEyebrow}
            title={productsHeading}
            lead={productsLead}
          />
        ) : flatVertical.length === 0 ? (
          <section className={`range-section${productsYellow ? ' range-section--yellow' : ''}`}>
            <div className="container">
              <p>
                Products coming soon. <a href="/contact">Contact us</a> for availability.
              </p>
            </div>
          </section>
        ) : null
      ) : products.length > 0 ? (
        <ProductCatalog
          products={products}
          showSearch={false}
          yellow={productsYellow}
          eyebrow={productsEyebrow}
          title={productsHeading}
          lead={productsLead}
        />
      ) : (
        <section className={`range-section${productsYellow ? ' range-section--yellow' : ''}`}>
          <div className="container">
            <p>
              Products coming soon. <a href="/contact">Contact us</a> for availability.
            </p>
          </div>
        </section>
      )}

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
