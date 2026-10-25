import React, { useState } from 'react';
import { IranPlate, Gauge, MapPin, StatusChip } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';
import PaintedCard from './PaintedCard.jsx';

const LIVE_PLATES = [
  { left2: '۴۸', letter: 'ع', mid3: '۷۲۹', iranCode: '۱۱', variant: 'public', route: 'تهران ← بندرعباس' },
  { left2: '۶۲', letter: 'ع', mid3: '۳۱۴', iranCode: '۴۳', variant: 'public', route: 'اصفهان ← شیراز' },
  { left2: '۲۴', letter: 'د', mid3: '۸۵۱', iranCode: '۶۸', variant: 'private', route: 'تبریز ← قزوین' },
];

export default function StoryCardsChapter() {
  const [plateIdx, setPlateIdx] = useState(0);
  const [fuelPct, setFuelPct] = useState(78);
  const [geofencePin, setGeofencePin] = useState({ x: 52, y: 48, inside: true });

  const currentPlate = LIVE_PLATES[plateIdx];

  const handleGaugeScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // در چیدمان راست‌به‌چپ حرکت از راست به چپ مقدار را پر می‌کند
    const ratio = 1 - (e.clientX - rect.left) / Math.max(1, rect.width);
    const next = Math.max(14, Math.min(100, Math.round(ratio * 100)));
    setFuelPct(next);
  };

  const handleGeofenceMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(14, Math.min(86, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(18, Math.min(82, ((e.clientY - rect.top) / rect.height) * 100));
    const dist = Math.hypot(x - 50, y - 50);
    setGeofencePin({ x, y, inside: dist <= 28 });
  };

  return (
    <section id="story-cards" data-polarity="daylight" className="story-sand-chapter">
      <div className="site-container story-sand-chapter__inner">
        <header className="story-chapter-head">
          <span className="story-step-kicker ds-tabular">۰۱ · فصل اول</span>
          <h2 className="story-chapter-title">
            خطی که کارت‌ها را می‌کشد و ناوگان را بیدار می‌کند.
          </h2>
        </header>

        <div className="story-stagger-grid">
          {/* کارت اول: دورگیری توسط نوار نقاش + تغییر هوشمند پلاک با کلیک یا لمس */}
          <PaintedCard tone="alabaster" delay={0} className="story-stagger-item story-stagger-item--start">
            <div className="smart-card-head">
              <span className="smart-card-index ds-tabular">۰۱</span>
              <StatusChip status="moving" label="قفل ۰.۰۲ ثانیه" />
            </div>

            <h3 className="smart-card-title">پلاک‌خوانی زنده در لحظه استارت</h3>
            <p className="smart-card-sub">روی پلاک بزنید تا واحد فعال بعدی روی خط سیگنال قفل شود.</p>

            <button
              type="button"
              className="smart-plate-stage"
              onClick={() => setPlateIdx((i) => (i + 1) % LIVE_PLATES.length)}
              aria-label="تغییر واحد ناوگان فعال"
            >
              <IranPlate
                left2={currentPlate.left2}
                letter={currentPlate.letter}
                mid3={currentPlate.mid3}
                iranCode={currentPlate.iranCode}
                variant={currentPlate.variant}
              />
              <span className="smart-plate-route">{currentPlate.route}</span>
            </button>
          </PaintedCard>

          {/* کارت دوم: تراز سوخت تعاملی فقط با حرکت موس روی تیغه‌ها */}
          <PaintedCard tone="alabaster" delay={0.08} className="story-stagger-item story-stagger-item--end">
            <div className="smart-card-head">
              <span className="smart-card-index ds-tabular">۰۲</span>
              <span className="smart-card-big-num ds-tabular">{toFa(Math.round(fuelPct * 0.31))}٪</span>
            </div>

            <h3 className="smart-card-title">کاهش هوشمند هدررفت سوخت</h3>
            <p className="smart-card-sub">موس را روی تیغه‌های مورب بکشید تا اثر پایش لحظه‌ای را ببینید.</p>

            <div
              className="smart-gauge-scrub"
              data-polarity="nocturnal"
              onPointerMove={handleGaugeScrub}
            >
              <Gauge
                segments={14}
                activeCount={Math.max(1, Math.round((fuelPct / 100) * 14))}
                label="بازده لحظه‌ای ناوگان"
                value={`${toFa(fuelPct)}٪`}
                tone="accent"
              />
            </div>
          </PaintedCard>

          {/* کارت سوم: ژئوفنس هوشمند که پین ۱۳۶.۵۴ درجه دنبال موس حرکت می‌کند */}
          <PaintedCard tone="alabaster" delay={0.14} className="story-stagger-item story-stagger-item--start">
            <div className="smart-card-head">
              <span className="smart-card-index ds-tabular">۰۳</span>
              <StatusChip
                status={geofencePin.inside ? 'moving' : 'signal'}
                label={geofencePin.inside ? 'درون مرز امن' : 'خروج از ژئوفنس'}
              />
            </div>

            <h3 className="smart-card-title">حصار نامرئی با واکنش آنی</h3>
            <p className="smart-card-sub">موس را داخل و خارج حلقه ببرید؛ پین ۱۳۶.۵۴ درجه مرز را حس می‌کند.</p>

            <div
              className={`smart-geofence-pad ${geofencePin.inside ? 'is-safe' : 'is-alert'}`}
              data-polarity="nocturnal"
              onPointerMove={handleGeofenceMove}
            >
              <div className="smart-geofence-zone ds-squircle" aria-hidden="true" />
              <div
                className="smart-geofence-follower"
                style={{ '--pin-x': `${geofencePin.x}%`, '--pin-y': `${geofencePin.y}%` }}
              >
                <MapPin
                  speed={geofencePin.inside ? 82 : 108}
                  heading={geofencePin.inside ? 40 : 135}
                  status={geofencePin.inside ? 'moving' : 'signal'}
                  selected
                  label="پین تعاملی ژئوفنس"
                />
              </div>
            </div>
          </PaintedCard>
        </div>
      </div>
    </section>
  );
}
