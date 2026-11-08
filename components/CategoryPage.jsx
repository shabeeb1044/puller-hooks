import ProductCatalog from '@/components/ProductCatalog';
import RichHTML, { isBlankRichText } from '@/components/RichHTML';
import { parseJsonList } from '@/lib/cms';

function isFeaturedModel(product) {
  // Featured = span full grid (e.g. Flash Striker “View colour patterns” → #catalog).
  // Do not treat every “View …” label or #product-… anchor as featured.
  if (/featured|colour patterns|color patterns/i.test(product.ctaLabel || '')) return true;
  const href = (product.ctaHref || '').trim();
  return href === '#catalog';
}

export default function CategoryPage({
  category,
  subcategory = null,
  products = [],
  bannerVariant = 'default',
}) {
  const isSubcategoryPage = Boolean(subcategory);

  // Prefer CMS pageTitle; fall back to entity name only for the banner H1 (a11y).
  // All other section copy: empty CMS value stays empty — no hardcoded marketing defaults.
  const title =
    (!isBlankRichText(subcategory?.pageTitle) && subcategory?.pageTitle) ||
    (!isBlankRichText(category?.pageTitle) && category?.pageTitle) ||
    subcategory?.name ||
    category?.name ||
    '';
  const lead = isSubcategoryPage
    ? (subcategory?.pageLead ?? category?.pageLead ?? '')
    : (category?.pageLead ?? '');
  const bannerImage = subcategory?.bannerImage || category?.bannerImage;
  const image = category?.image;

  const eyebrow = isSubcategoryPage
    ? (subcategory?.pageSubtitle || category?.pageSubtitle || '')
    : (category?.pageSubtitle || '');

  const aboutEyebrow = category?.introSubtitle || '';
  const aboutTitle =
    (!isBlankRichText(category?.introTitle) && category?.introTitle) || '';

  const modelsEyebrow = isSubcategoryPage
    ? subcategory?.modelsSubtitle || ''
    : category?.modelsSubtitle || '';
  const modelsTitle = isSubcategoryPage
    ? (!isBlankRichText(subcategory?.modelsTitle) && subcategory?.modelsTitle) || ''
    : (!isBlankRichText(category?.modelsTitle) && category?.modelsTitle) || '';
  const modelsLead = isSubcategoryPage
    ? subcategory?.modelsLead ?? ''
    : category?.modelsLead ?? '';

  const productsEyebrow = !isBlankRichText(subcategory?.productsSubtitle)
    ? subcategory.productsSubtitle
    : !isBlankRichText(category?.productsSubtitle)
      ? category.productsSubtitle
      : '';
  const productsHeading = !isBlankRichText(subcategory?.productsTitle)
    ? subcategory.productsTitle
    : !isBlankRichText(category?.productsTitle)
      ? category.productsTitle
      : '';
  const productsLead = !isBlankRichText(subcategory?.productsLead)
    ? subcategory.productsLead
    : !isBlankRichText(category?.productsLead)
      ? category.productsLead
      : '';

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

  // Prefer explicit CMS section themes. Only fall back to legacy pageTheme / bannerVariant
  // when a section theme was never set — never force yellow by slug.
  const legacyYellow = bannerVariant === 'yellow' || category?.pageTheme === 'yellow';

  const resolveTheme = (sectionTheme, fallbackTheme) => {
    if (sectionTheme === 'yellow' || sectionTheme === 'black') return sectionTheme === 'yellow';
    if (fallbackTheme === 'yellow' || fallbackTheme === 'black') return fallbackTheme === 'yellow';
    return legacyYellow;
  };

  const bannerYellow = resolveTheme(subcategory?.bannerTheme, category?.bannerTheme);
  const introYellow = resolveTheme(category?.introTheme);
  const modelsYellow = resolveTheme(
    subcategory?.modelsTheme,
    category?.modelsTheme ?? category?.productsTheme
  );
  const productsYellow = resolveTheme(subcategory?.productsTheme, category?.productsTheme);

  const showBanner = isSubcategoryPage
    ? subcategory?.bannerVisible !== false
    : category?.bannerVisible !== false;
  const showIntro = !isSubcategoryPage && category?.introVisible !== false;
  const showModels = isSubcategoryPage
    ? subcategory?.modelsVisible !== false
    : category?.modelsVisible !== false;
  const showProducts = isSubcategoryPage
    ? subcategory?.productsVisible !== false
    : category?.productsVisible !== false;

  // Name buttons: vertical layout, or any product without an image
  const isNameButton = (p) => p.layout === 'vertical' || !p.image;
  const flatVertical = products.filter(isNameButton);
  const horizontal = products.filter((p) => !isNameButton(p));

  return (
    <main id="main">
      {/* Section 01 — Banner */}
      {showBanner ? (
        <section
          className={`page-banner flash-striker-banner${bannerYellow ? ' page-banner--yellow' : ''}`}
          aria-labelledby={title ? 'category-title' : undefined}
          aria-label={title ? undefined : category?.name || subcategory?.name || 'Products'}
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
            {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
            {title ? (
              <RichHTML id="category-title" as="h1" className="section-title" html={title} inline />
            ) : null}
            <RichHTML className="page-banner-lead" html={lead} />
          </div>
        </section>
      ) : null}

      {/* Category pages keep intro (copy + image). Subcategory pages skip it. */}
      {showIntro && (image || !isBlankRichText(category?.description) || aboutEyebrow || aboutTitle) ? (
        <section
          className={`range-intro${introYellow ? ' range-intro--yellow' : ''}`}
          aria-labelledby={aboutTitle ? 'about-title' : undefined}
          aria-label={aboutTitle ? undefined : 'About'}
        >
          <div className="container range-intro-layout">
            <div className="range-copy reveal">
              {aboutEyebrow ? <p className="section-eyebrow">{aboutEyebrow}</p> : null}
              {aboutTitle ? (
                <RichHTML id="about-title" as="h2" className="section-title" html={aboutTitle} inline />
              ) : null}
              <RichHTML className="range-lead" html={category?.description} />
            </div>
            {image ? (
              <figure className={`range-figure${!introYellow ? ' range-figure--light' : ''} reveal`}>
                <img src={image} alt="" width="800" height="800" loading="lazy" decoding="async" />
              </figure>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Available Models — red name cards above products (category + subcategory) */}
      {showModels && flatVertical.length > 0 ? (
        <section
          className={`range-section${modelsYellow ? ' range-section--yellow' : ''}`}
          id="models"
          aria-labelledby={modelsTitle ? 'models-title' : undefined}
          aria-label={modelsTitle ? undefined : 'Available models'}
        >
          <div className="container">
            {(modelsEyebrow || modelsTitle || !isBlankRichText(modelsLead)) ? (
              <header className="range-head reveal">
                {modelsEyebrow ? <p className="section-eyebrow">{modelsEyebrow}</p> : null}
                {modelsTitle ? (
                  <RichHTML id="models-title" as="h2" className="section-title" html={modelsTitle} inline />
                ) : null}
                <RichHTML className="range-lead" html={modelsLead} />
              </header>
            ) : null}
            <div className="model-grid">
              {flatVertical.map((product) => {
                const featured = isFeaturedModel(product);
                return (
                  <a
                    key={product.id}
                    className={`model-card reveal${featured ? ' model-card--featured' : ''}`}
                    href={product.ctaHref || '#'}
                  >
                    <h3 className="model-name">{product.name}</h3>
                    {product.description ? <p className="model-note">{product.description}</p> : null}
                    <span className="model-cta">
                      {product.ctaLabel || 'Inquiry now'}{' '}
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

      {/* Products catalog — image cards only (models stay in the section above) */}
      {showProducts ? (
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
      ) : null}

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
