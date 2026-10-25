import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { DESIGN_TOKENS } from '../../../tokens/tokens.js';
import { LOGO_PATH_D } from '../../data/geometryData.js';
import { createClearcoatMaterial, setupClearcoatEnvironment } from '../../utils/pbrMaterials.js';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function tokenizePath(d) {
  return d.match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
}

function sampleCubic(p0, p1, p2, p3, steps = 22) {
  const pts = [];
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const mt = 1 - t;
    pts.push({
      x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
      y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
    });
  }
  return pts;
}

function parseSvgOutlineToPoints(d) {
  const tokens = tokenizePath(d);
  let idx = 0;
  let cmd = '';
  let cx = 0;
  let cy = 0;
  let sx = 0;
  let sy = 0;
  let prevC2 = null;
  const pts = [];

  const nextNum = () => parseFloat(tokens[idx++]);
  const hasNum = () => idx < tokens.length && !/^[a-zA-Z]$/.test(tokens[idx]);

  while (idx < tokens.length) {
    if (/^[a-zA-Z]$/.test(tokens[idx])) {
      cmd = tokens[idx++];
    }
    switch (cmd) {
      case 'M': {
        cx = nextNum();
        cy = nextNum();
        sx = cx;
        sy = cy;
        pts.push({ x: cx, y: cy });
        prevC2 = null;
        cmd = 'L';
        break;
      }
      case 'm': {
        cx += nextNum();
        cy += nextNum();
        sx = cx;
        sy = cy;
        pts.push({ x: cx, y: cy });
        prevC2 = null;
        cmd = 'l';
        break;
      }
      case 'L':
        while (hasNum()) {
          cx = nextNum();
          cy = nextNum();
          pts.push({ x: cx, y: cy });
        }
        prevC2 = null;
        break;
      case 'l':
        while (hasNum()) {
          cx += nextNum();
          cy += nextNum();
          pts.push({ x: cx, y: cy });
        }
        prevC2 = null;
        break;
      case 'H':
        while (hasNum()) {
          cx = nextNum();
          pts.push({ x: cx, y: cy });
        }
        prevC2 = null;
        break;
      case 'h':
        while (hasNum()) {
          cx += nextNum();
          pts.push({ x: cx, y: cy });
        }
        prevC2 = null;
        break;
      case 'V':
        while (hasNum()) {
          cy = nextNum();
          pts.push({ x: cx, y: cy });
        }
        prevC2 = null;
        break;
      case 'v':
        while (hasNum()) {
          cy += nextNum();
          pts.push({ x: cx, y: cy });
        }
        prevC2 = null;
        break;
      case 'C':
        while (hasNum()) {
          const p0 = { x: cx, y: cy };
          const p1 = { x: nextNum(), y: nextNum() };
          const p2 = { x: nextNum(), y: nextNum() };
          const p3 = { x: nextNum(), y: nextNum() };
          pts.push(...sampleCubic(p0, p1, p2, p3));
          cx = p3.x;
          cy = p3.y;
          prevC2 = p2;
        }
        break;
      case 'c':
        while (hasNum()) {
          const p0 = { x: cx, y: cy };
          const p1 = { x: cx + nextNum(), y: cy + nextNum() };
          const p2 = { x: cx + nextNum(), y: cy + nextNum() };
          const p3 = { x: cx + nextNum(), y: cy + nextNum() };
          pts.push(...sampleCubic(p0, p1, p2, p3));
          cx = p3.x;
          cy = p3.y;
          prevC2 = p2;
        }
        break;
      case 'S':
        while (hasNum()) {
          const p0 = { x: cx, y: cy };
          const p1 = prevC2 ? { x: 2 * cx - prevC2.x, y: 2 * cy - prevC2.y } : { x: cx, y: cy };
          const p2 = { x: nextNum(), y: nextNum() };
          const p3 = { x: nextNum(), y: nextNum() };
          pts.push(...sampleCubic(p0, p1, p2, p3));
          cx = p3.x;
          cy = p3.y;
          prevC2 = p2;
        }
        break;
      case 's':
        while (hasNum()) {
          const p0 = { x: cx, y: cy };
          const p1 = prevC2 ? { x: 2 * cx - prevC2.x, y: 2 * cy - prevC2.y } : { x: cx, y: cy };
          const p2 = { x: cx + nextNum(), y: cy + nextNum() };
          const p3 = { x: cx + nextNum(), y: cy + nextNum() };
          pts.push(...sampleCubic(p0, p1, p2, p3));
          cx = p3.x;
          cy = p3.y;
          prevC2 = p2;
        }
        break;
      case 'Z':
      case 'z':
        cx = sx;
        cy = sy;
        prevC2 = null;
        break;
      default:
        idx += 1;
        break;
    }
  }
  return pts;
}

