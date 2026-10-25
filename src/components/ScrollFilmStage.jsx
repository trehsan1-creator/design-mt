import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { Play, Pause, RotateCcw, Radio, Sparkles, Navigation } from 'lucide-react';
import { LOGO_PARTS } from '../data/geometryData.js';
import { toFa } from '../utils/faDigits.js';

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

export default function ScrollFilmStage() {
  const canvasWrapRef = useRef(null);
  const routeMainRef = useRef(null);
  const routeSecRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [autoLoop, setAutoLoop] = useState(true);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const [signalPt, setSignalPt] = useState({ x: 690, y: 270, angle: 180 });
  const [secPt, setSecPt] = useState({ x: 690, y: 270 });

  const progressRef = useRef(0);
  const pointerRef = useRef({ x: 0, y: 0 });
  const threeRef = useRef(null);

  // Sync state to refs for 60fps WebGL loop
  useEffect(() => {
    progressRef.current = progress;
    // Compute SVG route point for live orange signal comet
    const rEl = routeMainRef.current;
    if (rEl && rEl.getTotalLength) {
      const total = rEl.getTotalLength();
      const rProg = easeInOutCubic(clamp((progress - 0.52) / 0.44));
      const d = total * rProg;
      const pt = rEl.getPointAtLength(d);
      const pt2 = rEl.getPointAtLength(Math.min(total, d + 4));
      const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
      setSignalPt({ x: pt.x, y: pt.y, angle: ang });
    }
    const sEl = routeSecRef.current;
    if (sEl && sEl.getTotalLength) {
      const total2 = sEl.getTotalLength();
      const sProg = easeInOutCubic(clamp((progress - 0.58) / 0.4));
      const sp = sEl.getPointAtLength(total2 * sProg);
      setSecPt({ x: sp.x, y: sp.y });
    }
  }, [progress]);

  useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  // Auto-play cinema loop
  useEffect(() => {
    if (!isPlaying) return;
    let rafId;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setProgress((prev) => {
        const next = prev + dt * 0.155; // ~6.4 seconds full cinematic sequence
        if (next >= 1.12) {
          if (autoLoop) return 0;
          setIsPlaying(false);
          return 1;
        }
        return next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, autoLoop]);

  // Initialize Three.js 4-Part Extruded Bevel Scene
  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;

    const width = container.clientWidth || 880;
    const height = container.clientHeight || 440;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 1, 3000);
    camera.position.set(0, 0, 680);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const rootGroup = new THREE.Group();
    const partsGroup = new THREE.Group();
    rootGroup.add(partsGroup);
    scene.add(rootGroup);

    const loader = new SVGLoader();
    const partMeshes = [];

    LOGO_PARTS.forEach((part, idx) => {
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.21 324.76"><path d="${part.d}"/></svg>`;
      const parsed = loader.parse(svgMarkup);
      const shapes = [];
      parsed.paths.forEach((p) => {
        SVGLoader.createShapes(p).forEach((s) => shapes.push(s));
      });

      const depth = 30;
      const geo = new THREE.ExtrudeGeometry(shapes, {
        depth,
        bevelEnabled: true,
        bevelThickness: 7.5,
        bevelSize: 3.2,
        bevelOffset: -1.4,
        bevelSegments: 6,
        curveSegments: 36,
      });

      // Translate around shared emblem center (117.105, 162.38) so all 4 interlock seamlessly at (0,0,0)!
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
      mesh.scale.set(1, -1, 1); // Flip SVG Y-axis
      pivot.add(mesh);
      partsGroup.add(pivot);

      partMeshes.push({ pivot, mesh, mat, geo, cfg: part.offset, idx });
    });

    // Floating 3D ambient dust particles (derived from 1:1 square nuqta!)
    const pCount = 55;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 980;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 480;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 320 - 60;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe8decd,
      size: 4.2,
      transparent: true,
      opacity: 0.35,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Recovered Illustrator Lighting + Sweeping Specular Keylight + Orange Signal Glow
    const ambient = new THREE.AmbientLight(0xd9e6f2, 0.85);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x6c90ab, 0x091520, 0.65);
    scene.add(hemi);

    // Grazing 43.08 deg top-left directional light from gradiant.pdf
    const dirLight = new THREE.DirectionalLight(0xfff8f0, 1.9);
    dirLight.position.set(-190, 175, 220);
    scene.add(dirLight);

    // Sweeping specular flash light during lock impact (p = 0.32..0.58)
    const sweepLight = new THREE.PointLight(0xffffff, 0, 520, 1.4);
    sweepLight.position.set(-220, 180, 150);
    scene.add(sweepLight);

    // Warm Orange rim / beacon bounce light
    const orangeLight = new THREE.PointLight(0xff742e, 1.4, 650, 1.5);
    orangeLight.position.set(160, -140, 130);
    scene.add(orangeLight);

    threeRef.current = { scene, camera, renderer, rootGroup, partsGroup, partMeshes, sweepLight, orangeLight, particles };

    let animId;
    const tStart = performance.now();

    const renderLoop = (now) => {
      animId = requestAnimationFrame(renderLoop);
      const elapsed = (now - tStart) * 0.001;
      const p = clamp(progressRef.current, 0, 1);
      const ptr = pointerRef.current;

      // 1. Update 4 exploded-to-locked 3D modules with spring overshoot
      partMeshes.forEach(({ pivot, mat, cfg, idx }) => {
        const q = clamp((p - cfg.delay) / 0.24);
        const k = 1 - easeOutBack(q);
        // Zero-G idle float when exploded
        const floatY = Math.sin(elapsed * 2.1 + idx * 1.4) * 7 * clamp(1 - q * 1.4);
        const floatX = Math.cos(elapsed * 1.7 + idx * 1.1) * 5 * clamp(1 - q * 1.4);

        pivot.position.set(cfg.x * k + floatX, cfg.y * k + floatY, cfg.z * k);
        pivot.rotation.set(cfg.rx * k, cfg.ry * k, cfg.rz * k);

        // Warm orange flash at lock moment (p ≈ 0.38..0.50)
        const impact = Math.sin(clamp((p - 0.36) / 0.14) * Math.PI);
        mat.emissiveIntensity = impact * 0.28;
      });

      // 2. Stage 3D orientation + pointer tilt
      const orientEase = easeInOutCubic(clamp(p / 0.42));
      const targetRotX = 0.38 * (1 - orientEase) - ptr.y * 0.22;
      const targetRotY = -0.48 * (1 - orientEase) + ptr.x * 0.28;
      partsGroup.rotation.x += (targetRotX - partsGroup.rotation.x) * 0.12;
      partsGroup.rotation.y += (targetRotY - partsGroup.rotation.y) * 0.12;

      // 3. Elastic lock pulse + glide to RTL command anchor (right side of stage: +235 X)
      const lockBounce = Math.sin(clamp((p - 0.37) / 0.12) * Math.PI);
      const glide = easeInOutCubic(clamp((p - 0.46) / 0.18));
      const baseScale = (0.78 - 0.22 * glide) * (1 + 0.085 * lockBounce);
      partsGroup.scale.setScalar(baseScale);
      partsGroup.position.x = 235 * glide;
      partsGroup.position.y = 6 * Math.sin(elapsed * 1.6) * glide;

      // 4. Sweeping specular flash across 3D bevels
      const sw = clamp((p - 0.30) / 0.26);
      sweepLight.position.set(-240 + 520 * sw + 235 * glide, 180 - 320 * sw, 145);
      sweepLight.intensity = sw > 0 && sw < 1 ? Math.sin(sw * Math.PI) * 9.5 : 0;

      // 5. Drift ambient dust field
      particles.rotation.y = elapsed * 0.03 + ptr.x * 0.08;
      particles.position.x = p * 90;

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(renderLoop);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 880;
      const h = container.clientHeight || 440;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
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
  const routeDraw = easeInOutCubic(clamp((pClamped - 0.52) / 0.44));
  const routeSecDraw = easeInOutCubic(clamp((pClamped - 0.58) / 0.4));
  const routeVis = clamp((pClamped - 0.49) / 0.06);
  const destVis = clamp((pClamped - 0.88) / 0.09);

  // Active narrative phase label in Persian
  const phaseTitle =
    pClamped < 0.37
      ? 'فاز ۰۱ — همگرایی فنری ۴ قطعه سه‌بعدی لوگو در فضا'
      : pClamped < 0.52
      ? 'فاز ۰۲ — قفل مغناطیسی در نقطه طلایی (φ) و موج ضربه اسکوئیرکل'
      : 'فاز ۰۳ — گشودن بزرگراه کلوتوئیدی و شلیک سیگنال زنده GPS ناوگان';

  const liveSpeed = Math.round(62 + Math.sin(pClamped * 9) * 24 + routeDraw * 18);

  return (
    <section className="cad-card" style={{ marginBottom: 28, padding: '24px 26px' }}>
      {/* Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <div>
          <div className="kaf-slash-tag" style={{ marginBottom: 8 }}>
            <Sparkles size={14} />
            <span>فیلم تعاملی برند (نسخه ارتقایافته WebGL سه‌بعدی + سیگنال زنده مسیر)</span>
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, letterSpacing: '-0.01em' }}>
            از هندسه هسته تا تپش زنده ناوگان در جاده
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <button className="chip-btn" onClick={() => { setIsPlaying(false); setProgress(0.12); }}>
            ۱. انفجار فضایی
          </button>
          <button className="chip-btn" onClick={() => { setIsPlaying(false); setProgress(0.42); }}>
            ۲. موج ضربه قفل
          </button>
          <button className="chip-btn" onClick={() => { setIsPlaying(false); setProgress(0.84); }}>
            ۳. سیگنال مسیر GPS
          </button>
        </div>
      </div>

      {/* The Squircle-Inspired 3D Horizon Stage */}
      <div
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setPointer({
            x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
            y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
          });
        }}
        onMouseLeave={() => setPointer({ x: 0, y: 0 })}
        style={{
          position: 'relative',
          width: '100%',
          height: 440,
          borderRadius: 68, // Echoing gradiant.pdf squircle curvature!
          overflow: 'hidden',
          background: 'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)',
          backgroundSize: '165% 165%',
          backgroundPosition: `${pClamped * 100}% ${pClamped * 100}%`,
          border: '1px solid rgba(232, 222, 205, 0.22)',
          boxShadow: '0 30px 70px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.22)',
          userSelect: 'none',
        }}
      >
        {/* Parallax Layer 1: Far 24px (1u = 23.86pt) Square-Dot Matrix */}
        <div
          style={{
            position: 'absolute',
            inset: -40,
            backgroundImage: 'radial-gradient(circle, rgba(232,222,205,0.13) 1.3px, transparent 1.8px)',
            backgroundSize: '24px 24px',
            transform: `translate3d(${pClamped * 55 - pointer.x * 10}px, ${-pointer.y * 8}px, 0)`,
            pointerEvents: 'none',
          }}
        />

        {/* Parallax Layer 2: Near 72px (3u = 71.58pt) Waypoint Grid */}
        <div
          style={{
            position: 'absolute',
            inset: -60,
            backgroundImage: 'radial-gradient(circle, rgba(232,222,205,0.22) 2.2px, transparent 2.8px)',
            backgroundSize: '72px 72px',
            transform: `translate3d(${pClamped * 145 - pointer.x * 24}px, ${-pointer.y * 18}px, 0)`,
            pointerEvents: 'none',
          }}
        />

        {/* SVG Route Network & Comet GPS Signals (RTL Right-to-Left Trajectory!) */}
        <svg
          viewBox="0 0 960 440"
          preserveAspectRatio="xMidYMid slice"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          <defs>
            <filter id="orangeGlow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="cometGrad" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0%" stopColor="#E8DECD" stopOpacity="0.35" />
              <stop offset="72%" stopColor="#E8DECD" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#FF742E" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Secondary Branch Fleet Route (Clothoid + 14.5px Fillet) */}
          <path
            d="M 690,272 H 555 Q 535,272 535,292 V 348 Q 535,368 515,368 H 310 C 235,368 185,320 185,260"
            fill="none"
            stroke="rgba(232,222,205,0.14)"
            strokeWidth="5"
            strokeLinecap="round"
            opacity={routeVis}
          />
          <path
            ref={routeSecRef}
            d="M 690,272 H 555 Q 535,272 535,292 V 348 Q 535,368 515,368 H 310 C 235,368 185,320 185,260"
            fill="none"
            stroke="rgba(255,116,46,0.55)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="6 8"
            pathLength="1"
            style={{
              strokeDashoffset: 1 - routeSecDraw,
              opacity: routeSecDraw > 0.01 ? 0.85 : 0,
            }}
          />

          {/* Primary Highway Route (Exact R=16 fillets + Clothoid Ramp C curve!) */}
          <path
            d="M 690,272 H 520 Q 498,272 498,250 V 126 Q 498,104 476,104 H 318 C 218,104 142,178 142,282"
            fill="none"
            stroke="rgba(16, 35, 51, 0.72)"
            strokeWidth="12"
            strokeLinecap="round"
            opacity={routeVis}
          />
          <path
            ref={routeMainRef}
            d="M 690,272 H 520 Q 498,272 498,250 V 126 Q 498,104 476,104 H 318 C 218,104 142,178 142,282"
            fill="none"
            stroke="url(#cometGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - routeDraw}
            opacity={routeDraw > 0.005 ? 1 : 0}
            filter="url(#orangeGlow)"
          />

          {/* Intermediate Waypoint Squircle Node at Golden Turn (498, 126) */}
          {routeDraw > 0.36 && (
            <g transform="translate(498, 126)">
              <rect x="-8" y="-8" width="16" height="16" rx="5" fill="#102333" stroke="#E8DECD" strokeWidth="2.5" />
              <rect x="-3" y="-3" width="6" height="6" rx="2" fill="#FF742E" />
            </g>
          )}

          {/* Destination Squircle Target (142, 282) */}
          <g transform="translate(142, 282)" opacity={destVis}>
            <rect x="-20" y="-20" width="40" height="40" rx="12.5" fill="rgba(255,116,46,0.15)" stroke="#E8DECD" strokeWidth="2.5" />
            <rect x="-9" y="-9" width="18" height="18" rx="5.6" fill="#FF742E" />
          </g>

          {/* Secondary Vehicle Beacon */}
          {routeSecDraw > 0.04 && (
            <g transform={`translate(${secPt.x}, ${secPt.y})`}>
              <circle r="5.5" fill="#E8DECD" />
              <circle r="11" fill="none" stroke="#FF742E" strokeWidth="1.5" opacity="0.6" />
            </g>
          )}

          {/* Primary Active Vehicle GPS Beacon + Directional Blade Arrow */}
          {routeDraw > 0.01 && (
            <g transform={`translate(${signalPt.x}, ${signalPt.y})`}>
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
              <g transform={`rotate(${signalPt.angle})`}>
                <path d="M 10,0 L -7,-6.5 L -3.5,0 L -7,6.5 Z" fill="#FF742E" stroke="#FFF5EE" strokeWidth="1.4" />
              </g>
            </g>
          )}
        </svg>

        {/* Dual Squircle Impact Shockwaves on 3D Assembly Lock! */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 150,
            height: 150,
            borderRadius: '31.25%', // Exact gradiant.pdf squircle ratio!
            border: '2.5px solid #E8DECD',
            transform: `translate(-50%, -50%) scale(${0.5 + 3.4 * shock1})`,
            opacity: shock1 > 0 && shock1 < 1 ? 0.85 * (1 - shock1) : 0,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 120,
            height: 120,
            borderRadius: '31.25%',
            border: '2px solid #FF742E',
            boxShadow: '0 0 32px rgba(255,116,46,0.6)',
            transform: `translate(-50%, -50%) scale(${0.4 + 3.8 * shock2})`,
            opacity: shock2 > 0 && shock2 < 1 ? 0.9 * (1 - shock2) : 0,
            pointerEvents: 'none',
          }}
        />

        {/* Real-Time Three.js WebGL 4-Piece Extruded Logo Canvas */}
        <div
          ref={canvasWrapRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Top-Right & Bottom-Left Live Persian Telemetry HUD Pills */}
        <div
          style={{
            position: 'absolute',
            top: 22,
            right: 28,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px',
            borderRadius: 999,
            background: 'rgba(10, 22, 33, 0.72)',
            border: '1px solid rgba(232, 222, 205, 0.18)',
            backdropFilter: 'blur(10px)',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          <span className="live-dot" />
          <span>{phaseTitle}</span>
        </div>

        {/* Live Fleet Telemetry Card (fades in as route launches!) */}
        <div
          style={{
            position: 'absolute',
            top: 22,
            left: 28,
            padding: '12px 18px',
            borderRadius: 20,
            background: 'rgba(10, 22, 33, 0.78)',
            border: '1px solid rgba(255, 116, 46, 0.38)',
            backdropFilter: 'blur(12px)',
            opacity: clamp((pClamped - 0.5) / 0.14),
            transform: `translateY(${(1 - clamp((pClamped - 0.5) / 0.14)) * -12}px)`,
            transition: 'opacity 0.15s linear',
            pointerEvents: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#FFB085', fontWeight: 700 }}>
            <Navigation size={13} />
            <span>تله‌متری زنده واحد ناوگان ۰۷</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 4 }}>
            <div>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#E8DECD' }}>{toFa(liveSpeed)}</span>
              <span style={{ fontSize: 11.5, color: 'var(--beige-muted)', marginRight: 4 }}>کیلومتر/ساعت</span>
            </div>
            <div style={{ fontSize: 12, color: '#4ADE80', fontWeight: 700 }}>
              سیگنال ماهواره: {toFa('۹۹.۸٪')}
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: 18,
            right: 30,
            left: 30,
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            color: 'rgba(232,222,205,0.68)',
            pointerEvents: 'none',
          }}
        >
          <span>نشانگر ماوس را روی صحنه حرکت دهید تا زاویه دید سه‌بعدی تغییر کند</span>
          <span>۴ قطعه واقعی اکسترودشده در WebGL + مسیر کلوتوئیدی κ = ۰.۵۰</span>
        </div>
      </div>

      {/* Interactive Timeline Controls */}
      <div
        style={{
          marginTop: 18,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap',
          background: 'rgba(8, 19, 29, 0.72)',
          padding: '12px 18px',
          borderRadius: 18,
          border: '1px solid rgba(232,222,205,0.1)',
        }}
      >
        <button
          onClick={() => {
            if (progress >= 0.99 && !autoLoop) setProgress(0);
            setIsPlaying(!isPlaying);
          }}
          style={{
            padding: '8px 18px',
            borderRadius: 12,
            border: 'none',
            background: 'var(--brand-orange)',
            color: 'var(--brand-navy)',
            fontWeight: 800,
            fontSize: 13.5,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 6px 20px rgba(255, 116, 46, 0.38)',
          }}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} />}
          <span>{isPlaying ? 'توقف فیلم' : 'پخش سینمایی'}</span>
        </button>

        <button
          className="chip-btn"
          onClick={() => {
            setProgress(0);
            setIsPlaying(true);
          }}
          title="پخش از ابتدا"
        >
          <RotateCcw size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
          از ابتدا
        </button>

        <button className={`chip-btn ${autoLoop ? 'on' : ''}`} onClick={() => setAutoLoop(!autoLoop)}>
          <Radio size={13} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
          پخش پیوسته (Loop)
        </button>

        <div style={{ flex: 1, minWidth: 200, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12.5, color: 'var(--beige-muted)', whiteSpace: 'nowrap' }}>اسکراب زمان‌برگ:</span>
          <input
            type="range"
            className="cinema-range"
            min="0"
            max="1000"
            value={Math.round(pClamped * 1000)}
            onChange={(e) => {
              setIsPlaying(false);
              setProgress(Number(e.target.value) / 1000);
            }}
          />
          <span style={{ minWidth: 46, textAlign: 'left', fontWeight: 800, color: '#FF742E', fontSize: 15 }}>
            {toFa(Math.round(pClamped * 100))}٪
          </span>
        </div>
      </div>
    </section>
  );
}
