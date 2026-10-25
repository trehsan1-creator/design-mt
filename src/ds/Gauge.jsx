import React from 'react';

export function Gauge({
  segments = 12,
  activeCount = 9,
  label,
  value,
  tone = 'accent',
  className = '',
}) {
  const clamped = Math.max(0, Math.min(segments, Math.round(activeCount)));

  return (
    <div
      className={`ds-gauge ${className}`.trim()}
      data-tone={tone}
      role="meter"
      aria-label={label || 'نشانگر تله‌متری'}
      aria-valuemin={0}
      aria-valuemax={segments}
      aria-valuenow={clamped}
      aria-valuetext={value ? String(value) : undefined}
    >
      {(label || value) && (
        <div className="ds-gauge__head">
          {label && <span className="ds-gauge__label">{label}</span>}
          {value && <span className="ds-gauge__val">{value}</span>}
        </div>
      )}
      <div className="ds-gauge__track" aria-hidden="true">
        {Array.from({ length: segments }).map((_, idx) => (
          <span
            key={idx}
            className={`ds-gauge__seg ${idx < clamped ? 'is-on' : ''}`.trim()}
          />
        ))}
      </div>
    </div>
  );
}

export default Gauge;
