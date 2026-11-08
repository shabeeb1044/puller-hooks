'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const EMPTY = {
  whatsapp: '',
  facebook: '',
  instagram: '',
  youtube: '',
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/admin/settings/social-links');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load social links');
        if (!cancelled) {
          setForm({
            whatsapp: data.socialLinks?.whatsapp || '',
            facebook: data.socialLinks?.facebook || '',
            instagram: data.socialLinks?.instagram || '',
            youtube: data.socialLinks?.youtube || '',
          });
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load social links');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings/social-links', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setForm({
        whatsapp: data.socialLinks?.whatsapp || '',
        facebook: data.socialLinks?.facebook || '',
        instagram: data.socialLinks?.instagram || '',
        youtube: data.socialLinks?.youtube || '',
      });
      setSuccess('Social links updated. Changes appear on the public site immediately.');
    } catch (err) {
      setError(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/management-portal');
    router.refresh();
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Settings</h1>
          <p>Update WhatsApp, Facebook, Instagram, and YouTube links shown on the website.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-ghost" onClick={logout}>
          Logout
        </button>
      </div>
      <div className="admin-panel">
        {loading ? (
          <p className="admin-muted">Loading social links…</p>
        ) : (
          <form className="admin-form" onSubmit={onSubmit}>
            {error ? <div className="admin-error">{error}</div> : null}
            {success ? <div className="admin-success">{success}</div> : null}

            <fieldset className="admin-form-section">
              <legend>Social links</legend>
              <p className="admin-form-section-desc">
                These URLs power footer icons and the floating WhatsApp / Instagram buttons.
              </p>

              <div className="admin-field">
                <label htmlFor="whatsapp">WhatsApp number</label>
                <input
                  id="whatsapp"
                  type="text"
                  inputMode="tel"
                  placeholder="919539470261"
                  value={form.whatsapp}
                  onChange={(e) => updateField('whatsapp', e.target.value)}
                  required
                />
                <p className="hint">
                  Country code + number only (no + or spaces). Example: 919539470261
                </p>
              </div>

              <div className="admin-field">
                <label htmlFor="facebook">Facebook URL</label>
                <input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/your-page"
                  value={form.facebook}
                  onChange={(e) => updateField('facebook', e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="instagram">Instagram URL</label>
                <input
                  id="instagram"
                  type="url"
                  placeholder="https://instagram.com/your-profile"
                  value={form.instagram}
                  onChange={(e) => updateField('instagram', e.target.value)}
                  required
                />
              </div>

              <div className="admin-field">
                <label htmlFor="youtube">YouTube URL</label>
                <input
                  id="youtube"
                  type="url"
                  placeholder="https://youtube.com/@your-channel"
                  value={form.youtube}
                  onChange={(e) => updateField('youtube', e.target.value)}
                  required
                />
              </div>
            </fieldset>

            <button className="admin-btn" type="submit" disabled={saving}>
              {saving ? 'Updating…' : 'Update social links'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
