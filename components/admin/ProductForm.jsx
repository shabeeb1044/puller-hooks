'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageField from './ImageField';

function linesFromJson(value) {
  if (!value) return '';
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.join('\n') : String(value);
  } catch {
    return String(value);
  }
}

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeUrl(value) {
  const trimmed = String(value || '').trim();
  return trimmed || '#';
}

export default function ProductForm({ productId }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!productId);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    specifications: '',
    features: '',
    image: '',
    imageAlt: '',
    status: 'draft',
    layout: 'horizontal',
    imageStyle: 'contain',
    sortOrder: 0,
    ctaLabel: 'Inquiry now',
    ctaHref: '/dealers#apply',
    searchTerms: '',
    categoryId: '',
    subcategoryId: '',
  });

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  // Prefill category / subcategory / layout from Manage products / new URL query
  useEffect(() => {
    if (productId || typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const categoryId = params.get('categoryId') || '';
    const subcategoryId = params.get('subcategoryId') || '';
    const layout = params.get('layout') === 'vertical' ? 'vertical' : '';
    if (!categoryId && !subcategoryId && !layout) return;
    setForm((prev) => ({
      ...prev,
      ...(categoryId ? { categoryId } : {}),
      ...(subcategoryId ? { subcategoryId } : {}),
      ...(layout
        ? {
            layout: 'vertical',
            ctaHref: '#',
            image: '',
            imageAlt: '',
          }
        : {}),
    }));
  }, [productId]);

  useEffect(() => {
    if (!productId) return;
    fetch(`/api/admin/products/${productId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load');
        const p = d.product;
        const isVertical = p.layout === 'vertical';
        setForm({
          name: p.name || '',
          slug: p.slug || '',
          description: p.description || '',
          specifications: linesFromJson(p.specifications),
          features: linesFromJson(p.features),
          image: isVertical ? '' : p.image || '',
          imageAlt: isVertical ? '' : p.imageAlt || '',
          status: p.status || 'draft',
          layout: p.layout || 'horizontal',
          imageStyle: p.imageStyle === 'vertical' ? 'vertical' : 'contain',
          sortOrder: p.sortOrder ?? 0,
          ctaLabel: p.ctaLabel || 'Inquiry now',
          ctaHref: isVertical ? p.ctaHref || '#' : p.ctaHref || '/dealers#apply',
          searchTerms: p.searchTerms || '',
          categoryId: p.categoryId || '',
          subcategoryId: p.subcategoryId || '',
        });
        setSlugTouched(true);
      })
      .catch((e) => setError(e.message));
  }, [productId]);

  useEffect(() => {
    if (!form.categoryId) {
      setSubcategories([]);
      return;
    }
    fetch(`/api/admin/subcategories?categoryId=${form.categoryId}`)
      .then((r) => r.json())
      .then((d) => setSubcategories(d.subcategories || []));
  }, [form.categoryId]);

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && !slugTouched) next.slug = slugify(value);
      if (key === 'categoryId') next.subcategoryId = '';
      if (key === 'layout') {
        if (value === 'vertical') {
          next.image = '';
          next.imageAlt = '';
          if (!prev.ctaHref || prev.ctaHref === '/dealers#apply' || prev.ctaHref === '/contact') {
            next.ctaHref = '#';
          }
        } else if (!prev.ctaHref || prev.ctaHref === '#') {
          next.ctaHref = '/dealers#apply';
        }
      }
      return next;
    });
  }

  const isNameButton = form.layout === 'vertical';

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
        subcategoryId: form.subcategoryId || null,
        ctaHref: normalizeUrl(form.ctaHref),
        imageStyle: isNameButton
          ? 'contain'
          : form.imageStyle === 'vertical'
            ? 'vertical'
            : 'contain',
        ...(isNameButton
          ? {
              image: '',
              imageAlt: '',
              ctaLabel: form.ctaLabel || 'Inquiry now',
            }
          : {}),
      };
      const res = await fetch(productId ? `/api/admin/products/${productId}` : '/api/admin/products', {
        method: productId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      router.push(form.categoryId ? `/admin/products?categoryId=${form.categoryId}` : '/admin/products');
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
          <label htmlFor="name">Product name</label>
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

      <div className="admin-form-row">
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
          <label htmlFor="subcategoryId">Subcategory</label>
          <select id="subcategoryId" value={form.subcategoryId} onChange={(e) => setField('subcategoryId', e.target.value)}>
            <option value="">None</option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {isNameButton ? (
            <p className="hint">Groups on the category page use the subcategory name (e.g. Round Bend).</p>
          ) : null}
        </div>
      </div>

      <div className="admin-form-row">
        <div className="admin-field">
          <label htmlFor="status">Status</label>
          <select id="status" value={form.status} onChange={(e) => setField('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="admin-field">
          <label htmlFor="layout">Display layout</label>
          <select id="layout" value={form.layout} onChange={(e) => setField('layout', e.target.value)}>
            <option value="horizontal">Image card</option>
            <option value="vertical">Name button (red bar)</option>
          </select>
          <p className="hint">
            {isNameButton
              ? 'Shows as a red text option (no image). On subcategory pages this is Section 02 — Available Models; on category pages it is a name button in Products.'
              : 'Shows as an image card with CTA (Section 03 — Products).'}
          </p>
        </div>
      </div>

      {!isNameButton ? (
        <div className="admin-field">
          <label htmlFor="imageStyle">Image style</label>
          <select
            id="imageStyle"
            value={form.imageStyle === 'vertical' ? 'vertical' : 'contain'}
            onChange={(e) => setField('imageStyle', e.target.value)}
          >
            <option value="contain">Contain — as uploaded (recommended)</option>
            <option value="vertical">Vertical — rotated pack (hang-hole up)</option>
          </select>
          <p className="hint">
            {form.imageStyle === 'vertical'
              ? 'For landscape pack photos that should stand upright in a tall card.'
              : 'Shows the image at its uploaded proportions — height follows the file.'}
          </p>
        </div>
      ) : null}

      {isNameButton ? (
        <fieldset className="admin-form-section">
          <legend>Name button</legend>
          <p className="admin-form-section-desc">
            Model / name option — text only, no image. Optional URL; leave blank for #.
          </p>
          <div className="admin-form-row">
            <div className="admin-field">
              <label htmlFor="ctaHref">URL</label>
              <input
                id="ctaHref"
                value={form.ctaHref === '#' ? '' : form.ctaHref}
                onChange={(e) => setField('ctaHref', e.target.value)}
                placeholder="#"
              />
              <p className="hint">Leave blank to use # (no link destination).</p>
            </div>
            <div className="admin-field">
              <label htmlFor="sortOrder">Sort order</label>
              <input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} />
            </div>
          </div>
        </fieldset>
      ) : (
        <>
          <div className="admin-field">
            <label htmlFor="description">Description</label>
            <textarea id="description" rows={3} value={form.description} onChange={(e) => setField('description', e.target.value)} />
          </div>

          <div className="admin-form-row">
            <div className="admin-field">
              <label htmlFor="specifications">Specifications (one per line)</label>
              <textarea id="specifications" rows={5} value={form.specifications} onChange={(e) => setField('specifications', e.target.value)} />
            </div>
            <div className="admin-field">
              <label htmlFor="features">Features (one per line)</label>
              <textarea id="features" rows={5} value={form.features} onChange={(e) => setField('features', e.target.value)} />
            </div>
          </div>

          <ImageField label="Product image" value={form.image} onChange={(v) => setField('image', v)} />

          <div className="admin-form-row">
            <div className="admin-field">
              <label htmlFor="imageAlt">Image alt text</label>
              <input id="imageAlt" value={form.imageAlt} onChange={(e) => setField('imageAlt', e.target.value)} />
            </div>
            <div className="admin-field">
              <label htmlFor="sortOrder">Sort order</label>
              <input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} />
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-field">
              <label htmlFor="ctaLabel">CTA label</label>
              <input id="ctaLabel" value={form.ctaLabel} onChange={(e) => setField('ctaLabel', e.target.value)} />
            </div>
            <div className="admin-field">
              <label htmlFor="ctaHref">CTA link</label>
              <input id="ctaHref" value={form.ctaHref} onChange={(e) => setField('ctaHref', e.target.value)} />
            </div>
          </div>

          <div className="admin-field">
            <label htmlFor="searchTerms">Search terms</label>
            <input id="searchTerms" value={form.searchTerms} onChange={(e) => setField('searchTerms', e.target.value)} />
          </div>
        </>
      )}

      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : productId ? 'Update product' : 'Create product'}
        </button>
        <button
          className="admin-btn admin-btn-ghost"
          type="button"
          onClick={() =>
            router.push(form.categoryId ? `/admin/products?categoryId=${form.categoryId}` : '/admin/products')
          }
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
