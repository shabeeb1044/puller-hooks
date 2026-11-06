'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageField from './ImageField';
import MenuLinkFields from './MenuLinkFields';
import { menuLinkPayload, normalizeMenuLinkType } from '@/lib/menuLinks';
import { parseJsonResponse } from '@/lib/parseJsonResponse';

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
          aria-label="Black background"
          title="Black"
        />
        <button
          type="button"
          className={`admin-theme-dot admin-theme-dot--yellow${value === 'yellow' ? ' is-active' : ''}`}
          onClick={() => onChange('yellow')}
          aria-pressed={value === 'yellow'}
          aria-label="Yellow background"
          title="Yellow"
        />
        <span className="admin-theme-dot-label">{value === 'yellow' ? 'Yellow' : 'Black'}</span>
      </div>
      <input type="hidden" name={name} value={value} readOnly />
    </div>
  );
}

const emptyForm = {
  name: '',
  slug: '',
  categoryId: '',
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
  modelsSubtitle: '',
  modelsTitle: '',
  modelsLead: '',
  productsSubtitle: '',
  productsTitle: '',
  productsLead: '',
  bannerTheme: 'black',
  modelsTheme: 'black',
  productsTheme: 'black',
};

export default function SubcategoryForm({ subcategoryId }) {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!subcategoryId);
  const [modelCount, setModelCount] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (!subcategoryId) return;
    fetch(`/api/admin/subcategories/${subcategoryId}`)
      .then(async (r) => {
        const { data: d, error: parseError } = await parseJsonResponse(r);
        if (parseError) throw new Error(parseError);
        if (!r.ok) throw new Error(d?.error || 'Failed to load');
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
          menuLinkType: normalizeMenuLinkType(s.menuLinkType),
          menuAnchor: s.menuAnchor || '',
          menuProductId: s.menuProductId || '',
          pageSubtitle: s.pageSubtitle || '',
          pageTitle: s.pageTitle || '',
          pageLead: s.pageLead || '',
          modelsSubtitle: s.modelsSubtitle || '',
          modelsTitle: s.modelsTitle || '',
          modelsLead: s.modelsLead || s.description || '',
          productsSubtitle: s.productsSubtitle || '',
          productsTitle: s.productsTitle || '',
          productsLead: s.productsLead || '',
          bannerTheme: normalizeTheme(s.bannerTheme),
          modelsTheme: normalizeTheme(s.modelsTheme),
          productsTheme: normalizeTheme(s.productsTheme),
        });
        setError('');
        setSlugTouched(true);
      })
      .catch((e) => setError(e.message));
  }, [subcategoryId]);

  useEffect(() => {
    if (!subcategoryId) {
      setModelCount(null);
      setProductCount(null);
      return;
    }
    fetch(`/api/admin/products?subcategoryId=${encodeURIComponent(subcategoryId)}&limit=200`)
      .then((r) => r.json())
      .then((d) => {
        const list = d.products || [];
        setModelCount(list.filter((p) => p.layout === 'vertical' || !p.image).length);
        setProductCount(list.filter((p) => p.layout !== 'vertical' && p.image).length);
      })
      .catch(() => {
        setModelCount(null);
        setProductCount(null);
      });
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
      const payload = {
        ...form,
        description: form.modelsLead || form.description || '',
        sortOrder: Number(form.sortOrder) || 0,
        ...menuLinkPayload(form),
      };
      const res = await fetch(
        subcategoryId ? `/api/admin/subcategories/${subcategoryId}` : '/api/admin/subcategories',
        {
          method: subcategoryId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const { data, error: parseError } = await parseJsonResponse(res);
      if (parseError) throw new Error(parseError);
      if (!res.ok) throw new Error(data?.error || 'Save failed');
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

      <fieldset className="admin-form-section">
        <legend>Basics</legend>
        <p className="admin-form-section-desc">Subcategory identity and Products menu link.</p>
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
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="sortOrder">Sort order</label>
            <input id="sortOrder" type="number" value={form.sortOrder} onChange={(e) => setField('sortOrder', e.target.value)} />
          </div>
          <div className="admin-field admin-field-check">
            <label>
              <input type="checkbox" checked={form.visible} onChange={(e) => setField('visible', e.target.checked)} /> Visible in
              navigation
            </label>
          </div>
        </div>
        <MenuLinkFields
          pageLabel="Subcategory page"
          menuLinkType={form.menuLinkType}
          menuAnchor={form.menuAnchor}
          menuProductId={form.menuProductId}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
        />
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>Section 01 — Banner</legend>
        <p className="admin-form-section-desc">Breadcrumb / hero block: subtitle, heading, and description.</p>
        <ThemePicker value={form.bannerTheme} onChange={(v) => setField('bannerTheme', v)} name="bannerTheme" />
        <div className="admin-field">
          <label htmlFor="pageSubtitle">Subtitle</label>
          <input
            id="pageSubtitle"
            value={form.pageSubtitle}
            onChange={(e) => setField('pageSubtitle', e.target.value)}
            placeholder="PULLER Lures"
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
        <p className="hint">Background image is used on Black theme. Yellow theme uses the solid logo yellow.</p>
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>Section 02 — Available Models</legend>
        <p className="admin-form-section-desc">
          Subtitle, title, description, then model options as red text cards. No images in this section.
        </p>
        <ThemePicker value={form.modelsTheme} onChange={(v) => setField('modelsTheme', v)} name="modelsTheme" />
        <div className="admin-field">
          <label htmlFor="modelsSubtitle">Subtitle</label>
          <input
            id="modelsSubtitle"
            value={form.modelsSubtitle}
            onChange={(e) => setField('modelsSubtitle', e.target.value)}
            placeholder="Available Models"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="modelsTitle">Heading</label>
          <input
            id="modelsTitle"
            value={form.modelsTitle}
            onChange={(e) => setField('modelsTitle', e.target.value)}
            placeholder="Seven sizes. One series."
          />
        </div>
        <div className="admin-field">
          <label htmlFor="modelsLead">Description</label>
          <textarea
            id="modelsLead"
            rows={3}
            value={form.modelsLead}
            onChange={(e) => setField('modelsLead', e.target.value)}
            placeholder="Choose the size that matches your water, target species and technique…"
          />
        </div>
        {subcategoryId ? (
          <div className="admin-form-section-note">
            <p>
              {modelCount == null
                ? 'Manage model options as name-button products (no image).'
                : `${modelCount} model option${modelCount === 1 ? '' : 's'} linked to this subcategory.`}
            </p>
            <div className="admin-actions" style={{ margin: 0 }}>
              <a
                className="admin-btn admin-btn-ghost admin-btn-sm"
                href={`/admin/products/new?categoryId=${form.categoryId}&subcategoryId=${subcategoryId}&layout=vertical`}
              >
                Add model option
              </a>
              <a
                className="admin-btn admin-btn-ghost admin-btn-sm"
                href={`/admin/products?categoryId=${form.categoryId}&subcategoryId=${subcategoryId}`}
              >
                Manage products
              </a>
            </div>
            <p className="hint" style={{ marginTop: '0.75rem' }}>
              Model options use product name + optional URL only. No image upload.
            </p>
          </div>
        ) : (
          <p className="hint">Save the subcategory first, then add model options under Products (name button layout).</p>
        )}
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>Section 03 — Products</legend>
        <p className="admin-form-section-desc">Image product cards / colour patterns catalog.</p>
        <ThemePicker
          label="Section background (Yellow or Black)"
          value={form.productsTheme}
          onChange={(v) => setField('productsTheme', v)}
          name="productsTheme"
        />
        <div className="admin-field">
          <label htmlFor="productsSubtitle">Subtitle</label>
          <input
            id="productsSubtitle"
            value={form.productsSubtitle}
            onChange={(e) => setField('productsSubtitle', e.target.value)}
            placeholder="Colour Patterns"
          />
        </div>
        <div className="admin-field">
          <label htmlFor="productsTitle">Heading</label>
          <input
            id="productsTitle"
            value={form.productsTitle}
            onChange={(e) => setField('productsTitle', e.target.value)}
            placeholder={form.name || 'Products'}
          />
        </div>
        <div className="admin-field">
          <label htmlFor="productsLead">Description</label>
          <textarea
            id="productsLead"
            rows={3}
            value={form.productsLead}
            onChange={(e) => setField('productsLead', e.target.value)}
          />
        </div>
        {subcategoryId ? (
          <div className="admin-form-section-note">
            <p>
              {productCount == null
                ? 'Manage image products for this subcategory in Products.'
                : `${productCount} image product${productCount === 1 ? '' : 's'} linked to this subcategory.`}
            </p>
            <div className="admin-actions" style={{ margin: 0 }}>
              <a
                className="admin-btn admin-btn-ghost admin-btn-sm"
                href={`/admin/products/new?categoryId=${form.categoryId}&subcategoryId=${subcategoryId}`}
              >
                Add product
              </a>
              <a
                className="admin-btn admin-btn-ghost admin-btn-sm"
                href={`/admin/products?categoryId=${form.categoryId}&subcategoryId=${subcategoryId}`}
              >
                Manage products
              </a>
            </div>
          </div>
        ) : (
          <p className="hint">Save the subcategory first, then add image products under Products.</p>
        )}
      </fieldset>

      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : subcategoryId ? 'Update subcategory' : 'Create subcategory'}
        </button>
        <button className="admin-btn admin-btn-ghost" type="button" onClick={() => router.push('/admin/subcategories')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
