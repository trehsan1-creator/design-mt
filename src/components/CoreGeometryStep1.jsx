import React, { useState } from 'react';
import { LOGO_PATH_D, BRAND_COLORS, GRADIENT_STOPS } from '../data/geometryData.js';
import Logo3DInspector from './Logo3DInspector.jsx';
import { Button, Card, Capsule } from '../ds/index.js';
import { toFa } from '../utils/faDigits.js';

export default function CoreGeometryStep1() {
  const [showGrid, setShowGrid] = useState(true);
  const [showFillets, setShowFillets] = useState(true);
  const [mode3D, setMode3D] = useState('chisel');
  const [showWire, setShowWire] = useState(false);
  const [showRig, setShowRig] = useState(true);

  return (
    <section className="fleet-section">
      <div className="ds-stack-lg">
        <div className="section-grid">
          <Card variant="panel" className="ds-stack-md">
            <div className="ds-stack-xs">
              <div>
                <Capsule variant="slash">منبع ۰۱ · کالبدشکافی دقیق logo.svg</Capsule>
              </div>
              <h3>شبکه مدولار نشان برند (234.21 × 324.76)</h3>
            </div>

            <div className="ds-row-wrap">
              <Button variant="pill" size="sm" active={showGrid} onClick={() => setShowGrid(!showGrid)}>
                خطوط شبکه و زین طلایی
              </Button>
              <Button variant="pill" size="sm" active={showFillets} onClick={() => setShowFillets(!showFillets)}>
                شعاع‌های پایانه و فیلت‌ها
              </Button>
            </div>

            <div className="cad-stage">
              <svg viewBox="-30 -25 295 375" className="lab-svg-canvas" role="img" aria-label="نقشه مهندسی نشان برند">
                {showGrid && (
                  <g stroke="var(--ds-sand-300)" strokeOpacity="0.22" strokeDasharray="4 4">
                    <line x1="117.17" y1="-15" x2="117.17" y2="340" stroke="var(--ds-color-signal-orange)" strokeOpacity="0.6" />
                    <line x1="-15" y1="123.6" x2="255" y2="123.6" stroke="var(--ds-color-signal-orange)" strokeOpacity="0.6" />
                    <rect x="0" y="0" width="234.21" height="324.76" fill="none" />
                  </g>
                )}

                <path
                  d={LOGO_PATH_D}
                  fill="var(--ds-sand-300)"
                  fillOpacity="0.16"
                  stroke="var(--ds-sand-300)"
                  strokeWidth="2.2"
                />

                {showFillets && (
                  <g fill="none" stroke="var(--ds-color-signal-orange)" strokeWidth="2">
                    <circle cx="222.64" cy="11.57" r="11.57" />
                    <circle cx="11.58" cy="313.19" r="11.57" />
                    <circle cx="131.72" cy="37.58" r="14.54" />
                    <circle cx="37.7" cy="138.04" r="14.54" />
                  </g>
                )}
              </svg>
            </div>

            <div className="metric-list">
              <div className="metric-item">
                <div className="metric-head">
                  <strong>مدول ضخامت نوار (S)</strong>
                  <span className="metric-val ltr-code">S = 23.145 pt</span>
                </div>
                <p className="ds-muted">تمام پایانه‌های کپسولی با شعاع S/2 = 11.57pt و فیلت‌های داخلی با R = 14.54pt رسم شده‌اند.</p>
              </div>
              <div className="metric-item">
                <div className="metric-head">
                  <strong>تقسیم عمودی در تراز ۳۸.۰۶٪</strong>
                  <span className="metric-val ltr-code">y = 123.60 / 324.76</span>
                </div>
                <p className="ds-muted">محور افقی میانی نشان در نسبت ۰.۳۸۰۶ ارتفاع قرار گرفته است.</p>
              </div>
            </div>
          </Card>

          <Card variant="panel" className="ds-stack-md">
            <div className="ds-stack-xs">
              <div>
                <Capsule variant="slash">منبع ۰۲ و ۰۳ · پالت COLORS.md و گرادیان gradiant.pdf</Capsule>
              </div>
              <h3>قطبیت رنگی و منحنی چهارمرحله‌ای افق</h3>
            </div>

            <Card variant="chisel" compact className="ds-between-wrap">
              <div className="ds-stack-xs">
                <strong>گرادیان چهارمرحله‌ای استخراج‌شده از gradiant.pdf</strong>
                <span className="ds-muted">کمینه تیرگی در ۴۱.۵۸٪ و بازتاب ثانویه در ۷۸.۶۱٪</span>
              </div>
              <span className="ltr-code ds-accent-soft-text">140.24°</span>
            </Card>

            <div className="portal-scale-strip">
              {GRADIENT_STOPS.map((st) => (
                <div key={st.pos} className="portal-scale-chip" style={{ '--swatch-bg': st.cssVar }}>
                  <strong className="ltr-code">{toFa(st.pos)}٪</strong>
                  <span className="ltr-code ds-muted">{st.hex}</span>
                </div>
              ))}
            </div>

            <div className="ds-stack-sm">
              {BRAND_COLORS.map((c) => (
                <Card key={c.hex} variant="glass" compact className="ds-between-wrap">
                  <div className="ds-row">
                    <span className="brand-mark-pill" style={{ '--swatch-bg': c.cssVar }} />
                    <div className="ds-stack-xs">
                      <strong>{c.name}</strong>
                      <span className="ds-muted">{c.role}</span>
                    </div>
                  </div>
                  <span className="ltr-code ds-accent-text">{c.hex}</span>
                </Card>
              ))}
            </div>
          </Card>
        </div>

        <div className="section-grid">
          <Card variant="panel" className="ds-stack-md">
            <div className="ds-stack-xs">
              <div>
                <Capsule variant="slash">منبع ۰۴ · پارامترهای سه‌بعدی (3d_front.pdf + gradiant.pdf)</Capsule>
              </div>
              <h3>بازرس زنده فیزیک حجم و زاویه تابش نور</h3>
            </div>

            <div className="ds-row-wrap">
              <Button variant="pill" size="sm" active={mode3D === 'chisel'} onClick={() => setMode3D('chisel')}>
                حالت پخ‌خورده (۴۳.۰۸°)
              </Button>
              <Button variant="pill" size="sm" active={mode3D === 'inflate'} onClick={() => setMode3D('inflate')}>
                حالت بالشتکی (۷۱°)
              </Button>
              <Button variant="pill" size="sm" active={showWire} onClick={() => setShowWire(!showWire)}>
                توری سه‌بعدی
              </Button>
              <Button variant="pill" size="sm" active={showRig} onClick={() => setShowRig(!showRig)}>
                بردار نور
              </Button>
            </div>

            <Logo3DInspector mode={mode3D} showWireframe={showWire} showLightRig={showRig} />
          </Card>

          <Card variant="panel" className="ds-stack-md">
            <h3>مقایسه رندرهای مرجع ایلاستریتور</h3>
            <div className="kpi-2-grid">
              <div className="cad-stage ds-stack-xs">
                <img src="/refs/3d_front.webp" alt="مرجع حجم بالشتکی" className="lab-svg-canvas" />
                <strong>حجم بالشتکی (Inflate ۷۶٪)</strong>
                <span className="ds-muted">نور از بالا (۷۱ درجه) · نرم و یکپارچه</span>
              </div>
              <div className="cad-stage ds-stack-xs">
                <img src="/refs/gradiant.webp" alt="مرجع حجم پخ‌خورده" className="lab-svg-canvas" />
                <strong>پخ تراش‌خورده (Bevel ۶۰٪)</strong>
                <span className="ds-muted">نور مایل ۴۳.۰۸° · قاب چهارگوش‌نرم ۳۱.۲۵٪</span>
              </div>
            </div>

            <div className="metric-item">
              <div className="metric-head">
                <strong>جنس سطح مات-ابریشمی</strong>
                <span className="metric-val ltr-code">Roughness 0.40 · Metallic 0</span>
              </div>
              <p className="ds-muted">
                در هر دو فایل مرجع، فلزی بودن صفر و زبری ۴۰٪ ثبت شده است که بازتاب نرم پلیمری ایجاد می‌کند.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
