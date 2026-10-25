import React, { useState } from 'react';
import { Check, Sparkles, Send, Layers } from 'lucide-react';
import { Button, Card, Capsule, StatusChip } from '../../ds/index.js';
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
      'آرشیو مسیرهای پیموده‌شده تا ۱ سال',
      'تعریف ۲۰ حصار جغرافیایی چهارگوش‌نرم',
      'اپلیکیشن موبایل مدیر و راننده (اندروید و iOS)',
    ],
  },
  {
    name: 'فرماندهی حرفه‌ای ناوگان',
    sub: 'بسته پیشنهادی حمل‌ونقل جاده‌ای و زنجیره سرد',
    price: '۴۸۰,۰۰۰',
    period: 'تومان / ماهانه به ازای هر خودرو',
    featured: true,
    features: [
      'ردیابی زنده با تأخیر ۰.۰۲ ثانیه و قفل ۳ منظومه ماهواره‌ای',
      'پایش اولتراسونیک باک سوخت و هشدار تخلیه',
      'سنسور دمای یخچال، درب کانتینر و پلمپ دیجیتال',
      'تحلیل رفتار راننده و دیاگ از راه دور CAN-Bus',
      'پشتیبانی ۲۴/۷ اتاق عملیات',
    ],
  },
  {
    name: 'سازمانی و ترانزیت بین‌الملل',
    sub: 'ویژه هلدینگ‌ها، معادن و ناوگان بالای ۱۰۰ خودرو',
    price: 'اختصاصی',
    period: 'استقرار روی سرور اختصاصی (On-Premise) یا ابری',
    featured: false,
    features: [
      'رومینگ ماهواره‌ای برون‌مرزی پایدار',
      'وب‌سرویس و API اتصال به ERP و سامانه بارنامه',
      'داشبورد تحلیلی سفارشی و بهینه‌سازی مسیر',
      'نصب و کالیبراسیون حضوری در سراسر کشور',
    ],
  },
];

