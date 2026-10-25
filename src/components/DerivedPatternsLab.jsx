import React, { useEffect, useState } from 'react';
import { Radar, ShieldCheck, Truck, Navigation } from 'lucide-react';
import { Button, Card, Capsule, Gauge, IranPlate, StatusChip } from '../ds/index.js';
import { usePrefersReducedMotion } from '../utils/usePrefersReducedMotion.js';
import { toFa } from '../utils/faDigits.js';

function PatternClothoidRoute() {
  const [tVal, setTVal] = useState(0.72);

  return (
    <Card variant="panel" className="ds-stack-md">
      <div className="ds-stack-xs">
        <Capsule variant="slash">پترن ۰۱ · بزرگراه کلوتوئیدی و سیگنال زنده</Capsule>
        <h3>پیوستگی انحنا (G2) الهام‌گرفته از کمان Q2 لوگو</h3>
      </div>

      <p className="ds-muted">
        مسیرهای حرکت خودرو روی نقشه با پیوستگی نرم رسم می‌شوند و سیگنال نارنجی موقعیت لحظه‌ای را نشان می‌دهد.
      </p>

      <div className="cad-stage">
        <svg viewBox="0 0 520 190" className="lab-svg-canvas" role="img" aria-label="نمودار مسیر کلوتوئیدی">
          <path
            d="M 470,145 H 320 Q 280,145 280,105 V 65 Q 280,35 240,35 H 70"
            fill="none"
            stroke="var(--ds-sand-300)"
            strokeOpacity="0.2"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 470,145 H 320 Q 280,145 280,105 V 65 Q 280,35 240,35 H 70"
            fill="none"
            stroke="var(--ds-color-signal-orange)"
            strokeWidth="6"
            strokeLinecap="round"
            pathLength="1"
            strokeDasharray="1"
            strokeDashoffset={1 - tVal}
          />
        </svg>
      </div>

      <div className="ds-row-md">
        <label htmlFor="pat1-range" className="ds-muted">پیشرفت سیگنال:</label>
        <input
          id="pat1-range"
          type="range"
          className="cinema-range"
          min="0"
          max="100"
          value={Math.round(tVal * 100)}
          onChange={(e) => setTVal(Number(e.target.value) / 100)}
        />
        <strong className="ds-accent-text ds-tabular">{toFa(Math.round(tVal * 100))}٪</strong>
      </div>
    </Card>
  );
}

