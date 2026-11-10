'use client';

import { useState } from 'react';
import { parseJsonResponse } from '@/lib/parseJsonResponse';

export default function ManagementPortalPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const { data, error: parseError } = await parseJsonResponse(res);
      if (parseError) throw new Error(parseError);
      if (!res.ok) throw new Error(data?.error || 'Login failed');
      // Full navigation so middleware rewrites /management-portal → dashboard.
      window.location.assign('/management-portal');
      return;
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login-wrap">
      <form className="admin-login-card admin-form" onSubmit={onSubmit}>
        <h1>PULLER Admin</h1>
        <p>Sign in to manage products, categories, and inquiries.</p>
        {error ? <div className="admin-error">{error}</div> : null}
        <div className="admin-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="admin-field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="admin-btn" type="submit" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
