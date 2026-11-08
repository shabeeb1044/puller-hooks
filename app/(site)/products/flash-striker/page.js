import ProductCatalog from '@/components/ProductCatalog';
import RichHTML, { isBlankRichText } from '@/components/RichHTML';
import { getPublishedProductsForListing } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'FLASH STRIKER | PULLER Co., Ltd.',
  description: 'PULLER FLASH STRIKER. 2m +. YOUR PERFECT CATCHER.',
  openGraph: {
    title: 'FLASH STRIKER | PULLER Co., Ltd.',
    description: 'PULLER FLASH STRIKER. 2m +. YOUR PERFECT CATCHER.',
    images: [{ url: 'https://pullertackle.com/images/products/flash-striker-160-dd-31.webp' }],
    siteName: 'PULLER Co., Ltd.',
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: 'https://pullertackle.com/products/flash-striker',
  },
};

const FALLBACK_MODELS = [
  { size: '40', href: '/contact' },
  { size: '90', href: '/contact' },
  { size: '120', href: '/contact' },
  { size: '140', href: '/contact' },
  { size: '160', href: '#catalog', featured: true },
  { size: '190', href: '/contact' },
  { size: '220', href: '/contact' },
];

function isYellowTheme(theme, fallback) {
  if (theme === 'yellow' || theme === 'black') return theme === 'yellow';
  if (fallback === 'yellow' || fallback === 'black') return fallback === 'yellow';
  return false;
}

function isFeaturedModel(product) {
  if (/featured|colour patterns|color patterns/i.test(product.ctaLabel || '')) return true;
  const href = (product.ctaHref || '').trim();
  return href === '#catalog';
}

export default async function FlashStrikerPage() {
  const { category, subcategory, products } = await getPublishedProductsForListing(
    'hard-body-lures',
    'flash-striker'
  );

  const isNameButton = (p) => p.layout === 'vertical' || !p.image;
  const modelProducts = products.filter(isNameButton);
  const catalogProducts = products.filter((p) => !isNameButton(p));
  const colourCount = catalogProducts.length || products.length || 38;

  const eyebrow = subcategory?.pageSubtitle || 'PULLER Lures';
  const title =
    (!isBlankRichText(subcategory?.pageTitle) && subcategory?.pageTitle) ||
    'Strong, Reliable, Built to Perform';
  const lead =
    subcategory?.pageLead ??
    category?.pageLead ??
    'PULLER Lures are engineered to deliver reliable, high-performance results in both saltwater and freshwater.';

  const modelsEyebrow = subcategory?.modelsSubtitle || 'Available Models';
  const modelsTitle =
    (!isBlankRichText(subcategory?.modelsTitle) && subcategory?.modelsTitle) || 'Seven sizes. One series.';
  const modelsLead =
    subcategory?.modelsLead ??
    subcategory?.description ??
    `Choose the FLASH STRIKER size that matches your water, target species and technique. FLASH STRIKER is available now in ${colourCount} colour patterns.`;

  // Products catalog header: empty when CMS fields are blank — no hardcoded defaults.
  const productsEyebrow = !isBlankRichText(subcategory?.productsSubtitle)
    ? subcategory.productsSubtitle
    : '';
  const productsHeading = !isBlankRichText(subcategory?.productsTitle)
    ? subcategory.productsTitle
    : '';
  const productsLead = !isBlankRichText(subcategory?.productsLead)
    ? subcategory.productsLead
    : '';

  const bannerYellow = isYellowTheme(subcategory?.bannerTheme, category?.bannerTheme);
  const modelsYellow = isYellowTheme(subcategory?.modelsTheme, category?.productsTheme);
  const productsYellow = isYellowTheme(subcategory?.productsTheme, category?.productsTheme);
  const bannerImage = subcategory?.bannerImage || category?.bannerImage;

  const showBanner = subcategory?.bannerVisible !== false;
  const showModels = subcategory?.modelsVisible !== false;
  const showProducts = subcategory?.productsVisible !== false;

  return (
    <main id="main">
      {showBanner ? (
        <section
          className={`page-banner flash-striker-banner${bannerYellow ? ' page-banner--yellow' : ''}`}
          aria-labelledby="flash-striker-title"
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
              <a href="/">Home</a>
              <span aria-hidden="true">/</span>
              <a href="/#products">Products</a>
              <span aria-hidden="true">/</span>
              <span>Hard Body Lures</span>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Flash Striker</span>
            </nav>
            <p className="section-eyebrow">{eyebrow}</p>
            <RichHTML id="flash-striker-title" as="h1" className="section-title" html={title} inline />
            <RichHTML className="page-banner-lead" html={lead} />
          </div>
        </section>
      ) : null}

      {showModels ? (
        <section
          className={`range-section${modelsYellow ? ' range-section--yellow' : ''}`}
          id="models"
          aria-labelledby="models-title"
        >
          <div className="container">
            <header className="range-head reveal">
              <p className="section-eyebrow">{modelsEyebrow}</p>
              <RichHTML id="models-title" as="h2" className="section-title" html={modelsTitle} inline />
              <RichHTML className="range-lead" html={modelsLead} />
            </header>
            <div className="model-grid">
              {modelProducts.length > 0
                ? modelProducts.map((product) => {
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
                  })
                : FALLBACK_MODELS.map(({ size, href, featured }) => (
                    <a
                      key={size}
                      className={`model-card reveal${featured ? ' model-card--featured' : ''}`}
                      id={`fs-${size}`}
                      href={href}
                    >
                      <h3 className="model-name">
                        {featured ? 'FLASH STRIKER' : `FLASH STRIKER ${size} DD`}
                      </h3>
                      <p className="model-note">
                        {featured
                          ? `${colourCount} colour patterns · 2m+ dive depth. Available now.`
                          : 'Hard-body trolling & casting'}
                      </p>
                      <span className="model-cta">
                        {featured ? 'View colour patterns' : 'Inquiry now'}{' '}
                        <svg aria-hidden="true">
                          <use href="#i-circle-arrow" />
                        </svg>
                      </span>
                    </a>
                  ))}
            </div>
          </div>
        </section>
      ) : null}

      {showProducts ? (
        <ProductCatalog
          products={catalogProducts}
          showSearch={false}
          yellow={productsYellow}
          eyebrow={productsEyebrow}
          title={productsHeading}
          lead={productsLead}
        />
      ) : null}

      <section className="dealers" id="dealers" aria-labelledby="dealers-title">
        <div className="container dealers-inner reveal">
          <img className="dealers-logo" src="/images/logo.webp" alt="" width="640" height="320" loading="lazy" decoding="async" />
          <h2 id="dealers-title">Become a PULLER Authorized Dealer</h2>
          <p>
            PULLER works through a growing dealer network across all continents. Become an official dealer in your country or
            region and grow with a trusted fishing-products brand.
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
