import React, { Suspense, lazy, useRef, useState } from 'react';
import { LOGO_PATH_D } from '../../data/geometryData.js';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';
import LogoAnatomyBadge from './LogoAnatomyBadge.jsx';
import PaintedCard from './PaintedCard.jsx';

const HardwareTrackerCanvas = lazy(() => import('./HardwareTrackerCanvas.jsx'));

const HARDWARE_SPECS = [
  {
    id: '۰۱',
    threshold: 0.16,
    layerTag: 'درپوش بالشتکی + نشان برجسته',
    title: 'پوسته Superellipse با استاندارد IP68',
    detail: 'مشتق از انحنای ۳۱.۲۵٪ چهارگوش نرم برند؛ مقاوم در برابر ضربه، آب و گردوغبار جاده‌ای',
    explodeTarget: 0.35,
  },
  {
    id: '۰۲',
    threshold: 0.42,
    layerTag: 'ماژول طلایی ماهواره',
    title: 'آنتن سرامیکی دوفرکانسه GNSS',
    detail: 'قفل هم‌زمان ۶۴ کانال ماهواره‌ای با دقت زیر یک متر حتی در گردنه‌های کوهستانی',
    explodeTarget: 0.65,
  },
  {
    id: '۰۳',
    threshold: 0.66,
    layerTag: 'هسته پردازش تله‌متری',
    title: 'برد چهارلایه صنعتی + درگاه CAN-Bus',
    detail: 'خوانش مستقیم پارامترهای ECU، دما، سوخت و شتاب‌سنج سه‌محوره در لحظه',
    explodeTarget: 0.85,
  },
  {
    id: '۰۴',
    threshold: 0.84,
    layerTag: 'شاسی زیرین و ذخیره انرژی',
    title: 'باتری پشتیبان اضطراری ۷۲ ساعته',
    detail: 'ثبت بی‌وقفه نقاط مسیر در حافظه داخلی و ارسال خودکار به محض بازگشت آنتن',
    explodeTarget: 0.98,
  },
];

export default function ScrollExplodedHardware() {
  const reducedMotion = usePrefersReducedMotion();
  const explodeRef = useRef(reducedMotion ? 0.65 : 0.08);
  const [litStage, setLitStage] = useState(1);
  const [focusedIdx, setFocusedIdx] = useState(null);

  const hardwareProgressRef = useRef((p) => {
    if (!reducedMotion && focusedIdx === null) {
      explodeRef.current = Math.max(0.08, Math.min(0.96, p * 1.05));
    }
    let count = 0;
    HARDWARE_SPECS.forEach((sp, i) => {
      if (p >= sp.threshold) count = i + 1;
    });
    setLitStage(count);
  });

  const handleFocusLayer = (idx) => {
    setFocusedIdx(idx);
    if (idx !== null && !reducedMotion) {
      explodeRef.current = HARDWARE_SPECS[idx].explodeTarget;
    }
  };

  return (
    <section id="hardware-3d" className="hardware-alabaster-chapter" data-polarity="daylight">
      <div className="site-container">
        <div className="story-chapter-head">
          <LogoAnatomyBadge
            activeParts={['p0', 'p1', 'p2', 'p3']}
            code="گام ۰۳"
            elementTitle="ضدضربه IP68 + حافظه آفلاین ۷۲ ساعته"
            morphTarget="کالبد چهارلایه ردیاب صنعتی"
          />
          <h2 className="story-chapter-title">
            حتی در گردنه‌های بدون آنتن، هیچ نقطه‌ای از مسیر ناوگان گم نمی‌شود.
          </h2>
        </div>

        <PaintedCard
          nodeId="node-hardware"
          tone="alabaster"
          hasBottomPort
          interactiveTilt={false}
          className="hardware-circuit-card"
          onProgressRef={hardwareProgressRef}
        >
          <div className="hardware-sculpture-layout">
            <div className="hardware-open-air-stage">
              {/* هاله نقشه مهندسی CAD با فرم چهارگوش نرم لوگو در پس‌زمینه ردیاب سه‌بعدی */}
              <svg viewBox="0 0 500 500" className="hardware-cad-halo" aria-hidden="true">
                <rect x="65" y="65" width="370" height="370" rx="115" className="hardware-cad-halo__squircle" />
                <circle cx="250" cy="250" r="198" className="hardware-cad-halo__ring" />
                <line x1="40" y1="356" x2="460" y2="144" className="hardware-cad-halo__axis" />
                <g transform="translate(215, 202) scale(0.3)" className="hardware-cad-halo__watermark">
                  <path d={LOGO_PATH_D} />
                </g>
              </svg>

              <div className="hardware-floor-shadow" aria-hidden="true" />
              <Suspense fallback={<div className="hardware-stage-orb__placeholder" />}>
                <HardwareTrackerCanvas explodeRef={explodeRef} />
              </Suspense>
              <span className="hardware-orbit-whisper">با موس بچرخانید · با اسکرول یا انتخاب هر لایه شکافته می‌شود</span>
            </div>

            <div
              className="hardware-callouts-col"
              onMouseLeave={() => handleFocusLayer(null)}
            >
              {HARDWARE_SPECS.map((spec, idx) => {
                const isLit = reducedMotion || focusedIdx === idx || litStage > idx;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    className="hardware-callout-item"
                    data-lit={isLit ? 'true' : 'false'}
                    data-focused={focusedIdx === idx ? 'true' : 'false'}
                    onMouseEnter={() => handleFocusLayer(idx)}
                    onClick={() => handleFocusLayer(idx)}
                  >
                    <div className="hardware-callout-item__row">
                      <span className="hardware-callout-item__idx">{spec.id}</span>
                      <div className="hardware-callout-item__text">
                        <small>{spec.layerTag}</small>
                        <strong>{spec.title}</strong>
                        <span>{spec.detail}</span>
                      </div>
                    </div>
                    <div className="hardware-leader-track" aria-hidden="true">
                      <div className="hardware-leader-fill" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </PaintedCard>
      </div>
    </section>
  );
}
