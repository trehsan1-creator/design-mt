import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { Play, Pause, Navigation, ArrowLeft, Radio } from 'lucide-react';
import { LOGO_PARTS } from '../../data/geometryData.js';
import { DESIGN_TOKENS } from '../../../tokens/tokens.js';
import { Button, Card, Capsule, IranPlate, StatusChip } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutBack(t) {
  const c1 = 1.85;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
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
  const sectionRef = useRef(null);
  const canvasWrapRef = useRef(null);
  const routeMainRef = useRef(null);
  const routeSecRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedVeh, setSelectedVeh] = useState(HERO_VEHICLES[0]);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [mainPt, setMainPt] = useState({ x: 595, y: 296, angle: 180 });
  const [secPt, setSecPt] = useState({ x: 595, y: 296 });

  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const inViewRef = useRef(true);

  useEffect(() => {
    progressRef.current = progress;
    const pClamped = clamp(progress, 0, 1);

    const rEl = routeMainRef.current;
    if (rEl && rEl.getTotalLength) {
      const total = rEl.getTotalLength();
      const rProg = easeInOutCubic(clamp((pClamped - 0.5) / 0.46));
      const d = total * rProg;
      const pt = rEl.getPointAtLength(d);
      const pt2 = rEl.getPointAtLength(Math.min(total, d + 4));
      const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
      setMainPt({ x: pt.x, y: pt.y, angle: ang });
    }

    const sEl = routeSecRef.current;
    if (sEl && sEl.getTotalLength) {
      const total2 = sEl.getTotalLength();
      const sProg = easeInOutCubic(clamp((pClamped - 0.56) / 0.42));
      const sp = sEl.getPointAtLength(total2 * sProg);
      setSecPt({ x: sp.x, y: sp.y });
    }
  }, [progress]);

  useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  useEffect(() => {
    if (!isPlaying) return;
    let raf;
    let last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      if (inViewRef.current) {
        setProgress((prev) => {
          const next = prev + dt * 0.145;
          return next >= 1.18 ? 0 : next;
        });
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isPlaying]);

  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    obs.observe(container);

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 1, 3000);
    camera.position.set(0, 0, 680);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const orangeColor = new THREE.Color(DESIGN_TOKENS.color.signalOrange);
    const gridNavyColor = new THREE.Color(DESIGN_TOKENS.color.navy['200']);
    const gridHelper = new THREE.GridHelper(1100, 26, orangeColor, gridNavyColor);
    gridHelper.position.set(0, -175, -140);
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.2;
    scene.add(gridHelper);

    const partsGroup = new THREE.Group();
    scene.add(partsGroup);

    const loader = new SVGLoader();
    const partMeshes = [];

    LOGO_PARTS.forEach((part, idx) => {
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.21 324.76"><path d="${part.d}"/></svg>`;
      const parsed = loader.parse(svgMarkup);
      const shapes = [];
      parsed.paths.forEach((p) => {
        SVGLoader.createShapes(p).forEach((s) => shapes.push(s));
      });

      const depth = 32;
      const geo = new THREE.ExtrudeGeometry(shapes, {
        depth,
        bevelEnabled: true,
        bevelThickness: 8,
        bevelSize: 3.4,
        bevelOffset: -1.4,
        bevelSegments: 6,
        curveSegments: 36,
      });
      geo.translate(-117.105, -162.38, -depth / 2);

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(part.color),
        roughness: DESIGN_TOKENS.material3d.pbr.roughness,
        metalness: DESIGN_TOKENS.material3d.pbr.metalness,
        emissive: orangeColor,
        emissiveIntensity: 0,
      });

      const pivot = new THREE.Group();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(1, -1, 1);
      pivot.add(mesh);
      partsGroup.add(pivot);
      partMeshes.push({ pivot, geo, mat, cfg: part.offset, idx });
    });

    const pCount = 60;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 900;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 480;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 320 - 50;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: new THREE.Color(DESIGN_TOKENS.color.warmSand),
      size: 4,
      transparent: true,
      opacity: 0.36,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    scene.add(new THREE.AmbientLight(new THREE.Color(DESIGN_TOKENS.color.sand['50']), 0.86));
    scene.add(
      new THREE.HemisphereLight(
        new THREE.Color(DESIGN_TOKENS.color.navy['25']),
        new THREE.Color(DESIGN_TOKENS.color.navy['900']),
        0.65
      )
    );

    const keyLight = new THREE.DirectionalLight(new THREE.Color(DESIGN_TOKENS.color.sand['50']), 1.95);
    keyLight.position.set(-190, 175, 220);
    scene.add(keyLight);

    const sweepLight = new THREE.PointLight(new THREE.Color(DESIGN_TOKENS.color.neutral.white), 0, 540, 1.4);
    scene.add(sweepLight);

    const orangeRim = new THREE.PointLight(orangeColor, 1.6, 680, 1.5);
    orangeRim.position.set(170, -145, 130);
    scene.add(orangeRim);

    let animId;
    const t0 = performance.now();

    const animate = (now) => {
      animId = requestAnimationFrame(animate);
      if (!inViewRef.current) return;

      const elapsed = (now - t0) * 0.001;
      const p = clamp(progressRef.current, 0, 1);
      const ptr = pointerRef.current;

      partMeshes.forEach(({ pivot, mat, cfg, idx }) => {
        const q = clamp((p - cfg.delay) / 0.24);
        const k = 1 - easeOutBack(q);
        const floatY = Math.sin(elapsed * 2.1 + idx * 1.4) * 7 * clamp(1 - q * 1.4);
        const floatX = Math.cos(elapsed * 1.7 + idx * 1.1) * 5 * clamp(1 - q * 1.4);

        pivot.position.set(cfg.x * k + floatX, cfg.y * k + floatY, cfg.z * k);
        pivot.rotation.set(cfg.rx * k, cfg.ry * k, cfg.rz * k);

        const impact = Math.sin(clamp((p - 0.36) / 0.14) * Math.PI);
        mat.emissiveIntensity = impact * 0.32;
      });

      const orientEase = easeInOutCubic(clamp(p / 0.42));
      const targetRotX = 0.38 * (1 - orientEase) - ptr.y * 0.22;
      const targetRotY = -0.48 * (1 - orientEase) + ptr.x * 0.28;
      partsGroup.rotation.x += (targetRotX - partsGroup.rotation.x) * 0.12;
      partsGroup.rotation.y += (targetRotY - partsGroup.rotation.y) * 0.12;

      const lockBounce = Math.sin(clamp((p - 0.37) / 0.12) * Math.PI);
      const glide = easeInOutCubic(clamp((p - 0.46) / 0.18));
      const baseScale = (0.76 - 0.24 * glide) * (1 + 0.09 * lockBounce);
      partsGroup.scale.setScalar(baseScale);
      partsGroup.position.x = 205 * glide;
      partsGroup.position.y = 8 + 6 * Math.sin(elapsed * 1.6) * glide;

      const sw = clamp((p - 0.3) / 0.26);
      sweepLight.position.set(-240 + 520 * sw + 205 * glide, 180 - 320 * sw, 150);
      sweepLight.intensity = sw > 0 && sw < 1 ? Math.sin(sw * Math.PI) * 10 : 0;

      gridHelper.position.z = -140 + ((elapsed * 28) % 42);
      particles.rotation.y = elapsed * 0.03 + ptr.x * 0.08;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      obs.disconnect();
      ro.disconnect();
      partMeshes.forEach((m) => {
        m.geo.dispose();
        m.mat.dispose();
      });
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    };
  }, []);

  const pClamped = clamp(progress, 0, 1);
  const shock1 = clamp((pClamped - 0.37) / 0.16);
  const shock2 = clamp((pClamped - 0.41) / 0.18);
  const routeDraw = easeInOutCubic(clamp((pClamped - 0.5) / 0.46));
  const routeSecDraw = easeInOutCubic(clamp((pClamped - 0.56) / 0.42));
  const routeVis = clamp((pClamped - 0.47) / 0.07);
  const destVis = clamp((pClamped - 0.87) / 0.09);

  return (
    <section id="hero" ref={sectionRef} className="fleet-section fleet-section--hero">
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
              className="hero-stage-viewport"
              style={{ '--stage-bg-pos': `${pClamped * 100}% ${pClamped * 100}%` }}
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setPointer({
                  x: ((e.clientX - r.left) / r.width - 0.5) * 2,
                  y: ((e.clientY - r.top) / r.height - 0.5) * 2,
                });
              }}
              onMouseLeave={() => setPointer({ x: 0, y: 0 })}
            >
              <div
                className="hero-parallax-fine"
                style={{ '--px-x': `${pClamped * 50 - pointer.x * 12}px`, '--px-y': `${-pointer.y * 10}px` }}
              />
              <div
                className="hero-parallax-coarse"
                style={{ '--px-x': `${pClamped * 135 - pointer.x * 24}px`, '--px-y': `${-pointer.y * 18}px` }}
              />

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
                  d="M 595,296 H 468 Q 446,296 446,318 V 382 Q 446,404 424,404 H 255 C 190,404 148,358 148,298"
                  fill="none"
                  stroke="var(--ds-sand-300)"
                  strokeOpacity="0.16"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity={routeVis}
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
                  strokeDashoffset={1 - routeSecDraw}
                  opacity={routeSecDraw > 0.01 ? 0.85 : 0}
                />

                <path
                  d="M 595,296 H 442 Q 418,296 418,272 V 148 Q 418,124 394,124 H 258 C 170,124 102,198 102,306"
                  fill="none"
                  stroke="var(--ds-navy-600)"
                  strokeOpacity="0.72"
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity={routeVis}
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
                  strokeDashoffset={1 - routeDraw}
                  opacity={routeDraw > 0.005 ? 1 : 0}
                  filter="url(#heroCometGlow)"
                />

                {routeDraw > 0.35 && (
                  <g transform="translate(418, 148)">
                    <rect x="-8" y="-8" width="16" height="16" rx="5" fill="var(--ds-navy-600)" stroke="var(--ds-sand-300)" strokeWidth="2.5" />
                    <rect x="-3" y="-3" width="6" height="6" rx="2" fill="var(--ds-color-signal-orange)" />
                  </g>
                )}

                <g transform="translate(102, 306)" opacity={destVis}>
                  <rect x="-20" y="-20" width="40" height="40" rx="12.5" fill="var(--ds-navy-600)" stroke="var(--ds-sand-300)" strokeWidth="2.5" />
                  <rect x="-9" y="-9" width="18" height="18" rx="5.6" fill="var(--ds-color-signal-orange)" />
                </g>

                {routeSecDraw > 0.04 && (
                  <g transform={`translate(${secPt.x}, ${secPt.y})`}>
                    <circle r="5.5" fill="var(--ds-sand-300)" />
                    <circle r="11" fill="none" stroke="var(--ds-color-signal-orange)" strokeWidth="1.5" opacity="0.65" />
                  </g>
                )}

                {routeDraw > 0.01 && (
                  <g transform={`translate(${mainPt.x}, ${mainPt.y})`}>
                    <circle r="15" fill="var(--ds-color-signal-orange)" fillOpacity="0.28" />
                    <g transform={`rotate(${mainPt.angle})`}>
                      <path d="M 10,0 L -7,-6.5 L -3.5,0 L -7,6.5 Z" fill="var(--ds-color-signal-orange)" stroke="var(--ds-sand-50)" strokeWidth="1.4" />
                    </g>
                  </g>
                )}
              </svg>

              <div
                className="hero-shockwave"
                style={{
                  '--shock-scale': 0.5 + 3.4 * shock1,
                  '--shock-opacity': shock1 > 0 && shock1 < 1 ? 0.85 * (1 - shock1) : 0,
                }}
              />
              <div
                className="hero-shockwave hero-shockwave--accent"
                style={{
                  '--shock-scale': 0.4 + 3.8 * shock2,
                  '--shock-opacity': shock2 > 0 && shock2 < 1 ? 0.9 * (1 - shock2) : 0,
                }}
              />

              <div
                ref={canvasWrapRef}
                className="hero-webgl-layer"
                role="img"
                aria-label="صحنه سه‌بعدی مونتاژ نشان برند و مسیر ناوگان"
              />

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
                    type="range"
                    className="cinema-range"
                    aria-label="پیشرفت انیمیشن مسیر قهرمان"
                    min="0"
                    max="1000"
                    value={Math.round(pClamped * 1000)}
                    onChange={(e) => {
                      setIsPlaying(false);
                      setProgress(Number(e.target.value) / 1000);
                    }}
                  />
                  <span className="ds-accent-soft-text ds-tabular">
                    {toFa(Math.round(pClamped * 100))}٪
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
