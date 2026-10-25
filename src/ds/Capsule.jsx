import React from 'react';

export function Capsule({
  variant = 'eyebrow',
  pulse = false,
  className = '',
  children,
}) {
  return (
    <span className={`ds-capsule ds-capsule--${variant} ${className}`.trim()}>
      {pulse && <span className="ds-pulse-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export default Capsule;
