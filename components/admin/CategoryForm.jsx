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

export default function CategoryForm({ categoryId }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!categoryId);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    bannerImage: '',
    visible: true,
    sortOrder: 0,
    pageTitle: '',
    pageLead: '',
  });

  useEffect(() => {
    if (!categoryId) return;
    fetch(`/api/admin/categories/${categoryId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load');
        const c = d.category;
        setForm({
          name: c.name || '',
          slug: c.slug || '',
          description: c.description || '',
          image: c.image || '',
          bannerImage: c.bannerImage || '',
          visible: c.visible !== false,
          sortOrder: c.sortOrder ?? 0,
          pageTitle: c.pageTitle || '',
          pageLead: c.pageLead || '',
        });
        setSlugTouched(true);
      })
      .catch((e) => setError(e.message));
  }, [categoryId]);

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
      const res = await fetch(categoryId ? `/api/admin/categories/${categoryId}` : '/api/admin/categories', {
        method: categoryId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      router.push('/admin/categories');
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
          {saving ? 'Saving…' : categoryId ? 'Update category' : 'Create category'}
        </button>
        <button className="admin-btn admin-btn-ghost" type="button" onClick={() => router.push('/admin/categories')}>Cancel</button>
      </div>
    </form>
  );
}
