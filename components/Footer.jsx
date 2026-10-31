'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const metal = pathname === '/' ? '#card-metal' : '/#card-metal';
  const jigs = pathname === '/' ? '#card-jigs' : '/#card-jigs';
  const products = pathname === '/' ? '#products' : '/#products';
  const dealers = pathname === '/' ? '#dealers' : '/dealers';

  return (
    <>
      <footer className="site-footer" id="footer">
        <div className="footer-bg-layer" aria-hidden="true"></div>
        <div className="footer-glow" aria-hidden="true"></div>

        <div className="container footer-content">
          <div className="footer-newsletter">
            <div className="newsletter-copy">
              <h2 className="newsletter-title">NEVER LOSE A CATCH</h2>
              <p className="newsletter-sub">Get hook updates, exclusive gear &amp; pro tips delivered.</p>
            </div>
            <form className="newsletter-form" id="newsletterForm" noValidate>
              <div className="newsletter-field">
                <input
                  type="email"
                  name="newsletter_email"
                  id="newsletterEmail"
                  placeholder="Enter your email"
                  aria-label="Email address for hook updates"
                  required
                />
                <button type="submit" className="btn-hooked" id="newsletterSubmit">
                  <span>GET HOOKED</span>
                  <svg className="hook-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path
                      d="M6 3.5L10.5 8L6 12.5"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
              <p className="newsletter-status" id="newsletterStatus" role="status" aria-live="polite"></p>
            </form>
          </div>

          <div className="footer-grid">
            <div className="footer-col">
              <h3 className="footer-col-title">OUR HOOKS</h3>
              <ul className="footer-links">
                <li>
                  <Link href="/products/hooks">Fishing Hooks</Link>
                </li>
                <li>
                  <Link href="/products/flash-striker">FLASH STRIKER</Link>
                </li>
                <li>
                  <Link href={metal}>Metal Lures</Link>
                </li>
                <li>
                  <Link href={jigs}>Jigs</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">OUR STORY</h3>
              <ul className="footer-links">
                <li>
                  <Link href="/our-story">Our Story</Link>
                </li>
                <li>
                  <Link href={products}>Products</Link>
                </li>
                <li>
                  <Link href={dealers}>Authorized Dealers</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col">
              <h3 className="footer-col-title">SUPPORT</h3>
              <ul className="footer-links">
                <li>
                  <Link href="/contact">Size &amp; Rigging Guide</Link>
                </li>
                <li>
                  <Link href="/contact">Care &amp; Maintenance</Link>
                </li>
                <li>
                  <Link href="/contact">Warranty &amp; Returns</Link>
                </li>
                <li>
                  <Link href="/contact">FAQ</Link>
                </li>
              </ul>
            </div>

            <div className="footer-col footer-col--contact">
              <h3 className="footer-col-title">CONTACT</h3>
              <div className="footer-contact-info">
                <p>
                  <span>Sales:</span>{' '}
                  <a href="mailto:sales@pullertackle.com">sales@pullertackle.com</a>
                </p>
                <p>
                  <span>Products:</span> Specs, availability &amp; pricing
                </p>
                <p>
                  <span>Dealers:</span> Worldwide partnerships
                </p>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <div className="footer-brand">
              <Link href="/" className="logo logo--footer" aria-label="PULLER home">
                <img
                  src="/images/logo.webp"
                  alt="PULLER Flash Striker"
                  width="640"
                  height="320"
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <p className="copyright">
                © <span id="year">2026</span> PULLER Co., Ltd. All rights reserved.
              </p>
            </div>

            <div className="footer-social-wrap">
              <div className="footer-socials" aria-label="Social media links">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="YouTube"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  data-whatsapp
                  href="https://wa.me/919539470261"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  aria-label="WhatsApp"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <use href="#i-whatsapp" />
                  </svg>
                </a>
              </div>

              <div className="footer-sparkle" aria-hidden="true">
                <svg viewBox="0 0 32 32" fill="currentColor">
                  <path d="M16 0C16 8.837 8.837 16 0 16C8.837 16 16 23.163 16 32C16 23.163 23.163 16 32 16C23.163 16 16 8.837 16 0Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="float-actions" aria-label="Quick social links">
        <a
          className="instagram-float"
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow us on Instagram"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        </a>
        <a
          className="whatsapp-float"
          data-whatsapp
          href="https://wa.me/919539470261"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
        >
          <svg aria-hidden="true">
            <use href="#i-whatsapp" />
          </svg>
        </a>
      </div>
    </>
  );
}
