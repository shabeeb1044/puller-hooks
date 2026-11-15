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
      <link rel="stylesheet" href="/css/style.css?v=20261115-404" />
      <link rel="stylesheet" href="/css/flag-icons.min.css" />
      <Icons />
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header categories={STATIC_NAV_CATEGORIES} />

      <main id="main" className="error-page">
        <section className="error-simple" aria-label="Page not found">
          <img
            src="/images/404-not-found.jpg?v=3"
            alt="404 page not found"
            width="1280"
            height="720"
            className="error-simple__image"
            decoding="async"
            fetchPriority="high"
          />
          <Link href="/" className="btn btn-primary">
            <span>Return To Home</span>
            <svg className="btn-icon" aria-hidden="true"><use href="#i-arrow" /></svg>
          </Link>
        </section>
      </main>

      <Footer socialLinks={DEFAULT_SOCIAL_LINKS} />
      <SiteInteractions socialLinks={DEFAULT_SOCIAL_LINKS} />
    </>
  );
}