export default function PricingAndFooter({ onOpenArch, onOpenDesignSystem, onSwitchToLab }) {
  const [formState, setFormState] = useState({ name: '', phone: '' });
  const [submitted, setSubmitted] = useState(false);
  const [cursor, setCursor] = useState({ col: -10, row: -10 });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <section id="pricing" className="fleet-section">
        <div className="site-container">
          <div className="section-header-center">
            <Capsule variant="eyebrow">
              <Sparkles size={15} aria-hidden="true" />
              <span>تعرفه‌های شفاف سازمانی · متناسب با ابعاد ناوگان</span>
            </Capsule>
            <h2 className="section-title-xl">
              بسته فرماندهی متناسب با ناوگان خود را انتخاب کنید
            </h2>
          </div>

          <div className="pricing-grid">
            {PLANS.map((pl) => (
              <Card
                key={pl.name}
                variant={pl.featured ? 'chisel' : 'panel'}
                accentOutline={pl.featured}
                interactive
                className="pricing-card"
              >
                <div className="ds-stack-md">
                  {pl.featured && (
                    <div>
                      <StatusChip status="signal" label="پیشنهاد ویژه ناوگان حرفه‌ای" />
                    </div>
                  )}
                  <div className="ds-stack-xs">
                    <h3>{pl.name}</h3>
                    <p className="ds-muted">{pl.sub}</p>
                  </div>

                  <div className="ds-stack-xs">
                    <strong className={`section-title-xl ds-tabular ${pl.featured ? 'ds-accent-text' : ''}`}>
                      {pl.price}
                    </strong>
                    <span className="ds-muted">{pl.period}</span>
                  </div>

                  <ul className="pricing-feature-list">
                    {pl.features.map((f, i) => (
                      <li key={i} className="pricing-feature-item">
                        <Check size={15} className="ds-accent-text" aria-hidden="true" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  as="a"
                  href="#demo-request"
                  variant={pl.featured ? 'primary' : 'secondary'}
                  fullWidth
                >
                  سفارش و دریافت پیش‌فاکتور
                </Button>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="demo-request" className="fleet-section">
        <div className="site-container">
          <Card variant="chisel" accentOutline>
            <div className="section-grid">
              <div className="ds-stack-md">
                <div>
                  <Capsule variant="slash">ارزیابی آزمایشی ۱۴ روزه روی ناوگان واقعی</Capsule>
                </div>
                <h2 className="section-title-xl">
                  پنل فرماندهی سه‌بعدی را روی خودروهای ناوگان خود آزمایش کنید
                </h2>
                <p className="ds-muted">
                  کارشناسان فنی ظرف کمتر از ۱۵ دقیقه دسترسی دمو زنده و هماهنگی نصب واحد آزمایشی را فعال می‌کنند.
                </p>
              </div>

              <div>
                {submitted ? (
                  <Card variant="panel" className="ds-stack-md">
                    <StatusChip status="moving" label="درخواست شما ثبت شد" />
                    <p className="ds-muted">
                      تیم مهندسی فروش برای هماهنگی دسترسی دمو زنده با شما تماس می‌گیرد.
                    </p>
                    <div>
                      <Button variant="pill" active onClick={() => setSubmitted(false)}>
                        ثبت درخواست جدید
                      </Button>
                    </div>
                  </Card>
                ) : (
                  <form onSubmit={handleSubmit} className="demo-form">
                    <div className="ds-stack-xs">
                      <label htmlFor="demo-company-name">نام و نام خانوادگی یا نام سازمان</label>
                      <input
                        id="demo-company-name"
                        required
                        type="text"
                        className="demo-input"
                        placeholder="مثلاً شرکت حمل‌ونقل پارس"
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      />
                    </div>
                    <div className="ds-stack-xs">
                      <label htmlFor="demo-phone-number">شماره همراه جهت ارسال لینک دمو</label>
                      <input
                        id="demo-phone-number"
                        required
                        type="tel"
                        className="demo-input"
                        placeholder="۰۹۱۲..."
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      />
                    </div>
                    <Button type="submit" variant="primary" fullWidth>
                      <Send size={16} aria-hidden="true" />
                      <span>دریافت دسترسی دمو و مشاوره فنی</span>
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <footer
        className="fleet-footer"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setCursor({
            col: ((e.clientX - r.left) / r.width) * 18,
            row: ((e.clientY - r.top) / r.height) * 3,
          });
        }}
        onMouseLeave={() => setCursor({ col: -10, row: -10 })}
      >
        <div className="footer-nuqta-matrix" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, rIdx) => (
            <div key={rIdx} className="footer-nuqta-row">
              {Array.from({ length: 18 }).map((__, cIdx) => {
                const d = Math.hypot(cIdx - cursor.col, rIdx - cursor.row);
                const prox = Math.max(0, Math.min(1, 1 - d / 3.2));
                const widthPx = Math.round(6 + prox * 16);
                return (
                  <div
                    key={cIdx}
                    className={`footer-nuqta-dot ${prox > 0.3 ? 'is-near' : ''}`}
                    style={{ '--dot-w': `${widthPx}px` }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="site-container ds-between-wrap">
          <div className="ds-row-wrap">
            <img src="/brand-clean/logo-clean.svg" alt="نشان برند" className="nav-logo-badge__img brand-svg-light" />
            <img src="/brand-clean/typography-clean.svg" alt="نام تجاری برند" className="nav-typography-img brand-svg-light" />
            <span className="ds-muted">
              © {toFa(1405)} · سامانه هوشمند ردیابی خودرو، GPS و مدیریت ناوگان
            </span>
          </div>

          {(onOpenDesignSystem || onOpenArch || onSwitchToLab) && (
            <div className="ds-row-wrap">
              {onOpenDesignSystem && (
                <Button variant="pill" size="sm" active onClick={onOpenDesignSystem}>
                  پورتال دیزاین سیستم
                </Button>
              )}
              {onOpenArch && (
                <Button variant="ghost" size="sm" onClick={onOpenArch}>
                  <Layers size={14} aria-hidden="true" />
                  <span>معماری سه‌بعدی</span>
                </Button>
              )}
              {onSwitchToLab && (
                <Button variant="ghost" size="sm" onClick={onSwitchToLab}>
                  آزمایشگاه هندسه
                </Button>
              )}
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
