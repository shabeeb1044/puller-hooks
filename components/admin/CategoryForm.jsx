'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageField from './ImageField';
import MenuLinkFields from './MenuLinkFields';
import { menuLinkPayload, normalizeMenuLinkType } from '@/lib/menuLinks';

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function normalizeTheme(value, fallback = 'black') {
  if (value === 'yellow' || value === 'black') return value;
  return fallback === 'yellow' ? 'yellow' : 'black';
}

function ThemePicker({ label = 'Section background', value, onChange, name }) {
  return (
    <div className="admin-field">
      <label>{label}</label>
      <div className="admin-theme-picker" role="radiogroup" aria-label={label}>
        <button
          type="button"
          className={`admin-theme-dot admin-theme-dot--dark${value === 'black' ? ' is-active' : ''}`}
          onClick={() => onChange('black')}
          aria-pressed={value === 'black'}
          aria-label="Dark background"
          title="Dark"
        />
        <button
          type="button"
          className={`admin-theme-dot admin-theme-dot--yellow${value === 'yellow' ? ' is-active' : ''}`}
          onClick={() => onChange('yellow')}
          aria-pressed={value === 'yellow'}
          aria-label="Yellow background"
          title="Yellow"
        />
        <span className="admin-theme-dot-label">{value === 'yellow' ? 'Yellow' : 'Dark'}</span>
      </div>
      <input type="hidden" name={name} value={value} readOnly />
    </div>
  );
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  image: '',
  bannerImage: '',
  visible: true,
  sortOrder: 0,
  menuLinkType: 'page',
  menuAnchor: '',
  menuProductId: '',
  pageSubtitle: '',
  pageTitle: '',
  pageLead: '',
  introSubtitle: '',
  introTitle: '',
  productsSubtitle: '',
  productsTitle: '',
  productsLead: '',
  bannerTheme: 'black',
  introTheme: 'black',
  productsTheme: 'black',
};

