import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { LOGO_PATH_D } from '../data/geometryData.js';

export default function Logo3DInspector({ mode = 'inflate', showWireframe = false, showLightRig = true }) {
  const mountRef = useRef(null);
  const stateRef = useRef({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 520;
    const height = 390;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, width / height, 1, 2500);
    camera.position.set(0, 0, 620);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.minDistance = 320;
    controls.maxDistance = 1050;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.1;

    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.21 324.76"><path d="${LOGO_PATH_D}"/></svg>`;
    const loader = new SVGLoader();
    const svgData = loader.parse(svgMarkup);
    const shapes = [];
    svgData.paths.forEach((p) => {
      SVGLoader.createShapes(p).forEach((s) => shapes.push(s));
    });

    const geoInflate = new THREE.ExtrudeGeometry(shapes, {
      depth: 6,
      bevelEnabled: true,
      bevelThickness: 26,
      bevelSize: 13.5,
      bevelOffset: -4,
      bevelSegments: 20,
      curveSegments: 40,
    });
    geoInflate.center();

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

    const matMesh = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#132B3E'),
      roughness: 0.4,
      metalness: 0.04,
    });

    const mesh = new THREE.Mesh(geoInflate, matMesh);
    mesh.scale.set(1, -1, 1);
    scene.add(mesh);

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xff742e,
      wireframe: true,
      transparent: true,
      opacity: 0.34,
    });
    const wireMesh = new THREE.Mesh(geoInflate, wireMat);
    wireMesh.scale.set(1.003, -1.003, 1.003);
    scene.add(wireMesh);

    const ambient = new THREE.AmbientLight(0xd8e4ee, 0.85);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x6e8fa6, 0x09131c, 0.55);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0xff742e, 0.3);
    rim.position.set(180, -190, -140);
    scene.add(rim);

    const rigGroup = new THREE.Group();
    const arrowMat = new THREE.LineBasicMaterial({ color: 0xff742e });
    const arrowGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, 1),
    ]);
    const arrowLine = new THREE.Line(arrowGeo, arrowMat);
    const sunDot = new THREE.Mesh(
      new THREE.SphereGeometry(7, 20, 20),
      new THREE.MeshBasicMaterial({ color: 0xff742e })
    );
    rigGroup.add(arrowLine);
    rigGroup.add(sunDot);
    scene.add(rigGroup);

    stateRef.current = {
      mesh,
      wireMesh,
      geoInflate,
      geoChisel,
      matMesh,
      sun,
      ambient,
      rigGroup,
      arrowGeo,
      sunDot,
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
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      geoInflate.dispose();
      geoChisel.dispose();
      matMesh.dispose();
      wireMat.dispose();
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const s = stateRef.current;
    if (!s.mesh) return;

    const isInflate = mode === 'inflate';
    const rotDeg = isInflate ? -124.7 : -149.74;
    const elevDeg = isInflate ? 71.0 : 43.08;

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
    s.matMesh.color.set(isInflate ? '#153046' : '#ECEAE4');
    s.matMesh.roughness = 0.4;
    s.matMesh.needsUpdate = true;

    s.wireMesh.visible = showWireframe;
    s.rigGroup.visible = showLightRig;
    s.sunDot.position.set(lx, ly, lz);
    s.arrowGeo.setFromPoints([new THREE.Vector3(0, 0, 20), new THREE.Vector3(lx, ly, lz)]);
  }, [mode, showWireframe, showLightRig]);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: 390,
          borderRadius: 18,
          background:
            mode === 'chisel'
              ? 'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)'
              : 'radial-gradient(circle at 30% 25%, #1A354B 0%, #0A1520 80%)',
          cursor: 'grab',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 16,
          right: 16,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'rgba(232,222,205,0.82)',
          pointerEvents: 'none',
        }}
      >
        <span>با ماوس حجم سه‌بعدی را بچرخانید · بزرگ‌نمایی با اسکرول</span>
        <span className="ltr-code" style={{ color: '#FFB085' }}>
          {mode === 'inflate'
            ? 'Inflate 76% · El 71° · Az -124.7°'
            : 'Extrude 175.5pt · Bevel 60% · El 43.1°'}
        </span>
      </div>
    </div>
  );
}
