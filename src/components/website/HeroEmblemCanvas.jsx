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

// صفحات برش GPU هماهنگ با ۴ عنصر معنادار لوگو
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
    planes: [P_UPPER, P_WING_R],
    scatter: { x: 265, y: 185, z: 245, rx: 0.68, ry: 0.85, rz: -0.34, delay: 0.12 },
    mag: { x: 14, y: 12, z: 12, rz: -0.025 },
  },
  {
    planes: [P_UPPER, P_DOME_L],
    scatter: { x: -245, y: 175, z: -185, rx: -0.62, ry: -0.8, rz: 0.32, delay: 0.0 },
    mag: { x: -14, y: 11, z: 10, rz: 0.025 },
  },
  {
    planes: [P_LOWER, P_STEM_L],
    scatter: { x: -255, y: -175, z: 215, rx: 0.58, ry: -0.72, rz: -0.28, delay: 0.06 },
    mag: { x: -15, y: -10, z: 10, rz: 0.02 },
  },
  {
    planes: [P_LOWER, P_SHIELD_R, P_SHIELD_TOP],
    scatter: { x: 270, y: 38, z: -175, rx: -0.54, ry: 0.78, rz: 0.26, delay: 0.16 },
    mag: { x: 15, y: 4, z: 10, rz: -0.02 },
  },
  {
    planes: [P_LOWER, P_SHIELD_R, P_SHIELD_TIP],
    scatter: { x: 155, y: -245, z: 285, rx: -0.76, ry: 0.9, rz: -0.38, delay: 0.22 },
    mag: { x: 10, y: -16, z: 18, rz: -0.03 },
  },
];

