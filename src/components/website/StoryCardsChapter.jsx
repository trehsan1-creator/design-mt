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
    weight: '۲۲.۴ تن',
  },
  {
    digitsLeft: '۶۲',
    letter: 'د',
    digitsRight: '۳۱۵',
    iranCode: '۲۱',
    route: 'تبریز — قزوین',
    speed: '۷۹',
    weight: '۱۸.۶ تن',
  },
  {
    digitsLeft: '۱۹',
    letter: 'ط',
    digitsRight: '۸۴۶',
    iranCode: '۵۳',
    route: 'اصفهان — شیراز',
    speed: '۹۱',
    weight: '۲۴.۱ تن',
  },
];

export default function StoryCardsChapter() {
  const [plateIdx, setPlateIdx] = useState(0);
  const [plateLocked, setPlateLocked] = useState(false);

  const [fuelEfficiency, setFuelEfficiency] = useState(78);
  const userScrubbedFuel = useRef(false);

  const [geofencePin, setGeofencePin] = useState({ x: 50, y: 50, inside: true });

  const activePlate = FLEET_PLATES[plateIdx];
  const savedPercent = Math.max(9, Math.round((fuelEfficiency - 40) * 0.48));
  const savedLiters = Math.round(fuelEfficiency * 19.5);

  const plateProgressRef = useRef((p) => {
    setPlateLocked(p > 0.42);
  });

  const fuelProgressRef = useRef((p) => {
    if (!userScrubbedFuel.current && p > 0.05) {
      setFuelEfficiency(Math.round(48 + p * 40));
    }
  });

  const handleGaugeScrub = (e) => {
    userScrubbedFuel.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, 1 - (e.clientX - rect.left) / rect.width));
    setFuelEfficiency(Math.round(45 + ratio * 51));
  };

  const handleGeofenceMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(12, Math.min(88, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(16, Math.min(84, ((e.clientY - rect.top) / rect.height) * 100));
    const dist = Math.hypot(x - 50, y - 50);
    setGeofencePin({ x, y, inside: dist <= 29 });
  };

  return (
    <section id="story-cards" className="story-sand-chapter" data-polarity="daylight">
      <div className="site-container">
        <div className="story-chapter-head">
          <span className="story-step-kicker">۰۱ · کالبدشکافی کاربردی لوگو</span>
          <h2 className="story-chapter-title">
            عناصر هندسی لوگو جدا می‌شوند و ابزارهای زندهٔ ناوگان را می‌سازند.
          </h2>
          <p className="story-chapter-sub">
            هر قطعه از نشان فرزام یک وظیفهٔ مهندسی دارد؛ با رسیدن خط سیگنال، هر عنصر به یک حسگر تعاملی تبدیل می‌شود.
          </p>
        </div>

        <div className="story-stagger-grid">
          {/* کارت ۰۱: ستون عمودی دروازه لوگو (p1) -> ستون اسکنر لیزری پلاک‌خوان */}
          <PaintedCard
            nodeId="node-plate"
            tone="alabaster"
            className="story-stagger-item story-stagger-item--start"
            onProgressRef={plateProgressRef}
          >
            <div className="smart-card-toprow">
              <LogoAnatomyBadge
                activeParts={['p1']}
                code="عنصر ۰۱"
                elementTitle="ستون دروازه لوگو"
                morphTarget="پرتال لیزری پلاک‌خوان"
              />
              <StatusChip status={plateLocked ? 'moving' : 'signal'} pulse size="sm">
                {plateLocked ? `قفل ۰.۰۲ ثانیه · ${activePlate.speed} km/h` : 'آماده اسکن'}
              </StatusChip>
            </div>

            <h3 className="smart-card-title">تبدیل ستون لوگو به دروازهٔ اسکن پلاک</h3>
            <p className="smart-card-desc">
              ستون عمودی سمت چپ لوگو دقیقاً در نقش دکل دروازهٔ جاده‌ای قرار می‌گیرد و پرتو لیزر را روی پلاک عبوری می‌تاباند. روی پلاک کلیک کنید:
            </p>

            <button
              type="button"
              className="gantry-scanner-well"
              data-polarity="nocturnal"
              data-locked={plateLocked ? 'true' : 'false'}
              onClick={() => setPlateIdx((i) => (i + 1) % FLEET_PLATES.length)}
              aria-label="اسکن پلاک خودرو بعدی ناوگان"
            >
              {/* قطعه واقعی ستون دروازه لوگو (LOGO_PARTS[1]) که کالبد فیزیکی دکل اسکنر را ساخته است */}
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
                  <span>باسکول محوری: {activePlate.weight} · کلیک برای واحد بعدی</span>
                </div>
              </div>
            </button>
          </PaintedCard>

          {/* کارت ۰۲: بازوی افقی افق لوگو (p2) -> ریل کالیبراسیون تیغه‌های -۲۶.۸۴ درجه سوخت */}
          <PaintedCard
            nodeId="node-fuel"
            tone="alabaster"
            className="story-stagger-item story-stagger-item--end"
            onProgressRef={fuelProgressRef}
          >
            <div className="smart-card-toprow">
              <LogoAnatomyBadge
                activeParts={['p2']}
                code="عنصر ۰۲"
                elementTitle="بازوی افقی لوگو"
                morphTarget="ریل تیغه‌های -۲۶.۸۴° سوخت"
              />
              <span className="smart-card-metric">{toFa(savedPercent)}٪ کاهش مصرف</span>
            </div>

            <h3 className="smart-card-title">تبدیل بازوی افق به کنسول کالیبراسیون سوخت</h3>
            <p className="smart-card-desc">
              بازوی افقی بالای لوگو به ریل مرجع تبدیل شده و به ۱۴ تیغهٔ موازی با زاویهٔ برند (`-۲۶.۸۴°`) برش می‌خورد. موس را روی تیغه‌ها بکشید:
            </p>

            <div
              className="smart-gauge-scrub"
              data-polarity="nocturnal"
              onPointerMove={handleGaugeScrub}
            >
              {/* قطعه واقعی بازوی افق لوگو (LOGO_PARTS[2]) به عنوان ریل کالیبراسیون بالای گیج */}
              <div className="horizon-wing-rail" aria-hidden="true">
                <svg viewBox="115 -2 122 42" preserveAspectRatio="none" className="horizon-wing-rail__svg">
                  <path d={LOGO_PARTS[2].d} fill="currentColor" />
                </svg>
                <span className="horizon-wing-rail__tag">
                  ذخیره ماهانه هر خودرو: {toFa(savedLiters)} لیتر
                </span>
              </div>

              <Gauge value={fuelEfficiency} max={100} segments={14} label="بازده لحظه‌ای احتراق و دور موتور" />
            </div>
          </PaintedCard>

          {/* کارت ۰۳: هم‌نشینی دروازه و تیغه مکان‌نما (p1 + p3) -> رادار ژئوفنس */}
          <PaintedCard
            nodeId="node-geofence"
            tone="alabaster"
            className="story-stagger-item story-stagger-item--start"
          >
            <div className="smart-card-toprow">
              <LogoAnatomyBadge
                activeParts={['p1', 'p3']}
                code="عنصر ۰۳"
                elementTitle="دروازه + تیغه ۱۳۶.۵۴°"
                morphTarget="رادار حصار فضایی (Geofence)"
              />
              <StatusChip status={geofencePin.inside ? 'moving' : 'critical'} pulse size="sm">
                {geofencePin.inside ? 'درون محدوده مجاز' : 'هشدار خروج از مرز'}
              </StatusChip>
            </div>

            <h3 className="smart-card-title">تبدیل تیغهٔ لوگو به مکان‌نمای حساس به مرز</h3>
            <p className="smart-card-desc">
              قطعهٔ چهارم لوگو مستقیماً به مکان‌نمای `۱۳۶.۵۴°` ناوگان بدل می‌شود؛ موس را از حلقهٔ سبز بیرون ببرید تا واکنش آنی حصار را ببینید:
            </p>

            <div
              className={`smart-geofence-pad ${geofencePin.inside ? 'is-safe' : 'is-alert'}`}
              data-polarity="nocturnal"
              onPointerMove={handleGeofenceMove}
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
