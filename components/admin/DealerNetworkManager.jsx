'use client';

import { useCallback, useEffect, useState } from 'react';

const emptyRegion = { name: '', slug: '', visible: true };
const emptyDealer = { name: '', address: '', country: '', regionId: '', visible: true };

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function DealerNetworkManager() {
  const [tab, setTab] = useState('dealers');
  const [regions, setRegions] = useState([]);
  const [dealers, setDealers] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [regionForm, setRegionForm] = useState(emptyRegion);
  const [editingRegionId, setEditingRegionId] = useState(null);
  const [dealerForm, setDealerForm] = useState(emptyDealer);
  const [editingDealerId, setEditingDealerId] = useState(null);
  const [filterRegionId, setFilterRegionId] = useState('');

  const load = useCallback(async () => {
    const [rRes, dRes] = await Promise.all([
      fetch('/api/admin/dealer-regions'),
      fetch('/api/admin/dealer-locations'),
    ]);
    const rData = await rRes.json();
    const dData = await dRes.json();
    if (!rRes.ok) throw new Error(rData.error || 'Failed to load regions');
    if (!dRes.ok) throw new Error(dData.error || 'Failed to load dealers');
    setRegions(rData.regions || []);
    setDealers(dData.dealers || []);
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, [load]);

  function resetRegionForm() {
    setRegionForm(emptyRegion);
    setEditingRegionId(null);
  }

  function resetDealerForm() {
    setDealerForm({
      ...emptyDealer,
      regionId: filterRegionId || regions[0]?.id || '',
    });
    setEditingDealerId(null);
  }

  async function saveRegion(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: regionForm.name.trim(),
        slug: regionForm.slug.trim() || slugify(regionForm.name),
        visible: regionForm.visible !== false,
      };
      const url = editingRegionId
        ? `/api/admin/dealer-regions/${editingRegionId}`
        : '/api/admin/dealer-regions';
      const res = await fetch(url, {
        method: editingRegionId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      resetRegionForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveDealer(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        name: dealerForm.name.trim(),
        address: dealerForm.address.trim(),
        country: dealerForm.country.trim() || null,
        regionId: dealerForm.regionId,
        visible: dealerForm.visible !== false,
      };
      if (!payload.regionId) throw new Error('Select a region.');
      const url = editingDealerId
        ? `/api/admin/dealer-locations/${editingDealerId}`
        : '/api/admin/dealer-locations';
      const res = await fetch(url, {
        method: editingDealerId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      resetDealerForm();
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleRegionVisible(region) {
    const res = await fetch(`/api/admin/dealer-regions/${region.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !region.visible }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Update failed');
      return;
    }
    load().catch((e) => setError(e.message));
  }

  async function toggleDealerVisible(dealer) {
    const res = await fetch(`/api/admin/dealer-locations/${dealer.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visible: !dealer.visible }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Update failed');
      return;
    }
    load().catch((e) => setError(e.message));
  }

  async function removeRegion(id) {
    if (!confirm('Delete this region and all its dealers?')) return;
    const res = await fetch(`/api/admin/dealer-regions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Delete failed');
      return;
    }
    if (editingRegionId === id) resetRegionForm();
    load().catch((e) => setError(e.message));
  }

  async function removeDealer(id) {
    if (!confirm('Delete this dealer listing?')) return;
    const res = await fetch(`/api/admin/dealer-locations/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Delete failed');
      return;
    }
    if (editingDealerId === id) resetDealerForm();
    load().catch((e) => setError(e.message));
  }

  const filteredDealers = filterRegionId
    ? dealers.filter((d) => d.regionId === filterRegionId)
    : dealers;

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Dealer Network</h1>
          <p>Manage regions and authorized dealer listings shown on the public Dealers page.</p>
        </div>
        <div className="admin-actions">
          <button
            type="button"
            className={`admin-btn admin-btn-sm${tab === 'dealers' ? '' : ' admin-btn-ghost'}`}
            onClick={() => setTab('dealers')}
          >
            Dealers
          </button>
          <button
            type="button"
            className={`admin-btn admin-btn-sm${tab === 'regions' ? '' : ' admin-btn-ghost'}`}
            onClick={() => setTab('regions')}
          >
            Regions
          </button>
        </div>
      </div>

      {error ? <div className="admin-error">{error}</div> : null}

      {tab === 'regions' ? (
        <div className="admin-grid-2">
          <div className="admin-panel">
            <h2 style={{ marginTop: 0 }}>{editingRegionId ? 'Edit region' : 'Add region'}</h2>
            <form className="admin-form" onSubmit={saveRegion}>
              <div className="admin-field">
                <label htmlFor="region-name">Name</label>
                <input
                  id="region-name"
                  value={regionForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setRegionForm((f) => ({
                      ...f,
                      name,
                      slug: editingRegionId ? f.slug : slugify(name),
                    }));
                  }}
                  required
                  placeholder="Europe"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="region-slug">Slug</label>
                <input
                  id="region-slug"
                  value={regionForm.slug}
                  onChange={(e) => setRegionForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                  placeholder="europe"
                />
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={regionForm.visible !== false}
                  onChange={(e) => setRegionForm((f) => ({ ...f, visible: e.target.checked }))}
                />
                Visible on site
              </label>
              <div className="admin-actions" style={{ marginTop: '1rem' }}>
                <button type="submit" className="admin-btn" disabled={saving}>
                  {saving ? 'Saving…' : editingRegionId ? 'Update region' : 'Add region'}
                </button>
                {editingRegionId ? (
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={resetRegionForm}>
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </div>

          <div className="admin-panel">
            <h2 style={{ marginTop: 0 }}>Regions ({regions.length})</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Dealers</th>
                    <th>Visible</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {regions.map((region) => (
                    <tr key={region.id}>
                      <td>
                        <strong>{region.name}</strong>
                        <div className="admin-muted">{region.slug}</div>
                      </td>
                      <td>{region._count?.dealers || 0}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => toggleRegionVisible(region)}
                        >
                          {region.visible ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => {
                              setEditingRegionId(region.id);
                              setRegionForm({
                                name: region.name,
                                slug: region.slug,
                                visible: region.visible !== false,
                              });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-red admin-btn-sm"
                            onClick={() => removeRegion(region.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!regions.length ? (
                    <tr>
                      <td colSpan={4}>No regions yet. Add Europe, Asia, Americas…</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="admin-grid-2">
          <div className="admin-panel">
            <h2 style={{ marginTop: 0 }}>{editingDealerId ? 'Edit dealer' : 'Add dealer'}</h2>
            <form className="admin-form" onSubmit={saveDealer}>
              <div className="admin-field">
                <label htmlFor="dealer-region">Region</label>
                <select
                  id="dealer-region"
                  value={dealerForm.regionId}
                  onChange={(e) => setDealerForm((f) => ({ ...f, regionId: e.target.value }))}
                  required
                >
                  <option value="">Select region</option>
                  {regions.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-field">
                <label htmlFor="dealer-name">Client / company title</label>
                <input
                  id="dealer-name"
                  value={dealerForm.name}
                  onChange={(e) => setDealerForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  placeholder="Golden Catch"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="dealer-country">Country <span className="admin-muted">(optional)</span></label>
                <input
                  id="dealer-country"
                  value={dealerForm.country}
                  onChange={(e) => setDealerForm((f) => ({ ...f, country: e.target.value }))}
                  placeholder="Ukraine"
                />
              </div>
              <div className="admin-field">
                <label htmlFor="dealer-address">Address</label>
                <textarea
                  id="dealer-address"
                  rows={4}
                  value={dealerForm.address}
                  onChange={(e) => setDealerForm((f) => ({ ...f, address: e.target.value }))}
                  required
                  placeholder="Street, city, country"
                />
              </div>
              <label className="admin-check">
                <input
                  type="checkbox"
                  checked={dealerForm.visible !== false}
                  onChange={(e) => setDealerForm((f) => ({ ...f, visible: e.target.checked }))}
                />
                Visible on site
              </label>
              <div className="admin-actions" style={{ marginTop: '1rem' }}>
                <button type="submit" className="admin-btn" disabled={saving || !regions.length}>
                  {saving ? 'Saving…' : editingDealerId ? 'Update dealer' : 'Add dealer'}
                </button>
                {editingDealerId ? (
                  <button type="button" className="admin-btn admin-btn-ghost" onClick={resetDealerForm}>
                    Cancel
                  </button>
                ) : null}
              </div>
              {!regions.length ? (
                <p className="admin-muted">Add a region first, then add dealers.</p>
              ) : null}
            </form>
          </div>

          <div className="admin-panel">
            <div className="admin-topbar" style={{ padding: 0, marginBottom: '1rem' }}>
              <h2 style={{ margin: 0 }}>Dealers ({filteredDealers.length})</h2>
              <select
                value={filterRegionId}
                onChange={(e) => setFilterRegionId(e.target.value)}
                aria-label="Filter by region"
              >
                <option value="">All regions</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Dealer</th>
                    <th>Region</th>
                    <th>Visible</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDealers.map((dealer) => (
                    <tr key={dealer.id}>
                      <td>
                        <strong>{dealer.name}</strong>
                        {dealer.country ? <div className="admin-muted">{dealer.country}</div> : null}
                        <div className="admin-muted" style={{ whiteSpace: 'pre-wrap' }}>
                          {dealer.address}
                        </div>
                      </td>
                      <td>{dealer.region?.name || '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="admin-btn admin-btn-ghost admin-btn-sm"
                          onClick={() => toggleDealerVisible(dealer)}
                        >
                          {dealer.visible ? 'Visible' : 'Hidden'}
                        </button>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            type="button"
                            className="admin-btn admin-btn-ghost admin-btn-sm"
                            onClick={() => {
                              setEditingDealerId(dealer.id);
                              setDealerForm({
                                name: dealer.name || '',
                                address: dealer.address || '',
                                country: dealer.country || '',
                                regionId: dealer.regionId || '',
                                visible: dealer.visible !== false,
                              });
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-btn admin-btn-red admin-btn-sm"
                            onClick={() => removeDealer(dealer.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!filteredDealers.length ? (
                    <tr>
                      <td colSpan={4}>No dealers yet. Add authorized partners for each region.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
