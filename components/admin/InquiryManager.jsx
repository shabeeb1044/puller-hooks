'use client';

import { useCallback, useEffect, useState } from 'react';
import StatusBadge from './StatusBadge';

export default function InquiryManager({ type }) {
  const base = type === 'dealers' ? '/api/admin/dealers' : '/api/admin/contacts';
  const title = type === 'dealers' ? 'Dealers Inquiries' : 'Contact Inquiries';
  const [items, setItems] = useState([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status) params.set('status', status);
    const res = await fetch(`${base}?${params}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load');
    setItems(data.inquiries || []);
  }, [base, q, status]);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  async function updateStatus(id, nextStatus) {
    const res = await fetch(`${base}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Update failed');
      return;
    }
    if (selected?.id === id) setSelected(data.inquiry);
    load().catch((e) => setError(e.message));
  }

  async function remove(id) {
    if (!confirm('Delete this submission?')) return;
    const res = await fetch(`${base}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Delete failed');
      return;
    }
    if (selected?.id === id) setSelected(null);
    load().catch((e) => setError(e.message));
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>{title}</h1>
          <p>Search, filter, update status, and review full submission details.</p>
        </div>
      </div>
      {error ? <div className="admin-error">{error}</div> : null}
      <div className="admin-panel">
        <div className="admin-toolbar">
          <input
            placeholder="Search submissions"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ maxWidth: 280 }}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ maxWidth: 200 }}>
            <option value="">All statuses</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                {type === 'dealers' ? <th>Company</th> : <th>Topic</th>}
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.createdAt).toLocaleString()}</td>
                  <td>{item.name}</td>
                  <td>{item.email}</td>
                  <td>{type === 'dealers' ? item.company : item.topic || '—'}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setSelected(item)}>View</button>
                      <button type="button" className="admin-btn admin-btn-red admin-btn-sm" onClick={() => remove(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length ? (
                <tr>
                  <td colSpan={6} style={{ color: '#9aa0a8' }}>No submissions found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      {selected ? (
        <div className="admin-modal-backdrop" onClick={() => setSelected(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="admin-topbar" style={{ marginBottom: '0.75rem' }}>
              <h1 style={{ fontSize: '1.4rem' }}>Submission</h1>
              <button type="button" className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>
            <dl>
              {Object.entries(selected)
                .filter(([key]) => !['id', 'updatedAt'].includes(key))
                .map(([key, value]) => (
                  <div key={key} style={{ display: 'contents' }}>
                    <dt>{key}</dt>
                    <dd>{key === 'createdAt' ? new Date(value).toLocaleString() : String(value ?? '—')}</dd>
                  </div>
                ))}
            </dl>
            <div className="admin-actions" style={{ marginTop: '1rem' }}>
              <div className="admin-status-select" role="group" aria-label="Update status">
                {[
                  { value: 'new', label: 'New' },
                  { value: 'in_progress', label: 'In Progress' },
                  { value: 'completed', label: 'Completed' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={`admin-status-option${selected.status === opt.value ? ' is-active' : ''}`}
                    aria-pressed={selected.status === opt.value}
                    onClick={() => updateStatus(selected.id, opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button type="button" className="admin-btn admin-btn-red admin-btn-sm" onClick={() => remove(selected.id)}>Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
