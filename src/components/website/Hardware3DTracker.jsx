import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Cpu, Layers, ShieldCheck, BatteryCharging, Wifi } from 'lucide-react';
import { LOGO_PATH_D } from '../../data/geometryData.js';
import { DESIGN_TOKENS } from '../../../tokens/tokens.js';
import { Button, Card, Capsule } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';

const HARDWARE_LAYERS = [
  {
    id: 0,
    title: '۱. پوسته پلیمر ضدضربه کابین (IP68)',
    spec: 'فرم چهارگوش‌نرم ۳۱.۲۵٪ با پخ ۶۰٪ و زبری ابریشمی ۰.۴۰ به همراه نشان برجسته برند',
    icon: ShieldCheck,
  },
  {
    id: 1,
    title: '۲. آنتن سرامیکی چندبانده ماهواره‌ای',
    spec: 'دریافت هم‌زمان GPS + GLONASS + Galileo با خطای کمتر از ۱.۲ متر در مسیرهای کوهستانی',
    icon: Wifi,
  },
  {
    id: 2,
    title: '۳. برد پردازش تله‌متری و شتاب‌سنج ۶ محوره',
    spec: 'اتصال مستقیم به CAN-Bus خودرو، پایش لحظه‌ای سوخت، دمای سردخانه و تشخیص ضربه',
    icon: Cpu,
  },
  {
    id: 3,
    title: '۴. شاسی آلومینیومی و باتری پشتیبان اضطراری',
    spec: 'ذخیره تا ۷۲ ساعت ارسال موقعیت در صورت قطع برق باتری اصلی خودرو',
    icon: BatteryCharging,
  },
];

function createSquircleShape(size, radiusRatio = 0.3125) {
  const s = new THREE.Shape();
  const half = size / 2;
  const r = size * radiusRatio;
  s.moveTo(-half + r, -half);
  s.lineTo(half - r, -half);
  s.quadraticCurveTo(half, -half, half, -half + r);
  s.lineTo(half, half - r);
  s.quadraticCurveTo(half, half, half - r, half);
  s.lineTo(-half + r, half);
  s.quadraticCurveTo(-half, half, -half, half - r);
  s.lineTo(-half, -half + r);
  s.quadraticCurveTo(-half, -half, -half + r, -half);
  return s;
}