function planeSpec(nx, ny, nz, c) {
  const len = Math.hypot(nx, ny, nz) || 1;
  return { n: [nx / len, ny / len, nz / len], c: c / len };
}

function negSpec(sp) {
  return { n: [-sp.n[0], -sp.n[1], -sp.n[2]], c: -sp.c };
}

// افراز مهندسی BSP با ۱۰ صفحه برش زاویه‌دار تکتونیک -> ۱۱ قطعه مجسمه‌سازی‌شده بدون هم‌پوشانی
const PL_A = planeSpec(0, 1, -0.09, -48);
const PL_B = planeSpec(1, 0.14, 0.06, 10);
const PL_C = planeSpec(-0.42, 1, 0.08, -106);
const PL_D = planeSpec(1, 0.48, -0.07, -92);
const PL_E = planeSpec(1, 0, 0.05, 46.9);
const PL_F = planeSpec(0.34, 1, -0.08, 14);
const PL_G = planeSpec(-0.32, 1, 0.07, 64);
const PL_H = planeSpec(-0.36, 1, -0.08, -8);
const PL_I = planeSpec(0.46, 1, 0.07, 46);
const PL_J = planeSpec(-0.38, 1, -0.06, 108);

const TECTONIC_SHARDS = [
  {
    name: 'crown-apex',
    planes: [PL_A, negSpec(PL_B), PL_C],
    rest: { x: -8, y: 12, z: 6, rz: 0.025 },
    scatter: { x: -170, y: 162, z: 130, rx: 0.54, ry: -0.66, rz: 0.36, delay: 0.0 },
    mag: { x: -26, y: 24, z: 24, rz: 0.06 },
  },
  {
    name: 'clothoid-shoulder',
    planes: [PL_A, negSpec(PL_B), negSpec(PL_C)],
    rest: { x: -12, y: 5, z: -4, rz: 0.02 },
    scatter: { x: -220, y: 86, z: -98, rx: -0.44, ry: -0.6, rz: 0.3, delay: 0.06 },
    mag: { x: -30, y: 12, z: 16, rz: 0.045 },
  },
  {
    name: 'wing-inner-bridge',
    planes: [PL_A, PL_B, negSpec(PL_D)],
    rest: { x: 5, y: 10, z: 5, rz: -0.016 },
    scatter: { x: 78, y: 172, z: 115, rx: -0.5, ry: 0.4, rz: -0.26, delay: 0.09 },
    mag: { x: 16, y: 22, z: 20, rz: -0.035 },
  },
  {
    name: 'wing-cantilever-tip',
    planes: [PL_A, PL_B, PL_D],
    rest: { x: 16, y: 14, z: 11, rz: -0.036 },
    scatter: { x: 250, y: 142, z: 160, rx: 0.58, ry: 0.7, rz: -0.44, delay: 0.14 },
    mag: { x: 34, y: 26, z: 30, rz: -0.065 },
  },
  {
    name: 'archway-haunch',
    planes: [negSpec(PL_A), negSpec(PL_E), PL_F],
    rest: { x: -13, y: 1, z: 7, rz: 0.022 },
    scatter: { x: -200, y: 14, z: 110, rx: 0.36, ry: -0.54, rz: 0.24, delay: 0.08 },
    mag: { x: -28, y: 3, z: 20, rz: 0.045 },
  },
  {
    name: 'pillar-mid-stanchion',
    planes: [negSpec(PL_A), negSpec(PL_E), negSpec(PL_F), PL_G],
    rest: { x: -14, y: -6, z: -4, rz: -0.02 },
    scatter: { x: -215, y: -90, z: -88, rx: -0.4, ry: 0.5, rz: -0.3, delay: 0.12 },
    mag: { x: -30, y: -12, z: 14, rz: -0.045 },
  },
  {
    name: 'pillar-base-foot',
    planes: [negSpec(PL_A), negSpec(PL_E), negSpec(PL_F), negSpec(PL_G)],
    rest: { x: -11, y: -15, z: 9, rz: 0.03 },
    scatter: { x: -170, y: -200, z: 140, rx: 0.64, ry: -0.46, rz: 0.38, delay: 0.17 },
    mag: { x: -24, y: -26, z: 26, rz: 0.055 },
  },
  {
    name: 'bridge-keystone',
    planes: [negSpec(PL_A), PL_E, PL_H],
    rest: { x: 5, y: 2, z: 6, rz: -0.014 },
    scatter: { x: 92, y: 44, z: -124, rx: -0.46, ry: 0.54, rz: -0.2, delay: 0.05 },
    mag: { x: 16, y: 5, z: 18, rz: -0.025 },
  },
  {
    name: 'shield-main-flank',
    planes: [negSpec(PL_A), PL_E, negSpec(PL_H), PL_I],
    rest: { x: 13, y: -4, z: 8, rz: -0.024 },
    scatter: { x: 230, y: -30, z: 120, rx: 0.48, ry: 0.64, rz: -0.34, delay: 0.11 },
    mag: { x: 30, y: -8, z: 24, rz: -0.055 },
  },
  {
    name: 'blade-upper-wedge',
    planes: [negSpec(PL_A), PL_E, negSpec(PL_H), negSpec(PL_I), PL_J],
    rest: { x: 11, y: -12, z: -4, rz: 0.02 },
    scatter: { x: 190, y: -142, z: -98, rx: -0.54, ry: -0.48, rz: 0.3, delay: 0.15 },
    mag: { x: 26, y: -20, z: 18, rz: 0.045 },
  },
  {
    name: 'blade-pointer-tip',
    planes: [negSpec(PL_A), PL_E, negSpec(PL_H), negSpec(PL_I), negSpec(PL_J)],
    rest: { x: 7, y: -18, z: 12, rz: -0.032 },
    scatter: { x: 140, y: -230, z: 170, rx: 0.7, ry: 0.56, rz: -0.4, delay: 0.19 },
    mag: { x: 20, y: -32, z: 32, rz: -0.065 },
  },
];

