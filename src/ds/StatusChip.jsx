import React from 'react';

export function StatusChip({
  status = 'moving',
  label,
  icon: Icon,
  className = '',
}) {
  return (
    <span className={`ds-status-chip ${className}`.trim()} data-status={status}>
      {Icon ? (
        <Icon size={13} aria-hidden="true" />
      ) : (
        <span className="ds-status-chip__marker" aria-hidden="true" />
      )}
      <span>{label}</span>
    </span>
  );
}

export default StatusChip;
