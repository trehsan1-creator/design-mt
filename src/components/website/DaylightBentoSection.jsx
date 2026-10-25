import React, { useState } from 'react';
import { Award, Activity } from 'lucide-react';
import { Button, Card, Capsule, Gauge, StatusChip } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';

export default function DaylightBentoSection() {
  const [theftTest, setTheftTest] = useState(false);
  const [outsideFence, setOutsideFence] = useState(false);

  return (
    <section id="smart-features" className="daylight-sand-section" data-polarity="daylight">
      <div className="site-container">
        <div className="ds-between-wrap">
          <div className="ds-stack-xs">
            <div>
              <Capsule variant="eyebrow">
                <Activity size={15} aria-hidden="true" />
                <span>قطبیت روز شنی · کنتراست سرمه‌ای روی بژ گرم (۱۲.۰۳:۱)</span>
              </Capsule>
            </div>
            <h2 className="section-title-xl">
              فراتر از یک نقطه روی نقشه؛ نگهبان هوشمند دارایی ناوگان
            </h2>
          </div>

          <p className="section-subtitle">
            چیدمان ۲×۲ زیر ترکیب کارت‌های بالشتکی روشن و کارت‌های پخ‌خورده سرمه‌ای را نمایش می‌دهد.
          </p>
        </div>

        <div className="bento-golden-grid">
          <Card variant="chisel" polarity="nocturnal" tilt className="ds-stack-md">
            <div className="ds-between-wrap">
              <div className="ds-stack-xs">
                <div>
                  <Capsule variant="slash">سنسور اولتراسونیک باک · دقت ۹۹.۵٪</Capsule>
                </div>
                <h3>تشخیص آنی تخلیه غیرمجاز سوخت</h3>
              </div>

              <Button variant="primary" size="sm" onClick={() => setTheftTest(!theftTest)}>
                {theftTest ? 'بازنشانی نمودار' : 'شبیه‌سازی افت ناگهانی باک'}
              </Button>
            </div>

            <p className="ds-muted">
              الگوریتم پایش باک، نوسان طبیعی جاده را از تخلیه واقعی تفکیک کرده و در کمتر از ۳ ثانیه هشدار اتاق عملیات را فعال می‌کند.
            </p>

            <Card variant="panel" compact className="ds-stack-xs">
              <div className="ds-between-wrap">
                <span>سطح باک کشنده FH500 (ظرفیت ۸۰۰ لیتر)</span>
                <StatusChip
                  status={theftTest ? 'critical' : 'moving'}
                  label={theftTest ? 'هشدار: افت ناگهانی ۶۵ لیتر در توقف' : 'مصرف یکنواخت جاده‌ای'}
                />
              </div>

              <svg viewBox="0 0 480 96" className="lab-svg-canvas" role="img" aria-label="نمودار سطح سوخت باک">
                <line x1="0" y1="84" x2="480" y2="84" stroke="var(--ds-sand-300)" strokeOpacity="0.18" />
                <path
                  d={
                    theftTest
                      ? 'M 10,18 Q 110,24 210,30 L 222,74 Q 330,78 470,82'
                      : 'M 10,18 C 140,26 310,40 470,54'
                  }
                  fill="none"
                  stroke={theftTest ? 'var(--ds-color-signal-orange)' : 'var(--ds-status-moving)'}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                {theftTest && (
                  <g transform="translate(222, 74)">
                    <circle r="14" fill="var(--ds-color-signal-orange)" fillOpacity="0.28" />
                    <circle r="6" fill="var(--ds-color-signal-orange)" />
                    <text x="12" y="-10" fill="var(--ds-orange-300)" fontSize="12" fontWeight="800">
                      نقطه تخلیه غیرمجاز
                    </text>
                  </g>
                )}
              </svg>
            </Card>
          </Card>

          <Card variant="cushion" tilt className="ds-stack-md">
            <div className="ds-between-wrap">
              <Capsule variant="tag">حصار جغرافیایی چهارگوش‌نرم (Geofence)</Capsule>
              <Button
                variant={outsideFence ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setOutsideFence(!outsideFence)}
              >
                {outsideFence ? 'بازگرداندن خودرو به محدوده' : 'تست خروج از محدوده مجاز'}
              </Button>
            </div>

            <h3>مرزبندی هوشمند انبار، معدن و کریدور</h3>
            <p className="ds-muted">
              محدوده‌های مجاز را روی نقشه تعریف کنید؛ با خروج خودرو از مرز تعیین‌شده، رویداد هشدار ثبت می‌شود:
            </p>

            <div className="geofence-arena">
              <div className={`geofence-zone ${outsideFence ? 'is-breach' : ''}`}>
                محدوده مجاز
              </div>
              <div className={`geofence-vehicle-chip ${outsideFence ? 'is-outside' : ''}`}>
                {outsideFence ? 'خروج غیرمجاز' : 'داخل زون امن'}
              </div>
            </div>
          </Card>
        </div>

        <div className="bento-golden-grid-reverse">
          <Card variant="cushion" tilt className="ds-stack-md">
            <div className="ds-row">
              <div className="hardware-spec-icon">
                <Award size={20} aria-hidden="true" />
              </div>
              <div className="ds-stack-xs">
                <h3>امتیازدهی رفتار رانندگان</h3>
                <span className="ds-muted">ترمز شدید · شتاب ناگهانی · سرعت در پیچ</span>
              </div>
            </div>

            <div className="ds-stack-sm">
              {[
                { name: 'محسن رضایی (کد ۱۰۸)', score: 96 },
                { name: 'بهرام کاظمی (کد ۲۰۴)', score: 91 },
                { name: 'امیرحسین مرادی (کد ۳۱۹)', score: 74 },
              ].map((dr, i) => (
                <div key={i} className="daylight-stat-pill">
                  <Gauge
                    segments={14}
                    activeCount={Math.round((dr.score / 100) * 14)}
                    label={dr.name}
                    value={`امتیاز ایمنی: ${toFa(dr.score)} از ۱۰۰`}
                    tone={dr.score < 80 ? 'accent' : 'moving'}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card variant="chisel" polarity="nocturnal" tilt className="ds-stack-md">
            <div>
              <Capsule variant="slash">عیب‌یابی پیش‌بینانه موتور و دیاگ از راه دور (CAN-Bus)</Capsule>
            </div>
            <h3>پایش سلامت فنی پیش از توقف در جاده</h3>
            <p className="ds-muted">
              خوانش زنده کدهای خطای ECU، دمای آب، فشار روغن، ساعت کارکرد موتور و یادآور سرویس دوره‌ای بر اساس کیلومترشمار ماهواره‌ای.
            </p>

            <div className="kpi-3-grid">
              {[
                { label: 'سلامت باتری ناوگان', val: '۲۷.۸ ولت', badge: 'استاندارد', accent: false },
                { label: 'دمای میانگین موتور', val: '۸۶ درجه', badge: 'ایمن', accent: false },
                { label: 'کاهش توقف تعمیراتی', val: '۴۲٪', badge: 'صرفه‌جویی', accent: true },
              ].map((item, idx) => (
                <Card key={idx} variant="panel" compact className="ds-stack-xs">
                  <span className="ds-muted">{item.label}</span>
                  <strong className={`hero-kpi-item__val ds-tabular ${item.accent ? 'ds-accent-text' : ''}`}>
                    {item.val}
                  </strong>
                  <StatusChip status="moving" label={item.badge} />
                </Card>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
