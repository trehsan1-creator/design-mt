import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { Play, Pause, RotateCcw, Navigation, Shield, Sparkles, ArrowLeft, Radio } from 'lucide-react';
import { LOGO_PARTS } from '../../data/geometryData.js';
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
  const [mainPt, setMainPt] = useState({ x: 640, y: 270, angle: 180 });
  const [secPt, setSecPt] = useState({ x: 640, y: 270 });

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

  // Auto-play cinematic loop
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

  // Three.js WebGL 4-Part Extruded Bevel Emblem + 3D Topographic Grid
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

    // 3D Perspective Topographic Floor Grid
    const gridHelper = new THREE.GridHelper(1100, 26, 0xff742e, 0x244259);
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
        roughness: 0.36,
        metalness: 0.08,
        emissive: new THREE.Color('#FF742E'),
        emissiveIntensity: 0,
      });

      const pivot = new THREE.Group();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(1, -1, 1);
      pivot.add(mesh);
      partsGroup.add(pivot);
      partMeshes.push({ pivot, geo, mat, cfg: part.offset, idx });
    });

    // Ambient floating telemetry dust
    const pCount = 60;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 900;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 480;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 320 - 50;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xe8decd, size: 4, transparent: true, opacity: 0.36 });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Recovered Illustrator 43.08 deg Lighting + Sweeping Specular Flash
    scene.add(new THREE.AmbientLight(0xd9e6f2, 0.86));
    scene.add(new THREE.HemisphereLight(0x6c90ab, 0x08131d, 0.65));

    const keyLight = new THREE.DirectionalLight(0xfff8f0, 1.95);
    keyLight.position.set(-190, 175, 220);
    scene.add(keyLight);

    const sweepLight = new THREE.PointLight(0xffffff, 0, 540, 1.4);
    scene.add(sweepLight);

    const orangeRim = new THREE.PointLight(0xff742e, 1.6, 680, 1.5);
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
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      obs.disconnect();
      ro.disconnect();
      window.removeEventListener('resize', onResize);
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
    <section id="hero" ref={sectionRef} className="hero-section">
      {/* Subtle 24px (1u) Square Nuqta Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(232,222,205,0.08) 1.2px, transparent 1.7px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />

      <div className="site-container">
        <div className="hero-grid">
          {/* Right Column (38.1% Golden Proportion): Muscular Peyda Story & Tactile Actions */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            <div className="eyebrow-kaf">
              <Radio size={14} color="#FF742E" />
              <span>سامانه هوشمند ردیابی ماهواره‌ای، GPS و فرماندهی ناوگان</span>
            </div>

            <h1
              style={{
                fontWeight: 900,
                fontSize: 'clamp(34px, 4.2vw, 56px)',
                lineHeight: 1.24,
                letterSpacing: '-0.015em',
                marginBottom: 18,
                textShadow:
                  '0 1px 0 #264258, 0 2px 0 #1b3142, 0 3px 0 #11222f, 0 16px 34px rgba(0,0,0,0.65)',
              }}
            >
              هر تپش جاده را،{' '}
              <span style={{ color: '#FF742E' }}>زنده و سه‌بعدی</span>{' '}
              فرماندهی کنید.
            </h1>

            <p
              style={{
                fontSize: 16.5,
                fontWeight: 400,
                lineHeight: 1.85,
                color: 'rgba(232, 222, 205, 0.82)',
                marginBottom: 28,
              }}
            >
              از ردیابی میلی‌متری کشنده‌های ترانزیتی و پایش لحظه‌ای سوخت تا زنجیره سرد دارویی و تحلیل رفتار راننده؛ تمام ناوگان شما روی یک بوم زنده با تأخیر{' '}
              <strong style={{ color: '#FF9861', fontWeight: 800 }}>۰.۰۲ ثانیه</strong> در دستان شماست.
            </p>

            {/* Dual Tactile 3D CTAs */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 34 }}>
              <a href="#radar-command" className="btn-3d-orange" style={{ textDecoration: 'none' }}>
                <Navigation size={17} />
                <span>ورود به رادار زنده ناوگان</span>
              </a>

              <a href="#hardware-3d" className="btn-3d-navy" style={{ textDecoration: 'none' }}>
                <span>کالبد سه‌بعدی ردیاب</span>
                <ArrowLeft size={16} />
              </a>
            </div>

            {/* 3 Sculpted KPI Strip with 26.84 deg Kaf Sarkesh Dividers */}
            <div
              className="kpi-3-grid"
              style={{
                padding: '16px 18px',
                borderRadius: 22,
                background: 'rgba(16, 35, 51, 0.65)',
                border: '1px solid rgba(232, 222, 205, 0.14)',
                backdropFilter: 'blur(12px)',
              }}
            >
              {[
                { val: '۹۹.۹۸٪', label: 'پایداری سیگنال ماهواره' },
                { val: '۱۸.۴٪', label: 'کاهش واقعی مصرف سوخت' },
                { val: '+۱۲,۴۰۰', label: 'خودرو تحت پوشش زنده' },
              ].map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    borderInlineEnd: idx < 2 ? '1px solid rgba(232,222,205,0.12)' : 'none',
                    paddingInlineEnd: idx < 2 ? 10 : 0,
                  }}
                >
                  <div style={{ fontSize: 23, fontWeight: 900, color: idx === 0 ? '#FF742E' : '#E8DECD' }}>
                    {st.val}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'rgba(232,222,205,0.72)', fontWeight: 500 }}>{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Left Column (61.9% Golden Proportion): Interactive 3D Squircle Cinema Stage */}
          <div style={{ position: 'relative' }}>
            <div
              onMouseMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                setPointer({
                  x: ((e.clientX - r.left) / r.width - 0.5) * 2,
                  y: ((e.clientY - r.top) / r.height - 0.5) * 2,
                });
              }}
              onMouseLeave={() => setPointer({ x: 0, y: 0 })}
              style={{
                position: 'relative',
                width: '100%',
                height: 500,
                borderRadius: 68, // Echoing 31.25% squircle proportion!
                overflow: 'hidden',
                background: 'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)',
                backgroundSize: '165% 165%',
                backgroundPosition: `${pClamped * 100}% ${pClamped * 100}%`,
                border: '1px solid rgba(232, 222, 205, 0.24)',
                boxShadow:
                  '0 34px 80px rgba(0, 0, 0, 0.65), inset 0 2px 2px rgba(255, 255, 255, 0.24), inset 0 -4px 12px rgba(0,0,0,0.45)',
              }}
            >
              {/* Parallax Dot Layers */}
              <div
                style={{
                  position: 'absolute',
                  inset: -40,
                  backgroundImage: 'radial-gradient(circle, rgba(232,222,205,0.14) 1.3px, transparent 1.8px)',
                  backgroundSize: '24px 24px',
                  transform: `translate3d(${pClamped * 50 - pointer.x * 12}px, ${-pointer.y * 10}px, 0)`,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: -60,
                  backgroundImage: 'radial-gradient(circle, rgba(232,222,205,0.24) 2.2px, transparent 2.8px)',
                  backgroundSize: '72px 72px',
                  transform: `translate3d(${pClamped * 135 - pointer.x * 24}px, ${-pointer.y * 18}px, 0)`,
                  pointerEvents: 'none',
                }}
              />

              {/* Clothoid GPS Highway Routes + Live Comet Signals */}
              <svg
                viewBox="0 0 820 500"
                preserveAspectRatio="xMidYMid slice"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
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
                    <stop offset="0%" stopColor="#E8DECD" stopOpacity="0.3" />
                    <stop offset="70%" stopColor="#E8DECD" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#FF742E" stopOpacity="1" />
                  </linearGradient>
                </defs>

                {/* Secondary Branch Route */}
                <path
                  d="M 595,296 H 468 Q 446,296 446,318 V 382 Q 446,404 424,404 H 255 C 190,404 148,358 148,298"
                  fill="none"
                  stroke="rgba(232,222,205,0.14)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity={routeVis}
                />
                <path
                  ref={routeSecRef}
                  d="M 595,296 H 468 Q 446,296 446,318 V 382 Q 446,404 424,404 H 255 C 190,404 148,358 148,298"
                  fill="none"
                  stroke="rgba(255,116,46,0.58)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray="6 8"
                  pathLength="1"
                  style={{
                    strokeDashoffset: 1 - routeSecDraw,
                    opacity: routeSecDraw > 0.01 ? 0.85 : 0,
                  }}
                />

                {/* Primary Clothoid Highway Route */}
                <path
                  d="M 595,296 H 442 Q 418,296 418,272 V 148 Q 418,124 394,124 H 258 C 170,124 102,198 102,306"
                  fill="none"
                  stroke="rgba(16, 35, 51, 0.72)"
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

                {/* Golden Turn Waypoint */}
                {routeDraw > 0.35 && (
                  <g transform="translate(418, 148)">
                    <rect x="-8" y="-8" width="16" height="16" rx="5" fill="#102333" stroke="#E8DECD" strokeWidth="2.5" />
                    <rect x="-3" y="-3" width="6" height="6" rx="2" fill="#FF742E" />
                  </g>
                )}

                {/* Destination Squircle */}
                <g transform="translate(102, 306)" opacity={destVis}>
                  <rect x="-20" y="-20" width="40" height="40" rx="12.5" fill="rgba(255,116,46,0.16)" stroke="#E8DECD" strokeWidth="2.5" />
                  <rect x="-9" y="-9" width="18" height="18" rx="5.6" fill="#FF742E" />
                </g>

                {/* Secondary Beacon */}
                {routeSecDraw > 0.04 && (
                  <g transform={`translate(${secPt.x}, ${secPt.y})`}>
                    <circle r="5.5" fill="#E8DECD" />
                    <circle r="11" fill="none" stroke="#FF742E" strokeWidth="1.5" opacity="0.65" />
                  </g>
                )}

                {/* Primary Comet Arrow Beacon */}
                {routeDraw > 0.01 && (
                  <g transform={`translate(${mainPt.x}, ${mainPt.y})`}>
                    <rect
                      x="-15"
                      y="-15"
                      width="30"
                      height="30"
                      rx="9.5"
                      fill="none"
                      stroke="#FF742E"
                      strokeWidth="2.2"
                      style={{
                        transformBox: 'fill-box',
                        transformOrigin: 'center',
                        animation: 'svgPing 1.5s ease-out infinite',
                      }}
                    />
                    <circle r="16" fill="rgba(255,116,46,0.28)" />
                    <g transform={`rotate(${mainPt.angle})`}>
                      <path d="M 10,0 L -7,-6.5 L -3.5,0 L -7,6.5 Z" fill="#FF742E" stroke="#FFF5EE" strokeWidth="1.4" />
                    </g>
                  </g>
                )}
              </svg>

              {/* Concentric Squircle Shockwaves on Lock */}
              <div
                style={{
                  position: 'absolute',
                  insetInlineStart: '50%',
                  top: '50%',
                  width: 150,
                  height: 150,
                  borderRadius: '31.25%',
                  border: '2.5px solid #E8DECD',
                  transform: `translate(50%, -50%) scale(${0.5 + 3.4 * shock1})`,
                  opacity: shock1 > 0 && shock1 < 1 ? 0.85 * (1 - shock1) : 0,
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  insetInlineStart: '50%',
                  top: '50%',
                  width: 120,
                  height: 120,
                  borderRadius: '31.25%',
                  border: '2px solid #FF742E',
                  boxShadow: '0 0 32px rgba(255,116,46,0.65)',
                  transform: `translate(50%, -50%) scale(${0.4 + 3.8 * shock2})`,
                  opacity: shock2 > 0 && shock2 < 1 ? 0.9 * (1 - shock2) : 0,
                  pointerEvents: 'none',
                }}
              />

              {/* Three.js WebGL 4-Piece Extruded Canvas */}
              <div ref={canvasWrapRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

              {/* Floating Live Selected Vehicle Telemetry HUD */}
              <div
                style={{
                  position: 'absolute',
                  top: 18,
                  insetInlineEnd: 18,
                  padding: '13px 15px',
                  borderRadius: 20,
                  background: 'rgba(8, 19, 29, 0.86)',
                  border: '1px solid rgba(255, 116, 46, 0.42)',
                  backdropFilter: 'blur(14px)',
                  maxWidth: 'calc(100% - 36px)',
                  boxShadow: '0 16px 36px rgba(0,0,0,0.45)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBlockEnd: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: '#E8DECD' }}>{selectedVeh.name}</span>
                  <span style={{ fontSize: 12, color: '#4ADE80', fontWeight: 700 }}>
                    ● {toFa(selectedVeh.satellites)} ماهواره
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div className="iran-plate">
                    <div className="iran-plate-blue" aria-hidden="true">
                      <svg width="12" height="22" viewBox="0 0 12 22">
                        <rect x="1" y="2" width="10" height="2.5" fill="#22C55E" />
                        <rect x="1" y="4.5" width="10" height="2.5" fill="#FFFFFF" />
                        <rect x="1" y="7" width="10" height="2.5" fill="#EF4444" />
                        <rect x="2" y="13" width="8" height="1.5" rx="0.7" fill="#FFFFFF" opacity="0.85" />
                        <rect x="2" y="16.5" width="8" height="1.5" rx="0.7" fill="#FFFFFF" opacity="0.85" />
                      </svg>
                    </div>
                    <div className="iran-plate-main">
                      <span>{selectedVeh.plateLeft}</span>
                      <span style={{ color: '#D94E14' }}>{selectedVeh.plateChar}</span>
                      <span>{selectedVeh.plateRight}</span>
                    </div>
                    <div className="iran-plate-city">
                      <strong>{selectedVeh.plateCity}</strong>
                    </div>
                  </div>

                  <div style={{ textAlign: 'end' }}>
                    <span style={{ fontSize: 22, fontWeight: 900, color: '#FF742E' }}>{toFa(selectedVeh.speed)}</span>
                    <span style={{ fontSize: 12, color: 'rgba(232,222,205,0.75)', marginInlineStart: 3 }}>km/h</span>
                  </div>
                </div>

                <div style={{ fontSize: 12.5, color: 'rgba(232,222,205,0.76)', marginBlockStart: 8 }}>
                  {selectedVeh.cargo} {selectedVeh.temp ? `· دما: ${selectedVeh.temp}` : ''}
                </div>
              </div>

              {/* Bottom Interactive Controls Inside Stage */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 14,
                  insetInline: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                  flexWrap: 'wrap',
                  padding: '9px 14px',
                  borderRadius: 18,
                  background: 'rgba(8, 19, 29, 0.82)',
                  border: '1px solid rgba(232, 222, 205, 0.15)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {HERO_VEHICLES.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVeh(v)}
                      className={`chip-btn ${selectedVeh.id === v.id ? 'on' : ''}`}
                      style={{ fontSize: 12.5 }}
                    >
                      واحد {toFa(i + 1)}: {v.name.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 185, flex: 1, maxWidth: 280 }}>
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      border: 'none',
                      background: '#FF742E',
                      color: '#060E16',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                    aria-label={isPlaying ? 'توقف انیمیشن مسیر' : 'پخش انیمیشن مسیر'}
                    title={isPlaying ? 'توقف' : 'پخش'}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
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
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: '#FF9861', minWidth: 36 }}>
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
