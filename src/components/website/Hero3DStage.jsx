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
  const stickyRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pulseIdRef = useRef(0);
  const copyRef = useRef(null);

  const svgRef = useRef(null);
  const skyArcRef = useRef(null);
  const skyStrokeRef = useRef(null);
  const railLeftRef = useRef(null);
  const railRightRef = useRef(null);
  const pulseTrackRef = useRef(null);
  const glowPathRef = useRef(null);
  const strokePathRef = useRef(null);
  const handoffSparkRef = useRef(null);

  useEffect(() => {
    const updateScroll = () => {
      if (!trackRef.current) return;
      const scrollTop = Math.max(0, window.scrollY || window.pageYOffset || 0);
      const vh = window.innerHeight || 800;
      const scrollable = Math.max(240, trackRef.current.offsetHeight - vh);
      const p = scrollTop <= 4 ? 0 : clamp((scrollTop - 4) / scrollable, 0, 1);
      scrollProgressRef.current = p;

      const fade = p <= 0.08 ? 1 : clamp(1 - (p - 0.08) * 1.85, 0, 1);
      if (stickyRef.current) {
        stickyRef.current.style.setProperty('--hero-copy-op', fade.toFixed(3));
      }
      if (copyRef.current) {
        copyRef.current.style.setProperty('--hero-copy-op', fade.toFixed(3));
        copyRef.current.style.setProperty('--hero-copy-y', `${(p * 26).toFixed(1)}px`);
      }
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  const handleGatewayScreenUpdate = useCallback(
    (exitX, exitY, skyX, skyY, w, h, corridorAppear, smoothScroll) => {
      if (!svgRef.current || !strokePathRef.current) return;
      svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`);

      if (skyArcRef.current && skyStrokeRef.current) {
        const satStartX = Math.min(w - 24, skyX + w * 0.14);
        const satStartY = Math.max(24, skyY - h * 0.1);
        const dSat = `M ${satStartX.toFixed(1)},${satStartY.toFixed(1)} C ${(satStartX - w * 0.06).toFixed(1)},${(satStartY + h * 0.07).toFixed(1)} ${(skyX + 34).toFixed(1)},${(skyY - 10).toFixed(1)} ${skyX.toFixed(1)},${skyY.toFixed(1)}`;
        skyArcRef.current.setAttribute('d', dSat);
        skyStrokeRef.current.setAttribute('d', dSat);
        skyStrokeRef.current.setAttribute('opacity', `${(corridorAppear * 0.78).toFixed(3)}`);
      }

      const endX = w * 0.5;
      const endY = h;
      const spanY = Math.max(54, endY - exitY);
      const isCompact = w <= 900;
      const bankPush = isCompact ? 54 : Math.min(96, Math.abs(endX - exitX) * 0.4 + 46);
      const c1x = isCompact ? exitX - bankPush : exitX - bankPush * 0.5;
      const c1y = exitY + spanY * 0.36;
      const c2x = isCompact ? endX + bankPush : endX + bankPush * 0.72;
      const c2y = endY - spanY * 0.34;

      const dMain = `M ${exitX.toFixed(1)},${exitY.toFixed(1)} C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`;
      const dLaneL = `M ${(exitX - 10).toFixed(1)},${exitY.toFixed(1)} C ${(c1x - 11).toFixed(1)},${c1y.toFixed(1)} ${(c2x - 9).toFixed(1)},${c2y.toFixed(1)} ${(endX - 7).toFixed(1)},${endY.toFixed(1)}`;
      const dLaneR = `M ${(exitX + 10).toFixed(1)},${exitY.toFixed(1)} C ${(c1x + 11).toFixed(1)},${c1y.toFixed(1)} ${(c2x + 9).toFixed(1)},${c2y.toFixed(1)} ${(endX + 7).toFixed(1)},${endY.toFixed(1)}`;

      if (railLeftRef.current) railLeftRef.current.setAttribute('d', dLaneL);
      if (railRightRef.current) railRightRef.current.setAttribute('d', dLaneR);
      if (pulseTrackRef.current) pulseTrackRef.current.setAttribute('d', dMain);
      if (glowPathRef.current) glowPathRef.current.setAttribute('d', dMain);
      strokePathRef.current.setAttribute('d', dMain);

      const draw = clamp(corridorAppear * (0.48 + smoothScroll * 0.52), 0, 1);
      const dashOffset = `${(1 - draw).toFixed(4)}`;
      strokePathRef.current.setAttribute('stroke-dashoffset', dashOffset);
      if (glowPathRef.current) glowPathRef.current.setAttribute('stroke-dashoffset', dashOffset);

      if (handoffSparkRef.current && strokePathRef.current.getTotalLength) {
        try {
          const total = strokePathRef.current.getTotalLength();
          if (total > 1) {
            const pt = strokePathRef.current.getPointAtLength(total * draw);
            if (pt) {
              handoffSparkRef.current.setAttribute(
                'transform',
                `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`
              );
              handoffSparkRef.current.setAttribute('opacity', `${corridorAppear.toFixed(3)}`);
            }
          }
        } catch {
          // ignore layout shift
        }
      }
    },
    []
  );

  const updatePointerCoords = (clientX, clientY, targetEl) => {
    if (reducedMotion || !targetEl) return;
    const rect = targetEl.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * 100;
    const py = ((clientY - rect.top) / rect.height) * 100;
    const nx = (px / 100) * 2 - 1;
    const ny = (py / 100) * 2 - 1;
    pointerRef.current = { x: clamp(nx, -1, 1), y: clamp(ny, -1, 1) };
    if (stickyRef.current) {
      stickyRef.current.style.setProperty('--hero-spot-x', `${px.toFixed(1)}%`);
      stickyRef.current.style.setProperty('--hero-spot-y', `${py.toFixed(1)}%`);
    }
  };

  const handlePointerMove = (e) => {
    updatePointerCoords(e.clientX, e.clientY, e.currentTarget);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      updatePointerCoords(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
    }
  };

  const handleStageTap = (e) => {
    if (e.target.closest('button, a')) return;
    pulseIdRef.current += 1;
  };

  const handlePointerLeave = () => {
    pointerRef.current = { x: 0, y: 0 };
  };

  return (
    <section id="hero" ref={trackRef} className="hero-cinema-track">
      <div
        ref={stickyRef}
        className="hero-cinema-sticky"
        data-polarity="nocturnal"
        onPointerMove={handlePointerMove}
        onTouchMove={handleTouchMove}
        onPointerLeave={handlePointerLeave}
        onClick={handleStageTap}
      >
        <div className="hero-interactive-spotlight" aria-hidden="true" />

        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" className="hero-blueprint-backdrop" aria-hidden="true">
          <circle cx="430" cy="442" r="240" className="hero-blueprint-ring" />
          <circle cx="430" cy="442" r="348" className="hero-blueprint-ring hero-blueprint-ring--dashed" />
          <line x1="150" y1="584" x2="730" y2="290" className="hero-blueprint-axis" />
          <text x="690" y="282" className="hero-blueprint-tag">GPS · 64 CHANNELS LIVE</text>
          <text x="315" y="186" className="hero-blueprint-tag">R 117.6 · FLEET GATEWAY</text>
        </svg>

        <Suspense fallback={<div className="hero-fullbleed-webgl" aria-hidden="true" />}>
          <HeroEmblemCanvas
            scrollRef={scrollProgressRef}
            pointerRef={pointerRef}
            pulseRef={pulseIdRef}
            reducedMotion={reducedMotion}
            onGatewayScreenUpdate={handleGatewayScreenUpdate}
          />
        </Suspense>

        <svg
          ref={svgRef}
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          className="hero-painter-handoff"
          aria-hidden="true"
        >
          <path ref={skyArcRef} className="hero-painter-handoff__rail" />
          <path ref={skyStrokeRef} opacity="0" className="hero-painter-handoff__sky" />

          <path ref={railLeftRef} className="hero-painter-handoff__lane" />
          <path ref={railRightRef} className="hero-painter-handoff__lane" />
          <path ref={pulseTrackRef} className="hero-painter-handoff__pulse" />

          <path
            ref={glowPathRef}
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="0.56"
            className="hero-painter-handoff__glow"
          />
          <path
            ref={strokePathRef}
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="0.56"
            className="hero-painter-handoff__stroke"
          />
          <g ref={handoffSparkRef} opacity="0">
            <circle r="16" className="painter-spark-halo" />
            <circle r="6" className="painter-spark-core" />
          </g>
        </svg>

        {/* بج راهنمای تعامل و اسکرول در فضای باز زیر تندیس در موبایل */}
        <div className="hero-mobile-touch-chip" aria-hidden="true">
          <span className="hero-concept-flow__dot" />
          با اسکرول، تندیس باز می‌شود · لمس برای چرخش
        </div>

        <div className="site-container hero-cinema-overlay">
          <div ref={copyRef} className="hero-cinema-copy">
            <div>
              <Capsule tone="orange" dot>
                پایش زنده ناوگان · ضد سرقت سوخت · پوشش سراسری
              </Capsule>
            </div>

            <h1 className="hero-cinema-title">
              هر ثانیه از جاده،
              <br />
              <span>زنده در دستانت.</span>
            </h1>

            <p className="hero-cinema-lead">
              از لحظهٔ استارت خودرو تا تخلیهٔ بار در اسکله؛ مصرف واقعی سوخت، دمای یخچال و مسیر دقیق ناوگان را بی‌واسطه کنترل کنید تا با ورود سیگنال، هر ابزار مدیریتی شکل بگیرد.
            </p>

            <div className="hero-concept-flow" aria-label="سفر سیگنال از جاده تا سود ناوگان">
              <span className="hero-concept-flow__step">
                <i className="hero-concept-flow__dot" aria-hidden="true" />
                دریافت از خودرو
              </span>
              <span className="hero-concept-flow__sep" aria-hidden="true">←</span>
              <span className="hero-concept-flow__step">شکل‌گیری ابزارها</span>
              <span className="hero-concept-flow__sep" aria-hidden="true">←</span>
              <span className="hero-concept-flow__step hero-concept-flow__step--active">
                کاهش ۱۸٪ هزینه‌ها
              </span>
            </div>

            <div className="hero-cinema-cta">
              <Button as="a" href="#story-cards" variant="primary" size="lg">
                ورود به بزرگراه سیگنال ↙
              </Button>
            </div>
          </div>
        </div>

        <div className="hero-handoff-port" aria-hidden="true">
          <span className="hero-handoff-port__ring" />
          <span className="hero-handoff-port__dot" />
        </div>
        <div className="hero-sand-bridge" aria-hidden="true" />
      </div>
    </section>
  );
}
