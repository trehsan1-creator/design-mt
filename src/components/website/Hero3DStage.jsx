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
  const skyArcRef = useRef(null);
  const skyStrokeRef = useRef(null);
  const railLeftRef = useRef(null);
  const railRightRef = useRef(null);
  const glowPathRef = useRef(null);
  const strokePathRef = useRef(null);
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
        copyRef.current.style.setProperty('--hero-copy-op', `${clamp(1 - p * 1.05, 0.14, 1).toFixed(3)}`);
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

  // امتداد مهندسی‌شده بزرگراه از خروجی واقعی طاق دروازه تندیس سه‌بعدی تا سوکت مرکزی پایین هیرو
  const handleGatewayScreenUpdate = useCallback(
    (exitX, exitY, skyX, skyY, w, h, corridorAppear, smoothScroll) => {
      if (!svgRef.current || !strokePathRef.current) return;
      svgRef.current.setAttribute('viewBox', `0 0 ${w} ${h}`);

      // ۱. قوس ظریف ورودی سیگنال ماهواره‌ای به دهلیز افق بالای لوگو
      const skyStartX = clamp(skyX + w * 0.14, 0, w);
      const skyStartY = Math.max(44, skyY - 58);
      const dSky = `M ${skyStartX.toFixed(1)},${skyStartY.toFixed(1)} C ${(skyStartX - 60).toFixed(1)},${skyY.toFixed(1)} ${(skyX + 45).toFixed(1)},${skyY.toFixed(1)} ${skyX.toFixed(1)},${skyY.toFixed(1)}`;
      if (skyArcRef.current) skyArcRef.current.setAttribute('d', dSky);
      if (skyStrokeRef.current) {
        skyStrokeRef.current.setAttribute('d', dSky);
        skyStrokeRef.current.setAttribute('opacity', `${(corridorAppear * 0.72).toFixed(3)}`);
      }

      // ۲. خروج بزرگراه از میان طاق دروازه لوگو (با مماس عمودی هم‌راستای ستون و سپر) به مرکز افق پایین
      const endX = w * 0.5;
      const endY = h;
      const spanY = Math.max(48, endY - exitY);
      const dMain = `M ${exitX.toFixed(1)},${exitY.toFixed(1)} C ${exitX.toFixed(1)},${(exitY + spanY * 0.58).toFixed(1)} ${endX.toFixed(1)},${(endY - spanY * 0.44).toFixed(1)} ${endX.toFixed(1)},${endY.toFixed(1)}`;

      // خطوط شانه جاده در دو طرف مسیر اصلی برای القای حس واقعی کریدور آزادراه
      const dLaneL = `M ${(exitX - 10).toFixed(1)},${exitY.toFixed(1)} C ${(exitX - 10).toFixed(1)},${(exitY + spanY * 0.58).toFixed(1)} ${(endX - 8).toFixed(1)},${(endY - spanY * 0.44).toFixed(1)} ${(endX - 6).toFixed(1)},${endY.toFixed(1)}`;
      const dLaneR = `M ${(exitX + 10).toFixed(1)},${exitY.toFixed(1)} C ${(exitX + 10).toFixed(1)},${(exitY + spanY * 0.58).toFixed(1)} ${(endX + 8).toFixed(1)},${(endY - spanY * 0.44).toFixed(1)} ${(endX + 6).toFixed(1)},${endY.toFixed(1)}`;

      if (railLeftRef.current) railLeftRef.current.setAttribute('d', dLaneL);
      if (railRightRef.current) railRightRef.current.setAttribute('d', dLaneR);
      if (glowPathRef.current) glowPathRef.current.setAttribute('d', dMain);
      strokePathRef.current.setAttribute('d', dMain);

      const draw = clamp(corridorAppear * (0.44 + smoothScroll * 0.56), 0, 1);
      const dashOffset = `${(1 - draw).toFixed(4)}`;
      strokePathRef.current.setAttribute('stroke-dashoffset', dashOffset);
      if (glowPathRef.current) glowPathRef.current.setAttribute('stroke-dashoffset', dashOffset);

      if (handoffSparkRef.current && strokePathRef.current.getTotalLength) {
        const total = strokePathRef.current.getTotalLength();
        if (total > 1) {
          const pt = strokePathRef.current.getPointAtLength(total * draw);
          handoffSparkRef.current.setAttribute(
            'transform',
            `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`
          );
          handoffSparkRef.current.setAttribute('opacity', `${corridorAppear.toFixed(3)}`);
        }
      }
    },
    []
  );

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
        {/* شبکه مهندسی ظریف پس‌زمینه استودیو با زوایای استخراج‌شده لوگو */}
        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          className="hero-blueprint-backdrop"
          aria-hidden="true"
        >
          <circle cx="485" cy="430" r="245" className="hero-blueprint-ring" />
          <circle cx="485" cy="430" r="355" className="hero-blueprint-ring hero-blueprint-ring--dashed" />
          <line x1="160" y1="595" x2="820" y2="262" className="hero-blueprint-axis" />
          <text x="832" y="258" className="hero-blueprint-tag">-26.84° CLOTHOID</text>
          <text x="430" y="168" className="hero-blueprint-tag">R 117.6 · PORTAL</text>
        </svg>

        <Suspense fallback={<div className="hero-fullbleed-webgl" aria-hidden="true" />}>
          <HeroEmblemCanvas
            scrollRef={scrollRef}
            pointerRef={pointerRef}
            reducedMotion={reducedMotion}
            onGatewayScreenUpdate={handleGatewayScreenUpdate}
          />
        </Suspense>

        {/* لایه اتصال بزرگراه از دروازه میانی تندیس سه‌بعدی به درگاه مدار اصلی صفحه */}
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

        <div className="site-container hero-cinema-overlay">
          <div ref={copyRef} className="hero-cinema-copy">
            <div>
              <Capsule tone="orange" dot>
                معماری زنده دروازه ناوگان
              </Capsule>
            </div>

            <h1 className="hero-cinema-title">
              رد هر حرکت،
              <br />
              <span>زنده در دستانت.</span>
            </h1>

            <p className="hero-cinema-lead">
              سیگنال ماهواره از افق بالای نشان وارد می‌شود، از میان طاقِ دروازهٔ لوگو به‌صورت یک بزرگراه زنده بیرون می‌آید و چهار عنصر سازندهٔ برند را در طول مسیر به ابزارهای فرماندهی تبدیل می‌کند.
            </p>

            {/* نوار مفهومی جریان سیگنال درون معماری لوگو */}
            <div className="hero-concept-flow" aria-label="چرخه مفهومی جریان سیگنال در لوگو">
              <span className="hero-concept-flow__step">
                <i className="hero-concept-flow__dot" aria-hidden="true" />
                افق ماهواره
              </span>
              <span className="hero-concept-flow__sep" aria-hidden="true">←</span>
              <span className="hero-concept-flow__step">دروازه آزادراه</span>
              <span className="hero-concept-flow__sep" aria-hidden="true">←</span>
              <span className="hero-concept-flow__step hero-concept-flow__step--active">
                تبدیل ۴ عنصر به ابزار زنده
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
