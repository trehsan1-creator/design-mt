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
  ShieldCheck,
  Fuel,
  Send,
} from 'lucide-react';
import DESIGN_TOKENS from '../../../tokens/tokens.js';
import { PEYDA_WEIGHTS } from '../../data/geometryData.js';
import { toFa } from '../../utils/faDigits.js';

const CORE_SWATCHES = [
  {
    name: 'نارنجی سیگنال زنده',
    token: '--ds-color-signal-orange',
    hex: '#FF742E',
    spec: 'HSL(20.1°, 100%, 59%) · OKLCH(71.6%, 0.187, 43.8°)',
    usage: 'پالس زنده GPS، دکمه اصلی سه‌بعدی، هشدار انحراف و سوخت',
    textCol: '#102333',
  },
  {
    name: 'سرمه‌ای راداری عمیق',
    token: '--ds-color-deep-navy',
    hex: '#102333',
    spec: 'HSL(207.4°, 52.2%, 13.1%) · OKLCH(24.8%, 0.040, 245.7°)',
    usage: 'بدنه پنل‌های فرماندهی، پس‌زمینه رادار و تایپوگرافی روی بژ گرم',
    textCol: '#E8DECD',
  },
  {
    name: 'بژ گرم روز شنی',
    token: '--ds-color-warm-sand',
    hex: '#E8DECD',
    spec: 'HSL(37.8°, 37%, 85.7%) · OKLCH(90.4%, 0.025, 81.1°)',
    usage: 'تایپوگرافی روشن روی سرمه‌ای و بوم بخش‌های روزانه با کنتراست ۱۲.۰۳:۱',
    textCol: '#102333',
  },
];

const TELEMETRY_SWATCHES = [
  { label: 'در حرکت پایدار', token: '--ds-status-moving', hex: '#4ADE80' },
  { label: 'سیگنال فعال / هشدار باک', token: '--ds-status-signal', hex: '#FF742E' },
  { label: 'کریدور ترانزیتی', token: '--ds-status-corridor', hex: '#38BDF8' },
  { label: 'زنجیره سرد یخچالی', token: '--ds-status-cold-chain', hex: '#22D3EE' },
  { label: 'توقف درجا (Idle)', token: '--ds-status-idle', hex: '#FACC15' },
  { label: 'خروج اضطراری ژئوفنس', token: '--ds-status-critical', hex: '#EF4444' },
];

const GEOMETRY_TOKENS = [
  { token: '--ds-geo-stroke-s', value: '23.145px', title: 'مدول ضخامت نوار لوگو (S)', desc: 'واحد پایه هندسه نشان و لوگوتایپ (U = 23.86px ≈ S)' },
  { token: '--ds-geo-golden-fillet', value: '14.54px', title: 'فیلت طلایی داخلی (S / φ)', desc: 'شعاع گوشه دکمه‌های سه‌بعدی و اتصالات لوگو' },
  { token: '--ds-geo-squircle', value: '31.25%', title: 'اسکوئیرکل اختصاصی ۵/۱۶', desc: 'قاب آیکن‌ها، نودهای رادار و پوسته سخت‌افزار GPS' },
  { token: '--ds-geo-golden-split', value: '38.06%', title: 'نسبت زین طلایی (۱/φ²)', desc: 'تقسیم‌بندی ۳۸.۱٪ به ۶۱.۹٪ در بخش قهرمان و کارت‌های Bento' },
  { token: '--ds-geo-kaf-skew', value: '-26.84deg', title: 'برش سرعت سرکش «ک» پیدا', desc: 'زاویه تیغه‌های گیج سوخت، دور موتور و امتیاز راننده' },
  { token: '--ds-geo-radar-cone', value: '30.6deg', title: 'دهانه مخروط رادار رقم «۷»', desc: 'زاویه دید پرتو اسکن رادار زنده ناوگان' },
];

