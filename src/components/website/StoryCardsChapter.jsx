import React, { useRef, useState } from 'react';
import { Gauge, IranPlate, MapPin, StatusChip } from '../../ds';
import { LOGO_PARTS } from '../../data/geometryData.js';
import { toFa } from '../../utils/faDigits.js';
import LogoAnatomyBadge from './LogoAnatomyBadge.jsx';
import PaintedCard from './PaintedCard.jsx';

const FLEET_PLATES = [
  {
    digitsLeft: '۴۸',
    letter: 'ع',
    digitsRight: '۷۲۹',
    iranCode: '۱۱',
    route: 'تهران — بندرعباس',
    speed: '۸۴',
    weight: '۲۲.۴ تن · ثبت خودکار باسکول',
  },
  {
    digitsLeft: '۶۲',
    letter: 'د',
    digitsRight: '۳۱۵',
    iranCode: '۲۱',
    route: 'تبریز — قزوین',
    speed: '۷۹',
    weight: '۱۸.۶ تن · خروج از انبار مرکزی',
  },
  {
    digitsLeft: '۱۹',
    letter: 'ط',
    digitsRight: '۸۴۶',
    iranCode: '۵۳',
    route: 'اصفهان — شیراز',
    speed: '۹۱',
    weight: '۲۴.۱ تن · تحویل بدون توقف',
  },
];

