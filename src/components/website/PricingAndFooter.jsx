import React, { useState } from 'react';
import { Check, Sparkles, PhoneCall, Send, Layers } from 'lucide-react';
import { toFa } from '../../utils/faDigits.js';

const PLANS = [
  {
    name: 'ناوگان شهری پایه',
    sub: 'مناسب شرکت‌های پخش و خدمات شهری',
    price: '۲۹۰,۰۰۰',
    period: 'تومان / ماهانه به ازای هر خودرو',
    featured: false,
    features: [
      'ردیابی زنده با نرخ نوسازی ۲ ثانیه',
      'آرشیو کامل مسیرهای پیموده‌شده تا ۱ سال',
      'تعریف ۲۰ حصار جغرافیایی اسکوئیرکل',
      'اپلیکیشن موبایل مدیر و راننده (اندروید و iOS)',
    ],
  },
  {
    name: 'فرماندهی حرفه‌ای ناوگان',
    sub: 'پرفروش‌ترین بسته حمل‌ونقل و زنجیره سرد',
    price: '۴۸۰,۰۰۰',
    period: 'تومان / ماهانه به ازای هر خودرو',
    featured: true,
    features: [
      'ردیابی فوق‌سریع با تأخیر ۰.۰۲ ثانیه و قفل ۳ منظومه ماهواره‌ای',
      'پایش اولتراسونیک باک سوخت و هشدار آنی سرقت',
      'سنسور دمای یخچال، درب کانتینر و پلمپ دیجیتال',
      'تحلیل هوشمند رفتار راننده و دیاگ از راه دور CAN-Bus',
      'پشتیبانی اختصاصی ۲۴/۷ اتاق عملیات',
    ],
  },
  {
    name: 'سازمانی و ترانزیت بین‌الملل',
    sub: 'ویژه هلدینگ‌ها، معادن و ناوگان بالای ۱۰۰ خودرو',
    price: 'اختصاصی',
    period: 'استقرار روی سرور اختصاصی (On-Premise) یا ابری',
    featured: false,
    features: [
      'رومینگ ماهواره‌ای برون‌مرزی بدون قطعی',
      'وب‌سرویس و API کامل اتصال به ERP و سامانه بارنامه',
      'داشبورد تحلیلی سفارشی و هوش مصنوعی بهینه‌سازی مسیر',
      'نصب و کالیبراسیون حضوری در سراسر کشور',
    ],
  },
];

