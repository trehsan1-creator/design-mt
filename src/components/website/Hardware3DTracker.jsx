import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Cpu, Layers, ShieldCheck, BatteryCharging, Wifi } from 'lucide-react';
import { LOGO_PATH_D } from '../../data/geometryData.js';
import { toFa } from '../../utils/faDigits.js';

const HARDWARE_LAYERS = [
  {
    id: 0,
    title: '۱. پوسته پلیمر ضدضربه کابین (IP68)',
    spec: 'فرم اسکوئیرکل ۳۱.۲۵٪ با پخ ۶۰٪ و زبری ابریشمی ۰.۴۰ + نشان برجسته سه‌بعدی برند',
    icon: ShieldCheck,
  },
  {
    id: 1,
    title: '۲. آنتن سرامیکی چندبانده ماهواره‌ای',
    spec: 'دریافت هم‌زمان GPS + GLONASS + Galileo با خطای کمتر از ۱.۲ متر در تونل و جاده کوهستانی',
    icon: Wifi,
  },
  {
    id: 2,
    title: '۳. برد پردازش تله‌متری و شتاب‌سنج ۶ محوره',
    spec: 'اتصال مستقیم به CAN-Bus خودرو، پایش لحظه‌ای سوخت، دمای سردخانه و تشخیص تصادف یا سرقت',
    icon: Cpu,
  },
  {
    id: 3,
    title: '۴. شاسی آلومینیومی و باتری پشتیبان اضطراری',
    spec: 'ذخیره تا ۷۲ ساعت ارسال موقعیت مخفی حتی در صورت قطع کامل برق سرقتی باتری خودرو',
    icon: BatteryCharging,
  },
];

