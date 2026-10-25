import React, { useEffect, useState } from 'react';
import { Sun, Moon, Sparkles, Sliders, Gauge } from 'lucide-react';
import { PEYDA_WEIGHTS, LOGO_PATH_D } from '../data/geometryData.js';
import { toFa } from '../utils/faDigits.js';

const PRESET_TEXTS = [
  'ردیابی هوشمند ناوگان، در هر تپش جاده',
  'دقت میلی‌متری ماهواره در کالبد سه‌بعدی و زنده',
  'فرزام؛ هندسه حرکت، امنیت بار و فرماندهی مسیر',
  'سرعت ۹۴ کیلومتر · ۱۲۸ خودروی متصل · تأخیر ۰.۰۲ ثانیه',
];

export default function PeydaShowcase() {
  const [sampleText, setSampleText] = useState(PRESET_TEXTS[0]);
  const [weight, setWeight] = useState(800);
  const [fontSize, setFontSize] = useState(52);
  const [lightMode, setLightMode] = useState(false);
  const [kineticMode, setKineticMode] = useState('extrude'); // 'wave' | 'extrude' | 'clean'
  const [odoValue, setOdoValue] = useState(48291);

  // Live rolling Persian odometer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setOdoValue((v) => v + Math.floor(Math.random() * 4) + 1);
    }, 1100);
    return () => clearInterval(timer);
  }, []);

  const words = sampleText.split(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26, marginBottom: 28 }}>
      {/* 1. Interactive Live Persian Typography Stage */}
      <div className="cad-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div>
            <div className="kaf-slash-tag" style={{ marginBottom: 8 }}>
              <Sparkles size={14} />
              <span>آزمایشگاه زنده تایپوگرافی فارسی · خانواده فونت «پیدا» نسخه ۲.۰۰۰</span>
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 900 }}>
              نمایش زنده ۹ وزن فونت پیدا در قطبیت شب و روز برند
            </h2>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className={`chip-btn ${!lightMode ? 'on' : ''}`} onClick={() => setLightMode(false)}>
              <Moon size={13} style={{ verticalAlign: 'middle', marginInlineEnd: 5 }} />
              حالت شب راداری (#102333)
            </button>
            <button className={`chip-btn ${lightMode ? 'on' : ''}`} onClick={() => setLightMode(true)}>
              <Sun size={13} style={{ verticalAlign: 'middle', marginInlineEnd: 5 }} />
              حالت روز شنی (#E8DECD)
            </button>
          </div>
        </div>

        {/* Preset Slogans & Kinetic Mode */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_TEXTS.map((txt, i) => (
              <button
                key={i}
                className={`chip-btn ${sampleText === txt ? 'on' : ''}`}
                onClick={() => setSampleText(txt)}
              >
                نمونه {toFa(i + 1)}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className={`chip-btn ${kineticMode === 'extrude' ? 'on' : ''}`} onClick={() => setKineticMode('extrude')}>
              حجم سه‌بعدی پخ‌خورده
            </button>
            <button className={`chip-btn ${kineticMode === 'wave' ? 'on' : ''}`} onClick={() => setKineticMode('wave')}>
              موج فنری کلمات
            </button>
            <button className={`chip-btn ${kineticMode === 'clean' ? 'on' : ''}`} onClick={() => setKineticMode('clean')}>
              تایپوگرافی خالص
            </button>
          </div>
        </div>

        {/* Live Editable Stage */}
        <div
          style={{
            borderRadius: 28,
            padding: '44px 36px',
            minHeight: 230,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            transition: 'all 0.35s ease',
            background: lightMode
              ? 'linear-gradient(140.24deg, #F3ECE0 0%, #E8DECD 55%, #DDD0BA 100%)'
              : 'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)',
            color: lightMode ? '#102333' : '#E8DECD',
            border: lightMode ? '1px solid rgba(16,35,51,0.18)' : '1px solid rgba(232,222,205,0.2)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.25), 0 20px 50px rgba(0,0,0,0.3)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Lockup Eyebrow with Clean Emblem + Typography SVG */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg viewBox="0 0 234.21 324.76" style={{ height: 34, width: 'auto' }}>
                <path d={LOGO_PATH_D} fill="#FF742E" />
              </svg>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 999,
                  background: lightMode ? 'rgba(16,35,51,0.08)' : 'rgba(232,222,205,0.1)',
                }}
              >
                وزن فعلی: {toFa(weight)} · اندازه: {toFa(fontSize)} پیکسل · کنتراست ۱۲.۰۳:۱ AAA
              </span>
            </div>

            {/* Live Rolling Persian Odometer Pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 16px',
                borderRadius: 14,
                background: '#102333',
                color: '#E8DECD',
                border: '1px solid rgba(255,116,46,0.45)',
              }}
            >
              <Gauge size={16} color="#FF742E" />
              <span style={{ fontSize: 12, color: 'rgba(232,222,205,0.75)' }}>پیمایش زنده ناوگان:</span>
              <span style={{ fontWeight: 900, fontSize: 18, color: '#FF742E', letterSpacing: '0.04em' }}>
                {toFa(odoValue.toLocaleString('en-US'))}
              </span>
              <span style={{ fontSize: 12 }}>کیلومتر</span>
            </div>
          </div>

          {/* Animated Persian Display Headline */}
          <div
            style={{
              fontWeight: weight,
              fontSize: `clamp(26px, ${fontSize}px, 78px)`,
              lineHeight: 1.32,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.26em',
              textShadow:
                kineticMode === 'extrude'
                  ? lightMode
                    ? '0 1px 0 #fff, 0 2px 0 #cbbda6, 0 3px 0 #b8a88e, 0 4px 0 #a39276, 0 12px 24px rgba(16,35,51,0.22)'
                    : '0 1px 0 #2d4c63, 0 2px 0 #1f394c, 0 3px 0 #152938, 0 4px 0 #0c1924, 0 14px 28px rgba(0,0,0,0.62)'
                  : 'none',
            }}
          >
            {words.map((w, idx) => (
              <span
                key={`${w}-${idx}`}
                style={{
                  display: 'inline-block',
                  color: w.includes('ناوگان') || w.includes('فرزام') || w.includes('۹۴') || w.includes('سه‌بعدی') ? '#FF742E' : 'inherit',
                  animation:
                    kineticMode === 'wave'
                      ? `floatWord 2.4s ease-in-out ${idx * 0.14}s infinite`
                      : 'none',
                }}
              >
                {w}
              </span>
            ))}
          </div>

          {/* Custom Live Input */}
          <div style={{ marginTop: 26, display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="هر متن دلخواهی به فارسی بنویسید تا با فونت پیدا ببینید..."
              style={{
                flex: 1,
                minWidth: 260,
                padding: '11px 16px',
                borderRadius: 14,
                border: lightMode ? '1px solid rgba(16,35,51,0.22)' : '1px solid rgba(232,222,205,0.22)',
                background: lightMode ? 'rgba(255,255,255,0.65)' : 'rgba(8,19,29,0.62)',
                color: lightMode ? '#102333' : '#E8DECD',
                fontSize: 14.5,
                fontWeight: 500,
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 210 }}>
              <Sliders size={15} />
              <span style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>وزن ({toFa(weight)}):</span>
              <input
                type="range"
                className="cinema-range"
                min="100"
                max="900"
                step="100"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 190 }}>
              <span style={{ fontSize: 12.5, whiteSpace: 'nowrap' }}>ابعاد ({toFa(fontSize)}):</span>
              <input
                type="range"
                className="cinema-range"
                min="26"
                max="76"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full 9-Weight Scale Specimen & UI Hierarchy */}
      <div className="section-grid" style={{ marginBottom: 0 }}>
        <div className="cad-card">
          <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
            آبشار کامل ۹ وزن فونت «پیدا» (از ۱۰۰ نازک تا ۹۰۰ سیاه)
          </h3>
          <p style={{ fontSize: 14, color: 'var(--beige-muted)', marginBlockEnd: 16 }}>
            ضخامت پایه حرف «ا» از <strong style={{ color: '#FF742E' }}>۳۱ واحد</strong> در وزن نازک تا <strong style={{ color: '#FF742E' }}>۱۴۴ واحد</strong> در وزن سیاه (بازه دینامیکی ۴.۶۵ برابر) رشد می‌کند.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {PEYDA_WEIGHTS.map((item) => (
              <div
                key={item.weight}
                onClick={() => setWeight(item.weight)}
                className="peyda-weight-row"
                style={{
                  padding: '12px 16px',
                  borderRadius: 16,
                  background: weight === item.weight ? 'rgba(255, 116, 46, 0.14)' : 'rgba(8, 19, 29, 0.68)',
                  border: weight === item.weight ? '1px solid #FF742E' : '1px solid rgba(232, 222, 205, 0.08)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#FF742E' }}>
                    {toFa(item.weight)} · {item.faName}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--beige-dim)' }}>ضخامت الف: {toFa(item.alefW)} واحد</div>
                </div>

                <div style={{ fontWeight: item.weight, fontSize: 20, color: '#E8DECD' }}>
                  ردیابی زنده ناوگان و موقعیت ماهواره‌ای · ۰۱۲۳۴۵۶۷۸۹
                </div>

                <div style={{ fontSize: 12, color: 'var(--beige-muted)', maxWidth: 210, textAlign: 'end' }}>
                  {item.usage}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Fleet Dashboard UI Typography Preview Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="cad-card" style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: '#FF742E', fontWeight: 700, marginBottom: 6 }}>
              هم‌نشینی لوگوتایپ اختصاصی (typography.svg) و فونت پیدا در رابط واقعی
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 16 }}>
              چرا فونت «پیدا» با لوگوتایپ کپسولی شما جفت طلایی می‌سازد؟
            </h3>

            {/* Mock Navbar + Hero Telemetry Widget */}
            <div
              style={{
                borderRadius: 22,
                padding: 20,
                background: 'linear-gradient(140.24deg, #3D5768 0%, #112835 44%, #132D3F 100%)',
                border: '1px solid rgba(232,222,205,0.18)',
                marginBottom: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 14, borderBottom: '1px solid rgba(232,222,205,0.12)', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <img src="/brand-clean/logo-clean.svg" alt="نشان برند" style={{ height: 28, filter: 'brightness(0) invert(0.92)' }} />
                  <img src="/brand-clean/typography-clean.svg" alt="لوگوتایپ برند" style={{ height: 22, filter: 'brightness(0) invert(0.92)' }} />
                </div>
                <span style={{ padding: '4px 12px', borderRadius: 999, background: '#FF742E', color: '#102333', fontWeight: 800, fontSize: 12 }}>
                  ورود به پنل ناوگان
                </span>
              </div>

              <div style={{ fontWeight: 900, fontSize: 24, lineHeight: 1.35, marginBottom: 8 }}>
                هر خودرو، یک نقطه زنده در شبکه هوشمند مسیر
              </div>
              <p style={{ fontWeight: 400, fontSize: 14, color: 'rgba(232,222,205,0.82)', marginBottom: 16 }}>
                پایانه‌های کپسولی نرم در لوگوتایپ حس جریان جاده را می‌دهند و برش‌های تیز صفر درجه در فونت پیدا، خوانایی فوق‌دقیق اعداد سرعت، سوخت و مختصات GPS را تضمین می‌کنند.
              </p>

              <div className="kpi-3-grid">
                {[
                  { label: 'ناوگان در حرکت', val: '۲۴۸', unit: 'خودرو' },
                  { label: 'کاهش مصرف سوخت', val: '۱۸.۴٪', unit: 'ماهانه' },
                  { label: 'دقت مکان‌یابی', val: '۱.۲', unit: 'متر' },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      borderRadius: 15,
                      background: 'rgba(10, 22, 33, 0.65)',
                      border: '1px solid rgba(232,222,205,0.12)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--beige-muted)' }}>{stat.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: idx === 0 ? '#FF742E' : '#E8DECD', marginBlockStart: 2 }}>
                      {stat.val} <span style={{ fontSize: 12, fontWeight: 400 }}>{stat.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                borderRadius: 22,
                padding: 20,
                background: '#E8DECD',
                color: '#102333',
                boxShadow: '0 14px 32px rgba(0,0,0,0.28)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBlockEnd: 6, flexWrap: 'wrap', gap: 6 }}>
                <span style={{ fontWeight: 800, fontSize: 15 }}>نمونه کارت روزانه (Warm Beige #E8DECD)</span>
                <span style={{ background: '#102333', color: '#FF742E', padding: '3px 10px', borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
                  کنتراست ۱۲.۰۳:۱
                </span>
              </div>
              <p style={{ fontWeight: 400, fontSize: 14, lineHeight: 1.75, color: 'rgba(16,35,51,0.85)' }}>
                در بخش‌های روشن وب‌سایت، متن سرمه‌ای عمیق با وزن‌های ۴۰۰ و ۵۰۰ فونت پیدا خوانایی آرام و خستگی‌ناپذیری ایجاد می‌کند، در حالی که نارنجی تپنده نقش حجم سه‌بعدی یا نشانگر فعال درون قاب سرمه‌ای را دارد.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
