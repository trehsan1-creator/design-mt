import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { Play, Pause, Navigation, ArrowLeft, Radio } from 'lucide-react';
import { usePrefersReducedMotion, getPrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';
import { Button, Card, Capsule, IranPlate, StatusChip } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';

const HeroEmblemCanvas = lazy(() => import('./HeroEmblemCanvas.jsx'));

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

const HERO_VEHICLES = [
  {
    id: 'v1',
    name: 'کشنده ولوو FH500',
    cargo: 'ترانزیت کانتینری · محور تهران-بندرعباس',
    plateLeft: '۴۸',
    plateChar: 'ع',
    plateRight: '۷۹۲',
    plateCity: '۱۱',
    speed: 88,
    temp: null,
    satellites: 14,
  },
  {
    id: 'v2',
    name: 'کامیون یخچال‌دار اسکانیا',
    cargo: 'زنجیره سرد دارویی · دمای کنترل‌شده',
    plateLeft: '۲۶',
    plateChar: 'ع',
    plateRight: '۴۱۵',
    plateCity: '۶۸',
    speed: 79,
    temp: '-۴.۲°C',
    satellites: 12,
  },
  {
    id: 'v3',
    name: 'ناوگان پخش شهری ایسوزو',
    cargo: 'توزیع مویرگی · ۱۸ ایستگاه تحویل فعال',
    plateLeft: '۷۳',
    plateChar: 'ط',
    plateRight: '۱۶۹',
    plateCity: '۲۲',
    speed: 54,
    temp: null,
    satellites: 15,
  },
];

export default function Hero3DStage() {
  const reducedMotion = usePrefersReducedMotion();
  const [isPlaying, setIsPlaying] = useState(() => !getPrefersReducedMotion());
  const [selectedVeh, setSelectedVeh] = useState(HERO_VEHICLES[0]);
  const [mountWebgl, setMountWebgl] = useState(false);

  // Refs for zero-React-rerender 60fps DOM & SVG updates
  const viewportRef = useRef(null);
  const fineParallaxRef = useRef(null);
  const coarseParallaxRef = useRef(null);
  const routeMainRef = useRef(null);
  const routeSecRef = useRef(null);
  const railMainRef = useRef(null);
  const railSecRef = useRef(null);
  const waypointRef = useRef(null);
  const destRef = useRef(null);
  const mainBeaconRef = useRef(null);
  const mainArrowRef = useRef(null);
  const secBeaconRef = useRef(null);
  const shock1Ref = useRef(null);
  const shock2Ref = useRef(null);
  const rangeInputRef = useRef(null);
  const pctLabelRef = useRef(null);

  const progressRef = useRef(getPrefersReducedMotion() ? 1 : 0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const inViewRef = useRef(true);

  // Defer WebGL compilation until after initial Hero LCP paint
  useEffect(() => {
    const timer = setTimeout(() => setMountWebgl(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const applyFrameDom = useCallback((rawP) => {
    const pClamped = clamp(rawP, 0, 1);
    const ptr = pointerRef.current;

    if (viewportRef.current) {
      viewportRef.current.style.setProperty('--stage-bg-pos', `${(pClamped * 100).toFixed(1)}% ${(pClamped * 100).toFixed(1)}%`);
    }
    if (fineParallaxRef.current) {
      fineParallaxRef.current.style.setProperty('--px-x', `${(pClamped * 50 - ptr.x * 12).toFixed(1)}px`);
      fineParallaxRef.current.style.setProperty('--px-y', `${(-ptr.y * 10).toFixed(1)}px`);
    }
    if (coarseParallaxRef.current) {
      coarseParallaxRef.current.style.setProperty('--px-x', `${(pClamped * 135 - ptr.x * 24).toFixed(1)}px`);
      coarseParallaxRef.current.style.setProperty('--px-y', `${(-ptr.y * 18).toFixed(1)}px`);
    }

    const shock1 = clamp((pClamped - 0.37) / 0.16);
    const shock2 = clamp((pClamped - 0.41) / 0.18);
    if (shock1Ref.current) {
      shock1Ref.current.style.setProperty('--shock-scale', String(0.5 + 3.4 * shock1));
      shock1Ref.current.style.setProperty('--shock-opacity', String(shock1 > 0 && shock1 < 1 ? 0.85 * (1 - shock1) : 0));
    }
    if (shock2Ref.current) {
      shock2Ref.current.style.setProperty('--shock-scale', String(0.4 + 3.8 * shock2));
      shock2Ref.current.style.setProperty('--shock-opacity', String(shock2 > 0 && shock2 < 1 ? 0.9 * (1 - shock2) : 0));
    }

    const routeVis = clamp((pClamped - 0.47) / 0.07);
    const routeDraw = easeInOutCubic(clamp((pClamped - 0.5) / 0.46));
    const routeSecDraw = easeInOutCubic(clamp((pClamped - 0.56) / 0.42));
    const destVis = clamp((pClamped - 0.87) / 0.09);

    if (railMainRef.current) railMainRef.current.setAttribute('opacity', String(routeVis));
    if (railSecRef.current) railSecRef.current.setAttribute('opacity', String(routeVis));
    if (destRef.current) destRef.current.setAttribute('opacity', String(destVis));
    if (waypointRef.current) waypointRef.current.setAttribute('opacity', routeDraw > 0.35 ? '1' : '0');

    const rEl = routeMainRef.current;
    if (rEl) {
      rEl.setAttribute('stroke-dashoffset', String(1 - routeDraw));
      rEl.setAttribute('opacity', routeDraw > 0.005 ? '1' : '0');
      if (rEl.getTotalLength && mainBeaconRef.current && mainArrowRef.current) {
        if (routeDraw > 0.01) {
          const total = rEl.getTotalLength();
          const d = total * routeDraw;
          const pt = rEl.getPointAtLength(d);
          const pt2 = rEl.getPointAtLength(Math.min(total, d + 4));
          const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
          mainBeaconRef.current.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
          mainBeaconRef.current.setAttribute('opacity', '1');
          mainArrowRef.current.setAttribute('transform', `rotate(${ang.toFixed(1)})`);
        } else {
          mainBeaconRef.current.setAttribute('opacity', '0');
        }
      }
    }

    const sEl = routeSecRef.current;
    if (sEl) {
      sEl.setAttribute('stroke-dashoffset', String(1 - routeSecDraw));
      sEl.setAttribute('opacity', routeSecDraw > 0.01 ? '0.85' : '0');
      if (sEl.getTotalLength && secBeaconRef.current) {
        if (routeSecDraw > 0.04) {
          const total2 = sEl.getTotalLength();
          const sp = sEl.getPointAtLength(total2 * routeSecDraw);
          secBeaconRef.current.setAttribute('transform', `translate(${sp.x.toFixed(1)}, ${sp.y.toFixed(1)})`);
          secBeaconRef.current.setAttribute('opacity', '1');
        } else {
          secBeaconRef.current.setAttribute('opacity', '0');
        }
      }
    }

    if (rangeInputRef.current) {
      rangeInputRef.current.value = String(Math.round(pClamped * 1000));
    }
    if (pctLabelRef.current) {
      pctLabelRef.current.textContent = `${toFa(Math.round(pClamped * 100))}٪`;
    }
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    applyFrameDom(progressRef.current);
    return () => obs.disconnect();
  }, [applyFrameDom]);

  useEffect(() => {
    if (reducedMotion) {
      setIsPlaying(false);
      progressRef.current = 1;
      applyFrameDom(1);
    }
  }, [reducedMotion, applyFrameDom]);

  useEffect(() => {
    if (!isPlaying || reducedMotion) return undefined;
    let raf;
    let last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (inViewRef.current) {
        const next = progressRef.current + dt * 0.145;
        progressRef.current = next >= 1.18 ? 0 : next;
        applyFrameDom(progressRef.current);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying, reducedMotion, applyFrameDom]);

  return (
    <section id="hero" className="fleet-section fleet-section--hero">
      <div className="site-container">
        <div className="hero-grid">
          <div className="ds-stack-md">
            <div>
              <Capsule variant="eyebrow" pulse>
                <Radio size={14} aria-hidden="true" />
                <span>سامانه هوشمند ردیابی ماهواره‌ای، GPS و فرماندهی ناوگان</span>
              </Capsule>
            </div>

            <h1 className="hero-headline">
              هر تپش جاده را،{' '}
              <span className="ds-accent-text">زنده و سه‌بعدی</span>{' '}
              فرماندهی کنید.
            </h1>

            <p className="hero-lead">
              از ردیابی دقیق کشنده‌های ترانزیتی و پایش لحظه‌ای سوخت تا زنجیره سرد دارویی و تحلیل رفتار راننده؛ تمام ناوگان شما روی یک بوم یکپارچه با تأخیر{' '}
              <strong className="ds-accent-soft-text">۰.۰۲ ثانیه</strong> در دسترس اتاق عملیات است.
            </p>

            <div className="hero-cta-row">
              <Button as="a" href="#radar-command" variant="primary" size="lg">
                <Navigation size={17} aria-hidden="true" />
                <span>ورود به رادار زنده ناوگان</span>
              </Button>

              <Button as="a" href="#hardware-3d" variant="secondary" size="lg">
                <span>کالبد سه‌بعدی ردیاب</span>
                <ArrowLeft size={16} aria-hidden="true" />
              </Button>
            </div>

            <Card variant="glass" compact className="kpi-3-grid">
              {[
                { val: '۹۹.۹۸٪', label: 'پایداری سیگنال ماهواره', accent: true },
                { val: '۱۸.۴٪', label: 'کاهش میانگین مصرف سوخت', accent: false },
                { val: '+۱۲,۴۰۰', label: 'خودرو تحت پوشش زنده', accent: false },
              ].map((st, idx) => (
                <div key={idx} className="ds-stack-xs">
                  <div className={`hero-kpi-item__val ds-tabular ${st.accent ? 'ds-accent-text' : ''}`}>
                    {st.val}
                  </div>
                  <div className="hero-kpi-item__label">{st.label}</div>
                </div>
              ))}
            </Card>
          </div>

          <div>
            <div
              ref={viewportRef}
              className="hero-stage-viewport"
              onMouseMove={(e) => {
                if (reducedMotion) return;
                const r = e.currentTarget.getBoundingClientRect();
                pointerRef.current = {
                  x: ((e.clientX - r.left) / r.width - 0.5) * 2,
                  y: ((e.clientY - r.top) / r.height - 0.5) * 2,
                };
                if (!isPlaying) applyFrameDom(progressRef.current);
              }}
              onMouseLeave={() => {
                pointerRef.current = { x: 0, y: 0 };
                if (!isPlaying) applyFrameDom(progressRef.current);
              }}
            >
              <div ref={fineParallaxRef} className="hero-parallax-fine" />
              <div ref={coarseParallaxRef} className="hero-parallax-coarse" />

              <svg
                viewBox="0 0 820 500"
                preserveAspectRatio="xMidYMid slice"
                className="radar-map-svg"
                aria-hidden="true"
              >
                <defs>
                  <filter id="heroCometGlow" x="-60%" y="-60%" width="220%" height="220%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <linearGradient id="heroRouteGrad" x1="1" y1="0" x2="0" y2="0">
                    <stop offset="0%" stopColor="var(--ds-sand-300)" stopOpacity="0.3" />
                    <stop offset="70%" stopColor="var(--ds-sand-300)" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="var(--ds-color-signal-orange)" stopOpacity="1" />
                  </linearGradient>
                </defs>

                <path
                  ref={railSecRef}
                  d="M 595,296 H 468 Q 446,296 446,318 V 382 Q 446,404 424,404 H 255 C 190,404 148,358 148,298"
                  fill="none"
                  stroke="var(--ds-sand-300)"
                  strokeOpacity="0.16"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0"
                />
                <path
                  ref={routeSecRef}
                  d="M 595,296 H 468 Q 446,296 446,318 V 382 Q 446,404 424,404 H 255 C 190,404 148,358 148,298"
                  fill="none"
                  stroke="var(--ds-color-signal-orange)"
                  strokeOpacity="0.6"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="6 8"
                  pathLength="1"
                  strokeDashoffset="1"
                  opacity="0"
                />

                <path
                  ref={railMainRef}
                  d="M 595,296 H 442 Q 418,296 418,272 V 148 Q 418,124 394,124 H 258 C 170,124 102,198 102,306"
                  fill="none"
                  stroke="var(--ds-navy-600)"
                  strokeOpacity="0.72"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity="0"
                />
                <path
                  ref={routeMainRef}
                  d="M 595,296 H 442 Q 418,296 418,272 V 148 Q 418,124 394,124 H 258 C 170,124 102,198 102,306"
                  fill="none"
                  stroke="url(#heroRouteGrad)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  pathLength="1"
                  strokeDasharray="1"
                  strokeDashoffset="1"
                  opacity="0"
                  filter="url(#heroCometGlow)"
                />

                <g ref={waypointRef} transform="translate(418, 148)" opacity="0">
                  <rect x="-8" y="-8" width="16" height="16" rx="5" fill="var(--ds-navy-600)" stroke="var(--ds-sand-300)" strokeWidth="2.5" />
                  <rect x="-3" y="-3" width="6" height="6" rx="2" fill="var(--ds-color-signal-orange)" />
                </g>

                <g ref={destRef} transform="translate(102, 306)" opacity="0">
                  <rect x="-20" y="-20" width="40" height="40" rx="12.5" fill="var(--ds-navy-600)" stroke="var(--ds-sand-300)" strokeWidth="2.5" />
                  <rect x="-9" y="-9" width="18" height="18" rx="5.6" fill="var(--ds-color-signal-orange)" />
                </g>

                <g ref={secBeaconRef} transform="translate(595, 296)" opacity="0">
                  <circle r="5.5" fill="var(--ds-sand-300)" />
                  <circle r="11" fill="none" stroke="var(--ds-color-signal-orange)" strokeWidth="1.5" opacity="0.65" />
                </g>

                <g ref={mainBeaconRef} transform="translate(595, 296)" opacity="0">
                  <circle r="15" fill="var(--ds-color-signal-orange)" fillOpacity="0.28" />
                  <g ref={mainArrowRef}>
                    <path d="M 10,0 L -7,-6.5 L -3.5,0 L -7,6.5 Z" fill="var(--ds-color-signal-orange)" stroke="var(--ds-sand-50)" strokeWidth="1.4" />
                  </g>
                </g>
              </svg>

              <div ref={shock1Ref} className="hero-shockwave" />
              <div ref={shock2Ref} className="hero-shockwave hero-shockwave--accent" />

              {mountWebgl && (
                <Suspense fallback={null}>
                  <HeroEmblemCanvas
                    progressRef={progressRef}
                    pointerRef={pointerRef}
                    reducedMotion={reducedMotion}
                  />
                </Suspense>
              )}

              <div className="hero-hud-card ds-stack-xs">
                <div className="ds-between">
                  <strong>{selectedVeh.name}</strong>
                  <StatusChip status="moving" label={`${toFa(selectedVeh.satellites)} ماهواره`} />
                </div>

                <div className="ds-between">
                  <IranPlate
                    left2={selectedVeh.plateLeft}
                    letter={selectedVeh.plateChar}
                    mid3={selectedVeh.plateRight}
                    iranCode={selectedVeh.plateCity}
                  />
                  <div className="ds-row">
                    <strong className="hero-kpi-item__val ds-accent-text ds-tabular">{toFa(selectedVeh.speed)}</strong>
                    <span className="ltr-code ds-muted">km/h</span>
                  </div>
                </div>

                <div className="hero-kpi-item__label">
                  {selectedVeh.cargo} {selectedVeh.temp ? `· دما: ${selectedVeh.temp}` : ''}
                </div>
              </div>

              <div className="hero-controls-dock">
                <div className="ds-row-wrap">
                  {HERO_VEHICLES.map((v, i) => (
                    <Button
                      key={v.id}
                      variant="pill"
                      size="sm"
                      active={selectedVeh.id === v.id}
                      onClick={() => setSelectedVeh(v)}
                    >
                      واحد {toFa(i + 1)}: {v.name.split(' ')[0]}
                    </Button>
                  ))}
                </div>

                <div className="hero-scrubber-group">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    aria-label={isPlaying ? 'توقف انیمیشن مسیر' : 'پخش انیمیشن مسیر'}
                  >
                    {isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
                  </Button>
                  <input
                    ref={rangeInputRef}
                    type="range"
                    className="cinema-range"
                    aria-label="پیشرفت انیمیشن مسیر قهرمان"
                    min="0"
                    max="1000"
                    defaultValue={Math.round(progressRef.current * 1000)}
                    onChange={(e) => {
                      setIsPlaying(false);
                      const v = Number(e.target.value) / 1000;
                      progressRef.current = v;
                      applyFrameDom(v);
                    }}
                  />
                  <span ref={pctLabelRef} className="ds-accent-soft-text ds-tabular">
                    {toFa(Math.round(progressRef.current * 100))}٪
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
