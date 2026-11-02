'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import SortableList from '@/components/admin/SortableList';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/categories');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load');
    setCategories(data.categories || []);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function reorder(ids) {
    await fetch('/api/admin/categories/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids }),
    });
  }

  async function toggleVisible(cat) {
    const res = await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...cat, visible: !cat.visible }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Update failed');
      return;
    }
    load().catch((e) => setError(e.message));
  }

  async function remove(id) {
    if (!confirm('Delete this category and its products/subcategories?')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
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
          <h1>Categories</h1>
          <p>Manage Products menu categories, order, and visibility.</p>
        </div>
        <Link className="admin-btn" href="/admin/categories/new">Add category</Link>
      </div>
      {error ? <div className="admin-error">{error}</div> : null}
      <div className="admin-panel">
        <SortableList
          items={categories}
          onReorder={reorder}
          renderRow={(item, { header }) => {
            if (header) {
              return (
                <>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Menu link</th>
                  <th>Visible</th>
                  <th>Counts</th>
                  <th></th>
                </>
              );
            }
            return (
              <>
                <td><strong>{item.name}</strong></td>
                <td>{item.slug}</td>
                <td>
                  {item.menuLinkType === 'product'
                    ? 'Product'
                    : item.menuLinkType === 'custom' || item.menuLinkType === 'section'
                      ? item.menuAnchor || 'Custom'
                      : 'Category page'}
                </td>
                <td>
                  <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => toggleVisible(item)}>
                    {item.visible ? 'Visible' : 'Hidden'}
                  </button>
                </td>
                <td>{item._count?.subcategories || 0} subs · {item._count?.products || 0} products</td>
                <td>
                  <div className="admin-actions">
                    <Link className="admin-btn admin-btn-ghost admin-btn-sm" href={`/products/${item.slug}`} target="_blank">
                      View
                    </Link>
                    <Link className="admin-btn admin-btn-ghost admin-btn-sm" href={`/admin/categories/${item.id}`}>Edit</Link>
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
