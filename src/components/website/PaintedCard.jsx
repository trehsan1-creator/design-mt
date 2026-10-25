import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * کارتی که ابتدا توسط خط نارنجی نقاش دورگیری می‌شود و سپس به صورت سه‌بعدی از بوم بیرون می‌آید
 */
export default function PaintedCard({
  children,
  tone = 'alabaster', // 'alabaster' | 'horizon'
  delay = 0,
  className = '',
}) {
  const reducedMotion = usePrefersReducedMotion();
  const wrapRef = useRef(null);
  const strokeRef = useRef(null);
  const sparkRef = useRef(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;

    if (reducedMotion) {
      el.style.setProperty('--card-build', '1');
      el.style.setProperty('--card-tilt-in', '0deg');
      el.style.setProperty('--card-shift-y', '0px');
      if (strokeRef.current) strokeRef.current.setAttribute('stroke-dashoffset', '0');
      if (sparkRef.current) sparkRef.current.setAttribute('opacity', '0');
      return undefined;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // شروع نقاشی وقتی کارت وارد ۸۸٪ ارتفاع دید می‌شود و تکمیل در ۴۲٪
      const raw = (vh * 0.9 - rect.top) / (vh * 0.48);
      const p = clamp(raw - delay, 0, 1);

      // فاز ۱: کشیده شدن دورکادر نارنجی (0..0.62)
      const strokeP = easeOutCubic(clamp(p / 0.62, 0, 1));
      // فاز ۲: بیرون آمدن حجم سه‌بعدی کارت از دل بوم (0.28..1.0)
      const bodyP = easeOutCubic(clamp((p - 0.24) / 0.76, 0, 1));

      el.style.setProperty('--card-build', bodyP.toFixed(3));
      el.style.setProperty('--card-tilt-in', `${((1 - bodyP) * 18).toFixed(2)}deg`);
      el.style.setProperty('--card-shift-y', `${((1 - bodyP) * 34).toFixed(1)}px`);

      if (strokeRef.current) {
        strokeRef.current.setAttribute('stroke-dashoffset', `${(1 - strokeP).toFixed(3)}`);
        strokeRef.current.setAttribute('opacity', strokeP > 0.01 ? (bodyP > 0.95 ? '0.42' : '1') : '0');

        if (strokeRef.current.getTotalLength && sparkRef.current) {
          if (strokeP > 0.02 && strokeP < 0.98) {
            const total = strokeRef.current.getTotalLength();
            const pt = strokeRef.current.getPointAtLength(total * strokeP);
            sparkRef.current.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
            sparkRef.current.setAttribute('opacity', '1');
          } else {
            sparkRef.current.setAttribute('opacity', '0');
          }
        }
      }
    };

    const requestTick = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', requestTick, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', requestTick);
      window.removeEventListener('resize', requestTick);
    };
  }, [delay, reducedMotion]);

  const handlePointerMove = (e) => {
    if (reducedMotion || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const ux = (e.clientX - rect.left) / rect.width;
    const uy = (e.clientY - rect.top) / rect.height;
    const rx = (0.5 - uy) * 10;
    const ry = (ux - 0.5) * 12;
    wrapRef.current.style.setProperty('--hover-rx', `${rx.toFixed(2)}deg`);
    wrapRef.current.style.setProperty('--hover-ry', `${ry.toFixed(2)}deg`);
    wrapRef.current.style.setProperty('--glare-x', `${(ux * 100).toFixed(1)}%`);
    wrapRef.current.style.setProperty('--glare-y', `${(uy * 100).toFixed(1)}%`);
  };

  const handlePointerLeave = () => {
    if (!wrapRef.current) return;
    wrapRef.current.style.setProperty('--hover-rx', '0deg');
    wrapRef.current.style.setProperty('--hover-ry', '0deg');
  };

  return (
    <div
      ref={wrapRef}
      className={`painted-card painted-card--${tone} ${className}`.trim()}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* قاب SVG نقاش که دور کارت را زنده رسم می‌کند */}
      <svg
        viewBox="0 0 400 280"
        preserveAspectRatio="none"
        className="painted-card__sketch-svg"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="394"
          height="274"
          rx="28"
          ry="28"
          className="painted-card__sketch-rail"
        />
        <rect
          ref={strokeRef}
          x="3"
          y="3"
          width="394"
          height="274"
          rx="28"
          ry="28"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="1"
          className="painted-card__sketch-stroke"
        />
        <g ref={sparkRef} opacity="0">
          <circle r="11" className="painter-spark-halo" />
          <circle r="4.5" className="painter-spark-core" />
        </g>
      </svg>

      {/* بدنه سه‌بعدی برجسته با درخشش دنبال‌کننده موس */}
      <div className="painted-card__surface">
        <div className="painted-card__glare" aria-hidden="true" />
        <div className="painted-card__content">{children}</div>
      </div>
    </div>
  );
}
