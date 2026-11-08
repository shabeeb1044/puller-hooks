'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  categoryPageHref,
  isMenuHrefPlaceholder,
  normalizeMenuLinkType,
  resolveMenuHref,
  subcategoryPageHref,
} from '@/lib/menuLinks';

function isCurrent(pathname, href) {
  if (!pathname || !href || href.startsWith('#') || href.includes('#')) return false;
  if (href === '/') return pathname === '/';
  if (/^https?:\/\//i.test(href)) return false;
  return pathname === href || pathname.startsWith(href + '/');
}

/** Link when href is real; span.nav-label when #/empty (same format as static HTML). */
function MenuLabel({ href, className, children, ...props }) {
  if (isMenuHrefPlaceholder(href)) {
    return <span className={['nav-label', className].filter(Boolean).join(' ')}>{children}</span>;
  }
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}

export default function Header({ categories = [] }) {
  const rawPath = usePathname();
  const pathname = rawPath || '';
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
                  const pageHref = categoryPageHref(category);
                  const catHref = resolveMenuHref(category, { pathname, pageHref });
                  const linkType = normalizeMenuLinkType(category.menuLinkType);
                  const catCurrent =
                    linkType === 'page'
                      ? isCurrent(pathname, pageHref) || isCurrent(pathname, `/products/${category.slug}`)
                      : isCurrent(pathname, catHref);

                  if (hasSubs) {
                    return (
                      <li className="has-dropdown" key={category.id}>
                        <div className="nav-item">
                          <MenuLabel href={catHref} className={catCurrent ? 'is-current' : undefined}>
                            {category.name}
                          </MenuLabel>
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
                            const subPageHref = subcategoryPageHref(category, sub);
                            const href = resolveMenuHref(sub, { pathname, pageHref: subPageHref });
                            const current = isCurrent(pathname, href);
                            return (
                              <li key={sub.id}>
                                <MenuLabel
                                  href={href}
                                  className={current ? 'is-current' : undefined}
                                  aria-current={current ? 'page' : undefined}
                                >
                                  {sub.name}
                                </MenuLabel>
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                    );
                  }

                  return (
                    <li key={category.id}>
                      <MenuLabel
                        href={catHref}
                        className={catCurrent ? 'is-current' : undefined}
                        aria-current={catCurrent ? 'page' : undefined}
                      >
                        {category.name}
                      </MenuLabel>
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
