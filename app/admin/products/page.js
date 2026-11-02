'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import SortableList from '@/components/admin/SortableList';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get('categoryId') || '';
    if (fromUrl) setCategoryId(fromUrl);
  }, []);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcategoryId('');
      return;
    }
    fetch(`/api/admin/subcategories?categoryId=${categoryId}`)
      .then((r) => r.json())
      .then((d) => setSubcategories(d.subcategories || []))
      .catch(() => setSubcategories([]));
    setSubcategoryId('');
  }, [categoryId]);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    if (categoryId) params.set('categoryId', categoryId);
    if (subcategoryId) params.set('subcategoryId', subcategoryId);
    const res = await fetch(`/api/admin/products?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load');
    setProducts(data.products || []);
  }, [q, status, categoryId, subcategoryId]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function reorder(ids) {
    await fetch('/api/admin/products/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Delete failed');
      return;
    }
    load().catch((e) => setError(e.message));
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Products</h1>
          <p>Create, edit, publish, and reorder products. Drag rows to change display order.</p>
        </div>
        <Link className="admin-btn" href="/admin/products/new">Add product</Link>
      </div>

      {error ? <div className="admin-error">{error}</div> : null}

      <div className="admin-panel">
        <div className="admin-toolbar">
          <input
            placeholder="Search products"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            style={{ maxWidth: 220 }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={subcategoryId}
            onChange={(e) => setSubcategoryId(e.target.value)}
            style={{ maxWidth: 220 }}
            disabled={!categoryId}
          >
            <option value="">All subcategories</option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 180 }}>
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <SortableList
          items={products}
          onReorder={reorder}
          renderRow={(item, { header }) => {
            if (header) {
              return (
                <>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Layout</th>
                  <th></th>
                </>
              );
            }
            return (
              <>
                <td>{item.image ? <img className="thumb" src={item.image} alt="" /> : '—'}</td>
                <td>
                  <strong>{item.name}</strong>
                  <div style={{ color: '#9aa0a8', fontSize: '0.8rem' }}>{item.slug}</div>
                </td>
                <td>
                  {item.category?.name}
                  {item.subcategory ? ` / ${item.subcategory.name}` : ''}
                </td>
                <td><StatusBadge status={item.status} /></td>
                <td>{item.layout}</td>
                <td>
                  <div className="admin-actions">
                    <Link className="admin-btn admin-btn-ghost admin-btn-sm" href={`/admin/products/${item.id}`}>Edit</Link>
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