export default function DesignSystemPortal({ onBackToWebsite, onOpenLab }) {
  const [activeTab, setActiveTab] = useState('all');
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

  return (
    <div className="site-root" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      {/* Top Sticky Portal Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 70,
          background: 'rgba(6, 14, 22, 0.88)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(232, 222, 205, 0.14)',
          padding: '14px 0',
        }}
      >
        <div
          className="site-container"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={onBackToWebsite} className="btn-3d-orange" style={{ padding: '9px 18px', fontSize: 13.5 }}>
              <ArrowRight size={16} />
              <span>بازگشت به وب‌سایت اصلی</span>
            </button>
            <div>
              <div style={{ fontSize: 17, fontWeight: 900 }}>پورتال جامع دیزاین سیستم و توکن‌های ناوگان</div>
              <div style={{ fontSize: 11.5, color: 'rgba(232,222,205,0.65)' }}>
                مستندات زنده `DESIGN.md` · `tokens/design-tokens.json` · `tokens/tokens.css` · ۹ وزن فونت پیدا
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'همه بخش‌ها', icon: Sparkles },
              { id: 'colors', label: 'رنگ و قطبیت', icon: Palette },
              { id: 'typography', label: 'تایپوگرافی پیدا', icon: Type },
              { id: 'geometry', label: 'هندسه و مواد 3D', icon: Box },
              { id: 'components', label: 'کامپوننت‌های ناوگان', icon: Cpu },
              { id: 'tokens', label: 'کد توکن‌ها', icon: Code2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`chip-btn ${activeTab === tab.id ? 'on' : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
            <button onClick={onOpenLab} className="chip-btn" title="مشاهده آزمایشگاه کالبدشکافی هندسه">
              <Compass size={14} style={{ verticalAlign: 'middle', marginLeft: 5 }} />
              آزمایشگاه هندسه
            </button>
          </div>
        </div>
      </div>

      <div className="site-container" style={{ paddingTop: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>
        {/* Hero Banner of Design System */}
        <div
          className="cad-card"
          style={{
            padding: '34px 32px',
            background: 'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)',
            borderColor: 'rgba(255, 116, 46, 0.4)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ maxWidth: 780 }}>
              <span className="kaf-slash-tag">نسخه ۱.۰.۰ · استاندارد W3C DTCG + CSS Custom Properties + Three.js PBR</span>
              <h1 style={{ fontSize: 'clamp(26px, 3.2vw, 40px)', fontWeight: 900, marginTop: 10, marginBottom: 10 }}>
                دیزاین سیستم مهندسی‌شده از هسته هندسی برند
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(232,222,205,0.86)', lineHeight: 1.85 }}>
                تک‌تک توکن‌ها، زوایا، شعاع‌های اسکوئیرکل، گرادیان‌های چهارمرحله‌ای بدنه خودرو و کامپوننت‌های ردیابی ناوگان در این سامانه از کالبدشکافی ریاضی فایل‌های اصلی برند و ۹ وزن فونت فارسی <strong>«پیدا»</strong> استخراج شده‌اند.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(6,14,22,0.58)', padding: '18px 24px', borderRadius: 24, border: '1px solid rgba(232,222,205,0.16)' }}>
              <img src="/brand-clean/logo-clean.svg" alt="نشان تمیز" style={{ height: 52, filter: 'brightness(0) invert(0.95)' }} />
              <img src="/brand-clean/typography-clean.svg" alt="لوگوتایپ تمیز" style={{ height: 34, filter: 'brightness(0) invert(0.95)' }} />
            </div>
          </div>
        </div>

        {/* ۱. رنگ‌ها، گرادیان بدنه خودرو و کنتراست WCAG */}
        {(activeTab === 'all' || activeTab === 'colors') && (
          <section className="cad-card">
            <div style={{ marginBottom: 22 }}>
              <span className="kaf-slash-tag">۰۱ · سیستم رنگ، گرادیان ۱۴۰.۲۴° و قطبیت شب/روز</span>
              <h2 style={{ fontSize: 25, fontWeight: 900, marginTop: 8 }}>قطب‌های مکمل ۱۸۷.۳° و طیف‌های معنایی تله‌متری</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18, marginBottom: 24 }}>
              {CORE_SWATCHES.map((sw) => (
                <div
                  key={sw.token}
                  style={{
                    borderRadius: 24,
                    overflow: 'hidden',
                    border: '1px solid rgba(232,222,205,0.16)',
                    background: 'rgba(8, 19, 29, 0.8)',
                  }}
                >
                  <div
                    style={{
                      height: 112,
                      background: sw.hex,
                      color: sw.textCol,
                      padding: 18,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-end',
                    }}
                  >
                    <span style={{ fontWeight: 900, fontSize: 18 }}>{sw.name}</span>
                    <button
                      onClick={() => copyValue(sw.token, sw.hex)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: 9,
                        border: 'none',
                        background: 'rgba(16,35,51,0.18)',
                        color: sw.textCol,
                        fontWeight: 800,
                        fontSize: 12,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 5,
                      }}
                    >
                      {copiedKey === sw.token ? <Check size={13} /> : <Copy size={13} />}
                      <span className="ltr-code">{sw.hex}</span>
                    </button>
                  </div>
                  <div style={{ padding: 16 }}>
                    <div className="ltr-code" style={{ fontSize: 12, color: '#FF9861', marginBottom: 4 }}>{sw.token}</div>
                    <div className="ltr-code" style={{ fontSize: 11, color: 'rgba(232,222,205,0.58)', marginBottom: 8 }}>{sw.spec}</div>
                    <div style={{ fontSize: 13, color: 'rgba(232,222,205,0.82)' }}>{sw.usage}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 140.24deg Clearcoat Gradient Bar + WCAG Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 18, marginBottom: 22 }}>
              <div
                style={{
                  borderRadius: 22,
                  padding: 22,
                  background: DESIGN_TOKENS.gradients.clearcoatHorizon,
                  border: '1px solid rgba(232,222,205,0.22)',
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 800, color: '#FFB085' }}>گرادیان بدنه خودرو (--ds-grad-clearcoat)</div>
                <div style={{ fontSize: 18, fontWeight: 900, margin: '6px 0' }}>زاویه دقیق ۱۴۰.۲۴ درجه با منحنی S-Curve</div>
                <div className="ltr-code" style={{ fontSize: 11.5, color: 'rgba(232,222,205,0.82)' }}>
                  0% #3D5768 → 41.58% #112835 → 78.61% #213D4F → 100% #132D3F
                </div>
              </div>

              <div style={{ borderRadius: 22, padding: 20, background: 'rgba(7,17,26,0.75)', border: '1px solid rgba(232,222,205,0.12)' }}>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10 }}>ماتریس استاندارد کنتراست (WCAG 2.1)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>سرمه‌ای `#102333` روی بژ `#E8DECD`</span>
                    <strong style={{ color: '#4ADE80' }}>۱۲.۰۳ : ۱ (AAA عالی)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>نارنجی `#FF742E` روی سرمه‌ای `#102333`</span>
                    <strong style={{ color: '#38BDF8' }}>۵.۹۵ : ۱ (AA استاندارد)</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>نارنجی `#FF742E` روی بژ `#E8DECD`</span>
                    <strong style={{ color: '#FACC15' }}>۲.۰۲ : ۱ (فقط حجم سه‌بعدی)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry Status Tokens */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(185px, 1fr))', gap: 12 }}>
              {TELEMETRY_SWATCHES.map((st) => (
                <div
                  key={st.token}
                  onClick={() => copyValue(st.token, `var(${st.token})`)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: 'rgba(7,17,26,0.78)',
                    border: '1px solid rgba(232,222,205,0.12)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span style={{ width: 16, height: 16, borderRadius: 5, background: st.hex, boxShadow: `0 0 12px ${st.hex}` }} />
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 800 }}>{st.label}</div>
                    <div className="ltr-code" style={{ fontSize: 10.5, color: 'rgba(232,222,205,0.6)' }}>{st.token}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ۲. تایپوگرافی ۹ وزن فونت «پیدا» */}
        {(activeTab === 'all' || activeTab === 'typography') && (
          <section className="cad-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
              <div>
                <span className="kaf-slash-tag">۰۲ · سیستم تایپوگرافی فارسی «پیدا» (Peyda v2.000)</span>
                <h2 style={{ fontSize: 25, fontWeight: 900, marginTop: 8 }}>آزمایش زنده هر ۹ وزن (۱۰۰ تا ۹۰۰) و مقیاس سلسله‌مراتب متن</h2>
              </div>

              <input
                type="text"
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                placeholder="متن دلخواه خود را برای تست فونت پیدا بنویسید..."
                style={{
                  minWidth: 340,
                  padding: '10px 14px',
                  borderRadius: 12,
                  border: '1px solid rgba(255,116,46,0.4)',
                  background: 'rgba(8,19,29,0.9)',
                  color: '#E8DECD',
                  fontSize: 13.5,
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {PEYDA_WEIGHTS.map((pw) => (
                <div
                  key={pw.weight}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 18,
                    background: pw.weight >= 800 ? 'rgba(255,116,46,0.08)' : 'rgba(7,17,26,0.68)',
                    border: pw.weight === 900 ? '1px solid rgba(255,116,46,0.4)' : '1px solid rgba(232,222,205,0.1)',
                    display: 'grid',
                    gridTemplateColumns: '170px 1fr',
                    gap: 16,
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: pw.weight >= 800 ? '#FF742E' : '#E8DECD' }}>
                      وزن {toFa(pw.weight)} · {pw.faName}
                    </div>
                    <div className="ltr-code" style={{ fontSize: 11, color: 'rgba(232,222,205,0.55)' }}>
                      --ds-weight-{pw.name.toLowerCase()}
                    </div>
                  </div>
                  <div style={{ fontWeight: pw.weight, fontSize: 19, lineHeight: 1.65 }}>
                    {sampleText}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ۳. ثوابت هندسی، مواد سه‌بعدی و منحنی‌های حرکت */}
        {(activeTab === 'all' || activeTab === 'geometry') && (
          <section className="cad-card">
            <div style={{ marginBottom: 22 }}>
              <span className="kaf-slash-tag">۰۳ · توکن‌های هندسی CAD و مواد سه‌بعدی دوحالته</span>
              <h2 style={{ fontSize: 25, fontWeight: 900, marginTop: 8 }}>ثوابت استخراج‌شده از لوگو، حروف پیدا و فایل‌های سه‌بعدی</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
              {GEOMETRY_TOKENS.map((gt) => (
                <div
                  key={gt.token}
                  style={{
                    padding: 18,
                    borderRadius: 20,
                    background: 'rgba(7,17,26,0.75)',
                    border: '1px solid rgba(232,222,205,0.12)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span className="ltr-code" style={{ fontSize: 11.5, color: '#38BDF8' }}>{gt.token}</span>
                    <span className="ltr-code" style={{ fontSize: 15, fontWeight: 900, color: '#FF742E' }}>{gt.value}</span>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>{gt.title}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(232,222,205,0.72)' }}>{gt.desc}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ۴. کتابخانه زنده کامپوننت‌های عملیاتی ناوگان */}
        {(activeTab === 'all' || activeTab === 'components') && (
          <section className="cad-card">
            <div style={{ marginBottom: 22 }}>
              <span className="kaf-slash-tag">۰۴ · کتابخانه کامپوننت‌های عملیاتی ناوگان و GPS</span>
              <h2 style={{ fontSize: 25, fontWeight: 900, marginTop: 8 }}>اجزای لمسی سه‌بعدی آماده استفاده در محصول</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
              {/* Buttons & Chips */}
              <div style={{ padding: 22, borderRadius: 22, background: 'rgba(7,17,26,0.75)', border: '1px solid rgba(232,222,205,0.12)' }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>دکمه‌های سه‌بعدی لبه‌دار و چیپ‌های فیلتر</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
                  <button className="btn-3d-orange">
                    <Send size={15} />
                    <span>فراخوان اصلی (.btn-3d-orange)</span>
                  </button>
                  <button className="btn-3d-navy">
                    <ShieldCheck size={15} />
                    <span>دکمه بدنه (.btn-3d-navy)</span>
                  </button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  <span className="chip-btn on">چیپ فعال ناوگان</span>
                  <span className="chip-btn">فیلتر زنجیره سرد</span>
                  <span className="kaf-slash-tag">برچسب سرکش ک</span>
                </div>
              </div>

              {/* Iranian License Plates & Live Status */}
              <div style={{ padding: 22, borderRadius: 22, background: 'rgba(7,17,26,0.75)', border: '1px solid rgba(232,222,205,0.12)' }}>
                <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>پلاک استاندارد ایران (.iran-plate)</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 16 }}>
                  <div className="iran-plate">
                    <div className="iran-plate-blue"><span>I.R.</span><span>IRAN</span></div>
                    <div className="iran-plate-main" style={{ background: '#FACC15' }}>
                      <span>۴۸</span><span style={{ color: '#102333' }}>ع</span><span>۷۹۲</span>
                    </div>
                    <div className="iran-plate-city" style={{ background: '#FACC15' }}><span>ایران</span><strong>۱۱</strong></div>
                  </div>

                  <div className="iran-plate">
                    <div className="iran-plate-blue"><span>I.R.</span><span>IRAN</span></div>
                    <div className="iran-plate-main">
                      <span>۷۳</span><span style={{ color: '#FF742E' }}>ط</span><span>۱۶۹</span>
                    </div>
                    <div className="iran-plate-city"><span>ایران</span><strong>۲۲</strong></div>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: 'rgba(232,222,205,0.72)' }}>
                  پشتیبانی از پلاک زرد ناوگان عمومی/سنگین و پلاک سفید سازمانی با فونت پیدا وزن ۸۰۰.
                </div>
              </div>

              {/* Kaf-Slash Fuel Gauge + Squircle Slider */}
              <div style={{ padding: 22, borderRadius: 22, background: 'rgba(7,17,26,0.75)', border: '1px solid rgba(232,222,205,0.12)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 800 }}>گیج سوخت مورب ۲۶.۸۴° + اسلایدر اسکوئیرکل</span>
                  <strong style={{ color: demoFuel < 30 ? '#FF742E' : '#4ADE80' }}>{toFa(demoFuel)}٪</strong>
                </div>
                <div style={{ display: 'flex', gap: 5, marginBottom: 16, padding: '0 4px' }}>
                  {Array.from({ length: 16 }).map((_, i) => {
                    const lit = i < Math.round((demoFuel / 100) * 16);
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 16,
                          borderRadius: 3,
                          transform: 'skewX(-26.84deg)',
                          background: lit ? (demoFuel < 30 ? '#FF742E' : '#4ADE80') : 'rgba(232,222,205,0.12)',
                        }}
                      />
                    );
                  })}
                </div>
                <input
                  type="range"
                  className="cinema-range"
                  min="5"
                  max="100"
                  value={demoFuel}
                  onChange={(e) => setDemoFuel(Number(e.target.value))}
                />
              </div>

              {/* Dual Polarity Card Comparison */}
              <div
                className="cushion-card-light"
                style={{ padding: 22, color: '#102333', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <span style={{ fontSize: 12, fontWeight: 800, color: '#FF742E', background: '#102333', alignSelf: 'flex-start', padding: '3px 10px', borderRadius: 999, marginBottom: 8 }}>
                  کارت بالشتکی روز (.cushion-card-light)
                </span>
                <div style={{ fontSize: 17, fontWeight: 900, marginBottom: 4 }}>قطبیت روز شنی با کنتراست ۱۲.۰۳:۱</div>
                <p style={{ fontSize: 13, color: 'rgba(16,35,51,0.78)' }}>
                  مشتق از مد Inflate 76% فایل سه‌بعدی برند برای بخش‌های تحلیلی روشن.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ۵. خروجی مستقیم کدهای توکن */}
        {(activeTab === 'all' || activeTab === 'tokens') && (
          <section className="cad-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
              <div>
                <span className="kaf-slash-tag">۰۵ · فایل‌های رسمی توکن در مخزن گیت‌هاب</span>
                <h2 style={{ fontSize: 23, fontWeight: 900, marginTop: 8 }}>
                  آماده ایمپورت در CSS، React، Three.js، Tailwind و Figma
                </h2>
              </div>

              <button
                onClick={() => copyValue('json-all', JSON.stringify(DESIGN_TOKENS, null, 2))}
                className="btn-3d-navy"
                style={{ padding: '8px 16px', fontSize: 13 }}
              >
                {copiedKey === 'json-all' ? <Check size={15} color="#4ADE80" /> : <Copy size={15} />}
                <span>کپی کل شیء توکن‌ها (JSON)</span>
              </button>
            </div>

            <pre
              className="ltr-code"
              style={{
                background: '#050B12',
                padding: 20,
                borderRadius: 18,
                border: '1px solid rgba(232,222,205,0.14)',
                overflowX: 'auto',
                fontSize: 12.5,
                lineHeight: 1.65,
                color: '#E8DECD',
              }}
            >
{`/* tokens/tokens.css */
:root {
  --ds-color-signal-orange: #FF742E;
  --ds-color-deep-navy:     #102333;
  --ds-color-warm-sand:     #E8DECD;
  --ds-grad-clearcoat:      linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%);
  --ds-font-sans:           'Peyda', Tahoma, sans-serif;
  --ds-geo-stroke-s:        23.145px;
  --ds-geo-golden-fillet:   14.54px;
  --ds-geo-squircle:        31.25%;
  --ds-geo-kaf-skew:        -26.84deg;
  --ds-geo-radar-cone:      30.6deg;
  --ds-ease-spring-lock:    cubic-bezier(0.34, 1.45, 0.64, 1);
}`}
            </pre>
          </section>
        )}
      </div>
    </div>
  );
}
