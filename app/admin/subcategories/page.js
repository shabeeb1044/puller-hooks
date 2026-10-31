'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import SortableList from '@/components/admin/SortableList';

export default function AdminSubcategoriesPage() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    const res = await fetch(`/api/admin/subcategories${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load');
    setItems(data.subcategories || []);
  }, [categoryId]);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function reorder(ids) {
    await fetch('/api/admin/subcategories/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  }

  async function remove(id) {
    if (!confirm('Delete this subcategory?')) return;
    const res = await fetch(`/api/admin/subcategories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Delete failed');
      return;
    }
    load().catch((e) => setError(e.message));
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Subcategories</h1>
          <p>Nest under categories for dropdown menus and product pages.</p>
        </div>
        <Link className="admin-btn" href="/admin/subcategories/new">Add subcategory</Link>
      </div>
      {error ? <div className="admin-error">{error}</div> : null}
      <div className="admin-panel">
        <div className="admin-toolbar">
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ maxWidth: 260 }}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <SortableList
          items={items}
          onReorder={reorder}
          renderRow={(item, { header }) => {
            if (header) {
              return (
                <>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Visible</th>
                  <th>Products</th>
                  <th></th>
                </>
              );
            }
            return (
              <>
                <td>
                  <strong>{item.name}</strong>
                  <div style={{ color: '#9aa0a8', fontSize: '0.8rem' }}>{item.slug}</div>
                </td>
                <td>{item.category?.name}</td>
                <td>{item.visible ? 'Yes' : 'No'}</td>
                <td>{item._count?.products || 0}</td>
                <td>
                  <div className="admin-actions">
                    <Link
                      className="admin-btn admin-btn-ghost admin-btn-sm"
                      href={`/products/${item.category?.slug}/${item.slug}`}
                      target="_blank"
                    >
                      View
                    </Link>
                    <Link className="admin-btn admin-btn-ghost admin-btn-sm" href={`/admin/subcategories/${item.id}`}>Edit</Link>
                    <button type="button" className="admin-btn admin-btn-red admin-btn-sm" onClick={() => remove(item.id)}>Delete</button>
                  </div>
                </td>
              </>
            );
          }}
        />
      </div>
    </>
  );
}
