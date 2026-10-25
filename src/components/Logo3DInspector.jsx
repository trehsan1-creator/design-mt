import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LOGO_PATH_D } from '../data/geometryData.js';
import { DESIGN_TOKENS } from '../../tokens/tokens.js';
import {
  setupClearcoatEnvironment,
  createClearcoatMaterial,
  createInflateCushionMaps,
} from '../utils/pbrMaterials.js';
import { usePrefersReducedMotion, getPrefersReducedMotion } from '../utils/usePrefersReducedMotion.js';

export default function Logo3DInspector({ mode = 'inflate', showWireframe = false, showLightRig = true }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (stateRef.current.controls) {
      stateRef.current.controls.autoRotate = !reducedMotion;
    }
  }, [reducedMotion]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = container.clientHeight || 360;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 1, 2500);
    camera.position.set(0, 0, 620);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth <= 768 ? 1.5 : 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const envRT = setupClearcoatEnvironment(renderer, scene);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 320;
    controls.maxDistance = 1050;
    controls.autoRotate = !getPrefersReducedMotion();
    controls.autoRotateSpeed = 1.1;

    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.21 324.76"><path d="${LOGO_PATH_D}"/></svg>`;
    const loader = new SVGLoader();
    const svgData = loader.parse(svgMarkup);
    const shapes = [];
    svgData.paths.forEach((p) => {
      SVGLoader.createShapes(p).forEach((s) => shapes.push(s));
    });

    // Mode A (Cushion / Inflate 76%): Signed-distance blurred heightmap dome + normal/bump map
    const cushionMaps = createInflateCushionMaps(LOGO_PATH_D);
    const geoInflate = new THREE.ExtrudeGeometry(shapes, {
      depth: 8,
      bevelEnabled: true,
      bevelThickness: 18,
      bevelSize: 11,
      bevelOffset: -3,
      bevelSegments: 18,
      curveSegments: 42,
    });
    geoInflate.center();
    cushionMaps.applyDomeToGeometry(geoInflate, 20);

    // Mode B (Chisel / Bevel 60%): Crisp 1-segment bevel
    const geoChisel = new THREE.ExtrudeGeometry(shapes, {
      depth: 38,
      bevelEnabled: true,
      bevelThickness: 15,
      bevelSize: 13.8,
      bevelOffset: -4,
      bevelSegments: 1,
      curveSegments: 40,
    });
    geoChisel.center();

    const cOrange = new THREE.Color(DESIGN_TOKENS.color.signalOrange);
    const matMesh = createClearcoatMaterial({
      color: new THREE.Color(DESIGN_TOKENS.color.navy['400']),
      normalMap: cushionMaps.normalMap,
      normalScale: new THREE.Vector2(0.85, 0.85),
      bumpMap: cushionMaps.bumpMap,
      bumpScale: 3.5,
    });

    const mesh = new THREE.Mesh(geoInflate, matMesh);
    mesh.scale.set(1, -1, 1);
    scene.add(mesh);

    const wireMat = new THREE.MeshBasicMaterial({
      color: cOrange,
      wireframe: true,
      transparent: true,
      opacity: 0.34,
    });
    const wireMesh = new THREE.Mesh(geoInflate, wireMat);
    wireMesh.scale.set(1.003, -1.003, 1.003);
    scene.add(wireMesh);

    const ambient = new THREE.AmbientLight(
      new THREE.Color(DESIGN_TOKENS.color.sand['50']),
      DESIGN_TOKENS.material3d.pbr.ambientIntensity + 0.25
    );
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(
      new THREE.Color(DESIGN_TOKENS.color.navy['25']),
      new THREE.Color(DESIGN_TOKENS.color.navy['900']),
      0.55
    );
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(new THREE.Color(DESIGN_TOKENS.color.neutral.white), 2.2);
    scene.add(sun);

    const rim = new THREE.DirectionalLight(cOrange, 0.3);
    rim.position.set(180, -190, -140);
    scene.add(rim);

    const rigGroup = new THREE.Group();
    const arrowMat = new THREE.LineBasicMaterial({ color: cOrange });
    const arrowGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
    ]);
    const arrowLine = new THREE.Line(arrowGeo, arrowMat);
    const sunDotGeo = new THREE.SphereGeometry(7, 20, 20);
    const sunDotMat = new THREE.MeshBasicMaterial({ color: cOrange });
    const sunDot = new THREE.Mesh(sunDotGeo, sunDotMat);
    rigGroup.add(arrowLine);
    rigGroup.add(sunDot);
    scene.add(rigGroup);

    stateRef.current = {
      mesh,
      wireMesh,
      geoInflate,
      geoChisel,
      matMesh,
      cushionMaps,
      sun,
      ambient,
      rigGroup,
      arrowGeo,
      sunDot,
      controls,
    };

    let rafId;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 360;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      controls.dispose();
      geoInflate.dispose();
      geoChisel.dispose();
      matMesh.dispose();
      cushionMaps.normalMap.dispose();
      cushionMaps.bumpMap.dispose();
      wireMat.dispose();
      arrowGeo.dispose();
      arrowMat.dispose();
      sunDotGeo.dispose();
      sunDotMat.dispose();
      envRT.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    };
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    if (!s.mesh) return;

    const isInflate = mode === 'inflate';
    const rotDeg = isInflate
      ? DESIGN_TOKENS.material3d.modeACushion.azimuthDeg
      : DESIGN_TOKENS.material3d.modeBChisel.azimuthDeg;
    const elevDeg = isInflate
      ? DESIGN_TOKENS.material3d.modeACushion.elevationDeg
      : DESIGN_TOKENS.material3d.modeBChisel.elevationDeg;

    const azRad = (rotDeg * Math.PI) / 180;
    const elRad = (elevDeg * Math.PI) / 180;
    const dist = 210;
    const lx = Math.cos(elRad) * Math.cos(azRad) * dist;
    const ly = -Math.cos(elRad) * Math.sin(azRad) * dist;
    const lz = Math.sin(elRad) * dist;

    s.sun.position.set(lx, ly, lz);
    s.sun.intensity = isInflate ? 2.45 : 1.75;
    s.ambient.intensity = isInflate ? 0.72 : 0.88;

    s.mesh.geometry = isInflate ? s.geoInflate : s.geoChisel;
    s.wireMesh.geometry = isInflate ? s.geoInflate : s.geoChisel;
    s.matMesh.color.set(
      isInflate ? DESIGN_TOKENS.color.navy['400'] : DESIGN_TOKENS.color.sand['200']
    );
    s.matMesh.normalMap = isInflate ? s.cushionMaps.normalMap : null;
    s.matMesh.bumpMap = isInflate ? s.cushionMaps.bumpMap : null;
    s.matMesh.roughness = DESIGN_TOKENS.material3d.pbr.roughness;
    s.matMesh.needsUpdate = true;

    s.wireMesh.visible = showWireframe;
    s.rigGroup.visible = showLightRig;
    s.sunDot.position.set(lx, ly, lz);
    s.arrowGeo.setFromPoints([new THREE.Vector3(0, 0, 20), new THREE.Vector3(lx, ly, lz)]);
  }, [mode, showWireframe, showLightRig]);

  return (
    <div className="webgl-stage-shell">
      <div
        ref={mountRef}
        className="lab-3d-canvas"
        role="img"
        aria-label="بازرس سه‌بعدی هندسه نشان برند در دو حالت بالشتکی و پخ‌خورده"
      />
      <div className="webgl-hud-bottom ds-between-wrap">
        <span className="ds-muted">چرخش ۳۶۰ درجه با ماوس · بزرگ‌نمایی با اسکرول</span>
        <span className="ltr-code ds-accent-soft-text">
          {mode === 'inflate'
            ? 'Inflate 76% (Heightmap Dome + Clearcoat) · El 71°'
            : 'Extrude 175.5pt · Bevel 60% · Clearcoat 0.35 · El 43.08°'}
        </span>
      </div>
    </div>
  );
}
