import React, { useState } from 'react';
import {
  ArrowRight,
  Palette,
  Type,
  Box,
  Cpu,
  Code2,
  Copy,
  Check,
  Sparkles,
  Compass,
  Sun,
  Moon,
  Thermometer,
  Navigation,
} from 'lucide-react';
import { DESIGN_TOKENS } from '../../../tokens/tokens.js';
import { PEYDA_WEIGHTS } from '../../data/geometryData.js';
import { Button, Card, Capsule, Gauge, IranPlate, StatusChip } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';

const CORE_SWATCHES = [
  {
    name: 'نارنجی سیگنال زنده',
    token: '--ds-color-signal-orange',
    hex: DESIGN_TOKENS.color.signalOrange,
    spec: 'HSL(20.1°, 100%, 59%) · OKLCH(71.6%, 0.187, 43.8°)',
    usage: 'سیگنال فعال GPS، دکمه اصلی و هشدار انحراف',
  },
  {
    name: 'سرمه‌ای راداری عمیق',
    token: '--ds-color-deep-navy',
    hex: DESIGN_TOKENS.color.deepNavy,
    spec: 'HSL(207.4°, 52.2%, 13.1%) · OKLCH(24.8%, 0.040, 245.7°)',
    usage: 'پنل‌های اتاق فرمان و تایپوگرافی روی بژ گرم',
  },
  {
    name: 'بژ گرم روز شنی',
    token: '--ds-color-warm-sand',
    hex: DESIGN_TOKENS.color.warmSand,
    spec: 'HSL(37.8°, 37%, 85.7%) · OKLCH(90.4%, 0.025, 81.1°)',
    usage: 'تایپوگرافی روشن روی سرمه‌ای و بوم قطبیت روز (۱۲.۰۳:۱)',
  },
];

const TELEMETRY_SWATCHES = [
  { status: 'moving', label: 'در حرکت پایدار', token: '--ds-status-moving', hex: DESIGN_TOKENS.color.telemetry.moving },
  { status: 'signal', label: 'سیگنال فعال / هشدار باک', token: '--ds-status-signal', hex: DESIGN_TOKENS.color.telemetry.signal },
  { status: 'corridor', label: 'کریدور ترانزیتی', token: '--ds-status-corridor', hex: DESIGN_TOKENS.color.telemetry.corridor },
  { status: 'cold-chain', label: 'زنجیره سرد یخچالی', token: '--ds-status-cold-chain', hex: DESIGN_TOKENS.color.telemetry['cold-chain'] },
  { status: 'idle', label: 'توقف درجا (Idle)', token: '--ds-status-idle', hex: DESIGN_TOKENS.color.telemetry.idle },
  { status: 'critical', label: 'خروج از ژئوفنس', token: '--ds-status-critical', hex: DESIGN_TOKENS.color.telemetry.critical },
];

const GEOMETRY_TOKENS = [
  { token: '--ds-geo-stroke-s', value: DESIGN_TOKENS.geometry['stroke-s'], title: 'مدول ضخامت نوار لوگو (S)', desc: 'واحد پایه هندسه نشان و مقیاس فاصله‌گذاری (S = 23.145px)' },
  { token: '--ds-geo-golden-fillet', value: DESIGN_TOKENS.geometry['golden-fillet'], title: 'فیلت داخلی اتصالات', desc: 'شعاع گوشه داخلی در چهار قطعه نشان برند' },
  { token: '--ds-geo-squircle', value: DESIGN_TOKENS.geometry.squircle, title: 'چهارگوش‌نرم ۳۱.۲۵٪', desc: 'قاب آیکن‌ها، نودهای رادار و پوسته سخت‌افزار GPS' },
  { token: '--ds-geo-pin-blade', value: DESIGN_TOKENS.geometry['pin-blade'], title: 'تیغه مکان‌نما ۱۳۶.۵۴°', desc: 'زاویه رأس پایینی قطعه چهارم لوگو در پین نقشه' },
  { token: '--ds-geo-kaf-skew', value: DESIGN_TOKENS.geometry['kaf-skew'], title: 'برش مورب سرکش «ک» پیدا', desc: 'زاویه سگمنت‌های گیج سوخت و شاخص‌های سرعت' },
  { token: '--ds-geo-radar-cone', value: DESIGN_TOKENS.geometry['radar-cone'], title: 'دهانه مخروط رادار ۳۰.۶°', desc: 'مشتق از شیب ۷۴.۷° بازوهای رقم «۷» فونت پیدا' },
];

