import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icons from '@/components/Icons';
import SiteInteractions from '@/components/SiteInteractions';
import { DEFAULT_SOCIAL_LINKS } from '@/lib/socialLinks';

const STATIC_NAV_CATEGORIES = [
  {
    id: 1,
    name: 'Hard Body Lures',
    slug: 'hard-body-lures',
    subcategories: [
      { id: 101, name: 'FLASH STRIKER', slug: 'flash-striker' }
    ]
  },
  {
    id: 2,
    name: 'Hooks',
    slug: 'hooks',
    subcategories: []
  },
  {
    id: 3,
    name: 'Metal Lures',
    slug: 'metal-lures',
    subcategories: []
  },
  {
    id: 4,
    name: 'Jigs',
    slug: 'jigs',
    subcategories: []
  }
];

export default function NotFound() {
  return (
    <>
      <link rel="stylesheet" href="/css/style.css?v=20261109-404" />
      <link rel="stylesheet" href="/css/flag-icons.min.css" />
      <Icons />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header categories={STATIC_NAV_CATEGORIES} />

      <main id="main" className="error-page">
        {/* Hero Section */}
        <section className="error-hero" aria-labelledby="error-title">
          <div className="error-hero__bg" aria-hidden="true">
            <img
              src="/images/404-hero-banner.webp"
              alt=""
              width="1920"
              height="1080"
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <div className="container error-hero__container">
            <div className="error-hero__copy">
              <nav className="ph-breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: '1.25rem' }}>
                <ol className="ph-breadcrumb__list">
                  <li className="ph-breadcrumb__item">
                    <Link href="/">Home</Link>
                  </li>
                  <li className="ph-breadcrumb__item ph-breadcrumb__item--current">
                    <span aria-current="page">404 Lost at Sea</span>
                  </li>
                </ol>
              </nav>

              <div className="error-badge">
                <span className="error-badge__dot" aria-hidden="true"></span>
                <span>Signal Lost // Error 404</span>
              </div>

              <h1 id="error-title" className="error-title">
                This One <span className="error-title__accent">Got Away.</span>
              </h1>

              <p className="error-lead">
                The page you were casting for has snapped the line, slipped off the hook, or plunged deep into uncharted waters. Don't let it spoil your catch — safe waters are just a cast away.
              </p>

              <div className="error-cta-group">
                <Link href="/" className="btn btn-primary">
                  <span>Return To Home</span>
                  <svg className="btn-icon" aria-hidden="true"><use href="#i-arrow" /></svg>
                </Link>
                <Link href="/products/flash-striker" className="btn btn-outline-light">
                  <span>Browse Products</span>
                  <svg className="btn-icon" aria-hidden="true"><use href="#i-arrow" /></svg>
                </Link>
                <Link href="/contact" className="btn btn-outline-light" style={{ borderColor: 'rgba(255,255,255,0.3)' }}>
                  <span>Contact Crew</span>
                </Link>
              </div>
            </div>

            <div className="error-hero__media" aria-hidden="true">
              <div className="error-hero__glow"></div>
              <div className="error-hero__card">
                <picture>
                  <source srcSet="/images/404-hook.svg" type="image/svg+xml" />
                  <source srcSet="/images/404-hook.webp" type="image/webp" />
                  <img
                    src="/images/404-hook.png"
                    alt="404 - Fishing hook submerged in deep ocean with snapped leader line"
                    width="1200"
                    height="800"
                    className="error-hero__image"
                    decoding="async"
                  />
                </picture>
              </div>
            </div>
          </div>
        </section>

        {/* Discovery Range Section */}
        <section className="error-categories" aria-labelledby="range-title">
          <div className="container">
            <header className="error-categories__head">
              <p className="section-eyebrow">Cast In A New Direction</p>
              <h2 id="range-title" className="section-title">Explore Our Range</h2>
              <p>Find heavy-duty commercial tackle, tournament-grade hard body lures, and engineered hooks built for trophy catches.</p>
            </header>

            <div className="error-grid">
              <Link href="/products/hooks" className="error-card">
                <div className="error-card__icon" aria-hidden="true">
                  <svg><use href="#i-strength" /></svg>
                </div>
                <h3 className="error-card__title">Fishing Hooks</h3>
                <p className="error-card__desc">
                  High-carbon forged saltwater, treble, circle, and commercial big-game hooks built to stay set.
                </p>
                <span className="error-card__action">
                  <span>Explore Hooks</span>
                  <svg aria-hidden="true"><use href="#i-arrow" /></svg>
                </span>
              </Link>

              <Link href="/products/flash-striker" className="error-card">
                <div className="error-card__icon" aria-hidden="true">
                  <svg><use href="#i-quality" /></svg>
                </div>
                <h3 className="error-card__title">FLASH STRIKER Lures</h3>
                <p className="error-card__desc">
                  Japanese-designed hard-body lures featuring internal holographic flash foil and darting action.
                </p>
                <span className="error-card__action">
                  <span>Explore Lures</span>
                  <svg aria-hidden="true"><use href="#i-arrow" /></svg>
                </span>
              </Link>

              <Link href="/products/metal-lures" className="error-card">
                <div className="error-card__icon" aria-hidden="true">
                  <svg><use href="#i-catalog" /></svg>
                </div>
                <h3 className="error-card__title">Metal Lures</h3>
                <p className="error-card__desc">
                  Aerodynamic casting spoons and fast-sinking metal lures for long casts and deep surface blitzes.
                </p>
                <span className="error-card__action">
                  <span>Explore Metals</span>
                  <svg aria-hidden="true"><use href="#i-arrow" /></svg>
                </span>
              </Link>

              <Link href="/products/jigs" className="error-card">
                <div className="error-card__icon" aria-hidden="true">
                  <svg><use href="#i-strength" /></svg>
                </div>
                <h3 className="error-card__title">Fishing Jigs</h3>
                <p className="error-card__desc">
                  Slow-pitch and vertical jigging setups rigged with ultra-strong assist hooks for deep reef monsters.
                </p>
                <span className="error-card__action">
                  <span>Explore Jigs</span>
                  <svg aria-hidden="true"><use href="#i-arrow" /></svg>
                </span>
              </Link>

              <Link href="/dealers" className="error-card">
                <div className="error-card__icon" aria-hidden="true">
                  <svg><use href="#i-dealer" /></svg>
                </div>
                <h3 className="error-card__title">Dealer Network</h3>
                <p className="error-card__desc">
                  Locate authorized tackle shops or apply to become an official PULLER distributor in your region.
                </p>
                <span className="error-card__action">
                  <span>View Dealers</span>
                  <svg aria-hidden="true"><use href="#i-arrow" /></svg>
                </span>
              </Link>

              <Link href="/contact" className="error-card">
                <div className="error-card__icon" aria-hidden="true">
                  <svg><use href="#i-mail" /></svg>
                </div>
                <h3 className="error-card__title">Contact Sales</h3>
                <p className="error-card__desc">
                  Get in touch for wholesale inquiries, custom orders, dealer pricing, or technical specifications.
                </p>
                <span className="error-card__action">
                  <span>Get In Touch</span>
                  <svg aria-hidden="true"><use href="#i-arrow" /></svg>
                </span>
              </Link>
            </div>
          </div>
        </section>

        {/* Assistance Bar */}
        <section className="error-assist" aria-label="Customer Assistance">
          <div className="container error-assist__inner">
            <div className="error-assist__copy">
              <h3>Still Need Help Navigating?</h3>
              <p>Our tackle specialists are available for specs, order support, and dealer questions.</p>
            </div>
            <div className="error-assist__links">
              <a href="mailto:sales@pullertackle.com" className="error-assist__link">
                <svg width="18" height="18" aria-hidden="true"><use href="#i-mail" /></svg>
                <span>sales@pullertackle.com</span>
              </a>
              <a
                data-whatsapp
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="error-assist__link"
              >
                <svg width="18" height="18" aria-hidden="true"><use href="#i-whatsapp" /></svg>
                <span>WhatsApp Desk</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer socialLinks={DEFAULT_SOCIAL_LINKS} />
      <SiteInteractions socialLinks={DEFAULT_SOCIAL_LINKS} />
    </>
  );
}
