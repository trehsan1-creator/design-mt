import React, { useState } from 'react';
import { Button, StatusChip } from '../../ds';
import { LOGO_PARTS, LOGO_PATH_D } from '../../data/geometryData.js';
import { toFa } from '../../utils/faDigits.js';
import LogoAnatomyBadge from './LogoAnatomyBadge.jsx';
import PaintedCard from './PaintedCard.jsx';

export default function SmartFinaleChapter() {
  const [fleetSize, setFleetSize] = useState(75);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const annualSavingMillions = Math.round(fleetSize * 48.5);
  const fuelSavedMillions = Math.round(annualSavingMillions * 0.54);
  const maintSavedMillions = Math.round(annualSavingMillions * 0.29);
  const idleSavedMillions = annualSavingMillions - fuelSavedMillions - maintSavedMillions;

  const ratio = ((fleetSize - 10) / 290) * 100;
  // چرخش زنده عقربه تیغه ۱۳۶.۵۴ درجه لوگو متناسب با مقیاس ناوگان (-۵۲ درجه تا +۵۲ درجه)
  const bladeAngle = -52 + (ratio / 100) * 104;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSubmitted(true);
  };

  return (
    <section id="finale-portal" className="finale-sand-chapter" data-polarity="daylight">
      <div className="site-container">
        <div className="story-chapter-head">
          <LogoAnatomyBadge
            activeParts={['p3']}
            code="گام ۰۴"
            elementTitle="بازگشت کامل سرمایه در کمتر از ۴ ماه"
            morphTarget="ماشین‌حساب شفاف سود ناوگان"
          />
          <h2 className="story-chapter-title">
            دقیق ببینید سامانه چقدر از هزینه‌های سالانهٔ ناوگان شما کم می‌کند.
          </h2>
        </div>

        <PaintedCard
          nodeId="node-finale"
          tone="command"
          hasBottomPort={false}
          className="finale-launch-portal"
        >
          <div className="finale-unified-portal" data-polarity="nocturnal">
            <div className="finale-dial-band">
              <div className="finale-compass-cluster">
                {/* قطب‌نمای برداری که عقربه آن مستقیماً از قطعه چهارم لوگو (LOGO_PARTS[3]) ساخته شده است */}
                <div className="logo-blade-compass" aria-hidden="true">
                  <svg viewBox="0 0 180 180" className="logo-blade-compass__svg">
                    <circle cx="90" cy="90" r="78" className="logo-blade-compass__ring" />
                    <path
                      d="M 26,112 A 68,68 0 0 1 154,112"
                      className="logo-blade-compass__arc"
                    />
                    <g
                      className="logo-blade-compass__needle"
                      style={{ '--needle-rot': `${bladeAngle.toFixed(1)}deg` }}
                    >
                      <g transform="translate(52, 24) scale(0.42)">
                        <path d={LOGO_PARTS[3].d} className="logo-blade-compass__blade" />
                      </g>
                    </g>
                    <circle cx="90" cy="98" r="6" className="logo-blade-compass__pivot" />
                  </svg>
                </div>

                <div className="finale-dial-readout">
                  <span className="finale-dial-caption">
                    برآورد بازده سالانه برای ناوگان {toFa(fleetSize)} خودرویی
                  </span>
                  <div className="finale-dial-giant">
                    <strong>{toFa(annualSavingMillions.toLocaleString('en-US'))}</strong>
                    <span>میلیون تومان / سال</span>
                  </div>

                  <div className="finale-breakdown-pills">
                    <span>سوخت: {toFa(fuelSavedMillions.toLocaleString('en-US'))} م</span>
                    <span>استهلاک: {toFa(maintSavedMillions.toLocaleString('en-US'))} م</span>
                    <span>بهره‌وری سیر: {toFa(idleSavedMillions.toLocaleString('en-US'))} م</span>
                  </div>
                </div>
              </div>

              <div className="finale-dial-control">
                <div className="finale-dial-control__labels">
                  <span>مقیاس ناوگان فعال (عقربه تیغه را بچرخانید)</span>
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

                <div className="finale-scale-ticks" aria-hidden="true">
                  <span>{toFa(10)} خودرو</span>
                  <span>{toFa(150)} خودرو</span>
                  <span>{toFa(300)} خودرو</span>
                </div>
              </div>
            </div>

            <div className="finale-portal-divider" aria-hidden="true" />

            <div className="finale-launch-portal__grid">
              <div className="finale-launch-portal__copy">
                <div className="finale-seal-row">
                  <span className="finale-seal-emblem" aria-hidden="true">
                    <svg viewBox="0 0 234.21 324.76" width="20" height="28">
                      <path d={LOGO_PATH_D} fill="currentColor" />
                    </svg>
                  </span>
                  <span>هم‌گرایی نهایی هر ۴ عنصر در اتاق فرمان شما</span>
                </div>
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
