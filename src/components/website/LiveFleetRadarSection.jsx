import React, { useEffect, useState } from 'react';
import { Radar, Truck, Fuel, ShieldAlert, LocateFixed, CheckCircle2, Thermometer } from 'lucide-react';
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
    status: 'moving',
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
    status: 'alert',
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
    <section id="radar-command" className="dark-section">
      <div className="site-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
          <div style={{ maxWidth: 680 }}>
            <div className="eyebrow-kaf">
              <Radar size={15} />
              <span>مرکز فرماندهی زنده · مخروط رادار ۷۴.۷° و سونار اسکوئیرکل</span>
            </div>
            <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, lineHeight: 1.28 }}>
              تمام کریدورهای کشور، در یک نگاه سه‌بعدی و لحظه‌ای
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'همه واحدها (۴)' },
              { id: 'transit', label: 'ترانزیت جاده‌ای' },
              { id: 'cold', label: 'زنجیره سرد یخچالی' },
              { id: 'city', label: 'توزیع مویرگی' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`chip-btn ${filter === tab.id ? 'on' : ''}`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="radar-command-grid">
          {/* Right Sidebar: Live Vehicle List + Selected Vehicle Deep Telemetry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filtered.map((unit) => {
              const isSel = selected.id === unit.id;
              return (
                <div
                  key={unit.id}
                  onClick={() => {
                    setSelected(unit);
                    triggerPing();
                  }}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 22,
                    cursor: 'pointer',
                    background: isSel
                      ? 'linear-gradient(140.24deg, rgba(61,87,104,0.72) 0%, rgba(17,40,53,0.96) 52%, rgba(33,61,79,0.86) 100%)'
                      : 'rgba(14, 30, 44, 0.72)',
                    border: isSel ? '1.5px solid #FF742E' : '1px solid rgba(232,222,205,0.12)',
                    boxShadow: isSel ? '0 16px 38px rgba(255,116,46,0.22)' : 'none',
                    transition: 'all 0.24s cubic-bezier(0.34, 1.4, 0.64, 1)',
                    transform: isSel ? 'translateX(-4px)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontWeight: 800, fontSize: 14.5 }}>{unit.title}</span>
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '3px 10px',
                        borderRadius: 999,
                        background:
                          unit.status === 'alert'
                            ? 'rgba(255,116,46,0.24)'
                            : unit.status === 'moving'
                            ? 'rgba(74,222,128,0.16)'
                            : 'rgba(232,222,205,0.12)',
                        color:
                          unit.status === 'alert'
                            ? '#FF9861'
                            : unit.status === 'moving'
                            ? '#4ADE80'
                            : '#E8DECD',
                      }}
                    >
                      {unit.statusLabel}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 10, gap: 8, flexWrap: 'wrap' }}>
                    <div className="iran-plate">
                      <div className="iran-plate-blue" aria-hidden="true">
                        <svg width="12" height="22" viewBox="0 0 12 22">
                          <rect x="1" y="2" width="10" height="2.5" fill="#22C55E" />
                          <rect x="1" y="4.5" width="10" height="2.5" fill="#FFFFFF" />
                          <rect x="1" y="7" width="10" height="2.5" fill="#EF4444" />
                          <rect x="2" y="13" width="8" height="1.5" rx="0.7" fill="#FFFFFF" opacity="0.85" />
                          <rect x="2" y="16.5" width="8" height="1.5" rx="0.7" fill="#FFFFFF" opacity="0.85" />
                        </svg>
                      </div>
                      <div className="iran-plate-main">
                        <span>{unit.plate[0]}</span>
                        <span style={{ color: '#D94E14' }}>{unit.plate[1]}</span>
                        <span>{unit.plate[2]}</span>
                      </div>
                      <div className="iran-plate-city">
                        <strong>{unit.plate[3]}</strong>
                      </div>
                    </div>

                    <div style={{ fontSize: 12.5, color: 'rgba(232,222,205,0.76)' }}>{unit.corridor}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Fuel size={14} color="#FF9861" />
                    <span style={{ fontSize: 12.5, color: 'rgba(232,222,205,0.76)' }}>سوخت: {toFa(unit.fuel)}٪</span>
                    <div style={{ flex: 1, display: 'flex', gap: 3 }}>
                      {Array.from({ length: 12 }).map((_, bi) => {
                        const lit = bi < Math.round((unit.fuel / 100) * 12);
                        return (
                          <div
                            key={bi}
                            style={{
                              flex: 1,
                              height: 7,
                              borderRadius: 1.5,
                              transform: 'skewX(-26.84deg)',
                              background: lit ? (unit.fuel < 45 ? '#FF742E' : '#E8DECD') : 'rgba(232,222,205,0.12)',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Left Interactive 3D-Perspective Radar Map Stage */}
          <div
            className="cad-card"
            style={{
              padding: 0,
              minHeight: 510,
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background:
                'radial-gradient(circle at 46% 36%, rgba(61, 87, 104, 0.52) 0%, rgba(11, 25, 38, 0.96) 62%, #060E16 100%)',
            }}
          >
            {/* Squircle Radar Rings Centered on Tehran Command Hub */}
            <div style={{ position: 'absolute', inset: 0, direction: 'ltr', pointerEvents: 'none' }}>
              {[150, 280, 420].map((sz) => (
                <div
                  key={sz}
                  style={{
                    position: 'absolute',
                    insetInlineStart: '46%',
                    top: '44%',
                    width: sz,
                    height: sz,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '31.25%',
                    border: '1px solid rgba(232,222,205,0.11)',
                  }}
                />
              ))}

              <div
                style={{
                  position: 'absolute',
                  insetInlineStart: '46%',
                  top: '44%',
                  width: 460,
                  height: 460,
                  transform: 'translate(-50%, -50%)',
                  borderRadius: '31.25%',
                  background: `conic-gradient(from ${radarAngle}deg, rgba(255,116,46,0.34) 0deg, rgba(255,116,46,0.06) 22deg, transparent 31deg, transparent 360deg)`,
                }}
              />
            </div>

            {/* SVG Clothoid Freight Corridors */}
            <svg
              viewBox="0 0 800 500"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
            >
              {/* Tehran -> Tabriz Clothoid */}
              <path
                d="M 368,170 C 310,165 245,135 176,105"
                fill="none"
                stroke="rgba(232,222,205,0.28)"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
              {/* Tehran -> Mashhad Clothoid */}
              <path
                d="M 368,170 C 470,158 565,150 672,145"
                fill="none"
                stroke="rgba(232,222,205,0.28)"
                strokeWidth="4"
                strokeDasharray="6 6"
              />
              {/* Tehran -> Isfahan -> Shiraz -> Bandar Abbas */}
              <path
                d="M 368,170 Q 384,215 384,260 Q 384,305 392,345 C 415,390 462,405 504,420"
                fill="none"
                stroke="#FF742E"
                strokeWidth="4.5"
                strokeOpacity="0.65"
              />
            </svg>

            <div style={{ position: 'absolute', inset: 0, direction: 'ltr', pointerEvents: 'none' }}>
              {CITIES.map((ct) => (
                <div
                  key={ct.name}
                  style={{
                    position: 'absolute',
                    insetInlineStart: `${ct.x}%`,
                    top: `${ct.y}%`,
                    transform: 'translate(-50%, -50%)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: ct.hub ? 16 : 10,
                      height: ct.hub ? 16 : 10,
                      borderRadius: ct.hub ? 5 : 3,
                      background: ct.hub ? '#FF742E' : '#E8DECD',
                      border: '2px solid #102333',
                      boxShadow: ct.hub ? '0 0 20px #FF742E' : 'none',
                    }}
                  />
                  <span
                    style={{
                      direction: 'rtl',
                      fontSize: 12,
                      fontWeight: ct.hub ? 800 : 600,
                      color: ct.hub ? '#FFB085' : 'rgba(232,222,205,0.82)',
                      background: 'rgba(6,14,22,0.78)',
                      padding: '2px 8px',
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {ct.name}
                  </span>
                </div>
              ))}

              {FLEET_UNITS.map((u) => {
                const isSel = selected.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setSelected(u);
                      triggerPing();
                    }}
                    style={{
                      pointerEvents: 'auto',
                      direction: 'rtl',
                      position: 'absolute',
                      insetInlineStart: `${u.x}%`,
                      top: `${u.y}%`,
                      transform: `translate(-50%, -50%) scale(${isSel ? 1.12 : 1})`,
                      minHeight: 44,
                      minWidth: 44,
                      background: isSel ? '#FF742E' : '#102333',
                      color: isSel ? '#060E16' : '#E8DECD',
                      border: isSel ? '2px solid #FFF5EE' : '1.5px solid #FF742E',
                      borderRadius: 12,
                      padding: '8px 12px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontWeight: 800,
                      fontSize: 12.5,
                      boxShadow: isSel ? '0 0 28px rgba(255,116,46,0.85)' : '0 8px 20px rgba(0,0,0,0.45)',
                      zIndex: isSel ? 10 : 4,
                      transition: 'all 0.25s cubic-bezier(0.34, 1.45, 0.64, 1)',
                    }}
                  >
                    <Truck size={14} />
                    <span>{toFa(u.speed)} km/h</span>
                  </button>
                );
              })}

              {pingBurst && (
                <div
                  style={{
                    position: 'absolute',
                    insetInlineStart: `${selected.x}%`,
                    top: `${selected.y}%`,
                    width: 90,
                    height: 90,
                    borderRadius: '31.25%',
                    border: '2.5px solid #FF742E',
                    animation: 'squirclePing 1.1s ease-out forwards',
                    zIndex: 8,
                  }}
                />
              )}
            </div>

            {/* Bottom Command Dock Inside Map */}
            <div
              style={{
                marginTop: 'auto',
                margin: 18,
                padding: '16px 20px',
                borderRadius: 22,
                background: 'rgba(8, 19, 29, 0.86)',
                border: '1px solid rgba(232, 222, 205, 0.16)',
                backdropFilter: 'blur(14px)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 14,
                zIndex: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: '#FF9861', fontWeight: 700 }}>
                  واحد انتخاب‌شده: {selected.title} · راننده: {selected.driver}
                </div>
                <div style={{ display: 'flex', gap: 18, marginTop: 4, fontSize: 13.5, fontWeight: 700 }}>
                  <span>سرعت: {toFa(selected.speed)} کیلومتر/ساعت</span>
                  <span>دور موتور: {toFa(selected.rpm)} RPM</span>
                  {selected.temp && (
                    <span style={{ color: '#38BDF8' }}>
                      <Thermometer size={14} style={{ verticalAlign: 'middle' }} /> سنسور سردخانه: {selected.temp}
                    </span>
                  )}
                </div>
              </div>

              <button onClick={triggerPing} className="btn-3d-orange" style={{ padding: '9px 18px', fontSize: 13 }}>
                <LocateFixed size={15} />
                <span>ارسال پینگ ماهواره‌ای زنده</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
