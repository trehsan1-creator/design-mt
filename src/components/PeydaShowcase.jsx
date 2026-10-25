import React, { useState } from 'react';
import { Sun, Moon, Type } from 'lucide-react';
import { PEYDA_WEIGHTS, PEYDA_CAD_GLYPHS } from '../data/geometryData.js';
import { Button, Card, Capsule } from '../ds/index.js';
import { toFa } from '../utils/faDigits.js';

const PRESET_TEXTS = [
  'ردیابی زنده ناوگان و کنترل هوشمند مسیر · سرعت ۸۶ کیلومتر بر ساعت',
  'کشنده ولوو FH500 در محور تهران به بندرعباس · ۰۱۲۳۴۵۶۷۸۹',
  'پایش لحظه‌ای سوخت، زنجیره سرد دارویی و ایمنی رانندگان',
];

export default function PeydaShowcase() {
  const [sampleText, setSampleText] = useState(PRESET_TEXTS[0]);
  const [weight, setWeight] = useState(800);
  const [fontSize, setFontSize] = useState(36);
  const [lightMode, setLightMode] = useState(false);
  const [activeGlyph, setActiveGlyph] = useState(PEYDA_CAD_GLYPHS[0]);

  return (
    <section className="fleet-section">
      <div className="ds-stack-lg">
        <Card variant="panel" className="ds-stack-md">
          <div className="ds-between-wrap">
            <div className="ds-stack-xs">
              <div>
                <Capsule variant="eyebrow">
                  <Type size={14} aria-hidden="true" />
                  <span>تایپوگرافی اختصاصی فارسی · Peyda</span>
                </Capsule>
              </div>
              <h2>نمایش زنده اوزان فونت پیدا در قطبیت شب و روز برند</h2>
            </div>

            <div className="ds-row-wrap">
              <Button variant="pill" size="sm" active={!lightMode} onClick={() => setLightMode(false)}>
                <Moon size={14} aria-hidden="true" />
                <span>قطبیت شب راداری</span>
              </Button>
              <Button variant="pill" size="sm" active={lightMode} onClick={() => setLightMode(true)}>
                <Sun size={14} aria-hidden="true" />
                <span>قطبیت روز شنی</span>
              </Button>
            </div>
          </div>

          <div className="ds-between-wrap">
            <div className="ds-row-wrap">
              {PRESET_TEXTS.map((txt, i) => (
                <Button
                  key={i}
                  variant="pill"
                  size="sm"
                  active={sampleText === txt}
                  onClick={() => setSampleText(txt)}
                >
                  نمونه {toFa(i + 1)}
                </Button>
              ))}
            </div>

            <div className="ds-row-md">
              <label htmlFor="peyda-size-range" className="ds-muted">اندازه متن:</label>
              <input
                id="peyda-size-range"
                type="range"
                className="cinema-range"
                min="18"
                max="64"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
              />
              <strong className="ds-accent-text ds-tabular">{toFa(fontSize)}px</strong>
            </div>
          </div>

          <div className="peyda-live-stage ds-stack-md" data-polarity={lightMode ? 'daylight' : 'nocturnal'}>
            <input
              type="text"
              aria-label="متن قابل ویرایش نمونه فونت پیدا"
              className="portal-input"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
            />
            <div
              className="peyda-live-sample ds-tabular"
              style={{ '--sample-weight': weight, '--sample-size': `${fontSize}px` }}
            >
              {sampleText}
            </div>
          </div>
        </Card>

        <div className="section-grid">
          <Card variant="panel" className="ds-stack-md">
            <div className="ds-stack-xs">
              <h3>آبشار اوزان کاربردی فونت «پیدا»</h3>
              <p className="ds-muted">
                ضخامت پایه حرف «ا» از <strong className="ds-accent-text">۵۵ واحد</strong> در وزن سبک تا <strong className="ds-accent-text">۱۴۴ واحد</strong> در وزن سیاه رشد می‌کند.
              </p>
            </div>

            <div className="ds-stack-sm">
              {PEYDA_WEIGHTS.map((item) => {
                const isSel = weight === item.weight;
                return (
                  <Card
                    key={item.weight}
                    as="button"
                    type="button"
                    variant="glass"
                    compact
                    interactive
                    accentOutline={isSel}
                    className="peyda-weight-row"
                    onClick={() => setWeight(item.weight)}
                  >
                    <div className="ds-stack-xs">
                      <strong className="ds-accent-text">
                        {toFa(item.weight)} · {item.faName}
                      </strong>
                      <span className="ds-muted">ضخامت الف: {toFa(item.alefW)} واحد</span>
                    </div>

                    <div
                      className="peyda-live-sample ds-tabular"
                      style={{ '--sample-weight': item.weight, '--sample-size': '19px' }}
                    >
                      ردیابی زنده ناوگان · ۰۱۲۳۴۵۶۷۸۹
                    </div>

                    <span className="ds-muted">{item.usage}</span>
                  </Card>
                );
              })}
            </div>
          </Card>

          <Card variant="panel" className="ds-stack-md">
            <div className="ds-stack-xs">
              <Capsule variant="slash">کالبدشکافی برداری گلیف‌های کلیدی پیدا</Capsule>
              <h3>ویژگی‌های هندسی استخراج‌شده از جدول glyf</h3>
            </div>

            <div className="ds-row-wrap">
              {PEYDA_CAD_GLYPHS.map((g) => (
                <Button
                  key={g.id}
                  variant="pill"
                  size="sm"
                  active={activeGlyph.id === g.id}
                  onClick={() => setActiveGlyph(g)}
                >
                  حرف / رقم «{g.char}»
                </Button>
              ))}
            </div>

            <div className="cad-stage">
              <svg
                viewBox={`${activeGlyph.bbox[0] - 80} ${-activeGlyph.bbox[3] - 80} ${activeGlyph.bbox[2] - activeGlyph.bbox[0] + 160} ${activeGlyph.bbox[3] - activeGlyph.bbox[1] + 160}`}
                className="lab-svg-canvas"
                role="img"
                aria-label={activeGlyph.title}
              >
                <g transform="scale(1, -1)">
                  <path
                    d={activeGlyph.d}
                    fill="var(--ds-sand-300)"
                    fillOpacity="0.16"
                    stroke="var(--ds-color-signal-orange)"
                    strokeWidth="12"
                  />
                </g>
              </svg>
            </div>

            <div className="metric-item">
              <div className="metric-head">
                <strong>{activeGlyph.title}</strong>
                <span className="metric-val ltr-code">Advance {activeGlyph.width}u</span>
              </div>
              <p className="ds-muted">{activeGlyph.note}</p>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
