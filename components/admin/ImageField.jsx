'use client';

import { useState } from 'react';

export default function ImageField({ label, value, onChange, name = 'image' }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="admin-field">
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/images/... or upload below"
      />
      <div className="admin-actions" style={{ marginTop: '0.5rem' }}>
        <label className="admin-btn admin-btn-ghost admin-btn-sm" style={{ cursor: 'pointer' }}>
          {uploading ? 'Uploading…' : 'Upload image'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={onFile} disabled={uploading} />
        </label>
        {value ? (
          <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => onChange('')}>
            Clear
          </button>
        ) : null}
      </div>
      {error ? <p className="admin-error" style={{ marginTop: '0.5rem' }}>{error}</p> : null}
      {value ? (
        <div className="admin-image-preview">
          <img src={value} alt="" />
        </div>
      ) : null}
    </div>
  );
}
