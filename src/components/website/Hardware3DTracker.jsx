import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Cpu, Layers, ShieldCheck, BatteryCharging, Wifi } from 'lucide-react';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';
import { Button, Card, Capsule } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';

const HardwareTrackerCanvas = lazy(() => import('./HardwareTrackerCanvas.jsx'));

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

export default function Hardware3DTracker() {
  const stageShellRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const [explode, setExplode] = useState(0.55);
  const [activeLayer, setActiveLayer] = useState(0);
  const [shouldMountCanvas, setShouldMountCanvas] = useState(false);
  const explodeRef = useRef(0.55);

  useEffect(() => {
    explodeRef.current = explode;
  }, [explode]);

  useEffect(() => {
    const el = stageShellRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMountCanvas(true);
          obs.disconnect();
        }
      },
      { rootMargin: '260px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
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

            <div ref={stageShellRef} className="webgl-stage-shell">
              {shouldMountCanvas ? (
                <Suspense fallback={<div className="webgl-canvas-mount webgl-canvas-mount--tracker" />}>
                  <HardwareTrackerCanvas explodeRef={explodeRef} reducedMotion={reducedMotion} />
                </Suspense>
              ) : (
                <div className="webgl-canvas-mount webgl-canvas-mount--tracker" />
              )}
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