export default function HeroEmblemCanvas({
  scrollRef,
  pointerRef,
  reducedMotion = false,
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
    const isMobileInit = width <= 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 10, 3200);
    camera.position.set(0, 0, isMobileInit ? 940 : 810);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.localClippingEnabled = true;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobileInit ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const gl = renderer.getContext();
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    const gpuName = dbg ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '') : '';
    const isSoftwareGpu = /SwiftShader|llvmpipe|Software/i.test(gpuName);
    const lowDetail = isMobileInit || isSoftwareGpu;

    const envRT = setupClearcoatEnvironment(renderer, scene);

    const sandLight = new THREE.Color(DESIGN_TOKENS.color.sand['50']);
    const slateCool = new THREE.Color(DESIGN_TOKENS.color.navy['200']);
    const orangeColor = new THREE.Color(DESIGN_TOKENS.color.signalOrange);

    scene.add(new THREE.HemisphereLight(sandLight, slateCool, 1.08));

    const keyLight = new THREE.DirectionalLight(sandLight, 2.28);
    keyLight.position.set(-280, 360, 460);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(slateCool, 1.25);
    rimLight.position.set(320, 140, -280);
    scene.add(rimLight);

    const cursorSpot = new THREE.PointLight(orangeColor, 2.2, 920, 1.45);
    cursorSpot.position.set(80, -40, 290);
    scene.add(cursorSpot);

    const emblemGroup = new THREE.Group();
    scene.add(emblemGroup);

    // نور گرم درون طاق دروازه لوگو (بازتاب نوری نارنجی روی دیواره داخلی ستون و سپر)
    const archTunnelLight = new THREE.PointLight(orangeColor, 3.2, 260, 1.5);
    archTunnelLight.position.set(-46.9, -18, 12);
    emblemGroup.add(archTunnelLight);

    const ringGeo = new THREE.RingGeometry(86, 89.2, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: orangeColor,
      side: THREE.DoubleSide,
      transparent: true,
      blending: THREE.AdditiveBlending,
      opacity: 0,
    });
    const shockRing = new THREE.Mesh(ringGeo, ringMat);
    emblemGroup.add(shockRing);

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

    const solidMonolithMat = createClearcoatMaterial({
      color: new THREE.Color(DESIGN_TOKENS.color.sand['50']),
    });
    const solidMonolithMesh = new THREE.Mesh(monolithGeo, solidMonolithMat);
    solidMonolithMesh.visible = Boolean(reducedMotion);
    emblemGroup.add(solidMonolithMesh);

    const shardMeshes = SHARD_CONFIGS.map((cfg) => {
      const worldPlanes = cfg.planes.map((pl) => pl.clone());
      const mat = createClearcoatMaterial({
        color: new THREE.Color(DESIGN_TOKENS.color.sand['50']),
      });
      mat.side = THREE.DoubleSide;
      mat.clippingPlanes = worldPlanes;
      const mesh = new THREE.Mesh(monolithGeo, mat);
      emblemGroup.add(mesh);
      return { mesh, mat, cfg, localPlanes: cfg.planes, worldPlanes };
    });

    // ============================================================================
    // مسیر مفهومی سه‌بعدی در دل معماری لوگو:
    // ورود سیگنال ماهواره‌ای از «دهلیز افق بالا» -> عبور از پشت پل پردازشی هسته ->
    // طلوع و خروج باشکوه از میان «دروازه آزادراه لوگو» (بین ستون چپ و سپر راست، x = -46.9)
    // ============================================================================
    const gatewayCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(154, 94, -34),
      new THREE.Vector3(42, 90, -30),
      new THREE.Vector3(-28, 62, -28),
      new THREE.Vector3(-46.9, 12, 10),
      new THREE.Vector3(-46.9, -78, 18),
      new THREE.Vector3(-46.9, -158, 22),
    ]);

    const coreTubeGeo = new THREE.TubeGeometry(gatewayCurve, lowDetail ? 36 : 64, 3.6, 10, false);
    const coreTubeMat = new THREE.MeshStandardMaterial({
      color: orangeColor,
      emissive: orangeColor,
      emissiveIntensity: 1.85,
      roughness: 0.22,
      transparent: true,
      opacity: reducedMotion ? 1 : 0,
    });
    const coreTubeMesh = new THREE.Mesh(coreTubeGeo, coreTubeMat);
    emblemGroup.add(coreTubeMesh);

    // دو خط راهنمای ظریف موازی درون تونل دروازه آزادراه (حس واقعی لاین‌های عبوری بزرگراه)
    const railCurveL = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-59, 14, 8),
      new THREE.Vector3(-59, -78, 16),
      new THREE.Vector3(-59, -158, 20),
    ]);
    const railCurveR = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-34.8, 14, 8),
      new THREE.Vector3(-34.8, -78, 16),
      new THREE.Vector3(-34.8, -158, 20),
    ]);
    const sideRailGeoL = new THREE.TubeGeometry(railCurveL, 20, 1.0, 6, false);
    const sideRailGeoR = new THREE.TubeGeometry(railCurveR, 20, 1.0, 6, false);
    const sideRailMat = new THREE.MeshBasicMaterial({
      color: sandLight,
      transparent: true,
      opacity: 0,
    });
    const sideRailL = new THREE.Mesh(sideRailGeoL, sideRailMat);
    const sideRailR = new THREE.Mesh(sideRailGeoR, sideRailMat);
    emblemGroup.add(sideRailL);
    emblemGroup.add(sideRailR);

    // گوی‌های پالس تله‌متری که از افق بالا وارد لوگو شده و از دروازه پایین خارج می‌شوند
    const pulseSphereGeo = new THREE.SphereGeometry(5.6, 12, 12);
    const pulseSphereMat = new THREE.MeshBasicMaterial({
      color: sandLight,
      transparent: true,
      opacity: 0,
    });
    const pulseBeads = [0, 0.5].map((phase) => {
      const m = new THREE.Mesh(pulseSphereGeo, pulseSphereMat);
      emblemGroup.add(m);
      return { mesh: m, phase };
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
      size: 3.2,
      transparent: true,
      opacity: 0.22,
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
    const exitWorldVec = new THREE.Vector3();
    const skyEntryVec = new THREE.Vector3();
    const tangentVec = new THREE.Vector3();
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

      if (isSoftwareGpu && elapsed > 2.35 && scrollDelta < 0.0005 && ptrDelta < 0.001 && smoothMag < 0.002) {
        settledFrames += 1;
        if (settledFrames > 2) return;
      } else {
        settledFrames = 0;
      }

      smoothScroll += (targetScroll - smoothScroll) * 0.14;
      smoothPtrX += (rawPtr.x - smoothPtrX) * 0.085;
      smoothPtrY += (rawPtr.y - smoothPtrY) * 0.085;

      const introGlobal = isReduced ? 1 : clamp(elapsed / 2.0, 0, 1);

      const baseX = isMob ? 0 : -190 * (1 - smoothScroll * 0.78);
      const baseY = isMob ? 124 - smoothScroll * 30 : 4 + smoothScroll * 20;
      const breatheY = isReduced || isSoftwareGpu ? 0 : Math.sin(elapsed * 1.4) * 4;

      emblemGroup.position.set(
        baseX + smoothPtrX * 20,
        baseY - smoothPtrY * 16 + breatheY,
        smoothScroll * 34
      );

      const emblemNormX = isMob ? 0 : baseX / (width * 0.5);
      const dist = Math.hypot(rawPtr.x - emblemNormX, rawPtr.y - 0.02);
      const targetMag = !isReduced && introGlobal > 0.88 && dist < 0.42 ? 1 - dist / 0.42 : 0;
      smoothMag += (targetMag - smoothMag) * 0.11;

      const lockWindow = !isReduced ? clamp((elapsed - 1.2) / 0.7, 0, 1) : 0;
      const lockPulse = lockWindow > 0 && lockWindow < 1 ? Math.sin(lockWindow * Math.PI) : 0;
      shockRing.scale.setScalar(0.85 + easeOutExpo(lockWindow) * 2.65);
      ringMat.opacity = lockPulse * 0.56;

      // روشنایی تونل دروازه پس از قفل شدن تندیس
      const corridorAppear = isReduced ? 1 : easeOutExpo(clamp((elapsed - 1.05) / 0.95, 0, 1));
      coreTubeMat.opacity = corridorAppear * 0.96;
      sideRailMat.opacity = corridorAppear * 0.34;
      pulseSphereMat.opacity = corridorAppear * 0.92;
      archTunnelLight.intensity = corridorAppear * (3.1 + smoothScroll * 1.6 + smoothMag * 2.2) + lockPulse * 2.5;

      pulseBeads.forEach(({ mesh, phase }) => {
        const rawU = (elapsed * 0.44 + phase) % 1;
        const u = isReduced ? 0.82 : clamp(rawU < 0 ? rawU + 1 : rawU, 0.001, 0.999);
        gatewayCurve.getPointAt(u, tangentVec);
        mesh.position.copy(tangentVec);
        const edgeFade = Math.sin(u * Math.PI);
        mesh.scale.setScalar(0.65 + edgeFade * 0.65);
      });

      const introSpinY = isReduced ? 0 : (1 - easeOutExpo(introGlobal)) * -0.44;
      emblemGroup.rotation.y = introSpinY + smoothPtrX * 0.32 - smoothScroll * 0.18;
      emblemGroup.rotation.x = -smoothPtrY * 0.21 + smoothScroll * 0.15;
      emblemGroup.rotation.z = smoothScroll * -0.04;

      const scaleBase = isMob ? 0.33 : 0.71;
      emblemGroup.scale.setScalar(scaleBase * (1 + lockPulse * 0.045 - smoothScroll * 0.04));

      let maxScatter = 0;
      shardMeshes.forEach(({ mesh, cfg }) => {
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

      // تصویرسازی دقیق آستانه خروجی «دروازه آزادراه لوگو» (-46.9, -158, 22) به مختصات صفحه
      // تا بزرگراه خروجی بدون حتی ۱ پیکسل زاویه شکسته، مستقیماً از میان طاق لوگو به مدار اصلی صفحه جاری شود
      if (gatewayCallbackRef.current) {
        exitWorldVec.set(-46.9, -158, 22);
        emblemGroup.localToWorld(exitWorldVec);
        exitWorldVec.project(camera);
        const exitX = (exitWorldVec.x * 0.5 + 0.5) * width;
        const exitY = (-exitWorldVec.y * 0.5 + 0.5) * height;

        skyEntryVec.set(154, 94, -34);
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
      width = container.clientWidth || window.innerWidth || 1280;
      height = container.clientHeight || window.innerHeight || 800;
      const mob = width <= 768;
      camera.aspect = width / height;
      camera.position.z = mob ? 940 : 810;
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
      coreTubeGeo.dispose();
      coreTubeMat.dispose();
      sideRailGeoL.dispose();
      sideRailGeoR.dispose();
      sideRailMat.dispose();
      pulseSphereGeo.dispose();
      pulseSphereMat.dispose();
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
      aria-label="تندیس سه‌بعدی دروازه ناوگان فرزام که پرتو تله‌متری ماهواره از افق بالای آن وارد شده و به‌صورت بزرگراه زنده از میان طاق دروازه پایینی خارج می‌شود"
    />
  );
}
