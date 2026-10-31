'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageField from './ImageField';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function SubcategoryForm({ subcategoryId }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!subcategoryId);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    categoryId: '',
    description: '',
    image: '',
    bannerImage: '',
    visible: true,
    sortOrder: 0,
    pageTitle: '',
    pageLead: '',
  });

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (!subcategoryId) return;
    fetch(`/api/admin/subcategories/${subcategoryId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load');
        const s = d.subcategory;
        setForm({
          name: s.name || '',
          slug: s.slug || '',
          categoryId: s.categoryId || '',
          description: s.description || '',
          image: s.image || '',
          bannerImage: s.bannerImage || '',
          visible: s.visible !== false,
          sortOrder: s.sortOrder ?? 0,
          pageTitle: s.pageTitle || '',
          pageLead: s.pageLead || '',
        });
        setSlugTouched(true);
      })
      .catch((e) => setError(e.message));
  }, [subcategoryId]);

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !slugTouched) next.slug = slugify(value);
      return next;
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, sortOrder: Number(form.sortOrder) || 0 };
      const res = await fetch(
        subcategoryId ? `/api/admin/subcategories/${subcategoryId}` : '/api/admin/subcategories',
        {
          method: subcategoryId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      router.push('/admin/subcategories');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={onSubmit}>
      {error ? <div className="admin-error">{error}</div> : null}
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="name">Name</label>
          <input id="name" value={form.name} onChange={(e) => setField('name', e.target.value)} required />
        </div>
        <div className="admin-field">
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setField('slug', e.target.value);
            }}
            required
          />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="categoryId">Category</label>
        <select id="categoryId" value={form.categoryId} onChange={(e) => setField('categoryId', e.target.value)} required>
          <option value="">Select category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="admin-field">
        <label htmlFor="description">Description</label>
        <textarea id="description" rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} />
      </div>
      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="pageTitle">Page title</label>
          <input id="pageTitle" value={form.pageTitle} onChange={(e) => setField('pageTitle', e.target.value)} />
        </div>
        <div className="admin-field">
          <label htmlFor="sortOrder">Sort order</label>
          <input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} />
        </div>
      </div>
      <div className="admin-field">
        <label htmlFor="pageLead">Page lead</label>
        <textarea id="pageLead" rows={3} value={form.pageLead} onChange={(e) => setField('pageLead', e.target.value)} />
      </div>
      <ImageField label="Image" name="image" value={form.image} onChange={(v) => setField('image', v)} />
      <ImageField label="Banner image" name="bannerImage" value={form.bannerImage} onChange={(v) => setField('bannerImage', v)} />
      <div className="admin-field">
        <label>
          <input type="checkbox" checked={form.visible} onChange={(e) => setField('visible', e.target.checked)} /> Visible in navigation
        </label>
      </div>
      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : subcategoryId ? 'Update subcategory' : 'Create subcategory'}
        </button>
        <button className="admin-btn admin-btn-ghost" type="button" onClick={() => router.push('/admin/subcategories')}>Cancel</button>
      </div>
    </form>
  );
}