export default function PricingAndFooter({ onOpenArch, onOpenDesignSystem, onSwitchToLab }) {
  const [formState, setFormState] = useState({ name: '', phone: '', count: '۲۰ تا ۵۰ خودرو' });
  const [submitted, setSubmitted] = useState(false);
  const [cursor, setCursor] = useState({ col: -10, row: -10 });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      {/* Pricing Plans */}
      <section id="pricing" className="dark-section">
        <div className="site-container">
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 44px' }}>
            <div className="eyebrow-kaf">
              <Sparkles size={15} />
              <span>تعرفه‌های شفاف سازمانی · بازگشت سرمایه از ماه اول</span>
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 3.2vw, 42px)', fontWeight: 900 }}>
              بسته فرماندهی متناسب با ناوگان خود را انتخاب کنید
            </h2>
          </div>

          <div className="pricing-grid">
            {PLANS.map((pl) => (
              <div
                key={pl.name}
                className="cad-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  background: pl.featured
                    ? 'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)'
                    : 'rgba(13, 28, 42, 0.78)',
                  border: pl.featured ? '2px solid #FF742E' : '1px solid rgba(232,222,205,0.14)',
                  transform: pl.featured ? 'translateY(-10px)' : 'none',
                  boxShadow: pl.featured
                    ? '0 30px 65px rgba(255,116,46,0.22), inset 0 2px 2px rgba(255,255,255,0.22)'
                    : undefined,
                }}
              >
                <div>
                  {pl.featured && (
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 12px',
                        borderRadius: 999,
                        background: '#FF742E',
                        color: '#102333',
                        fontSize: 11.5,
                        fontWeight: 900,
                        marginBottom: 12,
                      }}
                    >
                      پیشنهاد ویژه ناوگان حرفه‌ای
                    </span>
                  )}
                  <h3 style={{ fontSize: 22, fontWeight: 900 }}>{pl.name}</h3>
                  <p style={{ fontSize: 13, color: 'var(--beige-muted)', marginTop: 4, marginBottom: 18 }}>{pl.sub}</p>

                  <div style={{ paddingBottom: 18, marginBottom: 18, borderBottom: '1px solid rgba(232,222,205,0.12)' }}>
                    <div style={{ fontSize: 34, fontWeight: 900, color: pl.featured ? '#FF742E' : '#E8DECD' }}>
                      {pl.price}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(232,222,205,0.68)' }}>{pl.period}</div>
                  </div>

                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 26 }}>
                    {pl.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13.5 }}>
                        <span
                          style={{
                            width: 19,
                            height: 19,
                            borderRadius: 6,
                            background: pl.featured ? 'rgba(255,116,46,0.22)' : 'rgba(232,222,205,0.1)',
                            color: '#FF742E',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                        >
                          <Check size={13} />
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href="#demo-request"
                  className={pl.featured ? 'btn-3d-orange' : 'btn-3d-navy'}
                  style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                >
                  سفارش و دریافت پیش‌فاکتور
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tactile Demo Request Section */}
      <section id="demo-request" style={{ padding: '30px 0 90px' }}>
        <div className="site-container">
          <div
            className="cad-card"
            style={{
              padding: '42px 36px',
              background: 'linear-gradient(140.24deg, rgba(255,116,46,0.18) 0%, #102333 46%, #132D3F 100%)',
              borderColor: 'rgba(255, 116, 46, 0.45)',
            }}
          >
            <div className="section-grid" style={{ marginBottom: 0, alignItems: 'center' }}>
              <div>
                <span className="kaf-slash-tag">تست رایگان ۱۴ روزه روی خودروهای واقعی شما</span>
                <h2 style={{ fontSize: 'clamp(26px, 3vw, 38px)', fontWeight: 900, marginTop: 10, marginBottom: 12 }}>
                  پنل فرماندهی سه‌بعدی را همین امروز روی ناوگان خود تجربه کنید
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(232,222,205,0.82)', lineHeight: 1.8 }}>
                  کارشناسان فنی ما ظرف کمتر از ۱۵ دقیقه دسترسی دمو زنده به همراه دستگاه تستی رایگان را برای ناوگان شما فعال می‌کنند.
                </p>
              </div>

              <div>
                {submitted ? (
                  <div
                    style={{
                      padding: 28,
                      borderRadius: 24,
                      background: 'rgba(8, 19, 29, 0.85)',
                      border: '1.5px solid #4ADE80',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#4ADE80', marginBottom: 8 }}>
                      درخواست شما با موفقیت ثبت شد!
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--beige-muted)', marginBottom: 16 }}>
                      تیم مهندسی فروش ما تا دقایقی دیگر برای هماهنگی دمو زنده با شما تماس می‌گیرند.
                    </p>
                    <button className="chip-btn on" onClick={() => setSubmitted(false)}>
                      ثبت درخواست جدید
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                      background: 'rgba(7, 17, 26, 0.78)',
                      padding: 24,
                      borderRadius: 24,
                      border: '1px solid rgba(232,222,205,0.14)',
                    }}
                  >
                    <input
                      required
                      type="text"
                      placeholder="نام و نام خانوادگی / نام شرکت"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      style={{
                        padding: '13px 16px',
                        borderRadius: 14,
                        border: '1px solid rgba(232,222,205,0.2)',
                        background: 'rgba(16,35,51,0.7)',
                        color: '#E8DECD',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                    <input
                      required
                      type="tel"
                      placeholder="شماره موبایل جهت ارسال لینک دمو (مثلاً ۰۹۱۲...)"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      style={{
                        padding: '13px 16px',
                        borderRadius: 14,
                        border: '1px solid rgba(232,222,205,0.2)',
                        background: 'rgba(16,35,51,0.7)',
                        color: '#E8DECD',
                        fontSize: 14,
                        outline: 'none',
                      }}
                    />
                    <button type="submit" className="btn-3d-orange" style={{ justifyContent: 'center', marginTop: 4 }}>
                      <Send size={16} />
                      <span>دریافت آنی پنل دمو و مشاوره رایگان</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Magnetic Nuqta-to-Capsule Footer */}
      <footer
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setCursor({
            col: ((e.clientX - r.left) / r.width) * 18,
            row: ((e.clientY - r.top) / r.height) * 4,
          });
        }}
        onMouseLeave={() => setCursor({ col: -10, row: -10 })}
        style={{
          position: 'relative',
          padding: '54px 0 42px',
          background: '#050B12',
          borderTop: '1px solid rgba(232,222,205,0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Live Magnetic Nuqta Matrix Strip */}
        <div
          style={{
            maxWidth: 1300,
            margin: '0 auto 34px',
            padding: '0 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            direction: 'ltr',
            opacity: 0.72,
          }}
        >
          {Array.from({ length: 3 }).map((_, rIdx) => (
            <div key={rIdx} style={{ display: 'flex', justifyContent: 'space-between' }}>
              {Array.from({ length: 18 }).map((__, cIdx) => {
                const d = Math.hypot(cIdx - cursor.col, rIdx - cursor.row);
                const prox = Math.max(0, Math.min(1, 1 - d / 3.2));
                return (
                  <div
                    key={cIdx}
                    style={{
                      width: 6 + prox * 16,
                      height: 6,
                      borderRadius: prox > 0.25 ? 999 : 2,
                      background: prox > 0.3 ? '#FF742E' : 'rgba(232,222,205,0.16)',
                      transition: 'all 0.18s ease',
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="site-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <img src="/brand-clean/logo-clean.svg" alt="لوگو" style={{ height: 34, filter: 'brightness(0) invert(0.92)' }} />
            <img src="/brand-clean/typography-clean.svg" alt="لوگوتایپ" style={{ height: 24, filter: 'brightness(0) invert(0.92)' }} />
            <span style={{ fontSize: 13, color: 'rgba(232,222,205,0.58)', marginRight: 8 }}>
              © {toFa(1405)} · سامانه هوشمند ردیابی خودرو، GPS و مدیریت ناوگان
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={onOpenDesignSystem} className="chip-btn on">
              پورتال دیزاین سیستم و توکن‌ها
            </button>
            <button onClick={onOpenArch} className="chip-btn">
              <Layers size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
              نقشه معماری سه‌بعدی سایت
            </button>
            <button onClick={onSwitchToLab} className="chip-btn">
              آزمایشگاه کالبدشکافی و پترن‌ها
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
