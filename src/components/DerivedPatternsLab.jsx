import React, { useEffect, useState } from 'react';
import { Compass, Radar, Cpu, Layers, Zap, Sparkles, Navigation, ShieldCheck, Truck } from 'lucide-react';
import { LOGO_PARTS } from '../data/geometryData.js';
import { toFa } from '../utils/faDigits.js';

/* Pattern 01: Clothoid Highway & Multi-Comet Signal Network */
function PatternClothoidRoutes() {
  const [burstKey, setBurstKey] = useState(0);

  return (
    <div className="cad-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <div>
          <span className="kaf-slash-tag">پترن ۰۱ · مسیرهای کلوتوئیدی و سیگنال شهاب‌سنگ</span>
          <h3 style={{ fontSize: 19, fontWeight: 800, marginTop: 8 }}>شبکه بزرگراهی با پیچ‌های نرم لوگو</h3>
        </div>
        <button className="chip-btn on" onClick={() => setBurstKey((k) => k + 1)}>
          شلیک موج جدید
        </button>
      </div>

      <p style={{ fontSize: 14, color: 'var(--beige-muted)', marginBottom: 14 }}>
        مشتق‌شده از <strong>کمان بالا-چپ لوگو (<span className="ltr-code">κ = 0.50, n = 1.85</span>)</strong> و <strong>فیلت‌های داخلی <span className="ltr-code">R = 14.54 (S/φ)</span></strong>. هیچ پیچی تیز نیست؛ تمام مسیرهای نقشه سایت با هندسه رمپ بزرگراهی نرم می‌شوند.
      </p>

      <div
        className="cad-stage"
        style={{
          height: 250,
          padding: 0,
          perspective: '700px',
          background: 'radial-gradient(circle at 70% 25%, #1E3B50 0%, #07111A 80%)',
        }}
      >
        <svg
          key={burstKey}
          viewBox="0 0 520 250"
          style={{
            width: '100%',
            height: '100%',
            transform: 'rotateX(26deg) scale(1.06)',
            transformOrigin: 'center 65%',
          }}
        >
          <defs>
            <linearGradient id="p1Trail" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FF742E" stopOpacity="0" />
              <stop offset="70%" stopColor="#E8DECD" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FF742E" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Subtle isometric grid */}
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={`gx-${i}`} x1={i * 40} y1="0" x2={i * 40} y2="250" stroke="rgba(232,222,205,0.06)" />
          ))}
          {Array.from({ length: 7 }).map((_, j) => (
            <line key={`gy-${j}`} x1="0" y1={j * 40} x2="520" y2={j * 40} stroke="rgba(232,222,205,0.06)" />
          ))}

          {/* Base Highway Tracks */}
          {[
            { d: 'M 490,205 H 350 Q 326,205 326,181 V 86 Q 326,62 302,62 H 150 C 88,62 42,112 42,188', dur: '3.2s', delay: '0s' },
            { d: 'M 490,145 H 260 Q 236,145 236,169 V 202 Q 236,222 212,222 H 95', dur: '2.7s', delay: '0.5s' },
            { d: 'M 460,42 H 385 Q 365,42 365,62 V 124 Q 365,144 345,144 H 190 C 140,144 108,104 108,52', dur: '3.6s', delay: '0.9s' },
          ].map((rt, idx) => (
            <g key={idx}>
              <path d={rt.d} fill="none" stroke="rgba(232,222,205,0.16)" strokeWidth="7" strokeLinecap="round" />
              <path
                d={rt.d}
                fill="none"
                stroke="url(#p1Trail)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="95 420"
              >
                <animate attributeName="stroke-dashoffset" from="515" to="0" dur={rt.dur} begin={rt.delay} repeatCount="indefinite" />
              </path>
              <circle r="5.5" fill="#FF742E">
                <animateMotion dur={rt.dur} begin={rt.delay} repeatCount="indefinite" path={rt.d} />
              </circle>
              <circle r="12" fill="none" stroke="#FF742E" strokeWidth="1.6" opacity="0.65">
                <animateMotion dur={rt.dur} begin={rt.delay} repeatCount="indefinite" path={rt.d} />
                <animate attributeName="r" values="5;17" dur="1.1s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.9;0" dur="1.1s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}

          {/* Waypoint Hubs */}
          {[
            [326, 145, 'تقاطع مرکزی'],
            [150, 62, 'ایستگاه شمال'],
            [42, 188, 'پایانه غرب'],
          ].map(([cx, cy, label], i) => (
            <g key={i} transform={`translate(${cx},${cy})`}>
              <rect x="-8" y="-8" width="16" height="16" rx="5" fill="#102333" stroke="#E8DECD" strokeWidth="2" />
              <rect x="-3" y="-3" width="6" height="6" rx="2" fill="#FF742E" />
              <text x="0" y="-14" textAnchor="middle" fill="#E8DECD" fontSize="10" fontWeight="700">
                {label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

/* Pattern 02: 74.7 deg Radar Cone & 31.25% Squircle Sonar */
function PatternSquircleRadar() {
  const [angle, setAngle] = useState(0);

  useEffect(() => {
    let raf;
    let t0 = performance.now();
    const step = (now) => {
      const dt = (now - t0) / 1000;
      t0 = now;
      setAngle((a) => (a + dt * 68) % 360);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  const vehicles = [
    { id: 'کامیون ۱۰۴', x: 68, y: 30, deg: 325, speed: '۸۲' },
    { id: 'وانت ۲۰۹', x: 26, y: 66, deg: 145, speed: '۶۴' },
    { id: 'کشنده ۳۱۲', x: 74, y: 72, deg: 42, speed: '۹۱' },
  ];

  return (
    <div className="cad-card">
      <div style={{ marginBottom: 12 }}>
        <span className="kaf-slash-tag">پترن ۰۲ · مخروط رادار ۷۴.۷° و سونار اسکوئیرکل</span>
        <h3 style={{ fontSize: 19, fontWeight: 800, marginTop: 8 }}>پرتو دید مخروطی رقم «۷» و امواج اسکوئیرکل</h3>
      </div>

      <p style={{ fontSize: 14, color: 'var(--beige-muted)', marginBottom: 14 }}>
        ترکیب <strong>مخروط متقارن رقم «۷» فونت پیدا (<span className="ltr-code">30.6° aperture</span>)</strong> با <strong>شعاع اسکوئیرکل <span className="ltr-code">31.25%</span></strong> قاب گرادیان و حلقه رقم «۰»؛ امواج رادار به جای دایره کلیشه‌ای، اسکوئیرکل هستند!
      </p>

      <div
        className="cad-stage"
        style={{
          height: 250,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle at center, #163147 0%, #07111A 78%)',
        }}
      >
        {/* Concentric Squircle Radar Rings */}
        {[76, 136, 198].map((sz, idx) => (
          <div
            key={sz}
            style={{
              position: 'absolute',
              width: sz,
              height: sz,
              borderRadius: '31.25%',
              border: '1px solid rgba(232,222,205,0.16)',
              pointerEvents: 'none',
            }}
          />
        ))}

        {/* Expanding Live Squircle Sonar Pulse */}
        <div
          style={{
            position: 'absolute',
            insetInlineStart: '50%',
            top: '50%',
            width: 84,
            height: 84,
            borderRadius: '31.25%',
            border: '2px solid rgba(255,116,46,0.65)',
            animation: 'squirclePing 2.4s ease-out infinite',
            pointerEvents: 'none',
          }}
        />

        {/* Rotating 30.6 deg Radar Cone (derived from Peyda '۷' 74.7 deg arms!) */}
        <div
          style={{
            position: 'absolute',
            width: 210,
            height: 210,
            borderRadius: '31.25%',
            background: `conic-gradient(from ${angle}deg, rgba(255,116,46,0.42) 0deg, rgba(255,116,46,0.08) 22deg, transparent 31deg, transparent 360deg)`,
            pointerEvents: 'none',
          }}
        />

        {/* Center Command Hub */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '31.25%',
            background: '#FF742E',
            boxShadow: '0 0 24px rgba(255,116,46,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}
        >
          <Radar size={17} color="#102333" />
        </div>

        {/* Fleet Vehicle Blips */}
        {vehicles.map((v) => {
          const diff = ((angle - v.deg + 360) % 360);
          const active = diff < 65;
          return (
            <div
              key={v.id}
              style={{
                position: 'absolute',
                direction: 'ltr',
                insetInlineStart: `${v.x}%`,
                top: `${v.y}%`,
                transform: `translate(-50%, -50%) scale(${active ? 1.14 : 0.94})`,
                transition: 'all 0.25s cubic-bezier(0.34, 1.45, 0.64, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 4,
                  background: active ? '#FF742E' : '#E8DECD',
                  boxShadow: active ? '0 0 16px #FF742E' : 'none',
                }}
              />
              <div
                style={{
                  padding: '3px 8px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  background: active ? 'rgba(255,116,46,0.22)' : 'rgba(10,22,33,0.75)',
                  border: active ? '1px solid #FF742E' : '1px solid rgba(232,222,205,0.16)',
                  whiteSpace: 'nowrap',
                }}
              >
                {v.id} · {v.speed} km/h
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Pattern 03: Magnetic 21x7 Nuqta-to-Capsule Depth Field */
function PatternMagneticNuqtaGrid() {
  const [cursor, setCursor] = useState({ col: 7, row: 3, active: false });

  const cols = 15;
  const rows = 6;

  return (
    <div className="cad-card">
      <div style={{ marginBottom: 12 }}>
        <span className="kaf-slash-tag">پترن ۰۳ · میدان مغناطیسی نقطه‌های مربعی پیدا</span>
        <h3 style={{ fontSize: 19, fontWeight: 800, marginTop: 8 }}>دگردیسی زنده نقطه مربعی ۱×۱ به کپسول ۲×۱</h3>
      </div>

      <p style={{ fontSize: 14, color: 'var(--beige-muted)', marginBottom: 14 }}>
        ماوس را روی ماتریس حرکت دهید: <strong>نقطه‌های مربعی فونت پیدا (<span className="ltr-code">1:1 Square Nuqta</span>)</strong> در شعاع میدان سیگنال خودرو بالا می‌آیند و به <strong>کپسول‌های <span className="ltr-code">2u × 1u</span> لوگوتایپ</strong> تبدیل می‌شوند!
      </p>

      <div
        className="cad-stage"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const c = ((e.clientX - r.left) / r.width) * (cols - 1);
          const rw = ((e.clientY - r.top) / r.height) * (rows - 1);
          setCursor({ col: c, row: rw, active: true });
        }}
        onMouseLeave={() => setCursor((prev) => ({ ...prev, active: false }))}
        style={{
          height: 250,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '26px 28px',
          direction: 'ltr', // geometric coordinate canvas
          cursor: 'crosshair',
        }}
      >
        {Array.from({ length: rows }).map((_, rIdx) => (
          <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {Array.from({ length: cols }).map((__, cIdx) => {
              const dist = Math.hypot(cIdx - cursor.col, rIdx - cursor.row);
              const prox = clamp01(1 - dist / 3.4);
              const w = 8 + prox * 16; // 8px square -> 24px 2u*1u capsule!
              return (
                <div
                  key={cIdx}
                  style={{
                    width: w,
                    height: 8,
                    borderRadius: prox > 0.25 ? 999 : 2,
                    background: prox > 0.35 ? '#FF742E' : `rgba(232, 222, 205, ${0.18 + prox * 0.65})`,
                    transform: `translateY(${-prox * 9}px) scale(${1 + prox * 0.2})`,
                    boxShadow: prox > 0.45 ? '0 6px 16px rgba(255,116,46,0.55)' : 'none',
                    transition: 'width 0.16s ease, transform 0.16s ease, background 0.16s ease',
                  }}
                />
              );
            })}
          </div>
        ))}

        <div
          style={{
            position: 'absolute',
            bottom: 10,
            insetInlineEnd: 16,
            direction: 'rtl',
            fontSize: 12,
            color: 'rgba(232,222,205,0.72)',
            pointerEvents: 'none',
          }}
        >
          {cursor.active ? 'میدان فعال: دگردیسی زنده نقطه به کپسول مسیر' : 'ماوس را روی شبکه بکشید تا موج تله‌متری را حس کنید'}
        </div>
      </div>
    </div>
  );
}

/* Pattern 04: Golden Saddle 2x2 3D Tilt Bento + 140.24deg Clearcoat Glare */
function PatternGoldenBento3D() {
  const [tilt, setTilt] = useState({ x: 0, y: 0, gx: 30, gy: 20 });

  return (
    <div className="cad-card">
      <div style={{ marginBottom: 12 }}>
        <span className="kaf-slash-tag">پترن ۰۴ · کارت‌های سه‌بعدی زین طلایی و بازتاب افق</span>
        <h3 style={{ fontSize: 19, fontWeight: 800, marginTop: 8 }}>توپولوژی ۲×۲ لوگو + حجم بالشتکی و پخ تراش‌خورده</h3>
      </div>

      <p style={{ fontSize: 14, color: 'var(--beige-muted)', marginBottom: 14 }}>
        چیدمان دقیقاً از <strong>تقارن قطری لوگو (<span className="ltr-code">Solid / Open</span> در تراز طلایی <span className="ltr-code">38.1%</span>)</strong> و بازتاب نوری <span className="ltr-code">140.24°</span> بدنه خودرو تبعیت می‌کند. ماوس را روی کارت‌ها بچرخانید!
      </p>

      <div
        className="cad-stage"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width;
          const ny = (e.clientY - r.top) / r.height;
          setTilt({
            x: (ny - 0.5) * -16,
            y: (nx - 0.5) * 18,
            gx: nx * 100,
            gy: ny * 100,
          });
        }}
        onMouseLeave={() => setTilt({ x: 0, y: 0, gx: 30, gy: 20 })}
        style={{
          height: 250,
          perspective: '850px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: '0.95fr 1.25fr', // Echoing 38.1% : 61.9% golden split!
            gap: 12,
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.14s ease-out',
          }}
        >
          {/* Q2 Solid Cushion Card (Inflate 76%) */}
          <div
            style={{
              borderRadius: '24px 8px 8px 8px', // Outer ramp arch!
              background: `radial-gradient(circle at ${tilt.gx}% ${tilt.gy}%, rgba(255,255,255,0.18), transparent 60%), linear-gradient(140.24deg, #3D5768 0%, #112835 42%, #213D4F 79%, #132D3F 100%)`,
              border: '1px solid rgba(232,222,205,0.28)',
              boxShadow: '0 14px 28px rgba(0,0,0,0.45), inset 0 2px 3px rgba(255,255,255,0.25)',
              padding: '12px 16px',
              transform: 'translateZ(22px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 12, color: '#FFB085', fontWeight: 700 }}>حجم بالشتکی (Inflate ۷۶٪)</div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>پوشش سراسری GPS</div>
          </div>

          <div
            style={{
              borderRadius: 16,
              background: 'rgba(16, 35, 51, 0.35)',
              border: '1px dashed rgba(232,222,205,0.22)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--beige-muted)' }}>فضای باز تنفس (Q1)</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{toFa('۹۹.۹۸٪')} آپ‌تایم</div>
            </div>
            <ShieldCheck size={22} color="#E8DECD" opacity={0.75} />
          </div>

          <div
            style={{
              borderRadius: 16,
              background: 'rgba(16, 35, 51, 0.35)',
              border: '1px dashed rgba(232,222,205,0.22)',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: 'var(--beige-muted)' }}>دالان داده زنده (Q3)</div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>پایش سوخت و دما</div>
            </div>
            <Truck size={22} color="#FF742E" />
          </div>

          <div
            style={{
              borderRadius: '8px 8px 8px 32px',
              background: '#FF742E',
              color: '#060E16',
              border: '2px solid rgba(255,255,255,0.45)',
              boxShadow: '0 16px 34px rgba(255,116,46,0.38), inset 0 -4px 8px rgba(16,35,51,0.25)',
              padding: '14px 16px',
              transform: 'translateZ(28px)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800 }}>پخ تراش‌خورده (Bevel ۶۰٪)</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>فرماندهی لحظه‌ای ناوگان</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Pattern 05: 26.84 deg Kaf Sarkesh Velocity Telemetry Bar */
function PatternVelocitySlash() {
  const [rpm, setRpm] = useState(72);

  useEffect(() => {
    const id = setInterval(() => {
      setRpm((prev) => {
        const next = prev + (Math.random() > 0.48 ? 6 : -5);
        return Math.max(45, Math.min(96, next));
      });
    }, 650);
    return () => clearInterval(id);
  }, []);

  const totalBars = 22;
  const litBars = Math.round((rpm / 100) * totalBars);

  return (
    <div className="cad-card">
      <div style={{ marginBottom: 12 }}>
        <span className="kaf-slash-tag">پترن ۰۵ · نوار شتاب با زاویه ۲۶.۸۴° سرکش «ک»</span>
        <h3 style={{ fontSize: 19, fontWeight: 800, marginTop: 8 }}>ریتم مورب فونت پیدا برای شاخص‌های سرعت و بار</h3>
      </div>

      <p style={{ fontSize: 14, color: 'var(--beige-muted)', marginBottom: 14 }}>
        استخراج‌شده از <strong>زاویه دقیق سرکش حرف «ک/گ» فونت پیدا (<span className="ltr-code">26.84°</span>)</strong> و برش‌های تخت صفر درجه؛ ایده‌آل برای نوارهای پیشرفت، دور موتور، سلامت باتری و جداکننده سکشن‌ها.
      </p>

      <div className="cad-stage" style={{ height: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--beige-muted)' }}>شاخص راندمان لحظه‌ای ناوگان فعال</div>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#E8DECD' }}>
              {toFa(rpm)}<span style={{ fontSize: 16, color: '#FF742E', marginInlineStart: 4 }}>٪ بازدهی مسیر</span>
            </div>
          </div>
          <span className="ltr-code" style={{ color: '#FFB085', fontSize: 12 }}>skewX(-26.84deg)</span>
        </div>

        <div style={{ display: 'flex', gap: 7, alignItems: 'center', padding: '6px 8px' }}>
          {Array.from({ length: totalBars }).map((_, i) => {
            const active = i < litBars;
            const hot = i >= totalBars - 5 && active;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 36,
                  borderRadius: 4,
                  transform: 'skewX(-26.84deg)',
                  background: hot
                    ? '#FF742E'
                    : active
                    ? 'linear-gradient(180deg, #E8DECD 0%, #9EB6C7 100%)'
                    : 'rgba(232,222,205,0.09)',
                  boxShadow: hot ? '0 0 16px rgba(255,116,46,0.75)' : 'none',
                  transition: 'all 0.25s ease',
                }}
              />
            );
          })}
        </div>

        <input
          type="range"
          className="cinema-range"
          min="15"
          max="100"
          value={rpm}
          onChange={(e) => setRpm(Number(e.target.value))}
        />
      </div>
    </div>
  );
}

/* Pattern 06: Interactive Scroll-Lock Section Gate */
function PatternScrollAssemblyGate() {
  const [lockVal, setLockVal] = useState(1);

  return (
    <div className="cad-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
        <div>
          <span className="kaf-slash-tag">پترن ۰۶ · ترنزیشن قفل مغناطیسی سکشن‌ها در اسکرول</span>
          <h3 style={{ fontSize: 19, fontWeight: 800, marginTop: 8 }}>ورود همگرای آیکون‌ها و تیترها هنگام اسکرول صفحه</h3>
        </div>
        <button
          className="chip-btn on"
          onClick={() => {
            setLockVal(0);
            setTimeout(() => setLockVal(1), 80);
          }}
        >
          تست انفجار و قفل فنری
        </button>
      </div>

      <p style={{ fontSize: 14, color: 'var(--beige-muted)', marginBottom: 14 }}>
        در وب‌سایت نهایی، هر سکشن هنگام ورود به دید کاربر از ۴ لایه عمق‌دار با فنر برگشتی (<span className="ltr-code">spring overshoot</span>) چفت می‌شود و حس یک قطعه صنعتی دقیق را منتقل می‌کند.
      </p>

      <div className="cad-stage" style={{ height: 220, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <div style={{ width: 92, height: 126, position: 'relative', perspective: 500 }}>
            {LOGO_PARTS.map((pt, i) => {
              const k = 1 - lockVal;
              const dirs = [
                [-46, -34, -18],
                [-38, 42, -12],
                [48, -36, 15],
                [44, 38, 18],
              ][i];
              return (
                <svg
                  key={pt.id}
                  viewBox="0 0 234.21 324.76"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                    transform: `translate3d(${dirs[0] * k}px, ${dirs[1] * k}px, ${k * 80}px) rotate(${dirs[2] * k}deg)`,
                    transition: lockVal === 1 ? `transform 0.75s cubic-bezier(0.34, 1.52, 0.64, 1) ${i * 0.06}s` : 'none',
                  }}
                >
                  <path d={pt.d} fill={i === 3 ? '#FF742E' : pt.color} />
                </svg>
              );
            })}
          </div>

          <div style={{ maxWidth: 290 }}>
            <div style={{ fontSize: 12, color: '#FF742E', fontWeight: 800 }}>قفل هندسی در کسری از ثانیه</div>
            <div style={{ fontSize: 20, fontWeight: 900, margin: '4px 0' }}>امنیت یکپارچه بار و خودرو</div>
            <div style={{ fontSize: 12.5, color: 'var(--beige-muted)' }}>
              اسلایدر زیر را بکشید تا نحوه باز و بسته شدن قطعات را با اسکرول کاربر ببینید:
            </div>
          </div>
        </div>

        <input
          type="range"
          className="cinema-range"
          style={{ maxWidth: 380 }}
          min="0"
          max="100"
          value={Math.round(lockVal * 100)}
          onChange={(e) => setLockVal(Number(e.target.value) / 100)}
        />
      </div>
    </div>
  );
}

function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export default function DerivedPatternsLab() {
  return (
    <div>
      <div className="cad-card" style={{ marginBottom: 24, background: 'var(--horizon-gradient)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div className="kaf-slash-tag" style={{ marginBottom: 8 }}>
              <Sparkles size={14} />
              <span>گام ۰۲ · استخراج پترن‌های اختصاصی وب‌سایت از دل هندسه برند</span>
            </div>
            <h2 style={{ fontSize: 26, fontWeight: 900 }}>
              ۶ پترن سه‌بعدی و حرکتی برای وب‌سایت ردیابی خودرو، GPS و مدیریت ناوگان
            </h2>
            <p style={{ fontSize: 14.5, color: 'var(--beige-muted)', marginTop: 4 }}>
              هیچ‌کدام از این پترن‌ها تزئینی یا تصادفی نیستند؛ تک‌تک زوایا، شعاع‌ها، منحنی‌ها و انیمیشن‌ها مستقیماً از کالبدشکافی لوگو، لوگوتایپ، فونت پیدا و فایل‌های سه‌بعدی شما متولد شده‌اند.
            </p>
          </div>
        </div>
      </div>

      <div className="patterns-grid">
        <PatternClothoidRoutes />
        <PatternSquircleRadar />
        <PatternMagneticNuqtaGrid />
        <PatternGoldenBento3D />
        <PatternVelocitySlash />
        <PatternScrollAssemblyGate />
      </div>
    </div>
  );
}
