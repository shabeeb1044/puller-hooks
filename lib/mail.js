import nodemailer from 'nodemailer';
import { getEnv } from '@/lib/env';

const SALES_FALLBACK = 'sales@pullertackle.com';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatFieldsText(fields) {
  return Object.entries(fields)
    .map(([key, value]) => `${key}: ${value == null || value === '' ? '—' : value}`)
    .join('\n');
}

function formatFieldsHtml(fields) {
  const rows = Object.entries(fields)
    .map(
      ([key, value]) =>
        `<tr><th align="left" style="padding:6px 12px 6px 0;vertical-align:top;color:#555">${escapeHtml(key)}</th>` +
        `<td style="padding:6px 0;vertical-align:top">${escapeHtml(value == null || value === '' ? '—' : value)}</td></tr>`
    )
    .join('');
  return `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;line-height:1.45">${rows}</table>`;
}

async function createTransport() {
  const host = (await getEnv('SMTP_HOST')) || '127.0.0.1';
  const port = Number((await getEnv('SMTP_PORT')) || 25);
  const user = await getEnv('SMTP_USER');
  const pass = await getEnv('SMTP_PASS');
  const secureEnv = await getEnv('SMTP_SECURE');
  const secure = secureEnv === 'true' || secureEnv === '1' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: { rejectUnauthorized: false },
  });
}

/**
 * Notify sales of a new form submission. Never throws — form save must succeed even if mail fails.
 */
export async function notifySalesOfSubmission({ type, fields, replyTo }) {
  try {
    const to = (await getEnv('SALES_EMAIL')) || SALES_FALLBACK;
    const from =
      (await getEnv('MAIL_FROM')) ||
      (await getEnv('SMTP_USER')) ||
      `noreply@pullertackle.com`;
    const subject =
      type === 'dealer'
        ? `New dealer application — ${fields.Company || fields.Name || 'PULLER'}`
        : `New contact inquiry — ${fields.Name || fields.Email || 'PULLER'}`;

    const transport = await createTransport();
    await transport.sendMail({
      from,
      to,
      replyTo: replyTo || undefined,
      subject,
      text: `${subject}\n\n${formatFieldsText(fields)}\n`,
      html: `<p style="font-family:Arial,sans-serif;font-size:14px"><strong>${escapeHtml(subject)}</strong></p>${formatFieldsHtml(fields)}`,
    });
    return { ok: true };
  } catch (err) {
    console.error('[mail] Failed to notify sales:', err?.message || err);
    return { ok: false, error: err?.message || String(err) };
  }
}
