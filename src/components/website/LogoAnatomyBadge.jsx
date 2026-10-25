import React from 'react';
import { LOGO_PARTS } from '../../data/geometryData.js';

/**
 * نشانگر کالبدشکافی هندسی لوگو:
 * دقیقاً نشان می‌دهد کدام‌یک از ۴ عنصر سازندهٔ لوگوی فرزام در حال ساختن و شکل‌دادن به کامپوننت فعلی است.
 *
 * p0: کمان کلوتوئیدی بزرگراه (Q2)
 * p1: ستون عمودی دروازه (Q3)
 * p2: بازوی افقی افق (Q1)
 * p3: تیغه آیرودینامیک مکان‌نما ۱۳۶.۵۴° (Q4)
 */
export default function LogoAnatomyBadge({
  activeParts = ['p0'],
  code = '۰۱',
  elementTitle = 'عنصر هندسی لوگو',
  morphTarget = 'کامپوننت مقصد',
  tone = 'daylight',
}) {
  const activeSet = new Set(activeParts);

  return (
    <div className="logo-dna-badge" data-tone={tone}>
      <div className="logo-dna-badge__emblem" aria-hidden="true">
        <svg viewBox="-18 -18 270 360" className="logo-dna-badge__svg">
          {/* خطوط راهنمای مهندسی CAD */}
          <line x1="-10" y1="123.6" x2="244" y2="123.6" className="logo-dna-badge__guide" />
          <line x1="117.2" y1="-10" x2="117.2" y2="334" className="logo-dna-badge__guide" />

          {LOGO_PARTS.map((part) => {
            const isActive = activeSet.has(part.id);
            return (
              <path
                key={part.id}
                d={part.d}
                className={
                  isActive
                    ? 'logo-dna-badge__part logo-dna-badge__part--active'
                    : 'logo-dna-badge__part'
                }
              />
            );
          })}
        </svg>
      </div>

      <div className="logo-dna-badge__meta">
        <div className="logo-dna-badge__top">
          <span className="logo-dna-badge__code">{code}</span>
          <span className="logo-dna-badge__origin">{elementTitle}</span>
        </div>
        <div className="logo-dna-badge__morph">
          <span className="logo-dna-badge__arrow" aria-hidden="true">⟵</span>
          <strong>{morphTarget}</strong>
        </div>
      </div>
    </div>
  );
}
