'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function isCurrent(pathname, href) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(href + '/');
}

function categoryHref(category) {
  // Preserve legacy URLs for seeded categories
  if (category.slug === 'hard-body-lures') {
    const flash = category.subcategories?.find((s) => s.slug === 'flash-striker');
    if (flash) return `/products/flash-striker`;
  }
  return `/products/${category.slug}`;
}

function subcategoryHref(category, subcategory) {
  if (category.slug === 'hard-body-lures' && subcategory.slug === 'flash-striker') {
    return '/products/flash-striker';
  }
  if (category.slug === 'hooks' && !subcategory) {
    return '/products/hooks';
  }
  return `/products/${category.slug}/${subcategory.slug}`;
}

export default function Header({ categories = [] }) {
  const pathname = usePathname();
  const homeProducts = pathname === '/' ? '#products' : '/#products';
  const homeTop = pathname === '/' ? '#top' : '/#top';
  const dealersHref =
    pathname.startsWith('/products/flash-striker') ? '#dealers' : '/dealers';

  const storyCurrent = isCurrent(pathname, '/our-story');
  const dealersCurrent = isCurrent(pathname, '/dealers');
  const contactCurrent = isCurrent(pathname, '/contact');

  return (
    <header className="site-header" id="top">
      <div className="container header-inner">
        <Link href="/" className="logo" aria-label="PULLER Flash Striker – home">
          <img
            src="/images/logo.webp"
            alt="PULLER Flash Striker fishing hooks and lures"
            width="640"
            height="320"
            decoding="async"
          />
        </Link>

        <button
          className="nav-toggle"
          id="navToggle"
          aria-label="Open menu"
          aria-expanded="false"
          aria-controls="mainNav"
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className="main-nav" id="mainNav" aria-label="Main navigation">
          <ul className="nav-list">
            <li>
              <Link href={homeTop} className={pathname === '/' ? 'is-current' : undefined}>
                Home
              </Link>
            </li>
            <li className="has-dropdown">
              <div className="nav-item">
                <Link href={homeProducts}>Products</Link>
                <button
                  type="button"
                  className="nav-plus"
                  aria-expanded="false"
                  aria-controls="menu-products"
                  aria-label="Open products menu"
                ></button>
              </div>
              <ul className="dropdown" id="menu-products">
                {categories.map((category) => {
                  const hasSubs = category.subcategories?.length > 0;
                  const catHref = categoryHref(category);
                  const catCurrent = isCurrent(pathname, catHref) || isCurrent(pathname, `/products/${category.slug}`);

                  if (hasSubs) {
                    return (
                      <li className="has-dropdown" key={category.id}>
                        <div className="nav-item">
                          <Link href={catHref} className={catCurrent ? 'is-current' : undefined}>
                            {category.name}
                          </Link>
                          <button
                            type="button"
                            className="nav-plus"
                            aria-expanded="false"
                            aria-controls={`menu-${category.slug}`}
                            aria-label={`Open ${category.name} menu`}
                          ></button>
                        </div>
                        <ul className="dropdown" id={`menu-${category.slug}`}>
                          {category.subcategories.map((sub) => {
                            const href = subcategoryHref(category, sub);
                            const current = isCurrent(pathname, href);
                            return (
                              <li key={sub.id}>
                                <Link
                                  href={href}
                                  className={current ? 'is-current' : undefined}
                                  aria-current={current ? 'page' : undefined}
                                >
                                  {sub.name}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  }

                  return (
                    <li key={category.id}>
                      <Link
                        href={catHref}
                        className={catCurrent ? 'is-current' : undefined}
                        aria-current={catCurrent ? 'page' : undefined}
                      >
                        {category.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
            <li>
              <Link
                href="/our-story"
                className={storyCurrent ? 'is-current' : undefined}
                aria-current={storyCurrent ? 'page' : undefined}
              >
                Our Story
              </Link>
            </li>
            <li>
              <Link
                href={dealersHref}
                className={dealersCurrent ? 'is-current' : undefined}
                aria-current={dealersCurrent ? 'page' : undefined}
              >
                Dealers
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className={contactCurrent ? 'is-current' : undefined}
                aria-current={contactCurrent ? 'page' : undefined}
              >
                Contact Us
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