// Create a rounded squircle-like shape in Three.js with R = 31.25% of size!
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
  const [explode, setExplode] = useState(0.55); // Start slightly exploded so user immediately sees 3D layers!
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
    const height = 470;

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

    // --- LAYER 0 (TOP): Satin Deep Navy Chiseled Squircle Shell + Embossed Brand Logo + Orange LED ---
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
      color: new THREE.Color('#132C40'),
      roughness: 0.38, // Recovered 40% tactile polymer!
      metalness: 0.08,
    });
    topLayer.add(new THREE.Mesh(shellGeo, shellMat));
    disposables.push(shellGeo, shellMat);

    // Embossed 3D Brand Logo on Top of Shell!
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
      color: new THREE.Color('#E8DECD'),
      roughness: 0.32,
      metalness: 0.12,
    });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.scale.set(0.32, -0.32, 0.32);
    logoMesh.rotation.x = -Math.PI / 2;
    logoMesh.position.set(0, 9.5, 0);
    topLayer.add(logoMesh);
    disposables.push(logoGeo, logoMat);

    // Glowing Orange Telemetry LED Capsule Bar on Front Flank
    const ledGeo = new THREE.CapsuleGeometry(2.6, 36, 8, 16);
    ledGeo.rotateZ(Math.PI / 2);
    const ledMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF742E'),
      emissive: new THREE.Color('#FF742E'),
      emissiveIntensity: 2.2,
      roughness: 0.2,
    });
    const ledMesh = new THREE.Mesh(ledGeo, ledMat);
    ledMesh.position.set(0, 2, 91);
    topLayer.add(ledMesh);
    disposables.push(ledGeo, ledMat);
    deviceGroup.add(topLayer);

    // --- LAYER 1: Warm Beige Ceramic Multi-Band GNSS Patch Antenna ---
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
      color: new THREE.Color('#E8DECD'),
      roughness: 0.35,
      metalness: 0.15,
    });
    antLayer.add(new THREE.Mesh(antGeo, antMat));

    const goldPatchGeo = new THREE.BoxGeometry(74, 3, 74);
    const goldPatchMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FF8C4B'),
      roughness: 0.25,
      metalness: 0.65,
    });
    const goldPatch = new THREE.Mesh(goldPatchGeo, goldPatchMat);
    goldPatch.position.set(0, 2, 0);
    antLayer.add(goldPatch);
    disposables.push(antGeo, antMat, goldPatchGeo, goldPatchMat);
    deviceGroup.add(antLayer);

    // --- LAYER 2: Telemetry PCB + MCU Chipset ---
    const pcbLayer = new THREE.Group();
    const pcbShape = createSquircleShape(156, 0.28);
    const pcbGeo = new THREE.ExtrudeGeometry(pcbShape, { depth: 5, bevelEnabled: false });
    pcbGeo.rotateX(Math.PI / 2);
    const pcbMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0E3B33'),
      roughness: 0.42,
      metalness: 0.25,
    });
    pcbLayer.add(new THREE.Mesh(pcbGeo, pcbMat));

    const chipGeo = new THREE.BoxGeometry(42, 6, 42);
    const chipMat = new THREE.MeshStandardMaterial({ color: 0x111922, roughness: 0.3, metalness: 0.4 });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(-18, 3, 10);
    pcbLayer.add(chip);

    const simGeo = new THREE.BoxGeometry(28, 4.5, 22);
    const simMat = new THREE.MeshStandardMaterial({ color: 0xff742e, roughness: 0.35, metalness: 0.3 });
    const sim = new THREE.Mesh(simGeo, simMat);
    sim.position.set(30, 2.5, -16);
    pcbLayer.add(sim);
    disposables.push(pcbGeo, pcbMat, chipGeo, chipMat, simGeo, simMat);
    deviceGroup.add(pcbLayer);

    // --- LAYER 3 (BOTTOM): Chiseled Anodized Base & Li-Po Industrial Backup Cell ---
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
      color: new THREE.Color('#273E50'),
      roughness: 0.36,
      metalness: 0.35,
    });
    baseLayer.add(new THREE.Mesh(baseGeo, baseMat));
    disposables.push(baseGeo, baseMat);
    deviceGroup.add(baseLayer);

    // Lighting
    scene.add(new THREE.AmbientLight(0xdbe8f4, 0.9));
    const sun = new THREE.DirectionalLight(0xfff7ee, 2.3);
    sun.position.set(-180, 260, 210);
    scene.add(sun);

    const orangeGlow = new THREE.PointLight(0xff742e, 1.8, 460);
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
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      obs.disconnect();
      window.removeEventListener('resize', onResize);
      controls.dispose();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <section id="hardware-3d" className="dark-section" style={{ paddingTop: 40 }}>
      <div className="site-container">
        <div className="hardware-grid">
          {/* Right/Main 3D Interactive Hardware Stage */}
          <div className="cad-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
              <span className="kaf-slash-tag">کالبدشکافی سه‌بعدی سخت‌افزار ردیاب صنعتی برند</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className={`chip-btn ${explode > 0.5 ? 'on' : ''}`}
                  onClick={() => setExplode(explode > 0.5 ? 0 : 1)}
                >
                  <Layers size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
                  {explode > 0.5 ? 'بستن و قفل بدنه' : 'نمای انفجاری ۴ لایه'}
                </button>
              </div>
            </div>

            <div
              ref={mountRef}
              style={{
                width: '100%',
                height: 470,
                borderRadius: 24,
                background: 'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)',
                cursor: 'grab',
                position: 'relative',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 14 }}>
              <span style={{ fontSize: 12.5, color: 'rgba(232,222,205,0.78)', whiteSpace: 'nowrap' }}>
                اسلایدر انفجار لایه‌ها:
              </span>
              <input
                type="range"
                className="cinema-range"
                min="0"
                max="100"
                value={Math.round(explode * 100)}
                onChange={(e) => setExplode(Number(e.target.value) / 100)}
              />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: '#FF742E', minWidth: 42 }}>
                {toFa(Math.round(explode * 100))}٪
              </span>
            </div>
          </div>

          {/* Left: Engineering Story & 4 Clickable Layers */}
          <div>
            <div className="eyebrow-kaf">
              <Cpu size={15} />
              <span>مهندسی سخت‌افزار بر پایه اسکوئیرکل ۳۱.۲۵٪ و پخ ۶۰٪</span>
            </div>

            <h2 style={{ fontSize: 'clamp(26px, 2.9vw, 38px)', fontWeight: 900, lineHeight: 1.3, marginBottom: 14 }}>
              سخت‌افزاری که مثل ساعت سوئیسی چفت می‌شود
            </h2>

            <p style={{ fontSize: 15, color: 'rgba(232,222,205,0.78)', lineHeight: 1.85, marginBottom: 22 }}>
              بدنه ردیاب دقیقاً از هندسه استخراج‌شده فایل‌های سه‌بعدی شما (پلیمر مات-ابریشمی با زبری ۴۰٪ و لبه‌های پخ‌خورده) طراحی شده است. دستگاه را با ماوس ۳۶۰ درجه بچرخانید و هر لایه را بررسی کنید:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {HARDWARE_LAYERS.map((ly, i) => {
                const Icon = ly.icon;
                const sel = activeLayer === i;
                return (
                  <div
                    key={ly.id}
                    onClick={() => {
                      setActiveLayer(i);
                      if (explode < 0.4) setExplode(0.85);
                    }}
                    style={{
                      padding: '15px 18px',
                      borderRadius: 20,
                      cursor: 'pointer',
                      background: sel ? 'rgba(255, 116, 46, 0.14)' : 'rgba(14, 30, 44, 0.72)',
                      border: sel ? '1px solid #FF742E' : '1px solid rgba(232, 222, 205, 0.12)',
                      display: 'flex',
                      gap: 14,
                      alignItems: 'flex-start',
                      transition: 'all 0.22s ease',
                    }}
                  >
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '31.25%',
                        background: sel ? '#FF742E' : 'rgba(232,222,205,0.1)',
                        color: sel ? '#102333' : '#FF9861',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 3 }}>{ly.title}</div>
                      <div style={{ fontSize: 13, color: 'rgba(232,222,205,0.74)', lineHeight: 1.65 }}>{ly.spec}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
