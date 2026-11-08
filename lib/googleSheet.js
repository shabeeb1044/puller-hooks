import { getEnv } from '@/lib/env';

/**
 * Append a form submission to Google Sheets via an Apps Script web app webhook.
 * Set GOOGLE_SHEET_WEBHOOK to the deployed script URL (/exec).
 * Never throws — DB save must succeed even if the sheet sync fails.
 */
export async function appendSubmissionToSheet({ type, fields }) {
  try {
    const webhook =
      (await getEnv('GOOGLE_SHEET_WEBHOOK')) ||
      (await getEnv('GOOGLE_SHEETS_WEBHOOK'));
    if (!webhook) {
      return { ok: false, skipped: true };
    }

    const payload = {
      type,
      submittedAt: new Date().toISOString(),
      fields,
    };

    const res = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[googleSheet] Webhook failed:', res.status, text.slice(0, 300));
      return { ok: false, error: `HTTP ${res.status}` };
    }

    return { ok: true };
  } catch (err) {
    console.error('[googleSheet] Failed to sync submission:', err?.message || err);
    return { ok: false, error: err?.message || String(err) };
  }
}
