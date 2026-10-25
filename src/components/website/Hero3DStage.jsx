import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { ArrowDownLeft } from 'lucide-react';
import { Button, Capsule } from '../../ds/index.js';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

const HeroEmblemCanvas = lazy(() => import('./HeroEmblemCanvas.jsx'));

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

export default function Hero3DStage() {
  const reducedMotion = usePrefersReducedMotion();
  const trackRef = useRef(null);
  const copyRef = useRef(null);
  const beamPathRef = useRef(null);
  const beamSparkRef = useRef(null);

  const scrollRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updateScroll = () => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const p = clamp(window.scrollY / scrollable, 0, 1);
      scrollRef.current = p;

      if (copyRef.current && !reducedMotion) {
        copyRef.current.style.setProperty('--hero-copy-y', `${(p * -42).toFixed(1)}px`);
        copyRef.current.style.setProperty('--hero-copy-op', `${clamp(1 - p * 1.15, 0.18, 1).toFixed(3)}`);
      }

      if (beamPathRef.current) {
        const draw = reducedMotion ? 1 : clamp(0.18 + p * 0.82, 0, 1);
        beamPathRef.current.setAttribute('stroke-dashoffset', `${(1 - draw).toFixed(3)}`);
        if (beamPathRef.current.getTotalLength && beamSparkRef.current) {
          const len = beamPathRef.current.getTotalLength();
          const pt = beamPathRef.current.getPointAtLength(len * draw);
          beamSparkRef.current.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
        }
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
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
      >
        {/* لایه پس‌زمینه تمام‌صفحه سه‌بعدی لوگو */}
        <Suspense fallback={null}>
          <HeroEmblemCanvas
            scrollRef={scrollRef}
            pointerRef={pointerRef}
            reducedMotion={reducedMotion}
          />
        </Suspense>

        {/* شروع نوار نقاش سیگنال از زیر نوک ۱۳۶.۵۴ درجه تندیس سه‌بعدی به سمت مرکز فصل اول */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMax slice"
          className="hero-painter-handoff"
          aria-hidden="true"
        >
          <path
            d="M 465,695 C 475,805 655,825 720,900"
            className="hero-painter-handoff__rail"
          />
          <path
            ref={beamPathRef}
            d="M 465,695 C 475,805 655,825 720,900"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="0.82"
            className="hero-painter-handoff__stroke"
          />
          <g ref={beamSparkRef} transform="translate(476, 735)">
            <circle r="14" className="painter-spark-halo" />
            <circle r="5.5" className="painter-spark-core" />
          </g>
        </svg>

        {/* متن مینیمال و تنفس‌دار روی پس‌زمینه سه‌بعدی */}
        <div className="site-container hero-cinema-overlay">
          <div ref={copyRef} className="hero-cinema-copy">
            <div>
              <Capsule variant="eyebrow" pulse>
                هوش فضایی ناوگان
              </Capsule>
            </div>

            <h1 className="hero-cinema-title">
              ردِ هر حرکت،
              <br />
              <span>زنده در دستانت.</span>
            </h1>

            <p className="hero-cinema-lead">
              یک خط سیگنال که از لحظه استارت تا مقصد نهایی، تمام ناوگان را لحظه‌به‌لحظه روایت می‌کند.
            </p>

            <div className="hero-cinema-cta">
              <Button as="a" href="#finale-portal" variant="primary" size="lg">
                <span>شروع تجربه زنده</span>
                <ArrowDownLeft size={18} aria-hidden="true" />
              </Button>
              <a href="#story-cards" className="hero-scroll-whisper">
                موس را حرکت دهید · اسکرول کنید تا خط سیگنال بسازد
              </a>
            </div>
          </div>
        </div>

        {/* محو نرم پایین صحنه به سمت بوم روشن شنی فصل اول */}
        <div className="hero-sand-bridge" aria-hidden="true" />
      </div>
    </section>
  );
}
