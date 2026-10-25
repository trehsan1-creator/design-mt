import React, { useState } from 'react';
import { PackageCheck, Lock, Route, BellRing, CheckCircle2 } from 'lucide-react';
import { toFa } from '../../utils/faDigits.js';

const STAGES = [
  {
    step: '۰۱',
    title: 'بارگیری و قفل پلمپ هوشمند GPS',
    time: '۰۶:۳۰ صبح · پایانه مبدأ',
    desc: 'به محض بسته شدن درب کانتینر، پلمپ الکترونیکی مسلح شده و مانیفست بار به پلاک کشنده و راننده متصل می‌گردد.',
    metric: 'ثبت خودکار بیجک و وزن باسکول',
    icon: Lock,
  },
  {
    step: '۰۲',
    title: 'مسیریابی پویا روی کریدور کلوتوئیدی',
    time: '۱۰:۱۵ صبح · آزادراه خلیج فارس',
    desc: 'الگوریتم هوشمند ترافیک، شیب جاده و نقاط حادثه‌خیز را تحلیل کرده و بهینه‌ترین مسیر کم‌مصرف را به راننده پیشنهاد می‌دهد.',
    metric: 'صرفه‌جویی ۱۴٪ زمان ترانزیت',
    icon: Route,
  },
  {
    step: '۰۳',
    title: 'پایش زنجیره سرد و هشدار انحراف ۰.۰۲ ثانیه',
    time: '۱۴:۴۰ ظهر · گذرگاه کوهستانی',
    desc: 'حتی در نقاط کور آنتن موبایل، حافظه داخلی و ماهواره مسیر را بدون پرش ثبت می‌کنند و باز شدن غیرمجاز درب را فوراً گزارش می‌دهند.',
    metric: 'صفر درصد افت کیفیت محموله',
    icon: BellRing,
  },
  {
    step: '۰۴',
    title: 'تحویل دقیق در مقصد و تسویه خودکار',
    time: '۱۸:۱۰ عصر · اسکله شهید رجایی',
    desc: 'با ورود خودرو به اسکوئیرکل مقصد، رسید دیجیتال تحویل صادر شده و گزارش کامل مصرف سوخت و کارکرد راننده آرشیو می‌شود.',
    metric: 'گزارش PDF و اکسل در یک کلیک',
    icon: PackageCheck,
  },
];

export default function JourneyTimelineSection() {
  const [activeIdx, setActiveIdx] = useState(1);

  return (
    <section id="journey" className="dark-section">
      <div className="site-container">
        <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 44px' }}>
          <div className="eyebrow-kaf">
            <Route size={15} />
            <span>سناریوی واقعی در جاده · فیلم حرکت سیگنال از مبدأ تا مقصد</span>
          </div>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 40px)', fontWeight: 900, lineHeight: 1.3 }}>
            سفر هوشمند یک محموله، ثانیه به ثانیه تحت فرمان شما
          </h2>
        </div>

        {/* Clothoid Connected Stepper */}
        <div className="cad-card" style={{ padding: '32px 28px' }}>
          {/* Animated SVG Clothoid Connector Bar */}
          <div style={{ position: 'relative', marginBottom: 28 }}>
            <div
              style={{
                height: 6,
                borderRadius: 999,
                background: 'rgba(232,222,205,0.12)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  insetInlineStart: 0,
                  bottom: 0,
                  width: `${((activeIdx + 1) / STAGES.length) * 100}%`,
                  background: 'linear-gradient(90deg, #FF742E 0%, #E8DECD 100%)',
                  borderRadius: 999,
                  boxShadow: '0 0 20px rgba(255,116,46,0.75)',
                  transition: 'width 0.55s cubic-bezier(0.34, 1.45, 0.64, 1)',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18 }}>
            {STAGES.map((st, idx) => {
              const Icon = st.icon;
              const isAct = idx === activeIdx;
              const passed = idx <= activeIdx;
              return (
                <div
                  key={st.step}
                  onClick={() => setActiveIdx(idx)}
                  style={{
                    padding: '22px 20px',
                    borderRadius: 24,
                    cursor: 'pointer',
                    background: isAct
                      ? 'linear-gradient(140.24deg, #3D5768 0%, #112835 45%, #132D3F 100%)'
                      : 'rgba(8, 19, 29, 0.65)',
                    border: isAct ? '1.5px solid #FF742E' : '1px solid rgba(232,222,205,0.1)',
                    transform: isAct ? 'translateY(-6px)' : 'none',
                    boxShadow: isAct ? '0 20px 44px rgba(0,0,0,0.45)' : 'none',
                    transition: 'all 0.28s cubic-bezier(0.34, 1.45, 0.64, 1)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: '31.25%',
                        background: passed ? '#FF742E' : 'rgba(232,222,205,0.1)',
                        color: passed ? '#102333' : '#E8DECD',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: isAct ? '0 0 22px rgba(255,116,46,0.7)' : 'none',
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <span style={{ fontSize: 26, fontWeight: 900, color: isAct ? '#FF742E' : 'rgba(232,222,205,0.25)' }}>
                      {st.step}
                    </span>
                  </div>

                  <div style={{ fontSize: 12.5, color: '#FFB085', fontWeight: 700, marginBlockEnd: 4 }}>{st.time}</div>
                  <h3 style={{ fontSize: 17.5, fontWeight: 900, marginBlockEnd: 8 }}>{st.title}</h3>
                  <p style={{ fontSize: 14.5, color: 'rgba(232,222,205,0.8)', lineHeight: 1.75, marginBlockEnd: 14 }}>
                    {st.desc}
                  </p>

                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#4ADE80',
                      paddingTop: 10,
                      borderTop: '1px solid rgba(232,222,205,0.1)',
                    }}
                  >
                    ✓ {st.metric}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
