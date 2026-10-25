import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { DESIGN_TOKENS } from '../../../tokens/tokens.js';
import { LOGO_PATH_D } from '../../data/geometryData.js';
import { setupClearcoatEnvironment, createClearcoatMaterial } from '../../utils/pbrMaterials.js';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

// در Three.js پلیگون نقطه‌ای زمانی حفظ می‌شود که normal.dot(p) + constant >= 0 باشد
const P_UPPER = new THREE.Plane(new THREE.Vector3(-0.4515, 0.8923, 0), -42);
const P_LOWER = new THREE.Plane(new THREE.Vector3(0.4515, -0.8923, 0), 42);
const P_WING_R = new THREE.Plane(new THREE.Vector3(0.8923, 0.4515, 0), -68);
const P_DOME_L = new THREE.Plane(new THREE.Vector3(-0.8923, -0.4515, 0), 68);
const P_STEM_L = new THREE.Plane(new THREE.Vector3(-1, 0, 0), -42);
const P_SHIELD_R = new THREE.Plane(new THREE.Vector3(1, 0, 0), 42);
const P_SHIELD_TOP = new THREE.Plane(new THREE.Vector3(0.4515, 0.8923, 0), 46);
const P_SHIELD_TIP = new THREE.Plane(new THREE.Vector3(-0.4515, -0.8923, 0), -46);

const SHARD_CONFIGS = [
  {
    // بال افقی بالا-راست
    planes: [P_UPPER, P_WING_R],
    scatter: { x: 265, y: 185, z: 245, rx: 0.68, ry: 0.85, rz: -0.34, delay: 0.12 },
    mag: { x: 14, y: 12, z: 12, rz: -0.025 },
  },
  {
    // گنبد قوسی بالا-چپ
    planes: [P_UPPER, P_DOME_L],
    scatter: { x: -245, y: 175, z: -185, rx: -0.62, ry: -0.8, rz: 0.32, delay: 0.0 },
    mag: { x: -14, y: 11, z: 10, rz: 0.025 },
  },
  {
    // ستون عمودی پایین-چپ
    planes: [P_LOWER, P_STEM_L],
    scatter: { x: -255, y: -175, z: 215, rx: 0.58, ry: -0.72, rz: -0.28, delay: 0.06 },
    mag: { x: -15, y: -10, z: 10, rz: 0.02 },
  },
  {
    // شانه سپر میانی-راست
    planes: [P_LOWER, P_SHIELD_R, P_SHIELD_TOP],
    scatter: { x: 270, y: 38, z: -175, rx: -0.54, ry: 0.78, rz: 0.26, delay: 0.16 },
    mag: { x: 15, y: 4, z: 10, rz: -0.02 },
  },
  {
    // نوک نیزه ۱۳۶.۵۴ درجه پایین-راست (سرچشمه خط سیگنال)
    planes: [P_LOWER, P_SHIELD_R, P_SHIELD_TIP],
    scatter: { x: 155, y: -245, z: 285, rx: -0.76, ry: 0.9, rz: -0.38, delay: 0.22 },
    mag: { x: 10, y: -16, z: 18, rz: -0.03 },
  },
];