export default function Hardware3DTracker() {
  const mountRef = useRef(null);
  const [explode, setExplode] = useState(0.55);
  const [activeLayer, setActiveLayer] = useState(0);
  const explodeRef = useRef(0.55);
  const inViewRef = useRef(true);

  useEffect(() => {
    explodeRef.current = explode;
  }, [explode]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    obs.observe(container);

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 460;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, width / height, 1, 2500);
    camera.position.set(270, 215, 360);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.25;
    controls.minDistance = 260;
    controls.maxDistance = 680;

    const deviceGroup = new THREE.Group();
    scene.add(deviceGroup);

    const disposables = [];
    const cOrange = new THREE.Color(DESIGN_TOKENS.color.signalOrange);
    const cSand = new THREE.Color(DESIGN_TOKENS.color.warmSand);

    const topLayer = new THREE.Group();
    const shellShape = createSquircleShape(176, 0.3125);
    const shellGeo = new THREE.ExtrudeGeometry(shellShape, {
      depth: 18,
      bevelEnabled: true,
      bevelThickness: 7,
      bevelSize: 6,
      bevelSegments: 8,
      curveSegments: 32,
    });
    shellGeo.rotateX(Math.PI / 2);
    const shellMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(DESIGN_TOKENS.color.navy['400']),
      roughness: DESIGN_TOKENS.material3d.pbr.roughness,
      metalness: DESIGN_TOKENS.material3d.pbr.metalness,
    });
    topLayer.add(new THREE.Mesh(shellGeo, shellMat));
    disposables.push(shellGeo, shellMat);

    const loader = new SVGLoader();
    const parsedLogo = loader.parse(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 234.21 324.76"><path d="${LOGO_PATH_D}"/></svg>`
    );
    const logoShapes = [];
    parsedLogo.paths.forEach((p) => {
      SVGLoader.createShapes(p).forEach((s) => logoShapes.push(s));
    });
    const logoGeo = new THREE.ExtrudeGeometry(logoShapes, {
      depth: 7,
      bevelEnabled: true,
      bevelThickness: 2.2,
      bevelSize: 1.8,
      bevelSegments: 3,
      curveSegments: 24,
    });
    logoGeo.center();
    const logoMat = new THREE.MeshStandardMaterial({
      color: cSand,
      roughness: 0.32,
      metalness: 0.12,
    });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.scale.set(0.32, -0.32, 0.32);
    logoMesh.rotation.x = -Math.PI / 2;
    logoMesh.position.set(0, 9.5, 0);
    topLayer.add(logoMesh);
    disposables.push(logoGeo, logoMat);

    const ledGeo = new THREE.CapsuleGeometry(2.6, 36, 8, 16);
    ledGeo.rotateZ(Math.PI / 2);
    const ledMat = new THREE.MeshStandardMaterial({
      color: cOrange,
      emissive: cOrange,
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0, 2, 91);
    topLayer.add(ledMesh);
    disposables.push(ledGeo, ledMat);
    deviceGroup.add(topLayer);

    const antLayer = new THREE.Group();
    const antShape = createSquircleShape(132, 0.26);
    const antGeo = new THREE.ExtrudeGeometry(antShape, {
      depth: 10,
      bevelEnabled: true,
      bevelThickness: 2,
      bevelSize: 2,
      bevelSegments: 2,
    });
    antGeo.rotateX(Math.PI / 2);
    const antMat = new THREE.MeshStandardMaterial({
      color: cSand,
      roughness: 0.35,
      metalness: 0.15,
    });
    antLayer.add(new THREE.Mesh(antGeo, antMat));

    const goldPatchGeo = new THREE.BoxGeometry(74, 3, 74);
    const goldPatchMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(DESIGN_TOKENS.color.orange['400']),
      roughness: 0.25,
      metalness: 0.65,
    });
    const goldPatch = new THREE.Mesh(goldPatchGeo, goldPatchMat);
    goldPatch.position.set(0, 2, 0);
    antLayer.add(goldPatch);
    disposables.push(antGeo, antMat, goldPatchGeo, goldPatchMat);
    deviceGroup.add(antLayer);

    const pcbLayer = new THREE.Group();
    const pcbShape = createSquircleShape(156, 0.28);
    const pcbGeo = new THREE.ExtrudeGeometry(pcbShape, { depth: 5, bevelEnabled: false });
    pcbGeo.rotateX(Math.PI / 2);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(DESIGN_TOKENS.color.neutral.pcb),
      roughness: 0.42,
      metalness: 0.25,
    });
    pcbLayer.add(new THREE.Mesh(pcbGeo, pcbMat));

    const chipGeo = new THREE.BoxGeometry(42, 6, 42);
    const chipMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(DESIGN_TOKENS.color.navy['900']),
      roughness: 0.3,
      metalness: 0.4,
    });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(-18, 3, 10);
    pcbLayer.add(chip);

    const simGeo = new THREE.BoxGeometry(28, 4.5, 22);
    const simMat = new THREE.MeshStandardMaterial({ color: cOrange, roughness: 0.35, metalness: 0.3 });
    const sim = new THREE.Mesh(simGeo, simMat);
    sim.position.set(30, 2.5, -16);
    pcbLayer.add(sim);
    disposables.push(pcbGeo, pcbMat, chipGeo, chipMat, simGeo, simMat);
    deviceGroup.add(pcbLayer);

    const baseLayer = new THREE.Group();
    const baseShape = createSquircleShape(174, 0.3125);
    const baseGeo = new THREE.ExtrudeGeometry(baseShape, {
      depth: 14,
      bevelEnabled: true,
      bevelThickness: 4,
      bevelSize: 4,
      bevelSegments: 4,
    });
    baseGeo.rotateX(Math.PI / 2);
    const baseMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(DESIGN_TOKENS.color.navy['200']),
      roughness: 0.36,
      metalness: 0.35,
    });
    baseLayer.add(new THREE.Mesh(baseGeo, baseMat));
    disposables.push(baseGeo, baseMat);
    deviceGroup.add(baseLayer);

    scene.add(new THREE.AmbientLight(new THREE.Color(DESIGN_TOKENS.color.sand['50']), 0.9));
    const sun = new THREE.DirectionalLight(new THREE.Color(DESIGN_TOKENS.color.sand['50']), 2.3);
    sun.position.set(-180, 260, 210);
    scene.add(sun);

    const orangeGlow = new THREE.PointLight(cOrange, 1.8, 460);
    orangeGlow.position.set(110, 40, 170);
    scene.add(orangeGlow);

    const layers = [
      { grp: topLayer, closedY: 22, openY: 88 },
      { grp: antLayer, closedY: 6, openY: 32 },
      { grp: pcbLayer, closedY: -6, openY: -24 },
      { grp: baseLayer, closedY: -20, openY: -82 },
    ];

    let rafId;
    const t0 = performance.now();

    const animate = (now) => {
      rafId = requestAnimationFrame(animate);
      if (!inViewRef.current) return;

      const t = (now - t0) * 0.001;
      const ex = explodeRef.current;

      layers.forEach((ly) => {
        const targetY = ly.closedY + (ly.openY - ly.closedY) * ex;
        ly.grp.position.y += (targetY - ly.grp.position.y) * 0.12;
      });

      deviceGroup.position.y = Math.sin(t * 1.8) * 4;
      ledMat.emissiveIntensity = 1.6 + Math.sin(t * 4.2) * 0.8;

      controls.update();
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(animate);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 460;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    return () => {
      cancelAnimationFrame(rafId);
      obs.disconnect();
      ro.disconnect();
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <section id="hardware-3d" className="fleet-section">
      <div className="site-container">
        <div className="section-grid">
          <Card variant="panel" className="ds-stack-md">
            <div className="ds-between-wrap">
              <Capsule variant="slash">کالبدشکافی سه‌بعدی سخت‌افزار ردیاب صنعتی</Capsule>
              <Button
                variant="pill"
                size="sm"
                active={explode > 0.5}
                onClick={() => setExplode(explode > 0.5 ? 0 : 1)}
              >
                <Layers size={14} aria-hidden="true" />
                <span>{explode > 0.5 ? 'بستن و قفل بدنه' : 'نمای انفجاری ۴ لایه'}</span>
              </Button>
            </div>

            <div className="webgl-stage-shell">
              <div
                ref={mountRef}
                className="webgl-canvas-mount webgl-canvas-mount--tracker"
                role="img"
                aria-label="مدل سه‌بعدی تعاملی چهار لایه ردیاب سخت‌افزاری ناوگان"
              />
            </div>

            <div className="ds-row-md">
              <label htmlFor="hardware-explode-range" className="ds-muted">
                فاصله لایه‌ها:
              </label>
              <input
                id="hardware-explode-range"
                type="range"
                className="cinema-range"
                min="0"
                max="100"
                value={Math.round(explode * 100)}
                onChange={(e) => setExplode(Number(e.target.value) / 100)}
              />
              <strong className="ds-accent-text ds-tabular">
                {toFa(Math.round(explode * 100))}٪
              </strong>
            </div>
          </Card>

          <div className="ds-stack-md">
            <div>
              <Capsule variant="eyebrow">
                <Cpu size={15} aria-hidden="true" />
                <span>مهندسی سخت‌افزار بر پایه چهارگوش‌نرم ۳۱.۲۵٪ و پخ ۶۰٪</span>
              </Capsule>
            </div>

            <h2 className="section-title-xl">
              سخت‌افزار صنعتی منطبق بر استاندارد کابین خودروهای سنگین
            </h2>

            <p className="section-subtitle">
              بدنه ردیاب بر اساس پارامترهای استخراج‌شده از فایل‌های سه‌بعدی مرجع (پلیمر مات-ابریشمی با زبری ۴۰٪ و لبه‌های پخ‌خورده) شبیه‌سازی شده است. مدل را با ماوس بچرخانید و هر لایه را بررسی کنید:
            </p>

            <div className="ds-stack-sm">
              {HARDWARE_LAYERS.map((ly, i) => {
                const Icon = ly.icon;
                const sel = activeLayer === i;
                return (
                  <Card
                    key={ly.id}
                    as="button"
                    type="button"
                    variant="panel"
                    compact
                    interactive
                    accentOutline={sel}
                    className="hardware-spec-card"
                    onClick={() => {
                      setActiveLayer(i);
                      if (explode < 0.4) setExplode(0.85);
                    }}
                  >
                    <div className="hardware-spec-icon">
                      <Icon size={18} aria-hidden="true" />
                    </div>
                    <div className="ds-stack-xs">
                      <strong>{ly.title}</strong>
                      <span className="ds-muted">{ly.spec}</span>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