export default function StoryCardsChapter() {
  const [plateIdx, setPlateIdx] = useState(0);
  const [plateLocked, setPlateLocked] = useState(false);

  const [fuelEfficiency, setFuelEfficiency] = useState(78);
  const userScrubbedFuel = useRef(false);
  const gaugeRectRef = useRef(null);
  const geoRectRef = useRef(null);

  const [geofencePin, setGeofencePin] = useState({ x: 50, y: 50, inside: true });

  const activePlate = FLEET_PLATES[plateIdx];
  const savedPercent = Math.max(9, Math.round((fuelEfficiency - 40) * 0.48));
  const savedLiters = Math.round(fuelEfficiency * 19.5);

  const plateProgressRef = useRef((p) => {
    const locked = p > 0.42;
    setPlateLocked((prev) => (prev === locked ? prev : locked));
  });

  const fuelProgressRef = useRef((p) => {
    if (!userScrubbedFuel.current && p > 0.05) {
      const nextVal = Math.round(48 + p * 40);
      setFuelEfficiency((prev) => (prev === nextVal ? prev : nextVal));
    }
  });

  const applyGaugeClientX = (clientX, targetEl) => {
    userScrubbedFuel.current = true;
    const rect = gaugeRectRef.current || targetEl.getBoundingClientRect();
    gaugeRectRef.current = rect;
    if (!rect || rect.width < 10) return;
    const ratio = Math.max(0, Math.min(1, 1 - (clientX - rect.left) / rect.width));
    const nextVal = Math.round(45 + ratio * 51);
    setFuelEfficiency((prev) => (prev === nextVal ? prev : nextVal));
  };

  const handleGaugeScrub = (e) => {
    applyGaugeClientX(e.clientX, e.currentTarget);
  };

  const handleGaugeTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      applyGaugeClientX(e.touches[0].clientX, e.currentTarget);
    }
  };

  const applyGeofenceCoords = (clientX, clientY, targetEl) => {
    const rect = geoRectRef.current || targetEl.getBoundingClientRect();
    geoRectRef.current = rect;
    if (!rect || rect.width < 10 || rect.height < 10) return;
    const x = Math.round(Math.max(12, Math.min(88, ((clientX - rect.left) / rect.width) * 100)) * 2) / 2;
    const y = Math.round(Math.max(16, Math.min(84, ((clientY - rect.top) / rect.height) * 100)) * 2) / 2;
    const inside = Math.hypot(x - 50, y - 50) <= 29;
    setGeofencePin((prev) =>
      prev.x === x && prev.y === y && prev.inside === inside ? prev : { x, y, inside }
    );
  };

  const handleGeofenceMove = (e) => {
    applyGeofenceCoords(e.clientX, e.clientY, e.currentTarget);
  };

  const handleGeofenceTouchMove = (e) => {
    if (e.touches && e.touches[0]) {
      applyGeofenceCoords(e.touches[0].clientX, e.touches[0].clientY, e.currentTarget);
    }
  };

  return (
    <section id="story-cards" className="story-sand-chapter" data-polarity="daylight">
      <div className="site-container">
        <div className="story-chapter-head">
          <span className="story-step-kicker">گام ۰۱ · شکل‌گیری ابزارها با ورود سیگنال</span>
          <h2 className="story-chapter-title">
            با ورود مسیر، هر دغدغهٔ ناوگان به یک ابزارِ کنترلی زنده تبدیل می‌شود.
          </h2>
          <p className="story-chapter-sub">
            اسکرول کنید تا ببینید چگونه خط سیگنال هر کامپوننت را از بالا به پایین می‌سازد و سه گلوگاه پرهزینهٔ ناوگان را حل می‌کند.
          </p>
        </div>

        <div className="story-stagger-grid">
          <PaintedCard
            nodeId="node-plate"
            tone="alabaster"
            className="story-stagger-item story-stagger-item--start"
            onProgressRef={plateProgressRef}
          >
            <div className="smart-card-toprow">
              <LogoAnatomyBadge
                activeParts={['p1']}
                code="مزیت ۰۱"
                elementTitle="حذف صف و قبض کاغذی انبار"
                morphTarget="پلاک‌خوان لیزری + باسکول"
              />
              <StatusChip status={plateLocked ? 'moving' : 'signal'} pulse size="sm">
                {plateLocked ? `ثبت ۰.۰۲ ثانیه · ${activePlate.speed} km/h` : 'آماده اسکن'}
              </StatusChip>
            </div>

            <h3 className="smart-card-title">ثبت خودکار ورود، خروج و وزن بار بدون توقف کامیون</h3>
            <p className="smart-card-desc">
              به‌محض عبور خودرو از دروازه، پلاک، ساعت دقیق و تناژ باسکول ثبت می‌شود. روی پلاک بزنید:
            </p>

            <button
              type="button"
              className="gantry-scanner-well"
              data-polarity="nocturnal"
              data-locked={plateLocked ? 'true' : 'false'}
              onClick={() => setPlateIdx((i) => (i + 1) % FLEET_PLATES.length)}
              aria-label="اسکن پلاک خودرو بعدی ناوگان"
            >
              <div className="gantry-scanner-well__pillar" aria-hidden="true">
                <svg viewBox="0 118 44 212" className="gantry-scanner-well__pillar-svg">
                  <path d={LOGO_PARTS[1].d} fill="currentColor" />
                </svg>
                <span className="gantry-scanner-well__beam" />
              </div>

              <div className="gantry-scanner-well__content">
                <IranPlate
                  digitsLeft={activePlate.digitsLeft}
                  letter={activePlate.letter}
                  digitsRight={activePlate.digitsRight}
                  iranCode={activePlate.iranCode}
                  size="md"
                />
                <div className="gantry-scanner-well__telemetry">
                  <strong>{activePlate.route}</strong>
                  <span>{activePlate.weight} · کلیک برای خودروی بعدی</span>
                </div>
              </div>
            </button>
          </PaintedCard>

          <PaintedCard
            nodeId="node-fuel"
            tone="alabaster"
            className="story-stagger-item story-stagger-item--end"
            onProgressRef={fuelProgressRef}
          >
            <div className="smart-card-toprow">
              <LogoAnatomyBadge
                activeParts={['p2']}
                code="مزیت ۰۲"
                elementTitle="جلوگیری از سرقت و هدررفت سوخت"
                morphTarget="سنسور باک + دیاگ ECU"
              />
              <span className="smart-card-metric">{toFa(savedPercent)}٪ کاهش مصرف</span>
            </div>

            <h3 className="smart-card-title">تشخیص آنی تخلیهٔ شبانه باک و رانندگی پرمصرف</h3>
            <p className="smart-card-desc">
              هرگونه افت ناگهانی سطح سوخت در توقف‌ها را با مکان دقیق هشدار می‌دهد. روی تیغه‌ها بکشید:
            </p>

            <div
              className="smart-gauge-scrub"
              data-polarity="nocturnal"
              onPointerEnter={(e) => {
                gaugeRectRef.current = e.currentTarget.getBoundingClientRect();
              }}
              onTouchStart={(e) => {
                gaugeRectRef.current = e.currentTarget.getBoundingClientRect();
              }}
              onPointerMove={handleGaugeScrub}
              onTouchMove={handleGaugeTouchMove}
              onClick={handleGaugeScrub}
            >
              <div className="horizon-wing-rail" aria-hidden="true">
                <svg viewBox="115 -2 122 42" preserveAspectRatio="none" className="horizon-wing-rail__svg">
                  <path d={LOGO_PARTS[2].d} fill="currentColor" />
                </svg>
                <span className="horizon-wing-rail__tag">
                  صرفه‌جویی ماهانه هر خودرو: {toFa(savedLiters)} لیتر
                </span>
              </div>

              <Gauge value={fuelEfficiency} max={100} segments={14} label="راندمان احتراق و سلامت مصرف ناوگان" />
            </div>
          </PaintedCard>

          <PaintedCard
            nodeId="node-geofence"
            tone="alabaster"
            className="story-stagger-item story-stagger-item--start"
          >
            <div className="smart-card-toprow">
              <LogoAnatomyBadge
                activeParts={['p1', 'p3']}
                code="مزیت ۰۳"
                elementTitle="امنیت محموله‌های حساس"
                morphTarget="حصار جغرافیایی (Geofence)"
              />
              <StatusChip status={geofencePin.inside ? 'moving' : 'critical'} pulse size="sm">
                {geofencePin.inside ? 'در مسیر مجاز شرکت' : 'هشدار خروج از مسیر!'}
              </StatusChip>
            </div>

            <h3 className="smart-card-title">هشدار فوری انحراف از مسیر و توقف غیرمجاز</h3>
            <p className="smart-card-desc">
              محدودهٔ مجاز حرکت هر خودرو را تعیین کنید؛ مکان‌نما را از حلقهٔ سبز بیرون ببرید تا هشدار آنی را ببینید:
            </p>

            <div
              className={`smart-geofence-pad ${geofencePin.inside ? 'is-safe' : 'is-alert'}`}
              data-polarity="nocturnal"
              onPointerEnter={(e) => {
                geoRectRef.current = e.currentTarget.getBoundingClientRect();
              }}
              onTouchStart={(e) => {
                geoRectRef.current = e.currentTarget.getBoundingClientRect();
              }}
              onPointerMove={handleGeofenceMove}
              onTouchMove={handleGeofenceTouchMove}
              onClick={handleGeofenceMove}
            >
              <svg viewBox="0 0 400 170" className="smart-geofence-pad__grid" aria-hidden="true">
                <line x1="0" y1="85" x2="400" y2="85" />
                <line x1="200" y1="0" x2="200" y2="170" />
                <circle cx="200" cy="85" r="76" />
              </svg>
              <div className="smart-geofence-ring" aria-hidden="true" />
              <div
                className="smart-geofence-cursor"
                style={{
                  '--pin-x': `${geofencePin.x.toFixed(1)}%`,
                  '--pin-y': `${geofencePin.y.toFixed(1)}%`,
                }}
              >
                <MapPin status={geofencePin.inside ? 'moving' : 'critical'} active={!geofencePin.inside} />
              </div>
            </div>
          </PaintedCard>
        </div>
      </div>
    </section>
  );
}
