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
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutBack(t) {
  const c1 = 1.85;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export default function HeroEmblemCanvas({ progressRef, pointerRef, isPlaying = false, reducedMotion = false }) {
  const canvasWrapRef = useRef(null);
  const inViewRef = useRef(true);
  const playingRef = useRef(isPlaying);
  const reducedRef = useRef(getPrefersReducedMotion());

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

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
      { threshold: 0.05 }
    );
    obs.observe(container);

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 500;
    const isMobile = window.innerWidth <= 768;
    const maxDpr = isMobile ? 1.25 : 2;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 1, 3000);
    camera.position.set(0, 0, 680);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.14;
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', 'صحنه سه‌بعدی مونتاژ نشان برند و مسیر ناوگان');
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const envRT = setupClearcoatEnvironment(renderer, scene);

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
        bevelSegments: isMobile ? 2 : 4,
        curveSegments: isMobile ? 16 : 28,
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

    const pCount = 48;
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
      opacity: 0.34,
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
    let lastP = -1;
    let lastPtrX = 999;
    let lastPtrY = 999;
    let settleFrames = 2;

    const renderSceneAt = (now) => {
      const elapsed = reducedRef.current || !playingRef.current ? 0 : (now - t0) * 0.001;
      const p = clamp(progressRef.current, 0, 1);
      const ptr = reducedRef.current ? { x: 0, y: 0 } : pointerRef.current;

      partMeshes.forEach(({ pivot, mat, cfg, idx }) => {
        const q = clamp((p - cfg.delay) / 0.24);
        const k = 1 - easeOutBack(q);
        const floatY = playingRef.current ? Math.sin(elapsed * 2.1 + idx * 1.4) * 7 * clamp(1 - q * 1.4) : 0;
        const floatX = playingRef.current ? Math.cos(elapsed * 1.7 + idx * 1.1) * 5 * clamp(1 - q * 1.4) : 0;

        pivot.position.set(cfg.x * k + floatX, cfg.y * k + floatY, cfg.z * k);
        pivot.rotation.set(cfg.rx * k, cfg.ry * k, cfg.rz * k);

        const impact = Math.sin(clamp((p - 0.36) / 0.14) * Math.PI);
        mat.emissiveIntensity = impact * 0.32;
      });

      const orientEase = easeInOutCubic(clamp(p / 0.42));
      const targetRotX = 0.38 * (1 - orientEase) - ptr.y * 0.22;
      const targetRotY = -0.48 * (1 - orientEase) + ptr.x * 0.28;
      partsGroup.rotation.x += (targetRotX - partsGroup.rotation.x) * 0.35;
      partsGroup.rotation.y += (targetRotY - partsGroup.rotation.y) * 0.35;

      const lockBounce = Math.sin(clamp((p - 0.37) / 0.12) * Math.PI);
      const glide = easeInOutCubic(clamp((p - 0.46) / 0.18));
      const baseScale = (0.76 - 0.24 * glide) * (1 + 0.09 * lockBounce);
      partsGroup.scale.setScalar(baseScale);
      partsGroup.position.x = 205 * glide;
      partsGroup.position.y = 8 + (playingRef.current ? 6 * Math.sin(elapsed * 1.6) * glide : 0);

      const sw = clamp((p - 0.3) / 0.26);
      sweepLight.position.set(-240 + 520 * sw + 205 * glide, 180 - 320 * sw, 150);
      sweepLight.intensity = sw > 0 && sw < 1 ? Math.sin(sw * Math.PI) * 10 : 0;

      gridHelper.position.z = -140 + ((elapsed * 28) % 42);
      particles.rotation.y = elapsed * 0.03 + ptr.x * 0.08;

      renderer.render(scene, camera);
    };

    const animate = (now) => {
      animId = requestAnimationFrame(animate);
      if (!inViewRef.current) return;

      const p = progressRef.current;
      const ptr = pointerRef.current;
      const changed =
        playingRef.current ||
        settleFrames > 0 ||
        Math.abs(p - lastP) > 0.0005 ||
        Math.abs(ptr.x - lastPtrX) > 0.002 ||
        Math.abs(ptr.y - lastPtrY) > 0.002;

      if (!changed) return;

      if (settleFrames > 0) settleFrames -= 1;
      lastP = p;
      lastPtrX = ptr.x;
      lastPtrY = ptr.y;
      renderSceneAt(now);
    };
    animId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1.25 : 2));
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
      gridHelper.geometry.dispose();
      gridHelper.material.dispose();
      pGeo.dispose();
      pMat.dispose();
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, [pointerRef, progressRef]);

  return (
    <div
      ref={canvasWrapRef}
      className="hero-webgl-layer"
      role="img"
      aria-label="صحنه سه‌بعدی مونتاژ نشان برند و مسیر ناوگان"
    />
  );
}
