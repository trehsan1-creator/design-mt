import React from 'react';
import { toFa } from '../utils/faDigits.js';

export function IranPlate({
  left2 = '۴۸',
  letter = 'ع',
  mid3 = '۷۳۹',
  iranCode = '۱۱',
  variant = 'private',
  className = '',
}) {
  const isPublic = variant === 'public' || letter === 'ع';
  const classes = [
    'ds-iran-plate',
    isPublic ? 'ds-iran-plate--public' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = `پلاک خودرو ${toFa(left2)} ${letter} ${toFa(mid3)} ایران ${toFa(iranCode)}`;

  return (
    <span className={classes} role="img" aria-label={ariaLabel}>
      <span className="ds-iran-plate__flag" aria-hidden="true">
        <svg viewBox="0 0 12 8" className="ds-iran-plate__flag-svg">
          <rect width="12" height="2.67" y="0" fill="var(--ds-plate-green)" />
          <rect width="12" height="2.67" y="2.67" fill="var(--ds-neutral-white)" />
          <rect width="12" height="2.66" y="5.34" fill="var(--ds-plate-red)" />
        </svg>
        <span className="ds-iran-plate__ir-label">IR</span>
      </span>
      <span className="ds-iran-plate__body" aria-hidden="true">
        <span>{toFa(left2)}</span>
        <span className="ds-iran-plate__letter">{letter}</span>
        <span>{toFa(mid3)}</span>
      </span>
      <span className="ds-iran-plate__code" aria-hidden="true">
        <span className="ds-iran-plate__code-caption">ایران</span>
        <span className="ds-iran-plate__code-num">{toFa(iranCode)}</span>
      </span>
    </span>
  );
}

export default IranPlate;
