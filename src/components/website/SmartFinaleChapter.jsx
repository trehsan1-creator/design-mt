import React, { useState } from 'react';
import { Button, StatusChip } from '../../ds';
import { LOGO_PATH_D } from '../../data/geometryData.js';
import { toFa } from '../../utils/faDigits.js';
import PaintedCard from './PaintedCard.jsx';

export default function SmartFinaleChapter() {
  const [fleetSize, setFleetSize] = useState(65);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const annualSavingMillions = Math.round(fleetSize * 48.5);
  const ratio = ((fleetSize - 10) / 290) * 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSubmitted(true);
  };

  return (
    <section id="finale-portal" className="finale-sand-chapter" data-polarity="daylight">
      <div className="site-container">
        <div className="story-chapter-head">
          <span className="story-step-kicker">۰۴ · مقصد نهایی مدار</span>
          <h2 className="story-chapter-title">
            در پایان مسیر، هر داده به سود سالانه و فرمان زنده تبدیل می‌شود.
          </h2>
        </div>

        {/* گره ۵ (مقصد نهایی مدار): درگاه یکپارچه محاسبه بازده و فعال‌سازی دمو */}
        <PaintedCard
          nodeId="node-finale"
          tone="horizon"
          hasBottomPort={false}
          className="finale-launch-portal"
        >
          <div className="finale-unified-portal" data-polarity="nocturnal">
            <div className="finale-dial-band">
              <div className="finale-dial-readout">
                <span className="finale-dial-caption">
                  صرفه‌جویی سالانه ناوگان {toFa(fleetSize)} خودرویی
                </span>
                <div className="finale-dial-giant">
                  <strong>{toFa(annualSavingMillions.toLocaleString('en-US'))}</strong>
                  <span>میلیون تومان</span>
                </div>
              </div>

              <div className="finale-dial-control">
                <div className="finale-dial-control__labels">
                  <span>تعداد خودروهای فعال</span>
                  <strong>{toFa(fleetSize)} دستگاه</strong>
                </div>

                <div
                  className="finale-ribbon-slider"
                  style={{ '--slider-fill': `${ratio.toFixed(1)}%` }}
                >
                  <div className="finale-ribbon-slider__track">
                    <div className="finale-ribbon-slider__fill" />
                    <span className="finale-ribbon-slider__thumb" />
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    value={fleetSize}
                    onChange={(e) => setFleetSize(Number(e.target.value))}
                    aria-label="تعداد خودروهای ناوگان"
                    className="finale-ribbon-slider__input"
                  />
                </div>
              </div>
            </div>

            <div className="finale-portal-divider" aria-hidden="true" />

            <div className="finale-launch-portal__grid">
              <div className="finale-launch-portal__copy">
                <h3>ناوگان خود را زنده روی همین مدار ببینید.</h3>
                <p>شماره همراه خود را بگذارید تا پیش‌نمایش اختصاصی ناوگان شما بلافاصله فعال شود.</p>
              </div>

              {submitted ? (
                <div className="finale-launch-portal__done" role="status">
                  <StatusChip status="moving" pulse>
                    درخواست ثبت شد · هماهنگی دمو طی ۱۵ دقیقه
                  </StatusChip>
                </div>
              ) : (
                <form className="finale-launch-portal__form" onSubmit={handleSubmit}>
                  <label htmlFor="finale-phone" className="sr-only">
                    شماره موبایل جهت هماهنگی دمو
                  </label>
                  <input
                    id="finale-phone"
                    type="tel"
                    dir="ltr"
                    required
                    placeholder="0912 000 0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="finale-launch-portal__input"
                  />
                  <Button type="submit" variant="primary" size="lg">
                    فعال‌سازی دمو ←
                  </Button>
                </form>
              )}
            </div>
          </div>
        </PaintedCard>

        <footer className="minimal-story-footer">
          <div className="minimal-story-footer__brand">
            <svg viewBox="0 0 234.21 324.76" width="22" height="30" aria-hidden="true">
              <path d={LOGO_PATH_D} fill="currentColor" />
            </svg>
            <span>فرزام تله‌ماتیک</span>
          </div>
          <p className="minimal-story-footer__copy">
            © {toFa(1405)} · سامانه هوشمند فرماندهی و ردیابی سه‌بعدی ناوگان
          </p>
        </footer>
      </div>
    </section>
  );
}
