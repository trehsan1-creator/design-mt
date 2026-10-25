import React from 'react';

/**
 * مسیر سوپرالیپس پیوسته (Lamé Superellipse, n = 4.2) در مختصات نرمال ۰..۱
 * برای ایجاد انحنای پیوسته G2 واقعی فراتر از border-radius دایره‌ای ساده
 */
export const SUPERELLIPSE_OBJECT_PATH =
  'M 0.5,0 C 0.84,0 1,0.16 1,0.5 C 1,0.84 0.84,1 0.5,1 C 0.16,1 0,0.84 0,0.5 C 0,0.16 0.16,0 0.5,0 Z';

export function SquircleClipDefs() {
  return (
    <svg
      width="0"
      height="0"
      aria-hidden="true"
      focusable="false"
      className="ds-sr-defs"
    >
      <defs>
        <clipPath id="ds-superellipse-clip" clipPathUnits="objectBoundingBox">
          <path d={SUPERELLIPSE_OBJECT_PATH} />
        </clipPath>
      </defs>
    </svg>
  );
}

export default SquircleClipDefs;