function PatternSquircleRadar() {
  const reducedMotion = usePrefersReducedMotion();
  const [angle, setAngle] = useState(32);

  useEffect(() => {
    if (reducedMotion) return undefined;
    let raf;
    let last = performance.now();
    const step = (now) => {
      const dt = (now - last) / 1000;
      last = now;
      setAngle((a) => (a + dt * 54) % 360);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

  const vehicles = [
    { id: 'TR-108', speed: '۸۶', x: 74, y: 30, deg: 35 },
    { id: 'CD-204', speed: '۷۹', x: 26, y: 68, deg: 215 },
  ];

  return (
    <Card variant="panel" className="ds-stack-md">
      <div className="ds-stack-xs">
        <Capsule variant="slash">پترن ۰۲ · رادار چهارگوش‌نرم و مخروط ۳۰.۶°</Capsule>
        <h3>حلقه‌های هم‌مرکز ۳۱.۲۵٪ و اسکن زاویه‌ای</h3>
      </div>

      <p className="ds-muted">
        حلقه‌های سونار از فرم چهارگوش‌نرم پیروی می‌کنند و دهانه پرتو از زاویه درونی رقم «۷» فونت پیدا الگوبرداری شده است.
      </p>

      <div className="cad-stage lab-pattern-stage">
        {[110, 190].map((sz) => (
          <div key={sz} className="radar-ring" style={{ '--ring-size': `${sz}px` }} />
        ))}
        <div className="radar-sweep-cone" style={{ '--radar-deg': `${angle}deg` }} />

        <div className="timeline-step-num">
          <Radar size={18} aria-hidden="true" />
        </div>

        {vehicles.map((v) => {
          const diff = (angle - v.deg + 360) % 360;
          const active = diff < 65;
          return (
            <div
              key={v.id}
              className={`lab-radar-blip ${active ? 'is-active' : ''}`}
              style={{ '--blip-x': `${v.x}%`, '--blip-y': `${v.y}%` }}
            >
              <span className="lab-radar-blip__dot" />
              <span className="lab-radar-blip__label ds-tabular">
                {v.id} · {v.speed} km/h
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function PatternNuqtaMorph() {
  const [col, setCol] = useState(5);

  return (
    <Card variant="panel" className="ds-stack-md">
      <div className="ds-stack-xs">
        <Capsule variant="slash">پترن ۰۳ · تبدیل نقطه مربعی ۱:۱ به کپسول مسیر</Capsule>
        <h3>ماتریس واکنش‌گرا بر پایه نقطه مربعی فونت پیدا</h3>
      </div>

      <p className="ds-muted">
        نقطه‌های شبکه در حالت سکون مربع هستند و در مجاورت سیگنال به کپسول کشیده تبدیل می‌شوند.
      </p>

      <div
        className="cad-stage"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setCol(((e.clientX - r.left) / r.width) * 12);
        }}
      >
        <div className="ds-stack-sm">
          {Array.from({ length: 3 }).map((_, rIdx) => (
            <div key={rIdx} className="footer-nuqta-row">
              {Array.from({ length: 12 }).map((__, cIdx) => {
                const prox = Math.max(0, Math.min(1, 1 - Math.abs(cIdx - col) / 3));
                const w = Math.round(8 + prox * 20);
                return (
                  <span
                    key={cIdx}
                    className={`footer-nuqta-dot ${prox > 0.35 ? 'is-near' : ''}`}
                    style={{ '--dot-w': `${w}px` }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function PatternGoldenBento3D() {
  return (
    <Card variant="panel" className="ds-stack-md">
      <div className="ds-stack-xs">
        <Capsule variant="slash">پترن ۰۴ · چیدمان ۲×۲ زین طلایی و بازتاب افق</Capsule>
        <h3>هم‌نشینی کارت‌های بالشتکی و پخ‌خورده</h3>
      </div>

      <p className="ds-muted">
        چیدمان متناوب دو ربع پر و دو ربع باز با واکنش سه‌بعدی ماوس (Tilt) روی کارت‌های مشترک سامانه طراحی:
      </p>

      <div className="kpi-2-grid">
        <Card variant="chisel" compact tilt className="ds-stack-xs">
          <span className="ds-accent-soft-text">حجم پخ‌خورده (Bevel ۶۰٪)</span>
          <strong>پوشش سراسری GPS</strong>
        </Card>
        <Card variant="glass" compact className="ds-between">
          <div className="ds-stack-xs">
            <span className="ds-muted">فضای باز تنفس (Q1)</span>
            <strong className="ds-tabular">{toFa('۹۹.۹۸٪')} آپ‌تایم</strong>
          </div>
          <ShieldCheck size={20} className="ds-accent-soft-text" aria-hidden="true" />
        </Card>
        <Card variant="glass" compact className="ds-between">
          <div className="ds-stack-xs">
            <span className="ds-muted">دالان تله‌متری (Q3)</span>
            <strong>پایش سوخت و دما</strong>
          </div>
          <Truck size={20} className="ds-accent-text" aria-hidden="true" />
        </Card>
        <Card variant="cushion" compact tilt className="ds-stack-xs">
          <span>حجم بالشتکی روشن (Inflate ۷۶٪)</span>
          <strong>کنتراست روز ۱۲.۰۳:۱</strong>
        </Card>
      </div>
    </Card>
  );
}

function PatternKafGauge() {
  const [rpm, setRpm] = useState(72);

  return (
    <Card variant="panel" className="ds-stack-md">
      <div className="ds-stack-xs">
        <Capsule variant="slash">پترن ۰۵ · گیج مورب ۲۶.۸۴- درجه سرکش «ک»</Capsule>
        <h3>نشانگر سگمنتی سوخت، دور موتور و ایمنی راننده</h3>
      </div>

      <p className="ds-muted">
        کامپوننت مشترک <span className="ltr-code">Gauge</span> زاویه سرکش «ک» فونت پیدا را روی نوارهای تله‌متری پیاده می‌کند:
      </p>

      <div className="cad-stage ds-stack-md">
        <Gauge
          segments={16}
          activeCount={Math.round((rpm / 100) * 16)}
          label="فشار کاری پیشرانه کشنده"
          value={`${toFa(rpm)}٪`}
          tone={rpm > 80 ? 'accent' : 'moving'}
        />
        <input
          type="range"
          aria-label="تغییر درصد گیج آزمایشی"
          className="cinema-range"
          min="0"
          max="100"
          value={rpm}
          onChange={(e) => setRpm(Number(e.target.value))}
        />
      </div>
    </Card>
  );
}

function PatternPlateAndControls() {
  return (
    <Card variant="panel" className="ds-stack-md">
      <div className="ds-stack-xs">
        <Capsule variant="slash">پترن ۰۶ · پلاک ملی ایران و کنترل‌های لمسی ۴۴ پیکسل</Capsule>
        <h3>یکپارچگی اجزای بومی ناوگان در کامپوننت‌های مشترک</h3>
      </div>

      <p className="ds-muted">
        پلاک خودروهای سنگین و شهری، نشانگرهای وضعیت غیررنگی و دکمه‌های لمسی مستقیماً از <span className="ltr-code">src/ds/</span> فراخوانی می‌شوند:
      </p>

      <div className="cad-stage ds-stack-md">
        <div className="ds-row-wrap">
          <IranPlate left2="۴۸" letter="ع" mid3="۷۹۲" iranCode="۱۱" variant="public" />
          <IranPlate left2="۲۶" letter="ط" mid3="۴۱۵" iranCode="۶۸" variant="private" />
        </div>
        <div className="ds-row-wrap">
          <StatusChip status="moving" label="در حرکت پایدار" />
          <StatusChip status="idle" label="توقف با موتور روشن" />
          <StatusChip status="critical" label="خروج از مرز مجاز" />
        </div>
        <div>
          <Button variant="primary" size="sm">
            <Navigation size={15} aria-hidden="true" />
            <span>ارسال فرمان به واحد ناوگان</span>
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function DerivedPatternsLab() {
  return (
    <section className="fleet-section">
      <div className="section-grid">
        <PatternClothoidRoute />
        <PatternSquircleRadar />
        <PatternNuqtaMorph />
        <PatternGoldenBento3D />
        <PatternKafGauge />
        <PatternPlateAndControls />
      </div>
    </section>
  );
}
