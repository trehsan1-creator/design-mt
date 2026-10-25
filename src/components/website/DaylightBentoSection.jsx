import React, { useState } from 'react';
import { Fuel, ShieldAlert, Award, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toFa } from '../../utils/faDigits.js';

function TiltCard({ children, className, style }) {
  const [rot, setRot] = useState({ x: 0, y: 0 });
  return (
    <div
      className={className}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        setRot({ x: -ny * 9, y: nx * 11 });
      }}
      onMouseLeave={() => setRot({ x: 0, y: 0 })}
      style={{
        ...style,
        transform: `perspective(900px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`,
        transition: 'transform 0.16s ease-out',
      }}
    >
      {children}
    </div>
  );
}

export default function DaylightBentoSection() {
  const [theftTest, setTheftTest] = useState(false);
  const [outsideFence, setOutsideFence] = useState(false);

  return (
    <section id="smart-features" className="daylight-section">
      <div className="site-container">
        {/* Section Header on Warm Beige (#E8DECD -> 12.03:1 AAA contrast with #102333!) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 34 }}>
          <div style={{ maxWidth: 720 }}>
            <div className="eyebrow-kaf on-light">
              <Activity size={15} color="#FF742E" />
              <span>هوش عملیاتی روزانه · کنتراست قطبی سرمه‌ای روی بژ گرم (۱۲.۰۳:۱)</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 900, lineHeight: 1.25, color: '#102333' }}>
              فراتر از یک نقطه روی نقشه؛{' '}
              <span
                style={{
                  background: '#102333',
                  color: '#FF742E',
                  padding: '2px 14px',
                  borderRadius: 14,
                  display: 'inline-block',
                }}
              >
                نگهبان هوشمند دارایی شما
              </span>
            </h2>
          </div>

          <p style={{ maxWidth: 420, fontSize: 14.5, color: 'rgba(16,35,51,0.78)', fontWeight: 500 }}>
            کارت‌های زیر بر اساس توپولوژی ۲×۲ لوگو (ترکیب کارت‌های بالشتکی روشن و کارت‌های پخ‌خورده سرمه‌ای) ساخته شده‌اند. ماوس را روی کارت‌ها حرکت دهید!
          </p>
        </div>

        {/* Row 1 of 2x2 Golden Saddle Bento */}
        <div className="bento-golden-grid" style={{ marginBottom: 22 }}>
          {/* Q2: Chiseled Clearcoat Dark Card — Smart Fuel Theft Detection */}
          <TiltCard className="chisel-card-navy">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
              <div>
                <span className="kaf-slash-tag">سنسور اولتراسونیک باک · دقت ۹۹.۵٪</span>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>تشخیص آنی سرقت و تخلیه غیرمجاز سوخت</h3>
              </div>

              <button
                onClick={() => setTheftTest(!theftTest)}
                className="btn-3d-orange"
                style={{ padding: '8px 14px', fontSize: 12 }}
              >
                {theftTest ? 'بازنشانی نمودار' : 'شبیه‌سازی افت ناگهانی باک'}
              </button>
            </div>

            <p style={{ fontSize: 14, color: 'rgba(232,222,205,0.8)', marginBottom: 18 }}>
              الگوریتم هوش مصنوعی نوسان طبیعی جاده را از سرقت واقعی تفکیک می‌کند و در کمتر از ۳ ثانیه هشدار پیامکی و آژیر کابین را فعال می‌سازد.
            </p>

            {/* Live Fuel Curve SVG */}
            <div style={{ background: 'rgba(6, 14, 22, 0.65)', borderRadius: 18, padding: '16px 18px', border: '1px solid rgba(232,222,205,0.12)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 8 }}>
                <span>سطح باک کشنده FH500 (ظرفیت ۸۰۰ لیتر)</span>
                <span style={{ color: theftTest ? '#FF742E' : '#4ADE80', fontWeight: 800 }}>
                  {theftTest ? '⚠ هشدار: افت ناگهانی ۶۵ لیتر در توقف!' : '● مصرف یکنواخت جاده‌ای'}
                </span>
              </div>

              <svg viewBox="0 0 480 96" style={{ width: '100%', height: 'auto' }}>
                <line x1="0" y1="84" x2="480" y2="84" stroke="rgba(232,222,205,0.15)" />
                <path
                  d={
                    theftTest
                      ? 'M 10,18 Q 110,24 210,30 L 222,74 Q 330,78 470,82'
                      : 'M 10,18 C 140,26 310,40 470,54'
                  }
                  fill="none"
                  stroke={theftTest ? '#FF742E' : '#4ADE80'}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {theftTest && (
                  <g transform="translate(222, 74)">
                    <circle r="14" fill="rgba(255,116,46,0.28)" />
                    <circle r="6" fill="#FF742E" />
                    <text x="12" y="-10" fill="#FFB085" fontSize="11" fontWeight="800">نقطه تخلیه غیرمجاز</text>
                  </g>
                )}
              </svg>
            </div>
          </TiltCard>

          {/* Q1: Tactile Cushion Light Card — Interactive Squircle Geofence */}
          <TiltCard className="cushion-card-light">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span
                style={{
                  background: '#102333',
                  color: '#E8DECD',
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                حصار جغرافیایی اسکوئیرکل (Geofence)
              </span>
              <button
                onClick={() => setOutsideFence(!outsideFence)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 10,
                  border: '1.5px solid #102333',
                  background: outsideFence ? '#FF742E' : 'transparent',
                  color: '#102333',
                  fontWeight: 800,
                  fontSize: 12,
                }}
              >
                {outsideFence ? 'بازگرداندن خودرو به محدوده' : 'تست خروج از محدوده مجاز'}
              </button>
            </div>

            <h3 style={{ fontSize: 21, fontWeight: 900, marginBottom: 8 }}>مرزبندی هوشمند انبار، معدن و کریدور</h3>
            <p style={{ fontSize: 13.5, color: 'rgba(16,35,51,0.78)', marginBottom: 14 }}>
              محدوده‌های مجاز را روی نقشه رسم کنید؛ به محض خروج خودرو از مرز اسکوئیرکل، فرمان هشدار صادر می‌شود:
            </p>

            <div
              style={{
                height: 136,
                borderRadius: 20,
                background: '#102333',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              {/* Allowed Squircle Zone */}
              <div
                style={{
                  width: 112,
                  height: 100,
                  borderRadius: '31.25%',
                  border: `2px dashed ${outsideFence ? '#FF742E' : '#4ADE80'}`,
                  background: outsideFence ? 'rgba(255,116,46,0.12)' : 'rgba(74,222,128,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                  color: '#E8DECD',
                  fontWeight: 700,
                }}
              >
                محدوده مجاز
              </div>

              {/* Moving Vehicle Node */}
              <div
                style={{
                  position: 'absolute',
                  left: outsideFence ? '18%' : '50%',
                  top: outsideFence ? '28%' : '50%',
                  transform: 'translate(-50%, -50%)',
                  transition: 'all 0.55s cubic-bezier(0.34, 1.45, 0.64, 1)',
                  padding: '5px 10px',
                  borderRadius: 9,
                  background: outsideFence ? '#FF742E' : '#4ADE80',
                  color: '#102333',
                  fontWeight: 900,
                  fontSize: 11.5,
                  boxShadow: outsideFence ? '0 0 24px #FF742E' : 'none',
                }}
              >
                {outsideFence ? 'خروج غیرمجاز!' : 'داخل زون امن'}
              </div>
            </div>
          </TiltCard>
        </div>

        {/* Row 2 of 2x2 Golden Saddle Bento (Inverted Diagonal!) */}
        <div className="bento-golden-grid" style={{ gridTemplateColumns: '0.85fr 1.15fr' }}>
          {/* Q3: Tactile Cushion Light Card — Driver Behavior Scoring */}
          <TiltCard className="cushion-card-light">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '31.25%',
                  background: '#102333',
                  color: '#FF742E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Award size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: 19, fontWeight: 900 }}>امتیازدهی هوشمند رفتار رانندگان</h3>
                <div style={{ fontSize: 12, color: 'rgba(16,35,51,0.7)' }}>ترمز ناگهانی · شتاب تند · گردش تند در پیچ</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
              {[
                { name: 'محسن رضایی (کد ۱۰۸)', score: 96 },
                { name: 'بهرام کاظمی (کد ۲۰۴)', score: 91 },
                { name: 'امیرحسین مرادی (کد ۳۱۹)', score: 74 },
              ].map((dr, i) => (
                <div key={i} style={{ background: 'rgba(16,35,51,0.06)', padding: '10px 14px', borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 800, marginBottom: 6 }}>
                    <span>{dr.name}</span>
                    <span>امتیاز ایمنی: {toFa(dr.score)} از ۱۰۰</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 14 }).map((_, bi) => {
                      const on = bi < Math.round((dr.score / 100) * 14);
                      return (
                        <div
                          key={bi}
                          style={{
                            flex: 1,
                            height: 8,
                            borderRadius: 2,
                            transform: 'skewX(-26.84deg)',
                            background: on ? (dr.score < 80 ? '#FF742E' : '#102333') : 'rgba(16,35,51,0.14)',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>

          {/* Q4: Chiseled Navy Card — Predictive CAN-Bus Diagnostics */}
          <TiltCard className="chisel-card-navy">
            <span className="kaf-slash-tag">عیب‌یابی پیش‌بینانه موتور و دیاگ از راه دور (CAN-Bus)</span>
            <h3 style={{ fontSize: 22, fontWeight: 900, margin: '10px 0 8px' }}>
              قبل از خرابی در جاده، هشدار سرویس دریافت کنید
            </h3>
            <p style={{ fontSize: 14, color: 'rgba(232,222,205,0.8)', marginBottom: 18 }}>
              خوانش زنده کدهای خطای ECU، دمای آب، فشار روغن، ساعت کارکرد واقعی موتور و یادآور هوشمند تعویض لنت و تایر بر اساس کیلومترشمار دقیق ماهواره‌ای.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { label: 'سلامت باتری ناوگان', val: '۲۷.۸ ولت', badge: 'استاندارد' },
                { label: 'دمای میانگین موتور', val: '۸۶ درجه', badge: 'ایمن' },
                { label: 'کاهش خواب خودرو', val: '۴۲٪', badge: 'صرفه‌جویی' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: 18,
                    background: 'rgba(8, 19, 29, 0.65)',
                    border: '1px solid rgba(232,222,205,0.14)',
                  }}
                >
                  <div style={{ fontSize: 11.5, color: 'rgba(232,222,205,0.7)' }}>{item.label}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: idx === 2 ? '#FF742E' : '#E8DECD', margin: '4px 0' }}>
                    {item.val}
                  </div>
                  <span style={{ fontSize: 11, color: '#4ADE80', fontWeight: 700 }}>● {item.badge}</span>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
