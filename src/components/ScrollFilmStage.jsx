import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { LOGO_PARTS } from '../data/geometryData.js';
import { DESIGN_TOKENS } from '../../tokens/tokens.js';
import { setupClearcoatEnvironment, createClearcoatMaterial } from '../utils/pbrMaterials.js';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion.js';
import { Button, Card, Capsule } from '../ds/index.js';
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
  const viewportRef = useRef(null);
  const routeMainRef = useRef(null);
  const beaconRef = useRef(null);
  const pctLabelRef = useRef(null);
  const rangeRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  const [isPlaying, setIsPlaying] = useState(false);
  const progressRef = useRef(0.86);
  const playingRef = useRef(false);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  const applyDomProgress = (rawP) => {
    const p = clamp(rawP, 0, 1);
    progressRef.current = p;

    if (viewportRef.current) {
      viewportRef.current.style.setProperty('--stage-bg-pos', `${(p * 100).toFixed(1)}% ${(p * 100).toFixed(1)}%`);
    }
    if (rangeRef.current) {
      rangeRef.current.value = String(Math.round(p * 1000));
    }
    if (pctLabelRef.current) {
      pctLabelRef.current.textContent = `${toFa(Math.round(p * 100))}٪`;
    }

    const rEl = routeMainRef.current;
    if (rEl) {
      const rProg = easeInOutCubic(clamp((p - 0.5) / 0.45));
      rEl.setAttribute('stroke-dashoffset', String(1 - rProg));
      rEl.setAttribute('opacity', rProg > 0.01 ? '1' : '0');
      if (rEl.getTotalLength && beaconRef.current) {
        if (rProg > 0.01) {
          const total = rEl.getTotalLength();
          const d = total * rProg;
          const pt = rEl.getPointAtLength(d);
          const pt2 = rEl.getPointAtLength(Math.min(total, d + 4));
          const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
          beaconRef.current.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
          beaconRef.current.setAttribute('opacity', '1');
        } else {
          beaconRef.current.setAttribute('opacity', '0');
        }
      }
    }
  };

  useEffect(() => {
    applyDomProgress(progressRef.current);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setIsPlaying(false);
      applyDomProgress(1);
    }
  }, [reducedMotion]);

  useEffect(() => {
    if (!isPlaying || reducedMotion) return undefined;
    let rafId;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const next = progressRef.current + dt * 0.14;
      if (next >= 1) {
        applyDomProgress(1);
        setIsPlaying(false);
        return;
      }
      applyDomProgress(next);
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying, reducedMotion]);

  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return undefined;

    let inView = true;
    const obs = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    obs.observe(container);

    const width = container.clientWidth || 880;
    const height = container.clientHeight || 420;
    const isMobile = window.innerWidth <= 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 1, 3000);
    camera.position.set(0, 0, 680);

    const renderer = new THREE.WebGLRenderer({ antialias: !isMobile, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'صحنه سه‌بعدی مونتاژ چهار قطعه نشان در آزمایشگاه');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const envRT = setupClearcoatEnvironment(renderer, scene);
    const orangeColor = new THREE.Color(DESIGN_TOKENS.color.signalOrange);

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

      const depth = 30;
      const geo = new THREE.ExtrudeGeometry(shapes, {
        depth,
        bevelEnabled: true,
        bevelThickness: 7.5,
        bevelSize: 3.2,
        bevelOffset: -1.3,
        bevelSegments: isMobile ? 2 : 4,
        curveSegments: isMobile ? 16 : 24,
      });
      geo.translate(-117.105, -162.38, -depth / 2);

      const mat = createClearcoatMaterial({
        color: new THREE.Color(part.color),
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

    scene.add(new THREE.AmbientLight(new THREE.Color(DESIGN_TOKENS.color.sand['50']), 0.88));
    const keyLight = new THREE.DirectionalLight(new THREE.Color(DESIGN_TOKENS.color.sand['50']), 1.9);
    keyLight.position.set(-180, 170, 220);
    scene.add(keyLight);

    let animId;
    const t0 = performance.now();
    let lastP = -1;
    let settleFrames = 2;

    const animate = (now) => {
      animId = requestAnimationFrame(animate);
      if (!inView) return;

      const p = clamp(progressRef.current, 0, 1);
      if (!playingRef.current && settleFrames <= 0 && Math.abs(p - lastP) < 0.0005) {
        return;
      }
      if (settleFrames > 0) settleFrames -= 1;
      lastP = p;

      const elapsed = playingRef.current ? (now - t0) * 0.001 : 0;
      partMeshes.forEach(({ pivot, mat, cfg, idx }) => {
        const q = clamp((p - cfg.delay) / 0.24);
        const k = 1 - easeOutBack(q);
        const floatY = playingRef.current ? Math.sin(elapsed * 2 + idx) * 6 * clamp(1 - q * 1.4) : 0;
        pivot.position.set(cfg.x * k, cfg.y * k + floatY, cfg.z * k);
        pivot.rotation.set(cfg.rx * k, cfg.ry * k, cfg.rz * k);
        mat.emissiveIntensity = Math.sin(clamp((p - 0.36) / 0.14) * Math.PI) * 0.3;
      });

      const glide = easeInOutCubic(clamp((p - 0.46) / 0.18));
      partsGroup.scale.setScalar(0.74 - 0.22 * glide);
      partsGroup.position.x = 190 * glide;
      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 880;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      settleFrames = 2;
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
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  return (
    <Card variant="panel" className="ds-stack-md">
      <div className="ds-between-wrap">
        <div className="ds-stack-xs">
          <div>
            <Capsule variant="eyebrow">صحنه مونتاژ ۴ قطعه نشان و مسیر کلوتوئیدی</Capsule>
          </div>
          <h2>شبیه‌ساز مونتاژ سه‌بعدی و ارسال سیگنال</h2>
        </div>

        <div className="ds-row-wrap">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (!isPlaying && progressRef.current >= 0.99) applyDomProgress(0);
              setIsPlaying(!isPlaying);
            }}
          >
            {isPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            <span>{isPlaying ? 'توقف' : 'پخش'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsPlaying(false);
              applyDomProgress(0);
            }}
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span>بازنشانی</span>
          </Button>
        </div>
      </div>

      <div ref={viewportRef} className="hero-stage-viewport">
        <svg viewBox="0 0 820 440" preserveAspectRatio="xMidYMid slice" className="radar-map-svg" aria-hidden="true">
          <path
            ref={routeMainRef}
            d="M 595,250 H 442 Q 418,250 418,226 V 130 Q 418,106 394,106 H 258 C 170,106 102,180 102,276"
            fill="none"
            stroke="var(--ds-color-signal-orange)"
            strokeWidth="7"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset="0.14"
          />
          <g ref={beaconRef} transform="translate(102, 276) rotate(90)">
            <circle r="13" fill="var(--ds-color-signal-orange)" fillOpacity="0.28" />
            <path d="M 9,0 L -6,-6 L -3,0 L -6,6 Z" fill="var(--ds-color-signal-orange)" stroke="var(--ds-sand-50)" strokeWidth="1.4" />
          </g>
        </svg>

        <div ref={canvasWrapRef} className="hero-webgl-layer" />
      </div>

      <div className="cinema-scrub-row">
        <label htmlFor="lab-film-range" className="ds-muted">پیشرفت مونتاژ:</label>
        <input
          ref={rangeRef}
          id="lab-film-range"
          type="range"
          className="cinema-range"
          min="0"
          max="1000"
          defaultValue="860"
          onChange={(e) => {
            setIsPlaying(false);
            applyDomProgress(Number(e.target.value) / 1000);
          }}
        />
        <span ref={pctLabelRef} className="ds-tabular ds-accent-text">۸۶٪</span>
      </div>
    </Card>
  );
}
