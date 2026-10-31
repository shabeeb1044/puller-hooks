export default function StatusBadge({ status }) {
  const key = String(status || 'new').toLowerCase().replace(/\s+/g, '_');
  return <span className={`admin-badge admin-badge-${key}`}>{status}</span>;
}
