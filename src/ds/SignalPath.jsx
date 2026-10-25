import React, { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion.js';

/**
 * زبان حرکتی واحد سامانه (Signal):
 * حرکت نقطه حامل سیگنال نارنجی در امتداد مسیر برداری همراه با وضعیت پایدار در حالت کاهش حرکت
 */
export function SignalPath({
  path = 'M 540,28 C 430,28 390,8 280,18 C 170,28 120,42 20,22',
  viewBox = '0 0 560 52',
  duration = '4.4s',
  label = 'مسیر انتقال سیگنال تله‌متری',
  staticPoint = { x: 148, y: 27 },
  className = '',
}) {
  const reducedMotion = usePrefersReducedMotion();
  const svgRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const showStatic = reducedMotion || !inView;

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      role="img"
      aria-label={label}
      className={`ds-signal-svg ${className}`.trim()}
    >
      <path d={path} className="ds-signal-svg__rail" />
      <path
        d={path}
        pathLength="100"
        className={`ds-signal-svg__trace ${showStatic ? 'is-static' : ''}`.trim()}
      />

      {showStatic ? (
        <g transform={`translate(${staticPoint.x} ${staticPoint.y})`}>
          <circle r="9" className="ds-signal-svg__halo" />
          <circle r="4.5" className="ds-signal-svg__dot" />
        </g>
      ) : (
        <g>
          <circle r="10" className="ds-signal-svg__halo">
            <animateMotion dur={duration} repeatCount="indefinite" path={path} />
          </circle>
          <circle r="4.5" className="ds-signal-svg__dot">
            <animateMotion dur={duration} repeatCount="indefinite" path={path} />
          </circle>
        </g>
      )}
    </svg>
  );
}

export default SignalPath;