export default function HeroEmblemCanvas({
  scrollRef,
  pointerRef,
  reducedMotion = false,
  onTipScreenUpdate,
}) {
  const mountRef = useRef(null);
  const tipCallbackRef = useRef(onTipScreenUpdate);
  tipCallbackRef.current = onTipScreenUpdate;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return undefined;

    let width = container.clientWidth || window.innerWidth || 1280;
    let height = container.clientHeight || window.innerHeight || 800;
    const isMobileInit = width <= 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 10, 3200);
    camera.position.set(0, 0, isMobileInit ? 940 : 820);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.localClippingEnabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileInit ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const envRT = setupClearcoatEnvironment(renderer, scene);

    const sandLight = new THREE.Color(DESIGN_TOKENS.color.sand['50']);
    const slateCool = new THREE.Color(DESIGN_TOKENS.color.navy['200']);
    const orangeColor = new THREE.Color(DESIGN_TOKENS.color.signalOrange);

    scene.add(new THREE.HemisphereLight(sandLight, slateCool, 1.08));

    const keyLight = new THREE.DirectionalLight(sandLight, 2.25);
    keyLight.position.set(-280, 360, 460);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(slateCool, 1.25);
    rimLight.position.set(320, 140, -280);
    scene.add(rimLight);

    const cursorSpot = new THREE.PointLight(orangeColor, 2.3, 920, 1.45);
    cursorSpot.position.set(80, -40, 290);
    scene.add(cursorSpot);

    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    const innerCoreLight = new THREE.PointLight(orangeColor, 0, 340, 1.35);
    innerCoreLight.position.set(6, -18, 20);
    emblemGroup.add(innerCoreLight);

    const ringGeo = new THREE.RingGeometry(82, 85.2, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: orangeColor,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0,
    });
    const shockRing = new THREE.Mesh(ringGeo, ringMat);
    emblemGroup.add(shockRing);

    // ساخت مش یکپارچه مرجع برند با تصحیح دقیق جهت محور Y
    const loader = new SVGLoader();
    const parsed = loader.parse(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.21 324.76"><path d="${LOGO_PATH_D}"/></svg>`
    );
    const rawShapes = [];
    parsed.paths.forEach((p) => {
      SVGLoader.createShapes(p).forEach((s) => rawShapes.push(s));
    });

    const basePts = rawShapes[0]
      .getPoints(96)
      .map((pt) => new THREE.Vector2(pt.x - 117.105, -(pt.y - 162.38)));
    if (THREE.ShapeUtils.isClockWise(basePts)) {
      basePts.reverse();
    }

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
    const isSoftwareGpu = /SwiftShader|llvmpipe|Software/i.test(gpuName);
    const lowDetail = isMobileInit || isSoftwareGpu;

    const depth = 38;
    const monolithShape = new THREE.Shape(basePts);
    const monolithGeo = new THREE.ExtrudeGeometry(monolithShape, {
      depth,
      bevelEnabled: true,
      bevelThickness: 7.2,
      bevelSize: 2.2,
      bevelOffset: -2.2,
      bevelSegments: lowDetail ? 2 : 7,
      curveSegments: lowDetail ? 16 : 34,
    });
    monolithGeo.translate(0, 0, -depth / 2);

    // مش یکپارچه نهایی بدون هیچ برشی برای نمایش ۱۰۰٪ یکدست در حالت سکون (و ۵ برابر سبک‌تر روی GPU)
    const solidMonolithMat = createClearcoatMaterial({
      color: new THREE.Color(DESIGN_TOKENS.color.sand['50']),
    });
    const solidMonolithMesh = new THREE.Mesh(monolithGeo, solidMonolithMat);
    solidMonolithMesh.visible = Boolean(reducedMotion);
    emblemGroup.add(solidMonolithMesh);

    // ۵ قطعه برش‌خورده GPU از روی همان هندسه واحد (برای ورود تیکه‌تیکه و شناوری مغناطیسی موس)
    const shardMeshes = SHARD_CONFIGS.map((cfg, idx) => {
      const worldPlanes = cfg.planes.map((pl) => pl.clone());
      const mat = createClearcoatMaterial({
        color: new THREE.Color(DESIGN_TOKENS.color.sand['50']),
      });
      mat.side = THREE.DoubleSide;
      mat.clippingPlanes = worldPlanes;
      if (idx === 4) {
        mat.emissive = orangeColor.clone();
        mat.emissiveIntensity = 0;
      }
      const mesh = new THREE.Mesh(monolithGeo, mat);
      emblemGroup.add(mesh);
      return { mesh, mat, cfg, localPlanes: cfg.planes, worldPlanes };
    });

    const particleCount = isMobileInit ? 18 : 34;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i += 1) {
      pPos[i * 3] = (Math.random() - 0.5) * 1250;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 720;
      pPos[i * 3 + 2] = -240 + Math.random() * 340;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: sandLight,
      size: 3.4,
      transparent: true,
      opacity: 0.24,
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
    let settledFrames = 0;
    const tipWorldVec = new THREE.Vector3();
    let rafId = 0;

    const tick = (now) => {
      rafId = requestAnimationFrame(tick);
      if (!inView) return;

      const elapsed = (now - startTime) * 0.001;
      const isReduced = Boolean(reducedMotion);
      const isMob = width <= 768;

      const targetScroll = clamp(scrollRef?.current || 0, 0, 1);
      const rawPtr = pointerRef?.current || { x: 0, y: 0 };

      const scrollDelta = Math.abs(targetScroll - smoothScroll);
      const ptrDelta = Math.abs(rawPtr.x - smoothPtrX) + Math.abs(rawPtr.y - smoothPtrY);

      if (isSoftwareGpu && elapsed > 2.25 && scrollDelta < 0.0005 && ptrDelta < 0.001 && smoothMag < 0.002) {
        settledFrames += 1;
        if (settledFrames > 2) return;
      } else {
        settledFrames = 0;
      }

      smoothScroll += (targetScroll - smoothScroll) * 0.14;
      smoothPtrX += (rawPtr.x - smoothPtrX) * 0.085;
      smoothPtrY += (rawPtr.y - smoothPtrY) * 0.085;

      const introGlobal = isReduced ? 1 : clamp(elapsed / 2.0, 0, 1);

      const baseX = isMob ? 0 : -195 * (1 - smoothScroll * 0.86);
      const baseY = isMob ? 124 - smoothScroll * 32 : -6 + smoothScroll * 18;
      const breatheY = isReduced || isSoftwareGpu ? 0 : Math.sin(elapsed * 1.45) * 4.5;

      emblemGroup.position.set(
        baseX + smoothPtrX * 20,
        baseY - smoothPtrY * 16 + breatheY,
        smoothScroll * 36
      );

      const emblemNormX = isMob ? 0 : (-195 * (1 - smoothScroll * 0.86)) / (width * 0.5);
      const dist = Math.hypot(rawPtr.x - emblemNormX, rawPtr.y - 0.02);
      const targetMag = !isReduced && introGlobal > 0.88 && dist < 0.42 ? 1 - dist / 0.42 : 0;
      smoothMag += (targetMag - smoothMag) * 0.11;

      const lockWindow = !isReduced ? clamp((elapsed - 1.2) / 0.7, 0, 1) : 0;
      const lockPulse = lockWindow > 0 && lockWindow < 1 ? Math.sin(lockWindow * Math.PI) : 0;
      shockRing.scale.setScalar(0.85 + easeOutExpo(lockWindow) * 2.65);
      ringMat.opacity = lockPulse * 0.58;
      innerCoreLight.intensity = smoothMag * 4.8 + lockPulse * 3.4;

      const introSpinY = isReduced ? 0 : (1 - easeOutExpo(introGlobal)) * -0.45;
      emblemGroup.rotation.y = introSpinY + smoothPtrX * 0.32 - smoothScroll * 0.22;
      emblemGroup.rotation.x = -smoothPtrY * 0.22 + smoothScroll * 0.16;
      emblemGroup.rotation.z = smoothScroll * -0.05;

      const scaleBase = isMob ? 0.33 : 0.72;
      emblemGroup.scale.setScalar(scaleBase * (1 + lockPulse * 0.045 - smoothScroll * 0.05));

      let maxScatter = 0;
      shardMeshes.forEach(({ mesh, mat, cfg }, idx) => {
        const localT = isReduced
          ? 1
          : clamp((elapsed - cfg.scatter.delay) / (1.62 - cfg.scatter.delay * 0.35), 0, 1);
        const scatter = 1 - easeOutExpo(localT);
        maxScatter = Math.max(maxScatter, scatter);

        mesh.position.set(
          cfg.scatter.x * scatter + cfg.mag.x * smoothMag,
          cfg.scatter.y * scatter + cfg.mag.y * smoothMag,
          cfg.scatter.z * scatter + cfg.mag.z * smoothMag
        );

        mesh.rotation.set(
          cfg.scatter.rx * scatter,
          cfg.scatter.ry * scatter,
          cfg.scatter.rz * scatter + cfg.mag.rz * smoothMag
        );

        if (idx === 4) {
          mat.emissiveIntensity = smoothScroll * 0.42 + smoothMag * 0.25 + lockPulse * 0.32;
        }
      });

      const isFullyFused = maxScatter < 0.009 && smoothMag < 0.005;
      solidMonolithMesh.visible = isFullyFused;
      emblemGroup.updateMatrixWorld();

      shardMeshes.forEach(({ mesh, localPlanes, worldPlanes }) => {
        mesh.visible = !isFullyFused;
        if (!isFullyFused) {
          mesh.updateMatrixWorld();
          for (let i = 0; i < localPlanes.length; i += 1) {
            worldPlanes[i].copy(localPlanes[i]).applyMatrix4(mesh.matrixWorld);
          }
        }
      });

      cursorSpot.position.set(smoothPtrX * 360 - 80, -smoothPtrY * 250 + 40, 310);

      particles.rotation.y = smoothPtrX * 0.07;
      particles.rotation.x = -smoothPtrY * 0.05;
      particles.position.y = smoothScroll * 65;

      renderer.render(scene, camera);

      if (tipCallbackRef.current) {
        tipWorldVec.set(9.4, -159.2, 6);
        const refMesh = isFullyFused ? solidMonolithMesh : shardMeshes[4].mesh;
        refMesh.updateMatrixWorld();
        refMesh.localToWorld(tipWorldVec);
        tipWorldVec.project(camera);
        const screenX = (tipWorldVec.x * 0.5 + 0.5) * width;
        const screenY = (-tipWorldVec.y * 0.5 + 0.5) * height;
        const tetherReady = isReduced ? 1 : easeOutExpo(clamp((elapsed - 0.85) / 1.0, 0, 1));
        tipCallbackRef.current(screenX, screenY, width, height, tetherReady, smoothScroll);
      }
    };

    rafId = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth || 1280;
      height = container.clientHeight || window.innerHeight || 800;
      const mob = width <= 768;
      camera.aspect = width / height;
      camera.position.z = mob ? 940 : 820;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, mob ? 1.5 : 2));
      renderer.setSize(width, height);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      io.disconnect();
      ro.disconnect();
      shardMeshes.forEach(({ mat }) => mat.dispose());
      solidMonolithMat.dispose();
      monolithGeo.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [reducedMotion, scrollRef, pointerRef]);

  return (
    <div
      ref={mountRef}
      className="hero-fullbleed-webgl"
      role="img"
      aria-label="تندیس سه‌بعدی ناوگان که در لحظه ورود از فضای سه‌بعدی هم‌گرا شده و خط سیگنال زنده را به پایین صفحه متصل می‌کند"
    />
  );
}
