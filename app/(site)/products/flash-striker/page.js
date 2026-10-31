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

export default async function FlashStrikerPage() {
  const { category, subcategory, products } = await getPublishedProductsForListing(
    'hard-body-lures',
    'flash-striker'
  );

  const title = subcategory?.pageTitle || 'Strong, Reliable, Built to Perform';
  const lead =
    subcategory?.pageLead ||
    category?.pageLead ||
    'PULLER Lures are engineered to deliver reliable, high-performance results in both saltwater and freshwater.';
  const image = subcategory?.image || category?.image || '/images/product-hard-body-lures-black-bg.webp';
  const about =
    subcategory?.description ||
    'The PULLER FLASH STRIKER is a renowned series of hard-body trolling and casting lures, available in more than 100 different colour patterns.';

  return (
    <main id="main">
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
          <p className="section-eyebrow">PULLER Lures</p>
          <h1 id="flash-striker-title" className="section-title">
            {title}
          </h1>
          <p className="page-banner-lead">{lead}</p>
        </div>
      </section>

      <section className="range-intro range-intro--yellow" aria-labelledby="lures-about-title">
        <div className="container range-intro-layout">
          <div className="range-copy reveal">
            <p className="section-eyebrow">FLASH STRIKER Series</p>
            <h2 id="lures-about-title" className="section-title">
              Hard-Body Trolling &amp; Casting Lures
            </h2>
            <p className="range-lead">
              PULLER Lures are engineered to deliver <strong>reliable, high-performance results in both saltwater and freshwater</strong>.
              Our range combines <strong>strength, durability, quality, and effective lure action</strong>, providing anglers with
              dependable performance across a wide variety of fishing conditions.
            </p>
            <p>{about}</p>
            <p>Whether trolling offshore or casting in freshwater, FLASH STRIKER lures are built to perform when it matters most.</p>
          </div>
          <figure className="range-figure reveal">
            <img
              src={image}
              alt="PULLER FLASH STRIKER hard-body lures in retail packaging"
              width="800"
              height="800"
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      <section className="range-section range-section--yellow" id="models" aria-labelledby="models-title">
        <div className="container">
          <header className="range-head reveal">
            <p className="section-eyebrow">Available Models</p>
            <h2 id="models-title" className="section-title">
              Seven sizes. One series.
            </h2>
            <p>
              Choose the FLASH STRIKER size that matches your water, target species and technique. FLASH STRIKER is available
              now in {products.length || 38} colour patterns.
            </p>
          </header>
          <div className="model-grid">
            {[
              ['40', '/contact'],
              ['90', '/contact'],
              ['120', '/contact'],
              ['140', '/contact'],
              ['160', '#catalog'],
              ['190', '/contact'],
              ['220', '/contact'],
            ].map(([size, href]) => (
              <a
                key={size}
                className={`model-card reveal${size === '160' ? ' model-card--featured' : ''}`}
                id={`fs-${size}`}
                href={href}
              >
                <span className="model-size">{size} DD</span>
                <h3 className="model-name">{size === '160' ? 'FLASH STRIKER' : `FLASH STRIKER ${size} DD`}</h3>
                <p className="model-note">
                  {size === '160'
                    ? `${products.length || 38} colour patterns · 2m+ dive depth. Available now.`
                    : 'Hard-body trolling & casting'}
                </p>
                <span className="model-cta">
                  {size === '160' ? 'View colour patterns' : 'Inquire'}{' '}
                  <svg aria-hidden="true">
                    <use href="#i-circle-arrow" />
                  </svg>
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <ProductCatalog products={products} showSearch={false} />

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
