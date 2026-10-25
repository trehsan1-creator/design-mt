import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

/**
 * گره کالبدساز مدار زنده:
 * پیش از رسیدن سیگنال، فقط شبح مهندسی (Blueprint) کامپوننت دیده می‌شود؛
 * به محض ورود خط نارنجی به سوکت بالا، پرتو افقی کالیبراسیون همراه با دو شاخه کناری پایین می‌آید
 * و کالبد واقعی کامپوننت را میلی‌متر به میلی‌متر شکل می‌دهد.
 */
export default function PaintedCard({
  children,
  nodeId,
  className = '',
  tone = 'alabaster',
  hasBottomPort = true,
  interactiveTilt = true,
  onProgressRef,
}) {
  const reducedMotion = usePrefersReducedMotion();
  const rootRef = useRef(null);
  const svgRef = useRef(null);
  const leftSplitRef = useRef(null);
  const rightSplitRef = useRef(null);
  const leftSparkRef = useRef(null);
  const rightSparkRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    const rebuildPerimeter = () => {
      const w = Math.max(120, el.offsetWidth);
      const h = Math.max(80, el.offsetHeight);
      const r = Math.min(28, w * 0.12, h * 0.22);
      const s = 1.5;
      const cx = w * 0.5;

      if (svgRef.current) {
        svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`);
      }

      const dRight = [
        `M ${cx},${s}`,
        `L ${w - r},${s}`,
        `A ${r - s},${r - s} 0 0 1 ${w - s},${r}`,
        `L ${w - s},${h - r}`,
        `A ${r - s},${r - s} 0 0 1 ${w - r},${h - s}`,
        `L ${cx},${h - s}`,
      ].join(' ');

      const dLeft = [
        `M ${cx},${s}`,
        `L ${r},${s}`,
        `A ${r - s},${r - s} 0 0 0 ${s},${r}`,
        `L ${s},${h - r}`,
        `A ${r - s},${r - s} 0 0 0 ${r},${h - s}`,
        `L ${cx},${h - s}`,
      ].join(' ');

      if (rightSplitRef.current) rightSplitRef.current.setAttribute('d', dRight);
      if (leftSplitRef.current) leftSplitRef.current.setAttribute('d', dLeft);

      const railRight = el.querySelector('[data-rail-right]');
      const railLeft = el.querySelector('[data-rail-left]');
      if (railRight) railRight.setAttribute('d', dRight);
      if (railLeft) railLeft.setAttribute('d', dLeft);
    };

    rebuildPerimeter();
    const ro = new ResizeObserver(rebuildPerimeter);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!onProgressRef || !rootRef.current) return undefined;
    const el = rootRef.current;
    const handler = (e) => {
      if (typeof onProgressRef.current === 'function') {
        onProgressRef.current(e.detail.progress);
      }
    };
    el.addEventListener('circuit-progress', handler);
    return () => el.removeEventListener('circuit-progress', handler);
  }, [onProgressRef]);

  const handlePointerMove = (e) => {
    if (reducedMotion || !interactiveTilt || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    rootRef.current.style.setProperty('--card-rx', `${(-ny * 4.0).toFixed(2)}deg`);
    rootRef.current.style.setProperty('--card-ry', `${(nx * 5.0).toFixed(2)}deg`);
    rootRef.current.style.setProperty('--glare-x', `${((nx * 0.5 + 0.5) * 100).toFixed(1)}%`);
    rootRef.current.style.setProperty('--glare-y', `${((ny * 0.5 + 0.5) * 100).toFixed(1)}%`);
  };

  const handlePointerLeave = () => {
    if (!rootRef.current) return;
    rootRef.current.style.setProperty('--card-rx', '0deg');
    rootRef.current.style.setProperty('--card-ry', '0deg');
  };

  return (
    <div
      ref={rootRef}
      data-circuit-node={nodeId}
      data-tone={tone}
      className={`painted-card ${className}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {/* شبح مهندسی اولیه پیش از ورود مسیر به کامپوننت */}
      <div className="painted-card__blueprint" aria-hidden="true">
        <span className="painted-card__blueprint-tag">در انتظار تزریق سیگنال…</span>
      </div>

      {/* سوکت ورودی سیگنال در مرکز دقیق لبه بالایی */}
      <span className="circuit-socket circuit-socket--in" data-port-in aria-hidden="true">
        <span className="circuit-socket__core" />
      </span>

      {/* دو شاخه نوار نقاش که هم در موبایل و هم دسکتاپ هم‌زمان دور کادر کشیده می‌شوند */}
      <svg
        ref={svgRef}
        viewBox="0 0 400 260"
        preserveAspectRatio="none"
        className="painted-card__sketch"
        aria-hidden="true"
      >
        <path data-rail-right className="painted-card__rail" />
        <path data-rail-left className="painted-card__rail" />
        <path
          ref={rightSplitRef}
          data-split-right
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={reducedMotion ? '0' : '1'}
          className="painted-card__stroke"
        />
        <path
          ref={leftSplitRef}
          data-split-left
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={reducedMotion ? '0' : '1'}
          className="painted-card__stroke"
        />
        <circle ref={rightSparkRef} data-spark-right r="4.8" opacity="0" className="painted-card__spark" />
        <circle ref={leftSparkRef} data-spark-left r="4.8" opacity="0" className="painted-card__spark" />
      </svg>

      {/* تیغه نوری افقی که هم‌پای سیگنال پایین می‌آید و بدنه کامپوننت را شکل می‌دهد */}
      <div className="painted-card__forge-horizon" aria-hidden="true" />

      <div className="painted-card__surface">
        <div className="painted-card__glare" aria-hidden="true" />
        <div className="painted-card__body">{children}</div>
      </div>

      {hasBottomPort && (
        <span className="circuit-socket circuit-socket--out" data-port-out aria-hidden="true">
          <span className="circuit-socket__core" />
        </span>
      )}
    </div>
  );
}
