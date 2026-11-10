'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ImageField from './ImageField';
import MenuLinkFields from './MenuLinkFields';
import RichTextField from './RichTextField';
import ToggleSwitch from './ToggleSwitch';
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

function normalizeBannerAlign(value) {
  if (value === 'center' || value === 'right') return value;
  return 'left';
}

function normalizeBannerMaxWidth(value) {
  if (value === '' || value == null) return '';
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return String(Math.min(120, Math.max(16, Math.round(n))));
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
  modelsSubtitle: '',
  modelsTitle: '',
  modelsLead: '',
  productsSubtitle: '',
  productsTitle: '',
  productsLead: '',
  bannerTheme: 'black',
  introTheme: 'black',
  modelsTheme: 'black',
  productsTheme: 'black',
  bannerVisible: true,
  introVisible: true,
  modelsVisible: true,
  productsVisible: true,
  bannerAlign: 'left',
  bannerMaxWidth: '',
};

export default function CategoryForm({ categoryId }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(!!categoryId);
  const [modelCount, setModelCount] = useState(null);
  const [productCount, setProductCount] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!categoryId) return;
    fetch(`/api/admin/categories/${categoryId}`)
      .then(async (r) => {
        const { data: d, error: parseError } = await parseJsonResponse(r);
        if (parseError) throw new Error(parseError);
        if (!r.ok) throw new Error(d?.error || 'Failed to load');
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
          modelsSubtitle: c.modelsSubtitle || '',
          modelsTitle: c.modelsTitle || '',
          modelsLead: c.modelsLead || '',
          productsSubtitle: c.productsSubtitle || '',
          productsTitle: c.productsTitle || '',
          productsLead: c.productsLead || '',
          bannerTheme: normalizeTheme(c.bannerTheme, legacy),
          introTheme: normalizeTheme(c.introTheme, legacy),
          modelsTheme: normalizeTheme(c.modelsTheme, legacy),
          productsTheme: normalizeTheme(c.productsTheme, legacy),
          bannerVisible: c.bannerVisible !== false,
          introVisible: c.introVisible !== false,
          modelsVisible: c.modelsVisible !== false,
          productsVisible: c.productsVisible !== false,
          bannerAlign: normalizeBannerAlign(c.bannerAlign),
          bannerMaxWidth: normalizeBannerMaxWidth(c.bannerMaxWidth),
        });
        setError('');
        setSlugTouched(true);
      })
      .catch((e) => setError(e.message));
  }, [categoryId]);

  useEffect(() => {
    if (!categoryId) return;
    let cancelled = false;
    Promise.all([
      fetch(`/api/admin/products?categoryId=${encodeURIComponent(categoryId)}&layout=vertical`).then((r) => r.json()),
      fetch(`/api/admin/products?categoryId=${encodeURIComponent(categoryId)}&layout=horizontal`).then((r) => r.json()),
    ])
      .then(([models, products]) => {
        if (cancelled) return;
        setModelCount(Array.isArray(models.products) ? models.products.length : Array.isArray(models) ? models.length : 0);
        setProductCount(
          Array.isArray(products.products) ? products.products.length : Array.isArray(products) ? products.length : 0
        );
      })
      .catch(() => {
        if (!cancelled) {
          setModelCount(null);
          setProductCount(null);
        }
      });
    return () => {
      cancelled = true;
    };
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
      const maxWidthRaw = String(form.bannerMaxWidth ?? '').trim();
      const payload = {
        ...form,
        sortOrder: Number(form.sortOrder) || 0,
        bannerAlign: normalizeBannerAlign(form.bannerAlign),
        bannerMaxWidth: maxWidthRaw === '' ? null : Number(maxWidthRaw),
        ...menuLinkPayload(form),
        // Keep legacy field in sync with products section for older readers
        pageTheme: form.productsTheme,
      };
      const res = await fetch(categoryId ? `/api/admin/categories/${categoryId}` : '/api/admin/categories', {
        method: categoryId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const { data, error: parseError } = await parseJsonResponse(res);
      if (parseError) throw new Error(parseError);
      if (!res.ok) throw new Error(data?.error || 'Save failed');
      router.push('/management-portal/categories');
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
          <div className="admin-field">
            <ToggleSwitch
              name="visible"
              checked={form.visible}
              onChange={(v) => setField('visible', v)}
              label="Visible in navigation"
              onLabel="Shown"
              offLabel="Hidden"
            />
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
        <ToggleSwitch
          name="bannerVisible"
          checked={form.bannerVisible !== false}
          onChange={(v) => setField('bannerVisible', v)}
          label="Show on website"
          onLabel="Shown"
          offLabel="Hidden"
        />
        <ThemePicker value={form.bannerTheme} onChange={(v) => setField('bannerTheme', v)} name="bannerTheme" />
        <div className="admin-form-row">
          <div className="admin-field">
            <label htmlFor="bannerMaxWidth">Content max width (rem)</label>
            <input
              id="bannerMaxWidth"
              type="number"
              min={16}
              max={120}
              step={1}
              value={form.bannerMaxWidth}
              onChange={(e) => setField('bannerMaxWidth', e.target.value)}
              placeholder="40"
            />
            <p className="hint">Leave blank for default (~40rem). Raise this to reduce empty space on the right.</p>
          </div>
          <div className="admin-field">
            <label>Content alignment</label>
            <div className="admin-radio-row" role="radiogroup" aria-label="Banner content alignment">
              {['left', 'center', 'right'].map((align) => (
                <label key={align} className="admin-radio">
                  <input
                    type="radio"
                    name="bannerAlign"
                    value={align}
                    checked={form.bannerAlign === align}
                    onChange={() => setField('bannerAlign', align)}
                  />
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </label>
              ))}
            </div>
            <p className="hint">Positions the banner text block left, center, or right.</p>
          </div>
        </div>
        <div className="admin-field">
          <label htmlFor="pageSubtitle">Subtitle</label>
          <input
            id="pageSubtitle"
            value={form.pageSubtitle}
            onChange={(e) => setField('pageSubtitle', e.target.value)}
            placeholder="PULLER Products"
          />
        </div>
        <RichTextField
          label="Heading"
          value={form.pageTitle}
          onChange={(html) => setField('pageTitle', html)}
          compact
          minHeight={48}
        />
        <RichTextField
          label="Description"
          value={form.pageLead}
          onChange={(html) => setField('pageLead', html)}
          minHeight={160}
        />
        <ImageField label="Background image" name="bannerImage" value={form.bannerImage} onChange={(v) => setField('bannerImage', v)} />
        <p className="hint">Background image is used on Black theme. Yellow theme uses the solid logo yellow.</p>
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>Section 02 — Intro</legend>
        <p className="admin-form-section-desc">Copy on the left, image on the right.</p>
        <ToggleSwitch
          name="introVisible"
          checked={form.introVisible !== false}
          onChange={(v) => setField('introVisible', v)}
          label="Show on website"
          onLabel="Shown"
          offLabel="Hidden"
        />
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
        <RichTextField
          label="Heading"
          value={form.introTitle}
          onChange={(html) => setField('introTitle', html)}
          compact
          minHeight={48}
        />
        <p className="hint" style={{ marginTop: '-0.35rem' }}>
          Leave heading blank to use the category name.
        </p>
        <RichTextField
          label="Description"
          value={form.description}
          onChange={(html) => setField('description', html)}
          minHeight={160}
        />
        <ImageField label="Right side image" name="image" value={form.image} onChange={(v) => setField('image', v)} />
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>Section 03 — Available Models</legend>
        <p className="admin-form-section-desc">
          Red name-button cards shown above the product catalog (same pattern as Flash Striker).
        </p>
        <ToggleSwitch
          name="modelsVisible"
          checked={form.modelsVisible !== false}
          onChange={(v) => setField('modelsVisible', v)}
          label="Show on website"
          onLabel="Shown"
          offLabel="Hidden"
        />
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
        <RichTextField
          label="Heading"
          value={form.modelsTitle}
          onChange={(html) => setField('modelsTitle', html)}
          compact
          minHeight={48}
        />
        <RichTextField
          label="Description"
          value={form.modelsLead}
          onChange={(html) => setField('modelsLead', html)}
          minHeight={140}
        />
        {categoryId ? (
          <div className="admin-form-section-note">
            <p>
              {modelCount == null
                ? 'Manage name-button models for this category in Models.'
                : `${modelCount} model${modelCount === 1 ? '' : 's'} linked to this category.`}
            </p>
            <div className="admin-actions" style={{ margin: 0 }}>
              <a
                className="admin-btn admin-btn-ghost admin-btn-sm"
                href={`/management-portal/models/new?categoryId=${categoryId}`}
              >
                Add model
              </a>
              <a className="admin-btn admin-btn-ghost admin-btn-sm" href={`/management-portal/models?categoryId=${categoryId}`}>
                Manage models
              </a>
            </div>
            <p className="hint" style={{ marginTop: '0.75rem' }}>
              Models use name + optional URL (blank = #). No image or icon upload.
            </p>
          </div>
        ) : (
          <p className="hint">Save the category first, then add models.</p>
        )}
      </fieldset>

      <fieldset className="admin-form-section">
        <legend>Section 04 — Products</legend>
        <p className="admin-form-section-desc">
          Image product catalog below the models section. Choose Yellow or Black background.
        </p>
        <ToggleSwitch
          name="productsVisible"
          checked={form.productsVisible !== false}
          onChange={(v) => setField('productsVisible', v)}
          label="Show on website"
          onLabel="Shown"
          offLabel="Hidden"
        />
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
            placeholder="Hook Styles"
          />
        </div>
        <RichTextField
          label="Heading"
          value={form.productsTitle}
          onChange={(html) => setField('productsTitle', html)}
          compact
          minHeight={48}
        />
        <RichTextField
          label="Description"
          value={form.productsLead}
          onChange={(html) => setField('productsLead', html)}
          minHeight={140}
        />
        {categoryId ? (
          <div className="admin-form-section-note">
            <p>
              {productCount == null
                ? 'Manage image products for this category in Products.'
                : `${productCount} image product${productCount === 1 ? '' : 's'} linked to this category.`}
            </p>
            <div className="admin-actions" style={{ margin: 0 }}>
              <a
                className="admin-btn admin-btn-ghost admin-btn-sm"
                href={`/management-portal/products/new?categoryId=${categoryId}&layout=horizontal`}
              >
                Add product
              </a>
              <a
                className="admin-btn admin-btn-ghost admin-btn-sm"
                href={`/management-portal/products?categoryId=${categoryId}`}
              >
                Manage products
              </a>
            </div>
          </div>
        ) : (
          <p className="hint">Save the category first, then add products.</p>
        )}
      </fieldset>

      <div className="admin-actions">
        <button className="admin-btn" type="submit" disabled={saving}>
          {saving ? 'Saving…' : categoryId ? 'Update category' : 'Create category'}
        </button>
        <button className="admin-btn admin-btn-ghost" type="button" onClick={() => router.push('/management-portal/categories')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
