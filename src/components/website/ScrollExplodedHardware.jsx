import React, { Suspense, lazy, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';
import PaintedCard from './PaintedCard.jsx';

const HardwareTrackerCanvas = lazy(() => import('./HardwareTrackerCanvas.jsx'));

const HARDWARE_SPECS = [
  { id: '۰۱', threshold: 0.22, title: 'پوسته صنعتی IP68', detail: 'مقاوم در برابر شوک و گردوغبار جاده‌ای' },
  { id: '۰۲', threshold: 0.52, title: 'تراشه دوفرکانسه GNSS', detail: 'قفل هم‌زمان ۶۴ کانال ماهواره‌ای' },
  { id: '۰۳', threshold: 0.78, title: 'باتری پشتیبان ۷۲ ساعته', detail: 'ثبت پیوسته مسیر حتی پس از قطع برق' },
];

export default function ScrollExplodedHardware() {
  const reducedMotion = usePrefersReducedMotion();
  const explodeRef = useRef(reducedMotion ? 0.62 : 0.06);
  const [litStage, setLitStage] = useState(0);

  // باز شدن لایه‌به‌لایه سخت‌افزار سه‌بعدی دقیقاً هم‌زمان با عبور خط نارنجی از این گره
  const hardwareProgressRef = useRef((p) => {
    if (!reducedMotion) {
      explodeRef.current = Math.max(0.06, Math.min(0.96, p * 1.04));
    }
    let count = 0;
    if (p >= 0.22) count = 1;
    if (p >= 0.52) count = 2;
    if (p >= 0.78) count = 3;
    setLitStage(count);
  });

  return (
    <section id="hardware-3d" className="hardware-alabaster-chapter" data-polarity="daylight">
      <div className="site-container">
        <div className="story-chapter-head">
          <span className="story-step-kicker">۰۳ · فصل سوم</span>
          <h2 className="story-chapter-title">
            خط سیگنال از دل ردیاب عبور می‌کند و چهار لایه آن را می‌شکافد.
          </h2>
        </div>

        {/* گره ۴ مدار: صحنه باز استودیویی بدون هیچ باکس تیره اضافه — ردیاب سه‌بعدی آزادانه در هوا شناور است */}
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
              <div className="hardware-floor-shadow" aria-hidden="true" />
              <Suspense fallback={<div className="hardware-stage-orb__placeholder" />}>
                <HardwareTrackerCanvas explodeRef={explodeRef} />
              </Suspense>
              <span className="hardware-orbit-whisper">با موس بچرخانید · با اسکرول شکافته می‌شود</span>
            </div>

            <div className="hardware-callouts-col">
              {HARDWARE_SPECS.map((spec, idx) => {
                const isLit = reducedMotion || litStage > idx;
                return (
                  <div
                    key={spec.id}
                    className="hardware-callout-item"
                    data-lit={isLit ? 'true' : 'false'}
                  >
                    <div className="hardware-callout-item__row">
                      <span className="hardware-callout-item__idx">{spec.id}</span>
                      <div className="hardware-callout-item__text">
                        <strong>{spec.title}</strong>
                        <span>{spec.detail}</span>
                      </div>
                    </div>
                    <div className="hardware-leader-track" aria-hidden="true">
                      <div className="hardware-leader-fill" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PaintedCard>
      </div>
    </section>
  );
}
