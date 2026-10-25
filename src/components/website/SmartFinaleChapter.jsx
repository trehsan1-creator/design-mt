import React, { useState } from 'react';
import { Check, ArrowLeft } from 'lucide-react';
import { Button } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';
import PaintedCard from './PaintedCard.jsx';

export default function SmartFinaleChapter() {
  const [fleetCount, setFleetCount] = useState(65);
  const [phone, setPhone] = useState('');
  const [sent, setSent] = useState(false);

  // برآورد سالانه (میلیون تومان) متناسب با مقیاس ناوگان
  const annualSavingMillion = Math.round(fleetCount * 48.5);
  const fillPct = Math.round(((fleetCount - 10) / 290) * 100);

  const handleRibbonScrub = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = 1 - (e.clientX - rect.left) / Math.max(1, rect.width);
    const next = Math.round(10 + Math.max(0, Math.min(1, ratio)) * 290);
    setFleetCount(next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSent(true);
  };

  return (
    <section id="finale-portal" data-polarity="daylight" className="finale-sand-chapter">
      <div className="site-container finale-sand-chapter__inner">
        <header className="story-chapter-head">
          <span className="story-step-kicker ds-tabular">۰۴ · فصل چهارم</span>
          <h2 className="story-chapter-title">
            وقتی خط سیگنال به سود خالص سالانه تبدیل می‌شود.
          </h2>
        </header>

        {/* نوار تعاملی مقیاس ناوگان با یک رقم مجسمه‌وار */}
        <PaintedCard tone="alabaster" className="finale-dial-card">
          <div className="finale-dial-layout">
            <div className="finale-dial-metric">
              <span className="smart-card-sub">صرفه‌جویی سالانه ناوگان {toFa(fleetCount)} خودرویی</span>
              <div className="finale-giant-number ds-tabular">
                {toFa(annualSavingMillion.toLocaleString('en-US'))}
                <span>میلیون تومان</span>
              </div>
            </div>

            <div className="finale-dial-control">
              <label htmlFor="fleet-ribbon-range" className="finale-dial-label">
                <span>تعداد خودروهای فعال</span>
                <strong className="ds-tabular">{toFa(fleetCount)} دستگاه</strong>
              </label>

              <div className="finale-ribbon-slider" onPointerMove={handleRibbonScrub}>
                <div
                  className="finale-ribbon-slider__fill"
                  style={{ '--fill-pct': `${fillPct}%` }}
                  aria-hidden="true"
                />
                <input
                  id="fleet-ribbon-range"
                  type="range"
                  min="10"
                  max="300"
                  value={fleetCount}
                  onChange={(e) => setFleetCount(Number(e.target.value))}
                  className="finale-ribbon-slider__input"
                />
              </div>
            </div>
          </div>
        </PaintedCard>

        {/* پورتال پایانی که دورکادرش توسط نوار نقاش کشیده می‌شود */}
        <PaintedCard tone="horizon" delay={0.1} className="finale-launch-portal">
          <div className="finale-launch-portal__grid">
            <div className="ds-stack-sm">
              <h3 className="finale-portal-heading">ناوگان خود را زنده روی نقشه ببینید.</h3>
              <p className="finale-portal-sub">
                شماره همراه خود را بگذارید تا پیش‌نمایش اختصاصی ناوگان شما فعال شود.
              </p>
            </div>

            {sent ? (
              <div className="finale-sent-pill" role="status">
                <Check size={18} aria-hidden="true" />
                <span>درخواست شما ثبت شد؛ همکاران ما با شما تماس می‌گیرند.</span>
              </div>
            ) : (
              <form className="finale-minimal-form" onSubmit={handleSubmit}>
                <label htmlFor="finale-phone-input" className="sr-only">
                  شماره موبایل
                </label>
                <input
                  id="finale-phone-input"
                  type="tel"
                  dir="ltr"
                  placeholder="0912 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="finale-minimal-input ds-tabular"
                  required
                />
                <Button type="submit" variant="primary" size="lg">
                  <span>فعال‌سازی دمو</span>
                  <ArrowLeft size={17} aria-hidden="true" />
                </Button>
              </form>
            )}
          </div>
        </PaintedCard>

        <footer className="minimal-story-footer">
          <div className="ds-row-sm">
            <img src="/brand-clean/logo-clean.svg" alt="نشان برند" className="minimal-footer-logo" />
            <img src="/brand-clean/typography-clean.svg" alt="نام تجاری برند" className="minimal-footer-type" />
          </div>
          <span className="minimal-footer-copy ds-tabular">
            © {toFa(1405)} · سامانه هوشمند فرماندهی و ردیابی سه‌بعدی ناوگان
          </span>
        </footer>
      </div>
    </section>
  );
}
