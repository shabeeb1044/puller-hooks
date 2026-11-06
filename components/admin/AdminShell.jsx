'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const LINKS = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/subcategories', label: 'Subcategories' },
  { href: '/admin/dealer-network', label: 'Dealer Network' },
  { href: '/admin/dealers', label: 'Dealers Inquiries' },
  { href: '/admin/contact-inquiries', label: 'Contact Inquiries' },
  { href: '/admin/settings', label: 'Settings' },
];

function isActive(pathname, href, exact) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export default function AdminShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  // Default = light mode. Persist preference in localStorage.
  const [darkMode, setDarkMode] = useState(false);

  // Restore saved preference on mount (client-only)
  useEffect(() => {
    const saved = localStorage.getItem('admin-theme');
    if (saved === 'dark') setDarkMode(true);
  }, []);

  function toggleTheme() {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('admin-theme', next ? 'dark' : 'light');
      return next;
    });
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/management-portal');
    router.refresh();
  }

  const bodyClass = ['admin-body', darkMode ? 'dark-mode' : ''].filter(Boolean).join(' ');

  return (
    <div className={bodyClass}>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            <Link href="/admin" className="admin-brand-logo" aria-label="PULLER Admin – Dashboard">
              <img
                src={darkMode ? '/images/og-image.png' : '/images/logo.webp'}
                alt="PULLER"
                width="160"
                height="80"
                decoding="async"
              />
            </Link>
            <span>Admin CMS</span>
          </div>
          <nav className="admin-nav" aria-label="Admin">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={isActive(pathname, link.href, link.exact) ? 'is-active' : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="admin-sidebar-foot">
            {/* ── Dark / Light toggle ── */}
            <button
              type="button"
              className="admin-theme-toggle"
              onClick={toggleTheme}
              aria-pressed={darkMode}
              aria-label={darkMode ? 'Switch to Light mode' : 'Switch to Dark mode'}
              style={{ marginBottom: '0.65rem' }}
            >
              <span className="admin-toggle-track">
                <span className="admin-toggle-thumb" />
              </span>
              {darkMode ? '☀ Light' : '☾ Dark'}
            </button>

            <button type="button" className="admin-btn admin-btn-ghost" onClick={logout} style={{ width: '100%' }}>
              Logout
            </button>
          </div>
        </aside>
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