export default function HeroEmblemCanvas({
  scrollRef,
  pointerRef,
  pulseRef,
  reducedMotion,
  onGatewayScreenUpdate,
}) {
  const mountRef = useRef(null);
  const gatewayCallbackRef = useRef(onGatewayScreenUpdate);
  gatewayCallbackRef.current = onGatewayScreenUpdate;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let width = container.clientWidth || window.innerWidth || 1280;
    let height = container.clientHeight || window.innerHeight || 800;
    const isCompactInit = width <= 900;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererInfo = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '' : '';
    const isSoftwareGpu = /swiftshader|llvmpipe|software/i.test(rendererInfo);

    renderer.setPixelRatio(
      isSoftwareGpu ? 0.75 : Math.min(window.devicePixelRatio || 1, isCompactInit ? 1.5 : 2)
    );
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.24;
    renderer.localClippingEnabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 10, 3200);
    camera.position.set(0, 0, isCompactInit ? 860 : 820);

    const envRT = setupClearcoatEnvironment(renderer, scene);

    const sandBase = new THREE.Color(DESIGN_TOKENS.color.sand['100']);
    const sandLight = new THREE.Color(DESIGN_TOKENS.color.sand['50']);
    const signalOrange = new THREE.Color(DESIGN_TOKENS.color.signalOrange);
    const orangeSoft = new THREE.Color(DESIGN_TOKENS.color.orange['300']);
    const corridorCyan = new THREE.Color(DESIGN_TOKENS.color.telemetry.corridor);
    const skyTint = new THREE.Color(DESIGN_TOKENS.color.navy['25']);

    const ambient = new THREE.AmbientLight(sandLight, 0.56);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(sandLight, 2.25);
    keyLight.position.set(270, 340, 430);
    scene.add(keyLight);

    const cyanRimLight = new THREE.PointLight(corridorCyan, 2.8, 920, 1.45);
    cyanRimLight.position.set(-250, 165, 145);
    scene.add(cyanRimLight);

    const skyFillLight = new THREE.DirectionalLight(skyTint, 1.05);
    skyFillLight.position.set(-340, -120, 220);
    scene.add(skyFillLight);

    const cursorSpot = new THREE.PointLight(signalOrange, 3.4, 980, 1.35);
    cursorSpot.position.set(-60, -40, 310);
    scene.add(cursorSpot);

    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    const rawPts = parseSvgOutlineToPoints(LOGO_PATH_D);
    const vec2Pts = rawPts
      .filter((pt, idx) => {
        if (idx === 0) return true;
        const prev = rawPts[idx - 1];
        return Math.hypot(pt.x - prev.x, pt.y - prev.y) > 0.05;
      })
      .map((pt) => new THREE.Vector2(pt.x - 117.105, -(pt.y - 162.38)));

    if (THREE.ShapeUtils.isClockWise(vec2Pts)) {
      vec2Pts.reverse();
    }
    const masterShape = new THREE.Shape(vec2Pts);

    const sharedGeo = new THREE.ExtrudeGeometry(masterShape, {
      depth: 38,
      bevelEnabled: true,
      bevelThickness: 8.5,
      bevelSize: 5.2,
      bevelOffset: -1.1,
      bevelSegments: isSoftwareGpu ? 2 : isCompactInit ? 3 : 5,
      curveSegments: isSoftwareGpu ? 14 : isCompactInit ? 18 : 26,
    });
    sharedGeo.translate(0, 0, -19);

    // حالت عادی (بدون اسکرول): تندیس یکپارچه و کاملاً سالم بدون کوچک‌ترین شکاف
    const intactMat = createClearcoatMaterial({
      color: sandLight,
      roughness: 0.19,
      metalness: 0.09,
    });
    const intactMesh = new THREE.Mesh(sharedGeo, intactMat);
    emblemGroup.add(intactMesh);

    // حالت اسکرول: ۱۱ قطعه تکتونیک که با شروع اسکرول تکه به تکه شکسته و از هم جدا می‌شوند
    const shardsGroup = new THREE.Group();
    shardsGroup.visible = false;
    emblemGroup.add(shardsGroup);

    const shardOrderMap = [3, 5, 6, 0, 7, 4, 1, 9, 8, 10, 2];
    const shardMaterials = [];
    const shardMeshes = TECTONIC_SHARDS.map((cfg, idx) => {
      const localPlanes = cfg.planes.map(
        (p) => new THREE.Plane(new THREE.Vector3(p.n[0], p.n[1], p.n[2]), p.c)
      );
      const worldPlanes = localPlanes.map((lp) => lp.clone());
      const mat = createClearcoatMaterial({
        color: idx % 3 === 0 ? sandLight : sandBase,
        roughness: 0.2,
        metalness: 0.09,
      });
      mat.clippingPlanes = worldPlanes;
      mat.side = THREE.DoubleSide;
      shardMaterials.push(mat);

      const mesh = new THREE.Mesh(sharedGeo, mat);
      shardsGroup.add(mesh);
      return { mesh, cfg, localPlanes, worldPlanes, idx, order: shardOrderMap[idx] ?? idx };
    });

    // هسته نوری گرم درون شکاف‌های ۱۱ قطعه تندیس
    const seamLight = new THREE.PointLight(signalOrange, 4.4, 350, 1.35);
    seamLight.position.set(-22, 22, 8);
    emblemGroup.add(seamLight);

    const archTunnelLight = new THREE.PointLight(signalOrange, 3.6, 300, 1.4);
    archTunnelLight.position.set(-46.9, -46, 20);
    emblemGroup.add(archTunnelLight);

    const coreEmberGeo = new THREE.SphereGeometry(18, 16, 16);
    const coreEmberMat = new THREE.MeshBasicMaterial({
      color: signalOrange,
      transparent: true,
      opacity: 0.42,
    });
    const coreEmberMesh = new THREE.Mesh(coreEmberGeo, coreEmberMat);
    coreEmberMesh.position.set(-24, 24, -10);
    emblemGroup.add(coreEmberMesh);

    // مسیر مارپیچی S-Curve که از مدار بالا وارد شکاف‌ها شده و از طاق دروازه خارج می‌شود
    const gatewayCurve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(236, 148, -76),
        new THREE.Vector3(128, 72, -44),
        new THREE.Vector3(28, 102, -26),
        new THREE.Vector3(-34, 52, -20),
        new THREE.Vector3(-46.9, -4, 6),
        new THREE.Vector3(-46.9, -86, 18),
        new THREE.Vector3(-46.9, -158, 24),
      ],
      false,
      'catmullrom',
      0.45
    );

    const coreTubeGeo = new THREE.TubeGeometry(gatewayCurve, isSoftwareGpu ? 44 : 84, 3.8, 12, false);
    const coreTubeMat = new THREE.MeshBasicMaterial({
      color: signalOrange,
      transparent: true,
      opacity: 0.96,
    });
    const coreTubeMesh = new THREE.Mesh(coreTubeGeo, coreTubeMat);
    emblemGroup.add(coreTubeMesh);

    const cyanFilamentCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(228, 160, -82),
      new THREE.Vector3(122, 86, -48),
      new THREE.Vector3(22, 112, -30),
      new THREE.Vector3(-42, 58, -22),
      new THREE.Vector3(-58.5, -4, 4),
      new THREE.Vector3(-58.5, -86, 16),
      new THREE.Vector3(-58.5, -158, 22),
    ]);
    const warmFilamentCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(242, 134, -70),
      new THREE.Vector3(134, 58, -38),
      new THREE.Vector3(34, 90, -22),
      new THREE.Vector3(-26, 44, -18),
      new THREE.Vector3(-35.3, -4, 8),
      new THREE.Vector3(-35.3, -86, 20),
      new THREE.Vector3(-35.3, -158, 24),
    ]);

    const cyanFilamentGeo = new THREE.TubeGeometry(cyanFilamentCurve, 56, 1.05, 6, false);
    const warmFilamentGeo = new THREE.TubeGeometry(warmFilamentCurve, 56, 1.05, 6, false);
    const cyanFilamentMat = new THREE.MeshBasicMaterial({
      color: corridorCyan,
      transparent: true,
      opacity: 0.48,
    });
    const warmFilamentMat = new THREE.MeshBasicMaterial({
      color: sandLight,
      transparent: true,
      opacity: 0.36,
    });
    emblemGroup.add(new THREE.Mesh(cyanFilamentGeo, cyanFilamentMat));
    emblemGroup.add(new THREE.Mesh(warmFilamentGeo, warmFilamentMat));

    const pulseSphereGeo = new THREE.SphereGeometry(6.8, 14, 14);
    const pulseSphereMat = new THREE.MeshBasicMaterial({
      color: orangeSoft,
      transparent: true,
      opacity: 0.95,
    });
    const pulseBeads = [0, 0.25, 0.5, 0.75].map((phase) => {
      const m = new THREE.Mesh(pulseSphereGeo, pulseSphereMat);
      emblemGroup.add(m);
      return { mesh: m, phase };
    });

    const ringGeo = new THREE.RingGeometry(118, 125, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: signalOrange,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
    });
    const shockRing = new THREE.Mesh(ringGeo, ringMat);
    shockRing.position.z = -30;
    emblemGroup.add(shockRing);

    const particleCount = isSoftwareGpu ? 22 : isCompactInit ? 38 : 68;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      pPos[i * 3] = (Math.random() - 0.5) * 1240;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 760;
      pPos[i * 3 + 2] = -260 + Math.random() * 380;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: orangeSoft,
      size: 3.6,
      transparent: true,
      opacity: 0.3,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    let inView = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { threshold: 0.01 }
    );
    io.observe(container);

    const startTime = performance.now();
    let smoothPtrX = 0;
    let smoothPtrY = 0;
    let smoothScroll = scrollRef?.current || 0;
    let smoothMag = 0;
    let tapBurst = 0;
    let lastSeenPulseId = 0;
    let settledFrames = 0;
    const exitWorldVec = new THREE.Vector3();
    const skyEntryVec = new THREE.Vector3();
    const tangentVec = new THREE.Vector3();
    let rafId = 0;

    const tick = (now) => {
      rafId = requestAnimationFrame(tick);
      if (!inView || document.hidden) return;

      const elapsed = Math.max(0, (now - startTime) * 0.001);
      const isReduced = Boolean(reducedMotion);
      const isCompact = width <= 900;

      // پالس لمسی در موبایل/دسکتاپ هنگام ضربه روی تندیس
      if (pulseRef?.current && pulseRef.current !== lastSeenPulseId) {
        lastSeenPulseId = pulseRef.current;
        tapBurst = 1.0;
      }
      tapBurst *= 0.92;

      const targetScroll = clamp(scrollRef?.current || 0, 0, 1);
      const rawPtr = pointerRef?.current || { x: 0, y: 0 };

      const scrollDelta = Math.abs(targetScroll - smoothScroll);
      const ptrDelta = Math.abs(rawPtr.x - smoothPtrX) + Math.abs(rawPtr.y - smoothPtrY);

      if (
        isSoftwareGpu &&
        elapsed > 2.55 &&
        scrollDelta < 0.0005 &&
        ptrDelta < 0.001 &&
        smoothMag < 0.002 &&
        tapBurst < 0.01
      ) {
        settledFrames += 1;
        if (settledFrames > 2) return;
      } else {
        settledFrames = 0;
      }

      smoothScroll += (targetScroll - smoothScroll) * 0.14;
      smoothPtrX += (rawPtr.x - smoothPtrX) * 0.085;
      smoothPtrY += (rawPtr.y - smoothPtrY) * 0.085;

      const introGlobal = isReduced ? 1 : clamp(elapsed / 2.0, 0, 1);

      // حرکت زنده و تنفس سه‌بعدی خودکار در موبایل (چون در موبایل نشانگر موس وجود ندارد)
      const ambientMotionScale = isReduced || isSoftwareGpu ? 0.35 : 1;
      const idleYaw = Math.sin(elapsed * 1.25) * (isCompact ? 0.28 : 0.11) * ambientMotionScale;
      const idlePitch = Math.cos(elapsed * 0.92) * (isCompact ? 0.15 : 0.06) * ambientMotionScale;
      const idleRoll = Math.sin(elapsed * 0.72) * (isCompact ? 0.045 : 0.02) * ambientMotionScale;
      const breatheY = isSoftwareGpu
        ? 0
        : Math.sin(elapsed * 1.65) * (isCompact ? 9.5 : 5.5) * ambientMotionScale;

      // در حالت موبایل/تبلت (<=900px) تندیس کاملاً در فضای باز بین هدر و کارت متن قرار می‌گیرد
      const compactCenterY = Math.min(104, height * 0.115);
      const baseX = isCompact ? Math.sin(elapsed * 0.85) * 8 * ambientMotionScale : -194 * (1 - smoothScroll * 0.55);
      const baseY = isCompact ? compactCenterY + smoothScroll * 10 : 6 + smoothScroll * 18;

      emblemGroup.position.set(
        baseX + smoothPtrX * 26,
        baseY - smoothPtrY * 20 + breatheY,
        smoothScroll * 28
      );

      const emblemNormX = isCompact ? 0 : baseX / (width * 0.5);
      const emblemNormY = isCompact ? -0.34 : 0.02;
      const dist = Math.hypot(rawPtr.x - emblemNormX, rawPtr.y - emblemNormY);
      const hoverMag = introGlobal > 0.65 && dist < 0.78 ? Math.pow(1 - dist / 0.78, 1.3) : 0;
      const targetMag = Math.min(1.25, hoverMag + tapBurst * 0.95);
      smoothMag += (targetMag - smoothMag) * 0.12;

      const lockWindow = !isReduced ? clamp((elapsed - 0.85) / 0.75, 0, 1) : 0;
      const lockPulse = lockWindow > 0 && lockWindow < 1 ? Math.sin(lockWindow * Math.PI) : 0;
      const totalPulse = Math.max(lockPulse, tapBurst * 0.85);
      shockRing.scale.setScalar(0.85 + easeOutExpo(Math.max(lockWindow, tapBurst)) * 2.65);
      ringMat.opacity = totalPulse * 0.62;

      const corridorAppear = isReduced ? 1 : easeOutExpo(clamp((elapsed - 0.45) / 0.95, 0, 1));
      coreTubeMat.opacity = corridorAppear * 0.97;
      cyanFilamentMat.opacity = corridorAppear * 0.52;
      warmFilamentMat.opacity = corridorAppear * 0.38;
      pulseSphereMat.opacity = corridorAppear * 0.95;

      // شکست ۱۱تکه با اسکرول همیشه به اسکرول کاربر پاسخ می‌دهد (حتی در حالت ذخیره باتری گوشی)
      const isFracturing = smoothScroll > 0.008;
      intactMesh.visible = !isFracturing;
      shardsGroup.visible = isFracturing;

      const crackGlow = clamp(smoothScroll * 2.4, 0, 1);
      const lightPulse = isSoftwareGpu ? 1 : 0.88 + 0.24 * Math.sin(elapsed * 3.1);
      seamLight.intensity = isFracturing ? (2.2 + crackGlow * 7.2 + smoothMag * 2.5) * lightPulse : 1.5;
      coreEmberMat.opacity = isFracturing ? crackGlow * 0.72 * lightPulse : 0;
      archTunnelLight.intensity = corridorAppear * (3.2 + crackGlow * 2.8 + smoothMag * 2.0) + totalPulse * 2.6;

      pulseBeads.forEach(({ mesh, phase }) => {
        const rawU = (elapsed * 0.46 + phase) % 1;
        const u = clamp(rawU < 0 ? rawU + 1 : rawU, 0.001, 0.999);
        gatewayCurve.getPointAt(u, tangentVec);
        mesh.position.copy(tangentVec);
        const edgeFade = Math.sin(u * Math.PI);
        mesh.scale.setScalar(0.62 + edgeFade * 0.74);
      });

      const introSpinY = isReduced ? 0 : (1 - easeOutExpo(introGlobal)) * -0.45;
      emblemGroup.rotation.y = introSpinY + idleYaw + smoothPtrX * 0.42 - smoothScroll * 0.24;
      emblemGroup.rotation.x = idlePitch - smoothPtrY * 0.28 + smoothScroll * 0.18;
      emblemGroup.rotation.z = idleRoll + smoothScroll * -0.05;

      const scaleBase = isCompact ? (height < 760 ? 0.34 : 0.38) : 0.7;
      const introScale = isReduced ? 1 : 0.9 + easeOutExpo(introGlobal) * 0.1;
      emblemGroup.scale.setScalar(scaleBase * introScale * (1 + totalPulse * 0.045 - smoothScroll * 0.03));

      if (isFracturing) {
        shardMeshes.forEach(({ mesh, cfg, idx, order }) => {
          // شکستگی مرحله‌به‌مرحله (تکه‌تکه) با پیشروی اسکرول
          const shardStart = 0.008 + order * 0.044;
          const rawLocal = clamp((smoothScroll - shardStart) / 0.44, 0, 1);
          const crackCurve = 1 - Math.pow(1 - rawLocal, 2.3);
          const floatWave =
            isSoftwareGpu ? 1 : 0.94 + 0.12 * Math.sin(elapsed * 2.1 + idx * 0.8);

          const dx = (cfg.rest.x * 3.1 + cfg.scatter.x * 0.22) * crackCurve * floatWave;
          const dy = (cfg.rest.y * 3.1 + cfg.scatter.y * 0.22) * crackCurve * floatWave;
          const dz = (cfg.rest.z * 2.8 + cfg.scatter.z * 0.24) * crackCurve;

          mesh.position.set(
            dx + cfg.mag.x * smoothMag * crackCurve,
            dy + cfg.mag.y * smoothMag * crackCurve,
            dz + cfg.mag.z * smoothMag * crackCurve
          );

          mesh.rotation.set(
            cfg.scatter.rx * 0.42 * crackCurve,
            cfg.scatter.ry * 0.42 * crackCurve,
            (cfg.rest.rz * 2.4 + cfg.scatter.rz * 0.32) * crackCurve
          );
        });
      }

      emblemGroup.updateMatrixWorld();

      if (isFracturing) {
        shardMeshes.forEach(({ mesh, localPlanes, worldPlanes }) => {
          mesh.updateMatrixWorld();
          for (let i = 0; i < localPlanes.length; i += 1) {
            worldPlanes[i].copy(localPlanes[i]).applyMatrix4(mesh.matrixWorld);
          }
        });
      }

      cursorSpot.position.set(smoothPtrX * 390 - 70, -smoothPtrY * 260 + 35, 315);

      particles.rotation.y = smoothPtrX * 0.08;
      particles.rotation.x = -smoothPtrY * 0.06;
      particles.position.y = smoothScroll * 65;

      renderer.render(scene, camera);

      if (gatewayCallbackRef.current) {
        exitWorldVec.set(-46.9, -158, 24);
        emblemGroup.localToWorld(exitWorldVec);
        exitWorldVec.project(camera);
        const exitX = (exitWorldVec.x * 0.5 + 0.5) * width;
        const exitY = (-exitWorldVec.y * 0.5 + 0.5) * height;

        skyEntryVec.set(236, 148, -76);
        emblemGroup.localToWorld(skyEntryVec);
        skyEntryVec.project(camera);
        const skyX = (skyEntryVec.x * 0.5 + 0.5) * width;
        const skyY = (-skyEntryVec.y * 0.5 + 0.5) * height;

        gatewayCallbackRef.current(exitX, exitY, skyX, skyY, width, height, corridorAppear, smoothScroll);
      }
    };

    rafId = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      if (!container) return;
      const nextW = container.clientWidth || window.innerWidth || 1280;
      const nextH = container.clientHeight || window.innerHeight || 800;
      if (Math.abs(nextW - width) < 2 && Math.abs(nextH - height) < 2) return;
      width = nextW;
      height = nextH;
      const compact = width <= 900;
      camera.aspect = width / height;
      camera.position.z = compact ? 860 : 820;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(
        isSoftwareGpu ? 0.75 : Math.min(window.devicePixelRatio || 1, compact ? 1.5 : 2)
      );
      renderer.setSize(width, height);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      sharedGeo.dispose();
      coreTubeGeo.dispose();
      coreTubeMat.dispose();
      cyanFilamentGeo.dispose();
      warmFilamentGeo.dispose();
      cyanFilamentMat.dispose();
      warmFilamentMat.dispose();
      pulseSphereGeo.dispose();
      pulseSphereMat.dispose();
      coreEmberGeo.dispose();
      coreEmberMat.dispose();
      intactMat.dispose();
      shardMaterials.forEach((m) => m.dispose());
      ringGeo.dispose();
      ringMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [reducedMotion, scrollRef, pointerRef, pulseRef]);

  return <div ref={mountRef} className="hero-fullbleed-webgl" aria-hidden="true" />;
}
