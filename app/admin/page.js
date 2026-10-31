'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load');
        setStats(data);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of CMS content and form submissions.</p>
        </div>
        <Link className="admin-btn" href="/admin/products/new">
          Add product
        </Link>
      </div>

      {error ? <div className="admin-error">{error}</div> : null}

      <div className="admin-card-grid">
        <div className="admin-stat">
          <div className="label">Products</div>
          <div className="value">{stats?.products ?? '—'}</div>
        </div>
        <div className="admin-stat">
          <div className="label">Published</div>
          <div className="value">{stats?.publishedProducts ?? '—'}</div>
        </div>
        <div className="admin-stat">
          <div className="label">Categories</div>
          <div className="value">{stats?.categories ?? '—'}</div>
        </div>
        <div className="admin-stat">
          <div className="label">Subcategories</div>
          <div className="value">{stats?.subcategories ?? '—'}</div>
        </div>
        <div className="admin-stat">
          <div className="label">New dealer inquiries</div>
          <div className="value">{stats?.dealerNew ?? '—'}</div>
        </div>
        <div className="admin-stat">
          <div className="label">New contact inquiries</div>
          <div className="value">{stats?.contactNew ?? '—'}</div>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-actions">
          <Link className="admin-btn admin-btn-ghost" href="/admin/categories">Manage categories</Link>
          <Link className="admin-btn admin-btn-ghost" href="/admin/subcategories">Manage subcategories</Link>
          <Link className="admin-btn admin-btn-ghost" href="/admin/dealers">Dealer inquiries ({stats?.dealerTotal ?? 0})</Link>
          <Link className="admin-btn admin-btn-ghost" href="/admin/contact-inquiries">Contact inquiries ({stats?.contactTotal ?? 0})</Link>
        </div>
      </div>
    </>
  );
}
