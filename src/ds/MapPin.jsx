import React from 'react';
import { toFa } from '../utils/faDigits.js';

/**
 * پین مکان‌نمای آیرودینامیک ناوگان (MapPin)
 * مشتق از قطعه چهارم نشان برند (p3) با زاویه تیغه پایینی ۱۳۶.۵۴ درجه
 */
export function MapPin({
  speed,
  heading = 0,
  status = 'moving',
  selected = false,
  label,
  onClick,
  style,
  className = '',
}) {
  const classes = [
    'ds-map-pin',
    selected ? 'is-selected' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={classes}
      data-status={status}
      style={style}
      aria-label={label || `پین خودرو با سرعت ${toFa(speed)} کیلومتر بر ساعت`}
      aria-pressed={selected}
      onClick={onClick}
    >
      <span className="ds-map-pin__glyph" aria-hidden="true">
        <svg viewBox="0 0 40 46" className="ds-map-pin__svg">
          {/* 31.25% Squircle head tapering into a 136.54° blade tip at (20, 44) */}
          <path
            d="M 20,2 H 27.5 C 33.3,2 38,6.7 38,12.5 V 22.5 C 38,28.2 31.4,35.6 22.8,42.6 C 21.1,44.0 18.9,44.0 17.2,42.6 C 8.6,35.6 2,28.2 2,22.5 V 12.5 C 2,6.7 6.7,2 12.5,2 Z"
            className="ds-map-pin__body"
          />
          {/* Inner directional heading chevron */}
          <g transform={`translate(20, 17.5) rotate(${heading})`}>
            <circle r="8.5" className="ds-map-pin__core" />
            <path d="M 0,-5.5 L 4.2,3.8 L 0,1.6 L -4.2,3.8 Z" className="ds-map-pin__arrow" />
          </g>
        </svg>
      </span>
      {speed !== undefined && (
        <span className="ds-map-pin__badge ds-tabular" aria-hidden="true">
          {toFa(speed)} <span className="ltr-code">km/h</span>
        </span>
      )}
    </button>
  );
}

export default MapPin;
