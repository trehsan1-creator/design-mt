import React, { Suspense, lazy, useCallback, useEffect, useRef } from 'react';
import { Button, Capsule } from '../../ds';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

const HeroEmblemCanvas = lazy(() => import('./HeroEmblemCanvas.jsx'));

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export default function Hero3DStage() {
  const reducedMotion = usePrefersReducedMotion();
  const trackRef = useRef(null);
  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const copyRef = useRef(null);

  const svgRef = useRef(null);
  const railPathRef = useRef(null);
  const glowPathRef = useRef(null);
  const strokePathRef = useRef(null);
  const tipNodeRef = useRef(null);
  const handoffSparkRef = useRef(null);

  useEffect(() => {
    const updateScroll = () => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const p = clamp(window.scrollY / scrollable, 0, 1);
      scrollRef.current = p;

      if (copyRef.current && !reducedMotion) {
        copyRef.current.style.setProperty('--hero-copy-y', `${(p * -38).toFixed(1)}px`);
        copyRef.current.style.setProperty('--hero-copy-op', `${clamp(1 - p * 1.05, 0.12, 1).toFixed(3)}`);
      }
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, [reducedMotion]);

  // اتصال لحظه‌ای و پیکسلی نوار نقاش به نوک واقعی تندیس سه‌بعدی در هر فریم
  const handleTipScreenUpdate = useCallback((sx, sy, w, h, tetherReady, smoothScroll) => {
    if (!svgRef.current || !strokePathRef.current) return;
    svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`);

    const endX = w * 0.5;
    const endY = h;
    const spanY = Math.max(40, endY - sy);
    const d = `M ${sx.toFixed(1)},${sy.toFixed(1)} C ${sx.toFixed(1)},${(sy + spanY * 0.54).toFixed(1)} ${endX.toFixed(1)},${(endY - spanY * 0.42).toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`;

    if (railPathRef.current) railPathRef.current.setAttribute('d', d);
    if (glowPathRef.current) glowPathRef.current.setAttribute('d', d);
    strokePathRef.current.setAttribute('d', d);

    // در بدو هم‌گرایی تندیس، بخش اول پرتو روشن می‌شود و با اسکرول تا دقیقاً نقطه تحویل پایین صفحه (50%, 100%) کشیده می‌شود
    const draw = clamp(tetherReady * (0.34 + smoothScroll * 0.66), 0, 1);
    const dashOffset = `${(1 - draw).toFixed(4)}`;
    strokePathRef.current.setAttribute('stroke-dashoffset', dashOffset);
    if (glowPathRef.current) glowPathRef.current.setAttribute('stroke-dashoffset', dashOffset);

    if (tipNodeRef.current) {
      tipNodeRef.current.setAttribute('transform', `translate(${sx.toFixed(1)}, ${sy.toFixed(1)})`);
      tipNodeRef.current.setAttribute('opacity', `${tetherReady.toFixed(3)}`);
    }

    if (handoffSparkRef.current && strokePathRef.current.getTotalLength) {
      const total = strokePathRef.current.getTotalLength();
      if (total > 1) {
        const pt = strokePathRef.current.getPointAtLength(total * draw);
        handoffSparkRef.current.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
        handoffSparkRef.current.setAttribute('opacity', `${tetherReady.toFixed(3)}`);
      }
    }
  }, []);

  const handlePointerMove = (e) => {
    if (reducedMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    pointerRef.current = { x: clamp(nx, -1, 1), y: clamp(ny, -1, 1) };
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
  };

  return (
    <section id="hero" ref={trackRef} className="hero-cinema-track">
      <div
        className="hero-cinema-sticky"
        data-polarity="nocturnal"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        <Suspense fallback={<div className="hero-fullbleed-webgl" aria-hidden="true" />}>
          <HeroEmblemCanvas
            scrollRef={scrollRef}
            pointerRef={pointerRef}
            reducedMotion={reducedMotion}
            onTipScreenUpdate={handleTipScreenUpdate}
          />
        </Suspense>

        {/* رشته سیگنال قفل‌شده به نوک واقعی تندیس سه‌بعدی تا سوکت ورودی مدار پایین صفحه */}
        <svg
          ref={svgRef}
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="hero-painter-handoff"
          aria-hidden="true"
        >
          <path ref={railPathRef} d="M 520,660 C 520,760 720,800 720,900" className="hero-painter-handoff__rail" />
          <path
            ref={glowPathRef}
            d="M 520,660 C 520,760 720,800 720,900"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="0.66"
            className="hero-painter-handoff__glow"
          />
          <path
            ref={strokePathRef}
            d="M 520,660 C 520,760 720,800 720,900"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="0.66"
            className="hero-painter-handoff__stroke"
          />
          <g ref={tipNodeRef} opacity="0">
            <circle r="9" className="painter-spark-halo" />
            <circle r="4" className="painter-spark-core" />
          </g>
          <g ref={handoffSparkRef} opacity="0">
            <circle r="15" className="painter-spark-halo" />
            <circle r="5.5" className="painter-spark-core" />
          </g>
        </svg>

        <div className="site-container hero-cinema-overlay">
          <div ref={copyRef} className="hero-cinema-copy">
            <div>
              <Capsule tone="orange" dot>
                مدار زنده فرماندهی ناوگان
              </Capsule>
            </div>

            <h1 className="hero-cinema-title">
              رد هر حرکت،
              <br />
              <span>زنده در دستانت.</span>
            </h1>

            <p className="hero-cinema-lead">
              یک رشته سیگنال پیوسته که از نوک تندیس سه‌بعدی آغاز می‌شود و با اسکرول شما، حسگرها، کریدور ایران و کالبد ردیاب را یک‌به‌یک روشن می‌کند.
            </p>

            <div className="hero-cinema-cta">
              <Button as="a" href="#story-cards" variant="primary" size="lg">
                همراهی با خط سیگنال ↙
              </Button>
            </div>
          </div>
        </div>

        {/* درگاه تحویل سیگنال در مرز دقیق افق شنی */}
        <div className="hero-handoff-port" aria-hidden="true">
          <span className="hero-handoff-port__ring" />
          <span className="hero-handoff-port__dot" />
        </div>
        <div className="hero-sand-bridge" aria-hidden="true" />
      </div>
    </section>
  );
}
