'use client';

export default function ToggleSwitch({
  checked = false,
  onChange,
  label,
  onLabel = 'Shown',
  offLabel = 'Hidden',
  name,
  id,
}) {
  const inputId = id || name;

  return (
    <label className={`admin-switch${checked ? ' is-on' : ''}`} htmlFor={inputId}>
      <input
        id={inputId}
        name={name}
        type="checkbox"
        className="admin-switch-input"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="admin-switch-track" aria-hidden="true">
        <span className="admin-switch-thumb" />
      </span>
      <span className="admin-switch-copy">
        {label ? <span className="admin-switch-label">{label}</span> : null}
        <span className="admin-switch-state">{checked ? onLabel : offLabel}</span>
      </span>
    </label>
  );
}
