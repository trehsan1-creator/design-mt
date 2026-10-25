import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

const HardwareTrackerCanvas = lazy(() => import('./HardwareTrackerCanvas.jsx'));

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

const CALLOUTS = [
  { step: '۰۱', title: 'پوسته صنعتی IP68', note: 'مقاوم در برابر شوک و غوطه‌وری' },
  { step: '۰۲', title: 'تراشه دوفرکانسه GNSS', note: 'قفل هم‌زمان ۶۴ کانال ماهواره‌ای' },
  { step: '۰۳', title: 'باتری پشتیبان ۷۲ ساعته', note: 'ثبت بی‌وقفه حتی پس از قطع برق' },
];

export default function ScrollExplodedHardware() {
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef(null);
  const explodeRef = useRef(0.38);
  const lineRefs = useRef([]);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldMount(true);
          obs.disconnect();
        }
      },
      { rootMargin: '280px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    if (reducedMotion) {
      explodeRef.current = 0.58;
      lineRefs.current.forEach((ln) => {
        if (ln) ln.setAttribute('stroke-dashoffset', '0');
      });
      return undefined;
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const p = clamp((vh * 0.85 - rect.top) / (rect.height * 0.72), 0, 1);
        // با اسکرول، ۴ لایه سخت‌افزار در بازه نرمال ۰..۱ از هم باز می‌شوند
        explodeRef.current = clamp(p * 1.15, 0.08, 0.96);

        lineRefs.current.forEach((ln, idx) => {
          if (!ln) return;
          const lp = clamp((p - idx * 0.14) / 0.45, 0, 1);
          ln.setAttribute('stroke-dashoffset', `${(1 - lp).toFixed(3)}`);
        });
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reducedMotion]);

  return (
    <section
      id="hardware-3d"
      ref={sectionRef}
      data-polarity="daylight"
      className="hardware-alabaster-chapter"
    >
      <div className="site-container hardware-alabaster-chapter__inner">
        <header className="story-chapter-head">
          <span className="story-step-kicker ds-tabular">۰۳ · فصل سوم</span>
          <h2 className="story-chapter-title">
            اسکرول کنید تا کالبد سه‌بعدی ردیاب لایه‌به‌لایه باز شود.
          </h2>
        </header>

        <div className="hardware-sculpture-layout">
          <div className="hardware-callouts-col">
            {CALLOUTS.map((item, idx) => (
              <div key={item.step} className="hardware-callout-item">
                <div className="hardware-callout-item__head">
                  <span className="smart-card-index ds-tabular">{item.step}</span>
                  <strong>{item.title}</strong>
                </div>
                <p className="smart-card-sub">{item.note}</p>
                <svg viewBox="0 0 220 16" className="hardware-leader-svg" aria-hidden="true">
                  <path d="M 216,8 L 4,8" className="hardware-leader-svg__rail" />
                  <path
                    ref={(el) => {
                      lineRefs.current[idx] = el;
                    }}
                    d="M 216,8 L 4,8"
                    pathLength="1"
                    strokeDasharray="1"
                    strokeDashoffset="1"
                    className="hardware-leader-svg__stroke"
                  />
                </svg>
              </div>
            ))}
          </div>

          <div className="hardware-stage-orb">
            {shouldMount && (
              <Suspense fallback={null}>
                <HardwareTrackerCanvas explodeRef={explodeRef} reducedMotion={reducedMotion} />
              </Suspense>
            )}
            <span className="hardware-stage-hint">با موس بچرخانید · با اسکرول باز کنید</span>
          </div>
        </div>
      </div>
    </section>
  );
}