export default function DesignSystemPortal({ onBackToWebsite, onOpenLab }) {
  const [activeTab, setActiveTab] = useState('all');
  const [polarity, setPolarity] = useState('nocturnal');
  const [copiedKey, setCopiedKey] = useState(null);
  const [sampleText, setSampleText] = useState(
    'کشنده ولوو FH500 در محور تهران به بندرعباس با سرعت ۸۶ کیلومتر بر ساعت و دمای یخچال ۴.۲- درجه در حرکت پایدار است.'
  );
  const [demoFuel, setDemoFuel] = useState(78);

  const copyValue = (key, text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1600);
  };

  const showSection = (id) => activeTab === 'all' || activeTab === id;

  return (
    <div className="fleet-site portal-shell" data-polarity={polarity}>
      <div className="lab-shell">
        <header className="topbar">
          <div className="ds-row-wrap">
            {onBackToWebsite && (
              <Button variant="primary" size="sm" onClick={onBackToWebsite}>
                <ArrowRight size={16} aria-hidden="true" />
                <span>بازگشت به وب‌سایت</span>
              </Button>
            )}
            <div className="brand-title">
              <h1>پورتال جامع دیزاین سیستم و توکن‌های ناوگان</h1>
              <p>تک‌منبع حقیقت: tokens/design-tokens.json · کامپوننت‌های مشترک src/ds/</p>
            </div>
          </div>

          <div className="ds-row-wrap">
            <Button
              variant="pill"
              size="sm"
              active={polarity === 'nocturnal'}
              onClick={() => setPolarity('nocturnal')}
            >
              <Moon size={14} aria-hidden="true" />
              <span>قطبیت شب راداری</span>
            </Button>
            <Button
              variant="pill"
              size="sm"
              active={polarity === 'daylight'}
              onClick={() => setPolarity('daylight')}
            >
              <Sun size={14} aria-hidden="true" />
              <span>قطبیت روز شنی</span>
            </Button>
            {onOpenLab && (
              <Button variant="ghost" size="sm" onClick={onOpenLab}>
                <Compass size={14} aria-hidden="true" />
                <span>آزمایشگاه هندسه</span>
              </Button>
            )}
          </div>
        </header>

        <div className="portal-tab-bar" role="tablist" aria-label="بخش‌های پورتال دیزاین سیستم">
          {[
            { id: 'all', label: 'همه بخش‌ها', icon: Sparkles },
            { id: 'colors', label: 'رنگ و قطبیت معنایی', icon: Palette },
            { id: 'typography', label: 'تایپوگرافی پیدا', icon: Type },
            { id: 'geometry', label: 'هندسه، فاصله S و مواد 3D', icon: Box },
            { id: 'components', label: 'کامپوننت‌های زنده src/ds', icon: Cpu },
            { id: 'tokens', label: 'خروجی خودکار توکن‌ها', icon: Code2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <Button
                key={tab.id}
                variant="pill"
                size="sm"
                role="tab"
                aria-selected={isSel}
                active={isSel}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={14} aria-hidden="true" />
                <span>{tab.label}</span>
              </Button>
            );
          })}
        </div>

        <main className="ds-stack-lg">
          {showSection('colors') && (
            <Card variant="panel" className="ds-stack-md">
              <div className="ds-between-wrap">
                <div className="ds-stack-xs">
                  <Capsule variant="eyebrow">لایه اول و دوم · رنگ‌های مادر و توکن‌های معنایی</Capsule>
                  <h2>پالت برند، مقیاس‌ها و وضعیت‌های تله‌متری</h2>
                </div>
                <StatusChip
                  status="moving"
                  label={polarity === 'daylight' ? 'نمایش زنده در قطبیت روز شنی' : 'نمایش زنده در قطبیت شب راداری'}
                />
              </div>

              <div className="portal-swatch-grid">
                {CORE_SWATCHES.map((sw) => (
                  <div key={sw.token} className="portal-swatch-card">
                    <div className="portal-swatch-preview" style={{ '--swatch-bg': `var(${sw.token})` }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyValue(sw.token, `var(${sw.token})`)}
                        aria-label={`کپی متغیر ${sw.token}`}
                      >
                        {copiedKey === sw.token ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                        <span className="ltr-code">{sw.hex}</span>
                      </Button>
                    </div>
                    <div className="portal-swatch-body">
                      <strong>{sw.name}</strong>
                      <span className="ltr-code ds-accent-soft-text">{sw.token}</span>
                      <span className="ltr-code ds-muted">{sw.spec}</span>
                      <p className="ds-muted">{sw.usage}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="ds-stack-xs">
                <h3>طیف تله‌متری ناوگان (با شکل و برچسب غیررنگی)</h3>
                <div className="ds-row-wrap">
                  {TELEMETRY_SWATCHES.map((ts) => (
                    <StatusChip key={ts.token} status={ts.status} label={`${ts.label} (${ts.hex})`} />
                  ))}
                </div>
              </div>
            </Card>
          )}

          {showSection('typography') && (
            <Card variant="panel" className="ds-stack-md">
              <div className="ds-between-wrap">
                <div className="ds-stack-xs">
                  <Capsule variant="eyebrow">خانواده تایپوگرافی فارسی · Peyda</Capsule>
                  <h2>مقیاس تایپی و ارقام هم‌عرض (Tabular Numerals)</h2>
                </div>

                <div className="ds-stack-xs">
                  <label htmlFor="portal-sample-input" className="ds-muted">متن آزمایشی زنده:</label>
                  <input
                    id="portal-sample-input"
                    type="text"
                    className="portal-input"
                    value={sampleText}
                    onChange={(e) => setSampleText(e.target.value)}
                  />
                </div>
              </div>

              <div className="ds-stack-sm">
                {PEYDA_WEIGHTS.map((w) => (
                  <Card key={w.weight} variant="glass" compact className="type-specimen-row">
                    <div className="ds-stack-xs">
                      <strong className="ds-accent-text">
                        {toFa(w.weight)} · {w.faName}
                      </strong>
                      <span className="ds-muted">{w.usage}</span>
                    </div>
                    <div
                      className="peyda-live-sample ds-tabular"
                      style={{ '--sample-weight': w.weight, '--sample-size': '20px' }}
                    >
                      {sampleText}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {showSection('geometry') && (
            <Card variant="panel" className="ds-stack-md">
              <div className="ds-stack-xs">
                <Capsule variant="eyebrow">هندسه استخراج‌شده و مقیاس فاصله S = 23.145px</Capsule>
                <h2>ضرایب هندسی، مقیاس فاصله‌گذاری و پارامترهای فیزیکی سه‌بعدی</h2>
              </div>

              <div className="portal-swatch-grid">
                {GEOMETRY_TOKENS.map((g) => (
                  <Card key={g.token} variant="glass" compact className="ds-stack-xs">
                    <div className="ds-between">
                      <strong>{g.title}</strong>
                      <span className="ltr-code ds-accent-text">{g.value}</span>
                    </div>
                    <span className="ltr-code ds-muted">{g.token}</span>
                    <p className="ds-muted">{g.desc}</p>
                  </Card>
                ))}
              </div>

              <div className="ds-stack-xs">
                <h3>مقیاس فاصله‌گذاری مبتنی بر مدول S</h3>
                <div className="portal-scale-strip">
                  {Object.entries(DESIGN_TOKENS.spacing).map(([key, val]) => (
                    <Card key={key} variant="glass" compact className="ds-stack-xs">
                      <strong className="ltr-code ds-accent-text">--ds-space-{key}</strong>
                      <span className="ltr-code ds-muted">{val}</span>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {showSection('components') && (
            <Card variant="panel" className="ds-stack-md">
              <div className="ds-stack-xs">
                <Capsule variant="eyebrow">کتابخانه مشترک src/ds/ · بدون تکرار کد</Capsule>
                <h2>کامپوننت‌های اجرایی مشترک وب‌سایت و پورتال</h2>
              </div>

              <div className="section-grid">
                <Card variant="glass" className="ds-stack-md">
                  <h3>۱. دکمه‌ها (Button) و کپسول‌ها (Capsule)</h3>
                  <div className="ds-row-wrap">
                    <Button variant="primary">
                      <Navigation size={16} aria-hidden="true" />
                      <span>دکمه اصلی ناوگان</span>
                    </Button>
                    <Button variant="secondary">دکمه ثانویه افق</Button>
                    <Button variant="ghost">دکمه شیشه‌ای</Button>
                    <Button variant="pill" active>فیلتر فعال</Button>
                  </div>
                  <div className="ds-row-wrap">
                    <Capsule variant="eyebrow" pulse>سیگنال زنده ۰.۰۲ ثانیه</Capsule>
                    <Capsule variant="slash">برچسب فنی سرکش</Capsule>
                    <Capsule variant="tag">تگ اطلاعاتی</Capsule>
                  </div>
                </Card>

                <Card variant="glass" className="ds-stack-md">
                  <h3>۲. پلاک ملی ایران (IranPlate) و وضعیت‌ها (StatusChip)</h3>
                  <div className="ds-row-wrap">
                    <IranPlate left2="۴۸" letter="ع" mid3="۷۹۲" iranCode="۱۱" variant="public" />
                    <IranPlate left2="۷۳" letter="ط" mid3="۱۶۹" iranCode="۲۲" variant="private" />
                  </div>
                  <div className="ds-row-wrap">
                    <StatusChip status="moving" label="در حرکت پایدار" />
                    <StatusChip status="cold-chain" icon={Thermometer} label="سردخانه ۴.۲- درجه" />
                    <StatusChip status="idle" label="توقف درجا" />
                    <StatusChip status="critical" label="خروج از مرز" />
                  </div>
                </Card>
              </div>

              <div className="section-grid">
                <Card variant="chisel" polarity="nocturnal" tilt className="ds-stack-md">
                  <h3>۳. کارت پخ‌خورده (Card variant=&quot;chisel&quot;) + گیج مورب (Gauge)</h3>
                  <Gauge
                    segments={14}
                    activeCount={Math.round((demoFuel / 100) * 14)}
                    label="سطح سوخت باک (برش ۲۶.۸۴- درجه)"
                    value={`${toFa(demoFuel)}٪`}
                    tone={demoFuel < 40 ? 'accent' : 'moving'}
                  />
                  <div className="ds-row-md">
                    <label htmlFor="portal-fuel-slider" className="ds-muted">تغییر مقدار گیج:</label>
                    <input
                      id="portal-fuel-slider"
                      type="range"
                      className="cinema-range"
                      min="0"
                      max="100"
                      value={demoFuel}
                      onChange={(e) => setDemoFuel(Number(e.target.value))}
                    />
                  </div>
                </Card>

                <Card variant="cushion" tilt className="ds-stack-md">
                  <h3>۴. کارت بالشتکی روشن (Card variant=&quot;cushion&quot;)</h3>
                  <p>
                    سطح روشن با سایه نرم دوطرفه و کنتراست ۱۲.۰۳:۱ برای پنل‌های تحلیلی روزانه و امتیازدهی رانندگان.
                  </p>
                  <div>
                    <StatusChip status="moving" label="تست‌شده با حرکت سه‌بعدی ماوس (Tilt)" />
                  </div>
                </Card>
              </div>

              <div className="portal-dodont-grid">
                <Card variant="glass" compact className="portal-do-card ds-stack-xs">
                  <StatusChip status="moving" label="انجام دهید (Do)" />
                  <p>
                    در تمام کامپوننت‌ها فقط از توکن‌های معنایی مانند <span className="ltr-code">var(--ds-surface)</span> و <span className="ltr-code">var(--ds-on-surface)</span> استفاده کنید تا تغییر قطبیت خودکار عمل کند.
                  </p>
                </Card>
                <Card variant="glass" compact className="portal-dont-card ds-stack-xs">
                  <StatusChip status="critical" label="انجام ندهید (Don't)" />
                  <p>
                    از کدهای هگز خام، توابع رنگ شفاف دستی یا متن سفید روی دکمه نارنجی استفاده نکنید؛ گیت <span className="ltr-code">npm run lint:tokens</span> بیلد را متوقف می‌کند.
                  </p>
                </Card>
              </div>
            </Card>
          )}

          {showSection('tokens') && (
            <Card variant="panel" className="ds-stack-md">
              <div className="ds-between-wrap">
                <div className="ds-stack-xs">
                  <Capsule variant="eyebrow">زنجیره تولید خودکار · scripts/build-tokens.mjs</Capsule>
                  <h2>نمونه خروجی زنده از tokens/design-tokens.json</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyValue('json', JSON.stringify(DESIGN_TOKENS, null, 2))}
                >
                  {copiedKey === 'json' ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                  <span>کپی کل توکن‌های JS</span>
                </Button>
              </div>

              <pre className="portal-code-box">
                {JSON.stringify(
                  {
                    semantic: 'tokens/tokens.css ([data-polarity="daylight"])',
                    spacing: DESIGN_TOKENS.spacing,
                    geometry: DESIGN_TOKENS.geometry,
                    material3d: DESIGN_TOKENS.material3d.pbr,
                  },
                  null,
                  2
                )}
              </pre>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
