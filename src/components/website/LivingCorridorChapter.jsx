import React, { useEffect, useRef, useState } from 'react';
import { MapPin, StatusChip } from '../../ds/index.js';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';
import { toFa } from '../../utils/faDigits.js';

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

const CORRIDOR_NODES = [
  { id: 'tabriz', name: 'تبریز', x: 24, y: 22, speed: 78, temp: '۴.۱+ °C', status: 'moving', at: 0.08 },
  { id: 'tehran', name: 'تهران', x: 47, y: 34, speed: 86, temp: '۱۸.۲- °C', status: 'cold-chain', at: 0.3 },
  { id: 'isfahan', name: 'اصفهان', x: 51, y: 54, speed: 84, temp: '۱۸.۴- °C', status: 'moving', at: 0.54 },
  { id: 'shiraz', name: 'شیراز', x: 50, y: 71, speed: 79, temp: '۳.۸+ °C', status: 'corridor', at: 0.76 },
  { id: 'bandar', name: 'بندرعباس', x: 66, y: 84, speed: 91, temp: 'مقصد نهایی', status: 'signal', at: 0.94 },
];

const HIGHWAY_SVG_D =
  'M 240,123 C 330,140 410,165 470,190 C 510,245 515,275 510,302 C 505,345 500,375 500,398 C 545,435 610,455 660,470';

export default function LivingCorridorChapter() {
  const reducedMotion = usePrefersReducedMotion();
  const sectionRef = useRef(null);
  const slabRef = useRef(null);
  const pathRef = useRef(null);
  const glowRef = useRef(null);
  const cometRef = useRef(null);

  const [activeNode, setActiveNode] = useState(CORRIDOR_NODES[1]);

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return undefined;

    if (reducedMotion) {
      if (pathRef.current) pathRef.current.setAttribute('stroke-dashoffset', '0');
      if (glowRef.current) glowRef.current.setAttribute('stroke-dashoffset', '0');
      return undefined;
    }

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const rect = sec.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const p = clamp((vh * 0.82 - rect.top) / (rect.height * 0.72), 0.06, 1);
        const offset = (1 - p).toFixed(3);
        if (pathRef.current) pathRef.current.setAttribute('stroke-dashoffset', offset);
        if (glowRef.current) glowRef.current.setAttribute('stroke-dashoffset', offset);

        if (pathRef.current && pathRef.current.getTotalLength && cometRef.current) {
          const total = pathRef.current.getTotalLength();
          const pt = pathRef.current.getPointAtLength(total * p);
          cometRef.current.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
        }
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reducedMotion]);

  const handleSlabMove = (e) => {
    if (reducedMotion || !slabRef.current) return;
    const rect = slabRef.current.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    slabRef.current.style.setProperty('--slab-rx', `${(16 - ny * 7).toFixed(2)}deg`);
    slabRef.current.style.setProperty('--slab-ry', `${(nx * 9).toFixed(2)}deg`);
  };

  const handleSlabLeave = () => {
    if (!slabRef.current) return;
    slabRef.current.style.setProperty('--slab-rx', '16deg');
    slabRef.current.style.setProperty('--slab-ry', '0deg');
  };

  return (
    <section id="radar-command" ref={sectionRef} className="corridor-horizon-chapter">
      <div className="site-container corridor-horizon-chapter__inner">
        <header className="story-chapter-head story-chapter-head--light">
          <span className="story-step-kicker story-step-kicker--light ds-tabular">۰۲ · فصل دوم</span>
          <h2 className="story-chapter-title story-chapter-title--light">
            نقاشی زنده آزادراه‌های ایران با اسکرول شما.
          </h2>
        </header>

        {/* لوح سه‌بعدی معلق نقشه کریدور */}
        <div
          ref={slabRef}
          className="corridor-3d-slab"
          onPointerMove={handleSlabMove}
          onPointerLeave={handleSlabLeave}
        >
          <svg
            viewBox="0 0 1000 560"
            className="corridor-3d-slab__svg"
            aria-hidden="true"
          >
            {/* خطوط تراز توپوگرافی ملایم */}
            <ellipse cx="500" cy="290" rx="410" ry="215" className="corridor-contour" />
            <ellipse cx="500" cy="290" rx="285" ry="150" className="corridor-contour" />

            {/* ریل پایه و خط نقاش بزرگراه */}
            <path d={HIGHWAY_SVG_D} className="corridor-highway-rail" />
            <path
              ref={glowRef}
              d={HIGHWAY_SVG_D}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="0.94"
              className="corridor-highway-glow"
            />
            <path
              ref={pathRef}
              d={HIGHWAY_SVG_D}
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="0.94"
              className="corridor-highway-stroke"
            />

            <g ref={cometRef} transform="translate(240, 123)">
              <circle r="18" className="painter-spark-halo" />
              <circle r="6" className="painter-spark-core" />
            </g>
          </svg>

          {/* پین‌های ۱۳۶.۵۴ درجه برجسته در فضای سه‌بعدی بالای لوح */}
          {CORRIDOR_NODES.map((node) => {
            const isSelected = activeNode.id === node.id;
            return (
              <div
                key={node.id}
                className={`corridor-pin-anchor ${isSelected ? 'is-selected' : ''}`}
                style={{ '--pin-x': `${node.x}%`, '--pin-y': `${node.y}%` }}
                onPointerEnter={() => setActiveNode(node)}
              >
                <MapPin
                  speed={node.speed}
                  heading={140}
                  status={node.status}
                  selected={isSelected}
                  label={`ایستگاه ${node.name} با سرعت ${toFa(node.speed)} کیلومتر بر ساعت`}
                  onClick={() => setActiveNode(node)}
                />
                <span className="corridor-city-tag">{node.name}</span>
              </div>
            );
          })}

          {/* کپسول شیشه‌ای تک‌خطی و هوشمند به جای ستون شلوغ کارت‌ها */}
          <div className="corridor-floating-hud" aria-live="polite">
            <StatusChip status={activeNode.status} label={activeNode.name} />
            <span className="ds-tabular">{toFa(activeNode.speed)} km/h</span>
            <span className="corridor-floating-hud__sep" aria-hidden="true" />
            <span className="ds-tabular" dir="ltr">{activeNode.temp}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
