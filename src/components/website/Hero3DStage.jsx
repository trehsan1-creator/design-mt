import React, { Suspense, lazy, useCallback, useEffect, useRef } from 'react';
import { Button, Capsule } from '../../ds';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

const HeroEmblemCanvas = lazy(() => import('./HeroEmblemCanvas.jsx'));

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function evalCubic1D(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

export default function Hero3DStage() {
  const reducedMotion = usePrefersReducedMotion();
  const trackRef = useRef(null);
  const stickyRef = useRef(null);
  const scrollProgressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const pulseIdRef = useRef(0);
  const copyRef = useRef(null);
  const stickyBoundsRef = useRef(null);
  const ptrRafRef = useRef(0);

  const svgRef = useRef(null);
  const skyArcRef = useRef(null);
  const skyStrokeRef = useRef(null);
  const railLeftRef = useRef(null);
  const railRightRef = useRef(null);
  const pulseTrackRef = useRef(null);
  const glowPathRef = useRef(null);
  const strokePathRef = useRef(null);
  const handoffSparkRef = useRef(null);
  const gatewayCacheRef = useRef({
    w: 0,
    h: 0,
    exitX: -999,
    exitY: -999,
    skyX: -999,
    skyY: -999,
    c1x: 0,
    c1y: 0,
    c2x: 0,
    c2y: 0,
    endX: 0,
    endY: 0,
    lastDash: '',
    lastSkyOp: '',
    lastSparkOp: '',
    lastSparkTf: '',
  });

  const syncHeroScrollRef = useRef(null);

  useEffect(() => {
    let scrollable = 520;
    let baseTrackTop = 0;
    let lastFadeStr = '';
    let lastYStr = '';

    const getAnyScrollTop = () =>
      Math.max(
        window.scrollY || 0,
        window.pageYOffset || 0,
        document.scrollingElement?.scrollTop || 0,
        document.documentElement?.scrollTop || 0,
        document.body?.scrollTop || 0
      );

    const measureTrack = () => {
      if (!trackRef.current) return;
      const vh = window.innerHeight || 800;
      scrollable = Math.max(240, trackRef.current.offsetHeight - vh);
      const rect = trackRef.current.getBoundingClientRect();
      baseTrackTop = rect.top + getAnyScrollTop();
      stickyBoundsRef.current = null;
    };

    const updateScroll = () => {
      if (!trackRef.current) return;
      const rectTop = trackRef.current.getBoundingClientRect().top;
      const byRect = Math.max(0, baseTrackTop - rectTop);
      const scrollTop = Math.max(getAnyScrollTop(), byRect);
      const p = scrollTop <= 4 ? 0 : clamp((scrollTop - 4) / scrollable, 0, 1);
      scrollProgressRef.current = p;

      const fade = p <= 0.08 ? 1 : clamp(1 - (p - 0.08) * 1.85, 0, 1);
      const fadeStr = fade.toFixed(3);
      const yStr = `${(p * 26).toFixed(1)}px`;

      if (fadeStr !== lastFadeStr) {
        lastFadeStr = fadeStr;
        if (stickyRef.current) {
          stickyRef.current.style.setProperty('--hero-copy-op', fadeStr);
        }
        if (copyRef.current) {
          copyRef.current.style.setProperty('--hero-copy-op', fadeStr);
        }
      }
      if (yStr !== lastYStr && copyRef.current) {
        lastYStr = yStr;
        copyRef.current.style.setProperty('--hero-copy-y', yStr);
      }
    };

    syncHeroScrollRef.current = updateScroll;
    measureTrack();
    updateScroll();

    const ro = new ResizeObserver(() => {
      measureTrack();
      updateScroll();
    });
    if (trackRef.current) ro.observe(trackRef.current);

    // پشتیبانی از ژیروسکوپ موبایل برای چرخش زنده سه‌بعدی با تکان دادن گوشی
    const onDeviceOrientation = (e) => {
      if (e.gamma == null || e.beta == null) return;
      const gx = clamp(e.gamma / 28, -1, 1);
      const gy = clamp((e.beta - 42) / 28, -1, 1);
      pointerRef.current = { x: gx, y: gy };
    };

    window.addEventListener('scroll', updateScroll, { passive: true, capture: true });
    window.addEventListener('deviceorientation', onDeviceOrientation, { passive: true });
    return () => {
      ro.disconnect();
      if (ptrRafRef.current) cancelAnimationFrame(ptrRafRef.current);
      window.removeEventListener('scroll', updateScroll, { capture: true });
      window.removeEventListener('deviceorientation', onDeviceOrientation);
    };
  }, []);

  const handleGatewayScreenUpdate = useCallback(
    (exitX, exitY, skyX, skyY, w, h, corridorAppear, smoothScroll) => {
      if (syncHeroScrollRef.current) syncHeroScrollRef.current();
      if (!svgRef.current || !strokePathRef.current) return;
      const cache = gatewayCacheRef.current;

      if (w !== cache.w || h !== cache.h) {
        cache.w = w;
        cache.h = h;
        svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`);
        cache.exitX = -999;
      }

      const geomMoved =
        Math.abs(exitX - cache.exitX) > 0.25 ||
        Math.abs(exitY - cache.exitY) > 0.25 ||
        Math.abs(skyX - cache.skyX) > 0.25 ||
        Math.abs(skyY - cache.skyY) > 0.25;

      if (geomMoved) {
        cache.exitX = exitX;
        cache.exitY = exitY;
        cache.skyX = skyX;
        cache.skyY = skyY;

        if (skyArcRef.current && skyStrokeRef.current) {
          const satStartX = Math.min(w - 24, skyX + w * 0.14);
          const satStartY = Math.max(24, skyY - h * 0.1);
          const dSat = `M ${satStartX.toFixed(1)},${satStartY.toFixed(1)} C ${(satStartX - w * 0.06).toFixed(1)},${(satStartY + h * 0.07).toFixed(1)} ${(skyX + 34).toFixed(1)},${(skyY - 10).toFixed(1)} ${skyX.toFixed(1)},${skyY.toFixed(1)}`;
          skyArcRef.current.setAttribute('d', dSat);
          skyStrokeRef.current.setAttribute('d', dSat);
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

        cache.c1x = c1x;
        cache.c1y = c1y;
        cache.c2x = c2x;
        cache.c2y = c2y;
        cache.endX = endX;
        cache.endY = endY;

        const dMain = `M ${exitX.toFixed(1)},${exitY.toFixed(1)} C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`;
        const dLaneL = `M ${(exitX - 10).toFixed(1)},${exitY.toFixed(1)} C ${(c1x - 11).toFixed(1)},${c1y.toFixed(1)} ${(c2x - 9).toFixed(1)},${c2y.toFixed(1)} ${(endX - 7).toFixed(1)},${endY.toFixed(1)}`;
        const dLaneR = `M ${(exitX + 10).toFixed(1)},${exitY.toFixed(1)} C ${(c1x + 11).toFixed(1)},${c1y.toFixed(1)} ${(c2x + 9).toFixed(1)},${c2y.toFixed(1)} ${(endX + 7).toFixed(1)},${endY.toFixed(1)}`;

        if (railLeftRef.current) railLeftRef.current.setAttribute('d', dLaneL);
        if (railRightRef.current) railRightRef.current.setAttribute('d', dLaneR);
        if (pulseTrackRef.current) pulseTrackRef.current.setAttribute('d', dMain);
        if (glowPathRef.current) glowPathRef.current.setAttribute('d', dMain);
        strokePathRef.current.setAttribute('d', dMain);
      }

      if (skyStrokeRef.current) {
        const skyOp = (corridorAppear * 0.78).toFixed(3);
        if (skyOp !== cache.lastSkyOp) {
          cache.lastSkyOp = skyOp;
          skyStrokeRef.current.setAttribute('opacity', skyOp);
        }
      }

      const draw = clamp(corridorAppear * (0.48 + smoothScroll * 0.52), 0, 1);
      const dashOffset = (1 - draw).toFixed(4);
      if (dashOffset !== cache.lastDash) {
        cache.lastDash = dashOffset;
        strokePathRef.current.setAttribute('stroke-dashoffset', dashOffset);
        if (glowPathRef.current) glowPathRef.current.setAttribute('stroke-dashoffset', dashOffset);
      }

      if (handoffSparkRef.current) {
        const sx = evalCubic1D(cache.exitX, cache.c1x, cache.c2x, cache.endX, draw);
        const sy = evalCubic1D(cache.exitY, cache.c1y, cache.c2y, cache.endY, draw);
        const tf = `translate(${sx.toFixed(1)}, ${sy.toFixed(1)})`;
        const op = corridorAppear.toFixed(3);
        if (tf !== cache.lastSparkTf) {
          cache.lastSparkTf = tf;
          handoffSparkRef.current.setAttribute('transform', tf);
        }
        if (op !== cache.lastSparkOp) {
          cache.lastSparkOp = op;
          handoffSparkRef.current.setAttribute('opacity', op);
        }
      }
    },
    []
  );

  const schedulePointerUpdate = (clientX, clientY) => {
    if (!stickyRef.current) return;
    if (!stickyBoundsRef.current) {
      stickyBoundsRef.current = stickyRef.current.getBoundingClientRect();
    }
    const rect = stickyBoundsRef.current;
    if (!rect || rect.width < 10 || rect.height < 10) return;

    const px = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const py = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
    pointerRef.current = {
      x: (px / 100) * 2 - 1,
      y: (py / 100) * 2 - 1,
    };

    if (!ptrRafRef.current) {
      ptrRafRef.current = requestAnimationFrame(() => {
        ptrRafRef.current = 0;
        if (stickyRef.current) {
          stickyRef.current.style.setProperty('--hero-spot-x', `${px.toFixed(1)}%`);
          stickyRef.current.style.setProperty('--hero-spot-y', `${py.toFixed(1)}%`);
        }
      });
    }
  };

  const refreshBounds = () => {
    if (stickyRef.current) {
      stickyBoundsRef.current = stickyRef.current.getBoundingClientRect();
    }
  };

  const handlePointerMove = (e) => {
    schedulePointerUpdate(e.clientX, e.clientY);
  };

  const handleTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      schedulePointerUpdate(e.touches[0].clientX, e.touches[0].clientY);
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
        onPointerEnter={refreshBounds}
        onTouchStart={refreshBounds}
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
