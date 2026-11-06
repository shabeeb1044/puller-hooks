import ProductCatalog from '@/components/ProductCatalog';
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

const MODELS = [
  { size: '40', href: '/contact' },
  { size: '90', href: '/contact' },
  { size: '120', href: '/contact' },
  { size: '140', href: '/contact' },
  { size: '160', href: '#catalog', featured: true },
  { size: '190', href: '/contact' },
  { size: '220', href: '/contact' },
];

export default async function FlashStrikerPage() {
  const { category, subcategory, products } = await getPublishedProductsForListing(
    'hard-body-lures',
    'flash-striker'
  );

  const eyebrow = subcategory?.pageSubtitle || 'PULLER Lures';
  const title = subcategory?.pageTitle || 'Strong, Reliable, Built to Perform';
  const lead =
    subcategory?.pageLead ||
    category?.pageLead ||
    'PULLER Lures are engineered to deliver reliable, high-performance results in both saltwater and freshwater.';

  const modelsEyebrow = subcategory?.modelsSubtitle || 'Available Models';
  const modelsTitle = subcategory?.modelsTitle || 'Seven sizes. One series.';
  const colourCount = products.length || 38;
  const modelsLead =
    subcategory?.modelsLead ||
    subcategory?.description ||
    `Choose the FLASH STRIKER size that matches your water, target species and technique. FLASH STRIKER is available now in ${colourCount} colour patterns.`;

  const productsEyebrow = subcategory?.productsSubtitle || 'Colour Patterns';
  const productsHeading = subcategory?.productsTitle || 'FLASH STRIKER 160 DD';
  const productsLead =
    subcategory?.productsLead ||
    `${colourCount} colour patterns · 2m+ dive depth. Available now.`;

  return (
    <main id="main">
      {/* Section 01 — Banner */}
      <section className="page-banner flash-striker-banner page-banner--yellow" aria-labelledby="flash-striker-title">
        <div className="container page-banner-inner">
          <nav className="crumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <a href="/#products">Products</a>
            <span aria-hidden="true">/</span>
            <span>Hard Body Lures</span>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Flash Striker</span>
          </nav>
          <p className="section-eyebrow">{eyebrow}</p>
          <h1 id="flash-striker-title" className="section-title">
            {title}
          </h1>
          {lead ? <p className="page-banner-lead">{lead}</p> : null}
        </div>
      </section>

      {/* Section 02 — Available Models (text options only, no images) */}
      <section className="range-section range-section--yellow" id="models" aria-labelledby="models-title">
        <div className="container">
          <header className="range-head reveal">
            <p className="section-eyebrow">{modelsEyebrow}</p>
            <h2 id="models-title" className="section-title">
              {modelsTitle}
            </h2>
            {modelsLead ? <p>{modelsLead}</p> : null}
          </header>
          <div className="model-grid">
            {MODELS.map(({ size, href, featured }) => (
              <a
                key={size}
                className={`model-card reveal${featured ? ' model-card--featured' : ''}`}
                id={`fs-${size}`}
                href={href}
              >
                <span className="model-size">{size} DD</span>
                <h3 className="model-name">{featured ? 'FLASH STRIKER' : `FLASH STRIKER ${size} DD`}</h3>
                <p className="model-note">
                  {featured
                    ? `${colourCount} colour patterns · 2m+ dive depth. Available now.`
                    : 'Hard-body trolling & casting'}
                </p>
                <span className="model-cta">
                  {featured ? 'View colour patterns' : 'Inquire'}{' '}
                  <svg aria-hidden="true">
                    <use href="#i-circle-arrow" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Section 03 — Products */}
      <ProductCatalog
        products={products}
        showSearch={false}
        yellow
        eyebrow={productsEyebrow}
        title={productsHeading}
        lead={productsLead}
      />

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
