import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { LOGO_PARTS } from '../data/geometryData.js';
import { DESIGN_TOKENS } from '../../tokens/tokens.js';
import { setupClearcoatEnvironment, createClearcoatMaterial } from '../utils/pbrMaterials.js';
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
  const routeMainRef = useRef(null);

  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [signalPt, setSignalPt] = useState({ x: 640, y: 270, angle: 180 });

  const progressRef = useRef(0);

  useEffect(() => {
    progressRef.current = progress;
    const rEl = routeMainRef.current;
    if (rEl && rEl.getTotalLength) {
      const total = rEl.getTotalLength();
      const rProg = easeInOutCubic(clamp((progress - 0.5) / 0.45));
      const d = total * rProg;
      const pt = rEl.getPointAtLength(d);
      const pt2 = rEl.getPointAtLength(Math.min(total, d + 4));
      const ang = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
      setSignalPt({ x: pt.x, y: pt.y, angle: ang });
    }
  }, [progress]);

  useEffect(() => {
    if (!isPlaying) return;
    let rafId;
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setProgress((prev) => {
        const next = prev + dt * 0.15;
        return next >= 1.12 ? 0 : next;
      });
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isPlaying]);

  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return;

    const width = container.clientWidth || 880;
    const height = container.clientHeight || 420;

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

    const envRT = setupClearcoatEnvironment(renderer, scene);

    const partsGroup = new THREE.Group();
    scene.add(partsGroup);

    const loader = new SVGLoader();
    const partMeshes = [];
    const cOrange = new THREE.Color(DESIGN_TOKENS.color.signalOrange);

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
        bevelSegments: 5,
        curveSegments: 32,
      });
      geo.translate(-117.105, -162.38, -depth / 2);

      const mat = createClearcoatMaterial({
        color: new THREE.Color(part.color),
        emissive: cOrange,
        emissiveIntensity: 0,
      });

      const pivot = new THREE.Group();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(1, -1, 1);
      pivot.add(mesh);
      partsGroup.add(pivot);
      partMeshes.push({ pivot, geo, mat, cfg: part.offset, idx });
    });

    scene.add(new THREE.AmbientLight(new THREE.Color(DESIGN_TOKENS.color.sand['50']), 0.85));
    const keyLight = new THREE.DirectionalLight(new THREE.Color(DESIGN_TOKENS.color.sand['50']), 1.9);
    keyLight.position.set(-190, 175, 220);
    scene.add(keyLight);

    const orangeRim = new THREE.PointLight(cOrange, 1.5, 680, 1.5);
    orangeRim.position.set(170, -145, 130);
    scene.add(orangeRim);

    let animId;
    const t0 = performance.now();

    const animate = (now) => {
      animId = requestAnimationFrame(animate);
      const elapsed = (now - t0) * 0.001;
      const p = clamp(progressRef.current, 0, 1);

      partMeshes.forEach(({ pivot, mat, cfg, idx }) => {
        const q = clamp((p - cfg.delay) / 0.24);
        const k = 1 - easeOutBack(q);
        const floatY = Math.sin(elapsed * 2.1 + idx * 1.4) * 6 * clamp(1 - q * 1.4);
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
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      partMeshes.forEach((m) => {
        m.geo.dispose();
        m.mat.dispose();
      });
      envRT.dispose();
      renderer.dispose();
    };
  }, []);

  const pClamped = clamp(progress, 0, 1);
  const routeDraw = easeInOutCubic(clamp((pClamped - 0.5) / 0.45));

  return (
    <Card variant="panel" className="ds-stack-md">
      <div className="ds-between-wrap">
        <div className="ds-stack-xs">
          <div>
            <Capsule variant="eyebrow" pulse>صحنه سینمایی مونتاژ ۴ قطعه نشان و مسیر کلوتوئیدی</Capsule>
          </div>
          <h2>شبیه‌ساز پیوسته مونتاژ سه‌بعدی و ارسال سیگنال</h2>
        </div>

        <div className="ds-row-wrap">
          <Button variant="primary" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}
            <span>{isPlaying ? 'توقف' : 'پخش'}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsPlaying(false);
              setProgress(0);
            }}
          >
            <RotateCcw size={15} aria-hidden="true" />
            <span>بازنشانی</span>
          </Button>
        </div>
      </div>

      <div
        className="hero-stage-viewport"
        style={{ '--stage-bg-pos': `${pClamped * 100}% ${pClamped * 100}%` }}
      >
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
            strokeDashoffset={1 - routeDraw}
            opacity={routeDraw > 0.01 ? 1 : 0}
          />
          {routeDraw > 0.01 && (
            <g transform={`translate(${signalPt.x}, ${signalPt.y}) rotate(${signalPt.angle})`}>
              <circle r="13" fill="var(--ds-color-signal-orange)" fillOpacity="0.28" />
              <path d="M 9,0 L -6,-6 L -3,0 L -6,6 Z" fill="var(--ds-color-signal-orange)" stroke="var(--ds-sand-50)" strokeWidth="1.4" />
            </g>
          )}
        </svg>

        <div
          ref={canvasWrapRef}
          className="hero-webgl-layer"
          role="img"
          aria-label="صحنه آزمایشگاهی مونتاژ چهار قطعه سه‌بعدی لوگو"
        />

        <div className="hero-controls-dock">
          <label htmlFor="lab-film-range" className="ds-muted">اسلایدر زمان‌بندی سکانس:</label>
          <div className="hero-scrubber-group">
            <input
              id="lab-film-range"
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
            <strong className="ds-accent-text ds-tabular">{toFa(Math.round(pClamped * 100))}٪</strong>
          </div>
        </div>
      </div>
    </Card>
  );
}
