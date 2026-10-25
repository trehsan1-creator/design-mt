import React, { useEffect, useState } from 'react';
import { Radar, LocateFixed, Thermometer } from 'lucide-react';
import { Button, Capsule, Gauge, IranPlate, MapPin, StatusChip } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';

const FLEET_UNITS = [
  {
    id: 'TR-108',
    title: 'کشنده ولوو FH500 · ترانزیت جنوب',
    category: 'transit',
    driver: 'محسن رضایی',
    plate: ['۴۸', 'ع', '۷۹۲', '۱۱'],
    corridor: 'تهران ← اصفهان ← بندرعباس',
    x: 56,
    y: 72,
    speed: 86,
    fuel: 78,
    rpm: 1420,
    temp: null,
    status: 'moving',
    statusLabel: 'در حرکت پایدار',
  },
  {
    id: 'CD-204',
    title: 'اسکانیا یخچال‌دار · زنجیره سرد دارو',
    category: 'cold',
    driver: 'بهرام کاظمی',
    plate: ['۲۶', 'ع', '۴۱۵', '۶۸'],
    corridor: 'تهران ← قزوین ← تبریز',
    x: 28,
    y: 26,
    speed: 79,
    fuel: 64,
    rpm: 1360,
    temp: '-۴.۲ درجه',
    status: 'cold-chain',
    statusLabel: 'دمای استاندارد',
  },
  {
    id: 'CT-319',
    title: 'ایسوزو ۶ تن · پخش مویرگی شرق',
    category: 'city',
    driver: 'امیرحسین مرادی',
    plate: ['۷۳', 'ط', '۱۶۹', '۲۲'],
    corridor: 'تهران ← سمنان ← مشهد',
    x: 79,
    y: 32,
    speed: 91,
    fuel: 42,
    rpm: 1580,
    temp: null,
    status: 'signal',
    statusLabel: 'نزدیک مرز سرعت مجاز',
  },
  {
    id: 'TR-412',
    title: 'کامیون بنز آکسور · بار صنعتی',
    category: 'transit',
    driver: 'سعید نادری',
    plate: ['۱۹', 'ع', '۸۳۴', '۱۳'],
    corridor: 'اصفهان ← شیراز ← عسلویه',
    x: 47,
    y: 54,
    speed: 0,
    fuel: 89,
    rpm: 0,
    temp: null,
    status: 'idle',
    statusLabel: 'توقف در پایانه هوشمند',
  },
];

const CITIES = [
  { name: 'تهران (مرکز فرماندهی)', x: 46, y: 34, hub: true },
  { name: 'تبریز', x: 22, y: 21 },
  { name: 'مشهد', x: 84, y: 29 },
  { name: 'اصفهان', x: 48, y: 52 },
  { name: 'شیراز', x: 49, y: 69 },
  { name: 'بندرعباس', x: 63, y: 84 },
];

