import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { LOGO_PARTS } from '../../data/geometryData.js';
import { DESIGN_TOKENS } from '../../../tokens/tokens.js';
import { setupClearcoatEnvironment, createClearcoatMaterial } from '../../utils/pbrMaterials.js';
import { getPrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function easeOutExpo(t) {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutBackGentle(t) {
  const c1 = 1.35;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// پراکنده شدن اولیه تندیس چهار تکه در فضای عمیق سه‌بعدی برای ورود باابهت
const ENTRANCE_OFFSETS = [
  { x: -340, y: 240, z: 260, rx: 0.95, ry: -1.15, rz: -0.55, delay: 0.0 },
  { x: 310, y: 260, z: -240, rx: -0.85, ry: 1.05, rz: 0.62, delay: 0.08 },
  { x: -290, y: -250, z: 210, rx: 0.78, ry: 0.92, rz: -0.48, delay: 0.16 },
  { x: 360, y: -260, z: 290, rx: -1.05, ry: -0.88, rz: 0.72, delay: 0.24 },
];

// بردار جدایش مغناطیسی قطعات هنگام نزدیک شدن موس به تندیس
const MAGNETIC_SPLIT = [
  { x: -22, y: 20, z: 34, rz: -0.05 },
  { x: 24, y: 18, z: 22, rz: 0.04 },
  { x: -20, y: -22, z: 28, rz: 0.04 },
  { x: 28, y: -26, z: 46, rz: -0.06 },
];

export default function HeroEmblemCanvas({ scrollRef, pointerRef, reducedMotion = false }) {
  const canvasWrapRef = useRef(null);
  const inViewRef = useRef(true);
  const reducedRef = useRef(getPrefersReducedMotion());

  useEffect(() => {
    reducedRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const container = canvasWrapRef.current;
    if (!container) return undefined;

    const obs = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.02 }
    );
    obs.observe(container);

    const width = container.clientWidth || window.innerWidth || 1280;
    const height = container.clientHeight || window.innerHeight || 760;
    const isMobile = window.innerWidth <= 768;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 1, 3500);
    camera.position.set(0, 0, isMobile ? 820 : 690);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.35 : 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'صحنه سه‌بعدی تعاملی نشان برند و نوار سیگنال');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const envRT = setupClearcoatEnvironment(renderer, scene);

    const orangeColor = new THREE.Color(DESIGN_TOKENS.color.signalOrange);
    const porcelainColor = new THREE.Color(DESIGN_TOKENS.color.sand['100']);
    const sandColor = new THREE.Color(DESIGN_TOKENS.color.warmSand);
    const slateColor = new THREE.Color(DESIGN_TOKENS.color.navy['200']);

    // گروه اصلی تندیس لوگو در سمت چپ صحنه (در چیدمان فارسی، مکمل تیتر سمت راست)
    const stageRoot = new THREE.Group();
    scene.add(stageRoot);

    const emblemGroup = new THREE.Group();
    stageRoot.add(emblemGroup);

    // نور درونی گرم که هنگام باز شدن مغناطیسی قطعات از شکاف میان آن‌ها می‌تابد
    const innerCoreLight = new THREE.PointLight(orangeColor, 0, 320, 1.4);
    innerCoreLight.position.set(0, 0, 18);
    emblemGroup.add(innerCoreLight);

    // حلقه موج ضربه ظریف هنگام قفل شدن باابهت قطعات در لحظه ورود
    const ringGeo = new THREE.RingGeometry(66, 68.8, 72);
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
    const partMeshes = [];

    LOGO_PARTS.forEach((part, idx) => {
      const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.21 324.76"><path d="${part.d}"/></svg>`;
      const parsed = loader.parse(svgMarkup);
      const shapes = [];
      parsed.paths.forEach((p) => {
        SVGLoader.createShapes(p).forEach((s) => shapes.push(s));
      });

      const depth = 42;
      const geo = new THREE.ExtrudeGeometry(shapes, {
        depth,
        bevelEnabled: true,
        bevelThickness: 5.5,
        bevelSize: 1.35,
        bevelOffset: 0,
        bevelSegments: isMobile ? 3 : 5,
        curveSegments: isMobile ? 18 : 28,
      });
      geo.translate(-117.105, -162.38, -depth / 2);

      const isPinBlade = idx === 3;
      const mat = createClearcoatMaterial({
        color: isPinBlade ? sandColor.clone() : porcelainColor.clone(),
        roughness: 0.32,
        clearcoat: 0.55,
        clearcoatRoughness: 0.18,
        emissive: orangeColor,
        emissiveIntensity: 0,
      });

      const pivot = new THREE.Group();
      const mesh = new THREE.Mesh(geo, mat);
      mesh.scale.set(1, -1, 1);
      pivot.add(mesh);
      emblemGroup.add(pivot);
      partMeshes.push({
        pivot,
        geo,
        mat,
        enter: ENTRANCE_OFFSETS[idx],
        mag: MAGNETIC_SPLIT[idx],
        idx,
      });
    });

    // ذرات معلق ظریف برای حس عمق فضایی هنگام حرکت موس
    const pCount = isMobile ? 28 : 56;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 1200;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 680;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 420 - 80;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: sandColor,
      size: 3.6,
      transparent: true,
      opacity: 0.35,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // نورپردازی استودیویی روشن و حجم‌دهنده (الهام از gradiant.webp)
    scene.add(new THREE.AmbientLight(porcelainColor, 1.05));
    scene.add(new THREE.HemisphereLight(porcelainColor, slateColor, 0.85));

    const keyLight = new THREE.DirectionalLight(porcelainColor, 2.35);
    keyLight.position.set(-220, 240, 310);
    scene.add(keyLight);

    const cursorLight = new THREE.PointLight(orangeColor, 2.8, 760, 1.35);
    cursorLight.position.set(120, -60, 210);
    scene.add(cursorLight);

    const rimLight = new THREE.DirectionalLight(orangeColor, 1.15);
    rimLight.position.set(260, -190, -140);
    scene.add(rimLight);

    let animId;
    const bootTime = performance.now();
    let smoothPtrX = 0;
    let smoothPtrY = 0;
    let smoothMag = 0;
    let smoothScroll = 0;

    const animate = (now) => {
      animId = requestAnimationFrame(animate);
      if (!inViewRef.current) return;

      const isReduced = reducedRef.current;
      const elapsed = isReduced ? 4.0 : (now - bootTime) * 0.001;

      // ۱. مونتاژ باابهت اولیه در ۲.۱ ثانیه نخست ورود کاربر
      const introDone = clamp(elapsed / 2.15, 0, 1);
      const scrollVal = clamp(scrollRef.current || 0, 0, 1);
      smoothScroll += (scrollVal - smoothScroll) * 0.12;

      const rawPtr = isReduced ? { x: 0, y: 0 } : pointerRef.current;
      smoothPtrX += (rawPtr.x - smoothPtrX) * 0.09;
      smoothPtrY += (rawPtr.y - smoothPtrY) * 0.09;

      // جایگاه افقی تندیس (سمت چپ در دسکتاپ، نیمه بالایی آسمان در موبایل بدون تداخل با متن)
      const baseX = isMobile ? 0 : -190 + smoothScroll * 160;
      const baseY = isMobile ? 128 - smoothScroll * 36 : -18 + smoothScroll * 16;
      emblemGroup.position.set(
        baseX + smoothPtrX * 22,
        baseY - smoothPtrY * 18 + (isReduced ? 0 : Math.sin(elapsed * 1.35) * 4.5),
        smoothScroll * 40
      );

      // فاصله موس تا مرکز تندیس برای افکت شناوری مغناطیسی قطعات
      const emblemNormX = isMobile ? 0 : -0.28 + smoothScroll * 0.24;
      const dx = rawPtr.x - emblemNormX;
      const dy = rawPtr.y - 0.04;
      const dist = Math.hypot(dx, dy);
      const targetMag = !isReduced && introDone > 0.85 && dist < 0.44 ? (1 - dist / 0.44) : 0;
      smoothMag += (targetMag - smoothMag) * 0.1;

      // موج ضربه نارنجی در لحظه قفل شدن قطعات (t ≈ 1.18..1.95s)
      const lockPulse = !isReduced ? Math.sin(clamp((elapsed - 1.18) / 0.72, 0, 1) * Math.PI) : 0;
      shockRing.scale.setScalar(1 + easeOutExpo(clamp((elapsed - 1.18) / 0.78, 0, 1)) * 3.4);
      ringMat.opacity = lockPulse * 0.5;
      innerCoreLight.intensity = smoothMag * 4.5 + lockPulse * 3.2;

      partMeshes.forEach(({ pivot, mat, enter, mag, idx }) => {
        const localT = isReduced ? 1 : clamp((elapsed - enter.delay) / 1.55, 0, 1);
        const k = 1 - easeOutBackGentle(localT);

        // هنگام اسکرول به انتهای هیرو، قطعه چهارم (نوک پین ۱۳۶.۵۴ درجه) به نارنجی زنده تبدیل می‌شود
        const pinIgnite = idx === 3 ? clamp(smoothScroll * 1.6 + smoothMag * 0.65, 0, 1) : smoothMag * 0.35;
        mat.emissiveIntensity = lockPulse * 0.42 + pinIgnite * 0.58;

        pivot.position.set(
          enter.x * k + mag.x * smoothMag,
          enter.y * k + mag.y * smoothMag,
          enter.z * k + mag.z * smoothMag
        );
        pivot.rotation.set(
          enter.rx * k + smoothPtrY * 0.04 * smoothMag,
          enter.ry * k + smoothPtrX * 0.04 * smoothMag,
          enter.rz * k + mag.rz * smoothMag
        );
      });

      // چرخش سه‌بعدی با موس + زاویه گرفتن هنگام اسکرول
      const introTilt = (1 - easeOutExpo(introDone)) * 0.42;
      emblemGroup.rotation.x = introTilt - smoothPtrY * 0.34 + smoothScroll * 0.24;
      emblemGroup.rotation.y = -introTilt + smoothPtrX * 0.42 - smoothScroll * 0.18;
      emblemGroup.rotation.z = smoothPtrX * -0.05;

      const scaleBase = isMobile ? 0.32 : 0.74;
      emblemGroup.scale.setScalar(scaleBase * (1 + lockPulse * 0.05 - smoothScroll * 0.06));

      // نور نقطه‌ای دنبال‌کننده موس روی لبه‌های پخ‌خورده
      cursorLight.position.set(smoothPtrX * 420, -smoothPtrY * 280, 240);

      particles.rotation.y = elapsed * 0.025 + smoothPtrX * 0.12;
      particles.rotation.x = -smoothPtrY * 0.08;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.position.z = window.innerWidth <= 768 ? 820 : 690;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1.35 : 2));
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
      ringGeo.dispose();
      ringMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [pointerRef, scrollRef]);

  return <div ref={canvasWrapRef} className="hero-fullbleed-webgl" />;
}
