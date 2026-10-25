import React, { useState } from 'react';
import {
  LOGO_PATH_D,
  PEYDA_CAD_GLYPHS,
  BRAND_COLORS,
} from '../data/geometryData.js';
import Logo3DInspector from './Logo3DInspector.jsx';

export default function CoreGeometryStep1() {
  const [showGrid, setShowGrid] = useState(true);
  const [showGolden, setShowGolden] = useState(true);
  const [showBezier, setShowBezier] = useState(true);
  const [showRadii, setShowRadii] = useState(true);
  const [showQuadrants, setShowQuadrants] = useState(false);

  const [showTypoGrid, setShowTypoGrid] = useState(true);
  const [showTypoZones, setShowTypoZones] = useState(true);
  const [showTypoGaps, setShowTypoGaps] = useState(true);

  const [selectedGlyph, setSelectedGlyph] = useState(PEYDA_CAD_GLYPHS[0]);
  const [mode3D, setMode3D] = useState('chisel');
  const [showWire, setShowWire] = useState(false);
  const [showRig, setShowRig] = useState(true);

  const S = 23.145;
  const u = 23.86;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      {/* 1. Emblem CAD Dissection */}
      <div className="section-grid" style={{ marginBottom: 0 }}>
        <div className="cad-card">
          <div style={{ marginBottom: 14 }}>
            <span className="kaf-slash-tag">منبع ۰۱ · کالبدشکافی نشان اصلی (logo.svg)</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
              توپولوژی زین طلایی (φ) و منحنی کلوتوئید بزرگراهی
            </h2>
          </div>

          <div className="toggle-row">
            <button className={`chip-btn ${showGolden ? 'on' : ''}`} onClick={() => setShowGolden(!showGolden)}>
              محور تقارن و نسبت طلایی φ
            </button>
            <button className={`chip-btn ${showGrid ? 'on' : ''}`} onClick={() => setShowGrid(!showGrid)}>
              گرید ۱۰×۱۴ ضخامت (S)
            </button>
            <button className={`chip-btn ${showBezier ? 'on' : ''}`} onClick={() => setShowBezier(!showBezier)}>
              اهرم‌های بزیه و زوایا
            </button>
            <button className={`chip-btn ${showRadii ? 'on' : ''}`} onClick={() => setShowRadii(!showRadii)}>
              شعاع کپسول و فیلت‌ها
            </button>
            <button className={`chip-btn ${showQuadrants ? 'on' : ''}`} onClick={() => setShowQuadrants(!showQuadrants)}>
              نقشه ۲×۲ پر و خالی
            </button>
          </div>

          <div className="cad-stage" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 470, direction: 'ltr' }}>
            <svg viewBox="-64 -44 372 412" style={{ width: '100%', maxWidth: 490, height: 'auto', overflow: 'visible' }}>
              {showQuadrants && (
                <g>
                  <rect x="0" y="0" width="117.17" height="123.6" fill="rgba(255,116,46,0.16)" />
                  <rect x="117.17" y="0" width="117.04" height="123.6" fill="rgba(61,87,104,0.16)" />
                  <rect x="0" y="123.6" width="117.17" height="201.16" fill="rgba(61,87,104,0.16)" />
                  <rect x="117.17" y="123.6" width="117.04" height="201.16" fill="rgba(255,116,46,0.16)" />
                  <text x="58" y="72" textAnchor="middle" fill="#FFB085" fontSize="9.5" fontWeight="800">Q2: کمان پر</text>
                  <text x="175" y="72" textAnchor="middle" fill="#9CC2DD" fontSize="9.5" fontWeight="800">Q1: دهانه باز</text>
                  <text x="70" y="230" textAnchor="middle" fill="#9CC2DD" fontSize="9.5" fontWeight="800">Q3: دروازه باز</text>
                  <text x="170" y="195" textAnchor="middle" fill="#FFB085" fontSize="9.5" fontWeight="800">Q4: تیغه پر</text>
                </g>
              )}

              {showGrid && (
                <g stroke="rgba(232,222,205,0.13)" strokeWidth="0.6">
                  {Array.from({ length: 11 }).map((_, i) => (
                    <line key={`vx-${i}`} x1={i * S} y1="0" x2={i * S} y2="324.76" />
                  ))}
                  {Array.from({ length: 15 }).map((_, j) => (
                    <line key={`hy-${j}`} x1="0" y1={j * S} x2="234.21" y2={j * S} />
                  ))}
                  <rect x="0" y="0" width="234.21" height="324.76" fill="none" stroke="rgba(232,222,205,0.28)" strokeWidth="0.9" strokeDasharray="3 3" />
                </g>
              )}

              <path d={LOGO_PATH_D} fill="rgba(232, 222, 205, 0.93)" stroke="#FF742E" strokeWidth="1.2" />

              {showGolden && (
                <g>
                  <line x1="117.17" y1="-26" x2="117.17" y2="348" stroke="#FF742E" strokeWidth="1.3" strokeDasharray="5 3" />
                  <text x="117.17" y="-31" textAnchor="middle" fill="#FF742E" fontSize="9.5" fontWeight="800">
                    X = 117.17 (50.03% محور میانی)
                  </text>
                  <line x1="-46" y1="123.6" x2="282" y2="123.6" stroke="#FF742E" strokeWidth="1.3" strokeDasharray="5 3" />
                  <text x="242" y="117" fill="#FF742E" fontSize="9" fontWeight="800">
                    Y = 123.60 (38.1% = 1/φ²)
                  </text>
                  <line x1="-32" y1="0" x2="-32" y2="123.6" stroke="#E8DECD" strokeWidth="1" />
                  <line x1="-32" y1="123.6" x2="-32" y2="324.76" stroke="#FF9A66" strokeWidth="1.2" />
                  <text x="-38" y="64" textAnchor="end" fill="#E8DECD" fontSize="8.5">123.6</text>
                  <text x="-38" y="226" textAnchor="end" fill="#FF9A66" fontSize="8.5" fontWeight="700">201.2 (φ)</text>
                </g>
              )}

              {showBezier && (
                <g>
                  <line x1="0" y1="123.6" x2="0" y2="61.8" stroke="#38BDF8" strokeWidth="1.5" />
                  <line x1="117.17" y1="0" x2="58.58" y2="0" stroke="#38BDF8" strokeWidth="1.5" />
                  <circle cx="0" cy="61.8" r="3.5" fill="#38BDF8" />
                  <circle cx="58.58" cy="0" r="3.5" fill="#38BDF8" />
                  <text x="6" y="52" fill="#38BDF8" fontSize="8.5" fontWeight="800">
                    κ = 0.500 (n = 1.85 کلوتوئید)
                  </text>
                  <line x1="234.09" y1="134.26" x2="229.62" y2="211.18" stroke="#38BDF8" strokeWidth="1.5" />
                  <line x1="137.22" y1="319.13" x2="170.50" y2="287.59" stroke="#38BDF8" strokeWidth="1.5" />
                  <circle cx="229.62" cy="211.18" r="3.5" fill="#38BDF8" />
                  <circle cx="170.50" cy="287.59" r="3.5" fill="#38BDF8" />
                  <text x="176" y="294" fill="#38BDF8" fontSize="8.5" fontWeight="800">
                    136.5° فرود تیغه
                  </text>
                </g>
              )}

              {showRadii && (
                <g>
                  <circle cx="222.64" cy="11.57" r="11.57" fill="none" stroke="#FACC15" strokeWidth="1.3" strokeDasharray="2.5 2" />
                  <circle cx="11.58" cy="313.19" r="11.57" fill="none" stroke="#FACC15" strokeWidth="1.3" strokeDasharray="2.5 2" />
                  <circle cx="37.70" cy="138.14" r="14.54" fill="none" stroke="#4ADE80" strokeWidth="1.3" />
                  <circle cx="131.72" cy="37.68" r="14.54" fill="none" stroke="#4ADE80" strokeWidth="1.3" />
                  <circle cx="131.73" cy="109.02" r="14.53" fill="none" stroke="#4ADE80" strokeWidth="1.3" />
                  <text x="150" y="42" fill="#4ADE80" fontSize="8.5" fontWeight="800">فیلت R = 14.54 (S/φ)</text>
                </g>
              )}
            </svg>
          </div>
        </div>

        <div className="cad-card">
          <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 14 }}>قوانین ریاضی استخراج‌شده از لوگو</h3>
          <div className="metric-list">
            <div className="metric-item">
              <div className="metric-head">
                <strong>۱. نصف‌النهار میانی و افق طلایی (φ)</strong>
                <span className="metric-val ltr-code">X = 50.03% · Y = 38.06%</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--beige-muted)' }}>
                ستون مرکزی در <span className="ltr-code">X = 117.17</span> عرض را دقیقاً دو نیم می‌کند و خط افقی در <span className="ltr-code">Y = 123.60</span> ارتفاع کل را با نسبت طلایی <span className="ltr-code">324.76 / 201.16 = 1.614 ≈ φ</span> (دقت ۹۹.۷۸٪) می‌شکند.
              </p>
            </div>

            <div className="metric-item">
              <div className="metric-head">
                <strong>۲. کوانتوم ضخامت (S) و ماتریس ۱۰×۱۴</strong>
                <span className="metric-val ltr-code">S = 23.145 pt</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--beige-muted)' }}>
                پایه چپ و بازوی بالا ضخامت یکسان <span className="ltr-code">23.15 pt</span> دارند؛ کل لوگو روی شبکه <span className="ltr-code">10S × 14S</span> با تعادل ۴۶٪ جرم پر و ۵۴٪ فضای تنفس نشسته است.
              </p>
            </div>

            <div className="metric-item">
              <div className="metric-head">
                <strong>۳. منحنی رمپ بزرگراهی (کمان کلوتوئید)</strong>
                <span className="metric-val ltr-code">κ = 0.500 · n = 1.85</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--beige-muted)' }}>
                اهرم‌های کمان بالا-چپ دقیقاً روی نیمه دهانه (<span className="ltr-code">0.50</span> به‌جای دایره <span className="ltr-code">0.5523</span>) قرار دارند؛ این همان منحنی انتقالی مهندسی راه برای ورود بدون تکان خودرو به پیچ است!
              </p>
            </div>

            <div className="metric-item">
              <div className="metric-head">
                <strong>۴. سلسله‌مراتب کپسول بیرونی و فیلت داخلی</strong>
                <span className="metric-val ltr-code">0.50S Cap / 0.628S Fillet</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--beige-muted)' }}>
                انتهای بازوها نیم‌دایره کامل (<span className="ltr-code">R = 11.57</span>) است، اما هر ۴ کنج داخلی با شعاع بزرگ‌تر <span className="ltr-code">R = 14.54 ≈ S/φ</span> نرم شده‌اند تا جریان بصری نشکند.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Typography.svg 21u x 7u Dissection */}
      <div className="section-grid" style={{ marginBottom: 0 }}>
        <div className="cad-card">
          <div style={{ marginBottom: 14 }}>
            <span className="kaf-slash-tag">منبع ۰۲ · کالبدشکافی لوگوتایپ (typography.svg)</span>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginTop: 8 }}>
              شبکه شطرنجی ۲۱×۷ با مدول پایه u = ۲۳.۸۶
            </h2>
          </div>

          <div className="toggle-row">
            <button className={`chip-btn ${showTypoGrid ? 'on' : ''}`} onClick={() => setShowTypoGrid(!showTypoGrid)}>
              شبکه ۲۱×۷ مربعی
            </button>
            <button className={`chip-btn ${showTypoZones ? 'on' : ''}`} onClick={() => setShowTypoZones(!showTypoZones)}>
              باندهای افقی ۱-۱-۳-۲
            </button>
            <button className={`chip-btn ${showTypoGaps ? 'on' : ''}`} onClick={() => setShowTypoGaps(!showTypoGaps)}>
              فاصله‌های ۱u و چشم حروف
            </button>
          </div>

          <div className="cad-stage" style={{ padding: '32px 18px', direction: 'ltr' }}>
            <svg viewBox="-26 -28 556 224" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
              {showTypoZones && (
                <g>
                  <rect x="0" y="0" width="497.03" height={u} fill="rgba(255,116,46,0.12)" />
                  <rect x="0" y={u} width="497.03" height={u} fill="rgba(56,189,248,0.06)" />
                  <rect x="0" y={2 * u} width="497.03" height={3 * u} fill="rgba(232,222,205,0.08)" />
                  <rect x="0" y={5 * u} width="497.03" height={2 * u} fill="rgba(250,204,21,0.08)" />
                  <text x="505" y="15" fill="#FFB085" fontSize="8.5" fontWeight="700">1u نقطه‌ها</text>
                  <text x="505" y="39" fill="#38BDF8" fontSize="8.5" fontWeight="700">1u هوا</text>
                  <text x="505" y="86" fill="#E8DECD" fontSize="8.5" fontWeight="700">3u بدنه</text>
                  <text x="505" y="146" fill="#FACC15" fontSize="8.5" fontWeight="700">2u پایین‌رو</text>
                </g>
              )}

              {showTypoGrid && (
                <g stroke="rgba(232,222,205,0.16)" strokeWidth="0.65">
                  {Array.from({ length: 22 }).map((_, i) => (
                    <line key={`tx-${i}`} x1={i * u} y1="0" x2={i * u} y2={7 * u} />
                  ))}
                  {Array.from({ length: 8 }).map((_, j) => (
                    <line key={`ty-${j}`} x1="0" y1={j * u} x2={20.83 * u} y2={j * u} />
                  ))}
                </g>
              )}

              <g fill="rgba(232,222,205,0.95)">
                <rect x="473.16" y="0" width="23.86" height="119.28" rx="11.93" ry="11.93" />
                <path d="M449.46,58.71v2.13c0,5.86-4.75,10.63-10.63,10.63h-76.77c-2.99,0-5.43,2.44-5.43,5.43v12.87c0,2.99,2.44,5.43,5.43,5.43h42.86c5.7,0,10.89,2.32,14.62,6.05,3.72,3.73,6.03,8.88,6.05,14.55,0,1.8-1.4,3.27-3.2,3.27h-77.68c-6.58,0-11.92-5.34-11.92-11.92v-48.67c0-6,4.86-10.87,10.87-10.87h94.69c6.14,0,11.11,4.98,11.11,11.11Z" />
                <path d="M425.42-12.27h0c6.5,0,11.77,5.27,11.77,11.77v24.87c0,6.5-5.27,11.77-11.77,11.77h-.32c-6.5,0-11.77-5.27-11.77-11.77V-.18c0-6.67,5.42-12.09,12.09-12.09Z" transform="translate(437.19 -413.33) rotate(90)" />
                <path d="M107.62,0h0C114.09,0,119.35,5.26,119.35,11.74v95.81c0,6.48-5.26,11.74-11.74,11.74h-.39c-6.48,0-11.74-5.26-11.74-11.74V12.12C95.49,5.43,100.93,0,107.62,0Z" transform="translate(214.85 119.28) rotate(180)" />
                <path d="M71.1,55.88c-.1-.36-.24-.73-.4-1.07,0-.03-.02-.07-.05-.1-1.81-4.13-5.96-7-10.75-7H11.79c-4.08,0-7.66,2.07-9.78,5.2-.22.31-.41.62-.59.97-.35.64-.62,1.31-.83,2-.35,1.11-.54,2.3-.54,3.51v95.74c0,6.52,5.27,11.79,11.77,11.79,3.34,0,6.36-1.35,8.54-3.54,2.19-2.18,3.54-5.2,3.54-8.54v-35.77h36c2.85,0,5.46-1,7.5-2.7.54-.43,1.04-.93,1.47-1.47.26-.31.48-.62.71-.93,1.3-1.94,2.06-4.25,2.06-6.76v-47.82c0-1.21-.19-2.4-.54-3.51ZM23.9,71.57h23.87v23.62h-23.87v-23.62Z" />
                <path d="M305.39,51.14c-2.21-2.19-5.24-3.54-8.59-3.54h-47.52c-6.59,0-11.92,5.34-11.92,11.92v35.67h-22.55v-35.86c0-6.48-5.25-11.73-11.73-11.73h-.38c-6.48,0-11.73,5.25-11.73,11.73v95.37c0,6.65,5.45,12.4,12.1,12.21,3.19-.09,6.1-1.42,8.21-3.55,2.19-2.18,3.54-5.22,3.54-8.57v-35.72h83.47c.36,0,.73-.02,1.09-.05h.05c2.3-.5,4.36-1.66,5.98-3.28,2.18-2.18,3.54-5.22,3.54-8.57v-47.44c0-3.34-1.37-6.38-3.54-8.57ZM266.43,71.47h13.42c2.88,0,5.22,2.34,5.22,5.22v13.3c0,2.88-2.34,5.22-5.22,5.22h-13.42c-2.88,0-5.22-2.34-5.22-5.22v-13.3c0-2.88,2.34-5.22,5.22-5.22Z" />
                <path d="M155.34,47.6h0c6.48,0,11.74,5.26,11.74,11.74v95.84c0,6.48-5.26,11.74-11.74,11.74h-.39c-6.48,0-11.74-5.26-11.74-11.74V59.72c0-6.69,5.43-12.12,12.12-12.12Z" transform="translate(310.29 214.51) rotate(180)" />
                <circle cx="273.14" cy="11.93" r="11.93" />
                <circle cx="155.15" cy="11.93" r="11.93" />
              </g>

              {showTypoGaps && (
                <g>
                  <rect x="23.90" y="71.57" width="23.87" height="23.62" fill="none" stroke="#FF742E" strokeWidth="1.6" />
                  <rect x="261.21" y="71.47" width="23.86" height="23.74" rx="5.22" fill="none" stroke="#4ADE80" strokeWidth="1.6" />
                  <rect x="401.05" y="0" width="48.41" height="23.86" rx="11.93" fill="none" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 2" />
                  {[71.68, 119.35, 167.08, 308.95, 449.46].map((gx, idx) => (
                    <g key={idx}>
                      <rect x={gx} y="52" width={u} height="62" fill="rgba(255,116,46,0.2)" stroke="rgba(255,116,46,0.55)" strokeWidth="0.8" strokeDasharray="2 2" />
                      <text x={gx + u / 2} y="182" textAnchor="middle" fill="#FFB085" fontSize="8" fontWeight="700">1u</text>
                    </g>
                  ))}
                </g>
              )}
            </svg>
          </div>
        </div>

        <div className="cad-card">
          <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 14 }}>قوانین استخراج‌شده از لوگوتایپ</h3>
          <div className="metric-list">
            <div className="metric-item">
              <div className="metric-head">
                <strong>۱. هم‌خوانی ضخامت با لوگو (اختلاف کمتر از ۳٪)</strong>
                <span className="metric-val ltr-code">1u = 23.86 pt ≈ S</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--beige-muted)' }}>
                واحد پایه لوگوتایپ (<span className="ltr-code">23.86 pt</span>) تقریباً برابر با ضخامت لوگو (<span className="ltr-code">23.15 pt</span>) است؛ هر دو از یک قلم هندسی واحد متولد شده‌اند.
              </p>
            </div>

            <div className="metric-item">
              <div className="metric-head">
                <strong>۲. ریتم عمودی ۷ ردیفه (۱ + ۱ + ۳ + ۲)</strong>
                <span className="metric-val ltr-code">H = 7u = 166.91 pt</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--beige-muted)' }}>
                ۱ واحد نقطه‌ها، ۱ واحد هوای تنفس، ۳ واحد بدنه اصلی حروف، و ۲ واحد دنباله‌های پایین‌رو (<span className="ltr-code">م، ر، ز</span>). تمام پایه‌های عمودی دقیقاً <span className="ltr-code">5u</span> قد دارند.
              </p>
            </div>

            <div className="metric-item">
              <div className="metric-head">
                <strong>۳. ضرباهنگ منظم فاصله‌های ۱ واحدی</strong>
                <span className="metric-val ltr-code">Gap = 1.00u</span>
              </div>
              <p style={{ fontSize: 13.5, color: 'var(--beige-muted)' }}>
                تمام شکاف‌های بین حروف غیرمتصل و نیز پل اتصال «ف» به «ر» دقیقاً برابر <span className="ltr-code">1u</span> هستند؛ ریتمی شبیه پالس‌های دیجیتال تله‌متری!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Peyda Glyph CAD + Color Wave + 3D Physics */}
      <div className="section-grid" style={{ marginBottom: 0 }}>
        {/* Peyda Vector CAD */}
        <div className="cad-card">
          <div style={{ marginBottom: 12 }}>
            <span className="kaf-slash-tag">منبع ۰۳ · کالبدشکافی برداری گلیف‌های فونت پیدا</span>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>زوایا، نقطه‌های مربعی و اسکوئیرکل اعداد</h3>
          </div>

          <div className="toggle-row">
            {PEYDA_CAD_GLYPHS.map((g) => (
              <button
                key={g.id}
                className={`chip-btn ${selectedGlyph.id === g.id ? 'on' : ''}`}
                onClick={() => setSelectedGlyph(g)}
              >
                گلیف «{g.char}»
              </button>
            ))}
          </div>

          <div className="cad-stage" style={{ direction: 'ltr' }}>
            <svg viewBox="-120 -310 1160 1240" style={{ width: '100%', maxHeight: 280, height: 'auto' }}>
              {[
                { y: 900, label: '+900 Ascender', color: 'rgba(56,189,248,0.45)' },
                { y: 700, label: '+700 CapHeight', color: 'rgba(232,222,205,0.35)' },
                { y: 500, label: '+500 xHeight', color: '#FF742E' },
                { y: 0, label: '0 Baseline', color: '#4ADE80' },
                { y: -500, label: '-500 Descender', color: 'rgba(56,189,248,0.35)' },
              ].map((ln) => {
                const sy = 900 - ln.y;
                return (
                  <g key={ln.y}>
                    <line x1="-20" y1={sy - 260} x2="960" y2={sy - 260} stroke={ln.color} strokeWidth="2" strokeDasharray={ln.y === 0 ? 'none' : '8 6'} />
                    <text x="-30" y={sy - 252} textAnchor="end" fill={ln.color} fontSize="24" fontWeight="700">
                      {ln.label}
                    </text>
                  </g>
                );
              })}

              <g transform="translate(90, 640) scale(1, -1)">
                <path d={selectedGlyph.d} fill="rgba(232,222,205,0.92)" stroke="#FF742E" strokeWidth="4" />
                {selectedGlyph.id === 'kaf' && (
                  <line x1="533" y1="583" x2="940" y2="789" stroke="#38BDF8" strokeWidth="7" />
                )}
                {selectedGlyph.id === 'feh' && (
                  <rect x="576" y="676" width="115" height="115" fill="none" stroke="#FACC15" strokeWidth="7" />
                )}
                {selectedGlyph.id === 'zero_fa' && (
                  <rect x="50" y="49" width="378" height="379" fill="none" stroke="#38BDF8" strokeWidth="6" strokeDasharray="12 8" />
                )}
                {selectedGlyph.id === 'seven_fa' && (
                  <g>
                    <line x1="30" y1="654" x2="255" y2="0" stroke="#38BDF8" strokeWidth="6" />
                    <line x1="588" y1="654" x2="363" y2="0" stroke="#38BDF8" strokeWidth="6" />
                  </g>
                )}
              </g>
            </svg>
          </div>
          <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--beige-muted)' }}>
            <strong style={{ color: '#FFB085' }}>{selectedGlyph.title}: </strong>
            {selectedGlyph.note}
          </div>
        </div>

        {/* Color Polarity & S-Curve Wave */}
        <div className="cad-card">
          <div style={{ marginBottom: 12 }}>
            <span className="kaf-slash-tag">منبع ۰۴ · هندسه رنگ‌ها و موج نوری ۱۴0.۲۴°</span>
            <h3 style={{ fontSize: 20, fontWeight: 800, marginTop: 8 }}>قطبیت مکمل ۱۸۷.۳ درجه و بازتاب بدنه خودرو</h3>
          </div>

          <div
            style={{
              height: 76,
              borderRadius: 18,
              background: 'linear-gradient(140.24deg, #3D5768 0%, #112835 41.58%, #213D4F 78.61%, #132D3F 100%)',
              border: '1px solid rgba(232,222,205,0.2)',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 800 }}>گرادیان چهارمرحله‌ای استخراج‌شده از gradiant.pdf</div>
              <div style={{ fontSize: 11.5, color: 'var(--beige-muted)' }}>افت روشنایی در ۴۱.۶٪ و جهش بازتاب افق در ۷۸.۶٪</div>
            </div>
            <span className="ltr-code" style={{ color: '#FFB085', fontWeight: 700 }}>140.24°</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {BRAND_COLORS.map((c) => (
              <div
                key={c.hex}
                style={{
                  padding: '12px 14px',
                  borderRadius: 16,
                  background: 'rgba(8,19,29,0.72)',
                  border: '1px solid rgba(232,222,205,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: c.hex, border: '1px solid rgba(255,255,255,0.22)' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--beige-muted)' }}>{c.role}</div>
                  </div>
                </div>
                <span className="ltr-code" style={{ color: '#FF742E', fontWeight: 700 }}>{c.hex}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Dual 3D & Volumetric Physics Inspector */}
      <div className="section-grid" style={{ marginBottom: 0 }}>
        <div className="cad-card">
          <div style={{ marginBottom: 12 }}>
            <span className="kaf-slash-tag">منبع ۰۵ · فیزیک سه‌بعدی و نورپردازی (3d_front.pdf + gradiant.pdf)</span>
            <h3 style={{ fontSize: 21, fontWeight: 900, marginTop: 8 }}>
              بازسازی زنده پارامترهای استخراج‌شده از موتور سه‌بعدی ایلاستریتور
            </h3>
          </div>

          <div className="toggle-row">
            <button className={`chip-btn ${mode3D === 'chisel' ? 'on' : ''}`} onClick={() => setMode3D('chisel')}>
              حالت پخ تراش‌خورده (gradiant.pdf · ۴۳.۱°)
            </button>
            <button className={`chip-btn ${mode3D === 'inflate' ? 'on' : ''}`} onClick={() => setMode3D('inflate')}>
              حالت بالشتکی نرم (3d_front.pdf · ۷۱°)
            </button>
            <button className={`chip-btn ${showWire ? 'on' : ''}`} onClick={() => setShowWire(!showWire)}>
              توری سه‌بعدی (Wireframe)
            </button>
            <button className={`chip-btn ${showRig ? 'on' : ''}`} onClick={() => setShowRig(!showRig)}>
              بردار تابش نور
            </button>
          </div>

          <Logo3DInspector mode={mode3D} showWireframe={showWire} showLightRig={showRig} />
        </div>

        <div className="cad-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 14 }}>
          <div>
            <h3 style={{ fontSize: 19, fontWeight: 800, marginBottom: 12 }}>مقایسه دو زبان حجم‌دهی در فایل‌های مرجع شما</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div className="cad-stage" style={{ padding: 14, textAlign: 'center' }}>
                <img src="/refs/3d_front.webp" alt="حجم بالشتکی" style={{ height: 118, objectFit: 'contain', marginBottom: 6 }} />
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>حجم بالشتکی (Inflate ۷۶٪)</div>
                <div style={{ fontSize: 11.5, color: 'var(--beige-muted)' }}>نور از بالا (۷۱ درجه) · لطیف و لمس‌شدنی</div>
              </div>
              <div className="cad-stage" style={{ padding: 14, textAlign: 'center' }}>
                <img src="/refs/gradiant.webp" alt="حجم پخ‌خورده" style={{ height: 118, objectFit: 'contain', marginBottom: 6 }} />
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>پخ تراش‌خورده (Bevel ۶۰٪)</div>
                <div style={{ fontSize: 11.5, color: 'var(--beige-muted)' }}>نور مایل ۴۳.۱° · قاب اسکوئیرکل ۳۱.۲۵٪</div>
              </div>
            </div>
          </div>

          <div className="metric-list">
            <div className="metric-item">
              <div className="metric-head">
                <strong>جنس سطح مات-ابریشمی کابین خودرو</strong>
                <span className="metric-val ltr-code">Roughness 40% · Metallic 0%</span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--beige-muted)' }}>
                در هر دو فایل، فلزی بودن صفر و زبری ۴۰٪ تنظیم شده است؛ یعنی حجم‌های سه‌بعدی سایت نباید کروم سرد و آینه‌ای باشند، بلکه باید حس پلیمر باکیفیت داشبورد و سرامیک گرم بدهند!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