export default function LiveFleetRadarSection() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(FLEET_UNITS[0]);
  const [radarAngle, setRadarAngle] = useState(0);
  const [pingBurst, setPingBurst] = useState(false);

  useEffect(() => {
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setRadarAngle((a) => (a + dt * 52) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const filtered = filter === 'all' ? FLEET_UNITS : FLEET_UNITS.filter((u) => u.category === filter);

  const triggerPing = () => {
    setPingBurst(true);
    setTimeout(() => setPingBurst(false), 1200);
  };

  return (
    <section id="radar-command" className="fleet-section">
      <div className="site-container">
        <div className="ds-between-wrap">
          <div className="ds-stack-xs">
            <div>
              <Capsule variant="eyebrow" pulse>
                <Radar size={15} aria-hidden="true" />
                <span>مرکز فرماندهی زنده · مخروط رادار ۳۰.۶° و سونار چهارگوش‌نرم</span>
              </Capsule>
            </div>
            <h2 className="section-title-xl">
              تمام کریدورهای کشور، در یک نمای یکپارچه و لحظه‌ای
            </h2>
          </div>

          <div className="ds-row-wrap" role="tablist" aria-label="فیلتر دسته‌بندی ناوگان">
            {[
              { id: 'all', label: 'همه واحدها (۴)' },
              { id: 'transit', label: 'ترانزیت جاده‌ای' },
              { id: 'cold', label: 'زنجیره سرد یخچالی' },
              { id: 'city', label: 'توزیع مویرگی' },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant="pill"
                size="sm"
                role="tab"
                aria-selected={filter === tab.id}
                active={filter === tab.id}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="radar-command-grid">
          <div className="radar-vehicle-list">
            {filtered.map((unit) => {
              const isSel = selected.id === unit.id;
              return (
                <button
                  key={unit.id}
                  type="button"
                  className={`radar-vehicle-card ds-stack-sm ${isSel ? 'is-selected' : ''}`}
                  onClick={() => {
                    setSelected(unit);
                    triggerPing();
                  }}
                >
                  <div className="ds-between-wrap">
                    <strong>{unit.title}</strong>
                    <StatusChip status={unit.status} label={unit.statusLabel} />
                  </div>

                  <div className="ds-between-wrap">
                    <IranPlate
                      left2={unit.plate[0]}
                      letter={unit.plate[1]}
                      mid3={unit.plate[2]}
                      iranCode={unit.plate[3]}
                    />
                    <span className="ds-muted">{unit.corridor}</span>
                  </div>

                  <Gauge
                    segments={12}
                    activeCount={Math.round((unit.fuel / 100) * 12)}
                    label="سطح باک سوخت"
                    value={`${toFa(unit.fuel)}٪`}
                    tone={unit.fuel < 45 ? 'accent' : 'moving'}
                  />
                </button>
              );
            })}
          </div>

          <div className="radar-map-stage">
            {[160, 290, 430].map((sz) => (
              <div key={sz} className="radar-ring" style={{ '--ring-size': `${sz}px` }} />
            ))}
            <div className="radar-sweep-cone" style={{ '--radar-deg': `${radarAngle}deg` }} />

            <svg viewBox="0 0 800 500" className="radar-map-svg" aria-hidden="true">
              <path
                d="M 368,170 C 310,165 245,135 176,105"
                fill="none"
                stroke="var(--ds-sand-300)"
                strokeOpacity="0.28"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
              <path
                d="M 368,170 C 470,158 565,150 672,145"
                fill="none"
                stroke="var(--ds-sand-300)"
                strokeOpacity="0.28"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
              <path
                d="M 368,170 Q 384,215 384,260 Q 384,305 392,345 C 415,390 462,405 504,420"
                fill="none"
                stroke="var(--ds-color-signal-orange)"
                strokeWidth="4.5"
                strokeOpacity="0.68"
              />
            </svg>

            {CITIES.map((ct) => (
              <div
                key={ct.name}
                className={`radar-city-marker ${ct.hub ? 'is-hub' : ''}`}
                style={{ '--city-x': `${ct.x}%`, '--city-y': `${ct.y}%` }}
              >
                <span className="radar-city-dot" />
                <span className="radar-city-name">{ct.name}</span>
              </div>
            ))}

            {FLEET_UNITS.map((u, idx) => {
              const isSel = selected.id === u.id;
              const headings = [152, -52, 84, 0];
              return (
                <MapPin
                  key={u.id}
                  speed={u.speed}
                  heading={headings[idx] || 0}
                  status={u.status}
                  selected={isSel}
                  label={`انتخاب ${u.title} با سرعت ${toFa(u.speed)} کیلومتر بر ساعت`}
                  className="radar-pin-pos"
                  style={{ '--pin-x': `${u.x}%`, '--pin-y': `${u.y}%` }}
                  onClick={() => {
                    setSelected(u);
                    triggerPing();
                  }}
                />
              );
            })}

            {pingBurst && (
              <div
                className="radar-ping-wave"
                style={{ '--ping-x': `${selected.x}%`, '--ping-y': `${selected.y}%` }}
              />
            )}

            <div className="radar-bottom-telemetry ds-between-wrap">
              <div className="ds-stack-xs">
                <div className="ds-accent-soft-text">
                  واحد انتخاب‌شده: <strong>{selected.title}</strong> · راننده: {selected.driver}
                </div>
                <div className="ds-row-wrap ds-tabular">
                  <span>سرعت: {toFa(selected.speed)} کیلومتر/ساعت</span>
                  <span>دور موتور: {toFa(selected.rpm)} RPM</span>
                  {selected.temp && (
                    <StatusChip status="cold-chain" icon={Thermometer} label={`سنسور سردخانه: ${selected.temp}`} />
                  )}
                </div>
              </div>

              <Button variant="primary" size="sm" onClick={triggerPing}>
                <LocateFixed size={15} aria-hidden="true" />
                <span>ارسال پینگ ماهواره‌ای زنده</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
