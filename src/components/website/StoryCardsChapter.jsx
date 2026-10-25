import React, { useRef, useState } from 'react';
import { Gauge, IranPlate, MapPin, StatusChip } from '../../ds';
import { toFa } from '../../utils/faDigits.js';
import PaintedCard from './PaintedCard.jsx';

const FLEET_PLATES = [
  { digitsLeft: '۴۸', letter: 'ع', digitsRight: '۷۲۹', iranCode: '۱۱', route: 'تهران — بندرعباس', speed: '۸۴' },
  { digitsLeft: '۶۲', letter: 'د', digitsRight: '۳۱۵', iranCode: '۲۱', route: 'تبریز — قزوین', speed: '۷۹' },
  { digitsLeft: '۱۹', letter: 'ط', digitsRight: '۸۴۶', iranCode: '۵۳', route: 'اصفهان — شیراز', speed: '۹۱' },
];

export default function StoryCardsChapter() {
  const [plateIdx, setPlateIdx] = useState(0);
  const [plateLocked, setPlateLocked] = useState(false);

  const [fuelEfficiency, setFuelEfficiency] = useState(76);
  const userScrubbedFuel = useRef(false);

  const [geofencePin, setGeofencePin] = useState({ x: 50, y: 50, inside: true });

  const activePlate = FLEET_PLATES[plateIdx];
  const savedPercent = Math.max(9, Math.round((fuelEfficiency - 40) * 0.48));

  // هم‌گام‌سازی خودکار پلاک‌خوان با رسیدن خط سیگنال به کارت اول
  const plateProgressRef = useRef((p) => {
    setPlateLocked(p > 0.45);
  });

  // هم‌گام‌سازی خودکار گیج سوخت با پیشرفت خط سیگنال دور کارت دوم (تا قبل از تعامل دستی موس)
  const fuelProgressRef = useRef((p) => {
    if (!userScrubbedFuel.current && p > 0.05) {
      setFuelEfficiency(Math.round(46 + p * 42));
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
          <span className="story-step-kicker">۰۱ · فصل اول</span>
          <h2 className="story-chapter-title">
            هر ایستگاهی که خط سیگنال لمس می‌کند، زنده می‌شود.
          </h2>
        </div>

        <div className="story-stagger-grid">
          {/* گره ۰ مدار: پلاک‌خوانی زنده */}
          <PaintedCard
            nodeId="node-plate"
            tone="alabaster"
            className="story-stagger-item story-stagger-item--start"
            onProgressRef={plateProgressRef}
          >
            <div className="smart-card-head">
              <span className="smart-card-index">۰۱</span>
              <StatusChip status={plateLocked ? 'moving' : 'signal'} pulse size="sm">
                {plateLocked ? `قفل در ۰.۰۲ ثانیه · ${activePlate.speed} km/h` : 'در انتظار سیگنال'}
              </StatusChip>
            </div>
            <h3 className="smart-card-title">قفل خودکار پلاک با ورود سیگنال</h3>
            <p className="smart-card-desc">
              با رسیدن خط نارنجی، پلاک فعال اسکن می‌شود؛ روی پلاک کلیک کنید تا واحد بعدی ناوگان فراخوانی شود.
            </p>

            <button
              type="button"
              className="smart-plate-trigger"
              onClick={() => setPlateIdx((i) => (i + 1) % FLEET_PLATES.length)}
              aria-label="تغییر پلاک خودرو فعال در مدار"
            >
              <IranPlate
                digitsLeft={activePlate.digitsLeft}
                letter={activePlate.letter}
                digitsRight={activePlate.digitsRight}
                iranCode={activePlate.iranCode}
                size="md"
              />
              <span className="smart-plate-route">{activePlate.route}</span>
            </button>
          </PaintedCard>

          {/* گره ۱ مدار: گیج مورب سوخت */}
          <PaintedCard
            nodeId="node-fuel"
            tone="alabaster"
            className="story-stagger-item story-stagger-item--end"
            onProgressRef={fuelProgressRef}
          >
            <div className="smart-card-head">
              <span className="smart-card-index">۰۲</span>
              <span className="smart-card-metric">
                {toFa(savedPercent)}٪ صرفه‌جویی سوخت
              </span>
            </div>
            <h3 className="smart-card-title">کالیبراسیون مورب مصرف سوخت</h3>
            <p className="smart-card-desc">
              جریان سیگنال تیغه‌های `-۲۶.۸۴°` را شارژ می‌کند؛ موس را روی تیغه‌ها بکشید تا بازده ناوگان را بسنجید.
            </p>

            <div
              className="smart-gauge-scrub"
              data-polarity="nocturnal"
              onPointerMove={handleGaugeScrub}
            >
              <Gauge value={fuelEfficiency} max={100} segments={14} label="بازده لحظه‌ای ناوگان" />
            </div>
          </PaintedCard>

          {/* گره ۲ مدار: رادار ژئوفنس */}
          <PaintedCard
            nodeId="node-geofence"
            tone="alabaster"
            className="story-stagger-item story-stagger-item--start"
          >
            <div className="smart-card-head">
              <span className="smart-card-index">۰۳</span>
              <StatusChip status={geofencePin.inside ? 'moving' : 'critical'} pulse size="sm">
                {geofencePin.inside ? 'درون حصار مجاز' : 'خروج از ژئوفنس'}
              </StatusChip>
            </div>
            <h3 className="smart-card-title">حصار فضایی حساس به حرکت موس</h3>
            <p className="smart-card-desc">
              اشاره‌گر موس را از دایره سبز عبور دهید تا هشدار آنی خروج از مرز مجاز را ببینید.
            </p>

            <div
              className={`smart-geofence-pad ${geofencePin.inside ? 'is-safe' : 'is-alert'}`}
              data-polarity="nocturnal"
              onPointerMove={handleGeofenceMove}
            >
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
