import React, { useState } from 'react';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion.js';
import { toFa } from '../utils/faDigits.js';

const DEFAULT_SERIES = [
  { hour: '۰۸:۰۰', speed: 68, fuel: 25.4 },
  { hour: '۱۰:۰۰', speed: 82, fuel: 27.9 },
  { hour: '۱۲:۰۰', speed: 88, fuel: 28.6 },
  { hour: '۱۴:۰۰', speed: 74, fuel: 26.2 },
  { hour: '۱۶:۰۰', speed: 96, fuel: 31.8 },
  { hour: '۱۸:۰۰', speed: 85, fuel: 28.1 },
  { hour: '۲۰:۰۰', speed: 79, fuel: 26.7 },
];

/**
 * نمودار راست‌به‌چپ (RTL) تله‌متری ناوگان:
 * محور زمان از راست (ابتدای شیفت) به چپ (آخرین ثبت) جریان دارد
 */
export function RtlTelemetryChart({ series = DEFAULT_SERIES, speedLimit = 95, dayCount = 7 }) {
  const [activeIdx, setActiveIdx] = useState(series.length - 1);
  const reducedMotion = usePrefersReducedMotion();

  const W = 560;
  const H = 196;
  const padX = 36;
  const padTop = 24;
  const padBot = 34;
  const plotW = W - padX * 2;
  const plotH = H - padTop - padBot;
  const maxSpeed = 120;

  // RTL: index 0 at rightmost X, last index at leftmost X
  const points = series.map((d, i) => {
    const ratio = i / Math.max(1, series.length - 1);
    const x = W - padX - ratio * plotW;
    const adjustedSpeed = Math.min(114, Math.round(d.speed + ((dayCount % 3) - 1) * 2));
    const y = padTop + plotH - (adjustedSpeed / maxSpeed) * plotH;
    const barH = (d.fuel / 40) * plotH;
    return { ...d, adjustedSpeed, x, y, barH };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(1)},${padTop + plotH} L ${points[0].x.toFixed(1)},${padTop + plotH} Z`;
  const limitY = padTop + plotH - (speedLimit / maxSpeed) * plotH;
  const selected = points[activeIdx] || points[points.length - 1];

  return (
    <div className="ds-rtl-chart">
      <div className="ds-between-wrap ds-rtl-chart__head">
        <div>
          <strong>روند راست‌به‌چپ سرعت میانه و مصرف سوخت ناوگان</strong>
          <div className="ds-muted">محور زمان فارسی از راست (شروع شیفت) به چپ (آخرین پالس)</div>
        </div>
        <div className="ds-rtl-chart__readout ds-tabular" aria-live="polite">
          <span>ساعت {selected.hour}</span>
          <span className="ds-accent-text">{toFa(selected.adjustedSpeed)} km/h</span>
          <span>{toFa(selected.fuel.toFixed(1))} L/100</span>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="نمودار راست‌به‌چپ سرعت و مصرف سوخت در طول ساعات روز"
        className="ds-rtl-chart__svg"
      >
        <line
          x1={padX}
          y1={limitY}
          x2={W - padX}
          y2={limitY}
          className="ds-rtl-chart__limit-line"
        />
        <text x={padX + 6} y={limitY - 6} className="ds-rtl-chart__limit-label">
          سقف مجاز {toFa(speedLimit)} km/h
        </text>

        {points.map((p, idx) => (
          <g key={p.hour}>
            <rect
              x={p.x - 10}
              y={padTop + plotH - p.barH}
              width="20"
              height={p.barH}
              rx="4"
              className={`ds-rtl-chart__bar ${idx === activeIdx ? 'is-selected' : ''}`}
            />
            <text x={p.x} y={H - 10} textAnchor="middle" className="ds-rtl-chart__axis-label">
              {p.hour}
            </text>
          </g>
        ))}

        <path d={areaPath} className="ds-rtl-chart__area" />
        <path d={linePath} className="ds-rtl-chart__line" />

        {!reducedMotion && (
          <circle r="4.5" className="ds-signal-svg__dot">
            <animateMotion dur="5.2s" repeatCount="indefinite" path={linePath} />
          </circle>
        )}

        {points.map((p, idx) => (
          <g key={`pt-${p.hour}`}>
            {idx === activeIdx && <circle cx={p.x} cy={p.y} r="10" className="ds-signal-svg__halo" />}
            <circle
              cx={p.x}
              cy={p.y}
              r={idx === activeIdx ? '5.5' : '4'}
              className={`ds-rtl-chart__point ${p.adjustedSpeed > speedLimit ? 'is-over' : ''}`}
            />
          </g>
        ))}
      </svg>

      <div className="ds-rtl-chart__slots" role="group" aria-label="انتخاب بازه ساعتی روی نمودار">
        {points.map((p, idx) => (
          <button
            key={p.hour}
            type="button"
            aria-pressed={idx === activeIdx}
            className={`ds-rtl-chart__slot ds-tabular ${idx === activeIdx ? 'is-active' : ''}`}
            onClick={() => setActiveIdx(idx)}
          >
            {p.hour}
          </button>
        ))}
      </div>
    </div>
  );
}

export default RtlTelemetryChart;