export default function CategoryForm({ categoryId }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!categoryId);
  const [productCount, setProductCount] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!categoryId) return;
    fetch(`/api/admin/categories/${categoryId}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'Failed to load');
        const c = d.category;
        const legacy = c.pageTheme === 'yellow' ? 'yellow' : 'black';
        setForm({
          name: c.name || '',
          slug: c.slug || '',
          description: c.description || '',
          image: c.image || '',
          bannerImage: c.bannerImage || '',
          visible: c.visible !== false,
          sortOrder: c.sortOrder ?? 0,
          menuLinkType: normalizeMenuLinkType(c.menuLinkType),
          menuAnchor: c.menuAnchor || '',
          menuProductId: c.menuProductId || '',
          pageSubtitle: c.pageSubtitle || '',
          pageTitle: c.pageTitle || '',
          pageLead: c.pageLead || '',
          introSubtitle: c.introSubtitle || '',
          introTitle: c.introTitle || '',
          productsSubtitle: c.productsSubtitle || '',
          productsTitle: c.productsTitle || '',
          productsLead: c.productsLead || '',
          bannerTheme: normalizeTheme(c.bannerTheme, legacy),
          introTheme: normalizeTheme(c.introTheme, legacy),
          productsTheme: normalizeTheme(c.productsTheme, legacy),
        });
        setProductCount(c._count?.products ?? c.products?.length ?? null);
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
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
        ...menuLinkPayload(form),
        // Keep legacy field in sync with products section for older readers
        pageTheme: form.productsTheme,
      };
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

      <fieldset className="admin-form-section">
        <legend>Basics</legend>
        <p className="admin-form-section-desc">Category identity and navigation settings.</p>
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
        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="sortOrder">Sort order</label>
            <input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} />
          </div>
          <div className="admin-field admin-field-check">
            <label>
              <input type="checkbox" checked={form.visible} onChange={(e) => setField('visible', e.target.checked)} /> Visible in navigation
            </label>
          </div>
        </div>
        <MenuLinkFields
          pageLabel="Category page"
          menuLinkType={form.menuLinkType}
          menuAnchor={form.menuAnchor}
          menuProductId={form.menuProductId}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        />
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>Section 01 — Banner</legend>
        <p className="admin-form-section-desc">Breadcrumb / hero block at the top of the category page.</p>
        <ThemePicker value={form.bannerTheme} onChange={(v) => setField('bannerTheme', v)} name="bannerTheme" />
        <div className="admin-field">
          <label htmlFor="pageSubtitle">Subtitle</label>
          <input
            id="pageSubtitle"
            value={form.pageSubtitle}
            onChange={(e) => setField('pageSubtitle', e.target.value)}
            placeholder="PULLER Products"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="pageTitle">Heading</label>
          <input id="pageTitle" value={form.pageTitle} onChange={(e) => setField('pageTitle', e.target.value)} />
        </div>
        <div className="admin-field">
          <label htmlFor="pageLead">Description</label>
          <textarea id="pageLead" rows={3} value={form.pageLead} onChange={(e) => setField('pageLead', e.target.value)} />
        </div>
        <ImageField label="Background image" name="bannerImage" value={form.bannerImage} onChange={(v) => setField('bannerImage', v)} />
        <p className="hint">Background image is used on Dark theme. Yellow theme uses the solid logo yellow.</p>
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>Section 02 — Intro</legend>
        <p className="admin-form-section-desc">Copy on the left, image on the right.</p>
        <ThemePicker value={form.introTheme} onChange={(v) => setField('introTheme', v)} name="introTheme" />
        <div className="admin-field">
          <label htmlFor="introSubtitle">Subtitle</label>
          <input
            id="introSubtitle"
            value={form.introSubtitle}
            onChange={(e) => setField('introSubtitle', e.target.value)}
            placeholder="Our Range"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="introTitle">Heading</label>
          <input
            id="introTitle"
            value={form.introTitle}
            onChange={(e) => setField('introTitle', e.target.value)}
            placeholder={form.name || 'Category name'}
          />
          <p className="hint">Leave blank to use the category name.</p>
        </div>
        <div className="admin-field">
          <label htmlFor="description">Description</label>
          <textarea id="description" rows={4} value={form.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
        <ImageField label="Right side image" name="image" value={form.image} onChange={(v) => setField('image', v)} />
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>Section 03 — Products</legend>
        <p className="admin-form-section-desc">
          Product styles block (grouped red buttons). Red buttons stay red on Yellow and Dark.
        </p>
        <ThemePicker value={form.productsTheme} onChange={(v) => setField('productsTheme', v)} name="productsTheme" />
        <div className="admin-field">
          <label htmlFor="productsSubtitle">Subtitle</label>
          <input
            id="productsSubtitle"
            value={form.productsSubtitle}
            onChange={(e) => setField('productsSubtitle', e.target.value)}
            placeholder="Hook Styles"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="productsTitle">Heading</label>
          <input
            id="productsTitle"
            value={form.productsTitle}
            onChange={(e) => setField('productsTitle', e.target.value)}
            placeholder="Designed for every technique"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="productsLead">Description</label>
          <textarea
            id="productsLead"
            rows={3}
            value={form.productsLead}
            onChange={(e) => setField('productsLead', e.target.value)}
            placeholder="From classic round bend patterns to specialty bait hooks…"
          />
        </div>
        {categoryId ? (
          <div className="admin-form-section-note">
            <p>
              {productCount == null
                ? 'Manage products for this category in Products.'
                : `${productCount} product${productCount === 1 ? '' : 's'} linked to this category. Groups use subcategory names.`}
            </p>
            <a className="admin-btn admin-btn-ghost admin-btn-sm" href={`/admin/products?categoryId=${categoryId}`}>
              Manage products
            </a>
          </div>
        ) : (
          <p className="hint">Save the category first, then add products under Products.</p>
        )}
      </fieldset>

      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : categoryId ? 'Update category' : 'Create category'}
        </button>
        <button className="admin-btn admin-btn-ghost" type="button" onClick={() => router.push('/admin/categories')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
