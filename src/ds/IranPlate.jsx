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
        <svg viewBox="0 0 16 20" className="ds-iran-plate__emblem-svg">
          <rect x="1" width="14" height="3" y="1" fill="var(--ds-plate-green)" />
          <rect x="1" width="14" height="3" y="4" fill="var(--ds-neutral-white)" />
          <rect x="1" width="14" height="3" y="7" fill="var(--ds-plate-red)" />
          <text
            x="8"
            y="18"
            textAnchor="middle"
            fill="var(--ds-neutral-white)"
            fontSize="6.5"
            fontWeight="800"
            fontFamily="sans-serif"
          >
            IR
          </text>
        </svg>
      </span>
      <span className="ds-iran-plate__body" aria-hidden="true">
        <span>{toFa(left2)}</span>
        <span className="ds-iran-plate__letter">{letter}</span>
        <span>{toFa(mid3)}</span>
      </span>
      <span className="ds-iran-plate__code" aria-hidden="true">
        <svg viewBox="0 0 28 10" className="ds-iran-plate__code-svg">
          <text
            x="14"
            y="8"
            textAnchor="middle"
            fill="currentColor"
            fontSize="7.5"
            fontWeight="700"
          >
            ایران
          </text>
        </svg>
        <span className="ds-iran-plate__code-num">{toFa(iranCode)}</span>
      </span>
    </span>
  );
}

export default IranPlate;
