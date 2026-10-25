import React, { useRef, useState } from 'react';
import { IranPlate, MapPin, StatusChip } from '../../ds';
import { LOGO_PARTS } from '../../data/geometryData.js';
import LogoAnatomyBadge from './LogoAnatomyBadge.jsx';
import PaintedCard from './PaintedCard.jsx';

const CORRIDOR_HIGHWAY_D =
  'M 500,0 C 500,48 680,46 680,102 C 680,152 560,150 560,198 C 560,248 430,244 430,294 C 430,362 500,418 500,500';

const CORRIDOR_NODES = [
  {
    id: 'tabriz',
    city: 'تبریز',
    corridor: 'آزادراه شمال‌غرب · محموله صادراتی سردخانه‌ای',
    temp: '-۱۸.۲°C زنجیره سرد پایدار',
    eta: 'زمان تحویل تخمینی: ۴ ساعت دیگر در قزوین',
    x: 32,
    y: 20,
    threshold: 0.18,
    speed: '۷۸ km/h',
    status: 'moving',
    plate: { l: '۶۲', ch: 'د', r: '۳۱۵', ir: '۱۵' },
  },
  {
    id: 'tehran',
    city: 'تهران',
    corridor: 'کمربندی آزادگان · هاب توزیع مرکزی',
    temp: '+۴.۰°C کابین دارو و لبنیات',
    eta: 'عبور از گیت هوشمند بدون معطلی',
    x: 44,
    y: 39,
    threshold: 0.4,
    speed: '۸۶ km/h',
    status: 'signal',
    plate: { l: '۴۸', ch: 'ع', r: '۷۲۹', ir: '۱۱' },
  },
  {
    id: 'isfahan',
    city: 'اصفهان',
    corridor: 'کریدور شمال-جنوب · رانندگی ایمن بدون تخلف',
    temp: '-۱۹.۰°C زنجیره سرد پایدار',
    eta: '۲۱۰ کیلومتر تا ایستگاه بعدی',
    x: 57,
    y: 56.5,
    threshold: 0.62,
    speed: '۹۱ km/h',
    status: 'corridor',
    plate: { l: '۸۳', ch: 'ط', r: '۴۱۲', ir: '۵۳' },
  },
  {
    id: 'bandar',
    city: 'بندرعباس',
    corridor: 'بندر شهید رجایی · تایید نهایی تحویل بار',
    temp: '+۲.۱°C ثبت سلامت کامل محموله',
    eta: 'تخلیه در اسکله شماره ۴ تکمیل شد',
    x: 51.5,
    y: 71.5,
    threshold: 0.78,
    speed: 'تحویل در اسکله',
    status: 'moving',
    plate: { l: '۲۹', ch: 'ص', r: '۶۱۸', ir: '۸۴' },
  },
];

export default function LivingCorridorChapter() {
  const highwayStrokeRef = useRef(null);
  const highwayGlowRef = useRef(null);
  const highwayCometRef = useRef(null);

  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [scrollCityIdx, setScrollCityIdx] = useState(1);
  const [lineReach, setLineReach] = useState(0);

  const corridorProgressRef = useRef((p) => {
    const dash = `${(1 - p).toFixed(4)}`;
    if (highwayStrokeRef.current) highwayStrokeRef.current.setAttribute('stroke-dashoffset', dash);
    if (highwayGlowRef.current) highwayGlowRef.current.setAttribute('stroke-dashoffset', dash);

    if (highwayCometRef.current && highwayStrokeRef.current?.getTotalLength) {
      if (p > 0.01 && p < 0.99) {
        try {
          const len = highwayStrokeRef.current.getTotalLength();
          if (len > 1) {
            const pt = highwayStrokeRef.current.getPointAtLength(len * p);
            if (pt) {
              highwayCometRef.current.setAttribute(
                'transform',
                `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`
              );
              highwayCometRef.current.setAttribute('opacity', '1');
            }
          }
        } catch {
          highwayCometRef.current.setAttribute('opacity', '0');
        }
      } else {
        highwayCometRef.current.setAttribute('opacity', '0');
      }
    }

    setLineReach((prev) => (Math.abs(prev - p) > 0.04 ? p : prev));

    let reached = 0;
    CORRIDOR_NODES.forEach((n, idx) => {
      if (p >= n.threshold) reached = idx;
    });
    setScrollCityIdx(reached);
  });

  const activeIdx = hoveredIdx !== null ? hoveredIdx : scrollCityIdx;
  const activeNode = CORRIDOR_NODES[activeIdx] || CORRIDOR_NODES[0];

  return (
    <section id="radar-command" className="story-corridor-section" data-polarity="daylight">
      <div className="site-container">
        <div className="story-chapter-head">
          <LogoAnatomyBadge
            activeParts={['p0']}
            code="گام ۰۲"
            elementTitle="اشراف سراسری بدون یک تماس تلفنی"
            morphTarget="اتاق فرمان کریدورهای ترانزیتی ایران"
          />
          <h2 className="story-chapter-title">
            تمام ناوگانِ تبریز تا بندرعباس، زنده جلوی چشم شماست.
          </h2>
          <p className="story-chapter-sub">
            روی هر شهر بزنید تا سرعت، دمای یخچال، پلاک خودرو و زمان دقیق تحویل محموله را در لحظه ببینید.
          </p>
        </div>

        <PaintedCard
          nodeId="node-corridor"
          tone="command"
          hasBottomPort
          className="corridor-circuit-card"
          onProgressRef={corridorProgressRef}
        >
          <div className="corridor-deck-stage" data-polarity="nocturnal">
            <svg
              viewBox="0 0 1000 500"
              preserveAspectRatio="none"
              className="corridor-3d-slab__svg"
              aria-hidden="true"
            >
              <g transform="translate(26, 24) scale(1.45)" className="corridor-clothoid-origin">
                <path d={LOGO_PARTS[0].d} />
              </g>
              <g transform="translate(974, 476) scale(-1.45, -1.45)" className="corridor-clothoid-origin">
                <path d={LOGO_PARTS[0].d} />
              </g>

              <ellipse cx="500" cy="250" rx="430" ry="198" className="corridor-contour" />
              <ellipse cx="500" cy="250" rx="305" ry="138" className="corridor-contour" />
              <ellipse cx="500" cy="250" rx="175" ry="78" className="corridor-contour" />
              <line x1="80" y1="250" x2="920" y2="250" className="corridor-axis-line" />
              <line x1="500" y1="20" x2="500" y2="480" className="corridor-axis-line" />

              <path d={CORRIDOR_HIGHWAY_D} className="corridor-highway-rail" />
              <path
                ref={highwayGlowRef}
                d={CORRIDOR_HIGHWAY_D}
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                className="corridor-highway-glow"
              />
              <path
                ref={highwayStrokeRef}
                d={CORRIDOR_HIGHWAY_D}
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                className="corridor-highway-stroke"
              />
              <g ref={highwayCometRef} opacity="0">
                <circle r="15" className="painter-spark-halo" />
                <circle r="6" className="painter-spark-core" />
              </g>
            </svg>

            {CORRIDOR_NODES.map((node, idx) => {
              const isSelected = idx === activeIdx;
              const isLit = lineReach >= node.threshold - 0.04;
              return (
                <div
                  key={node.id}
                  className="corridor-pin-anchor"
                  data-reached={isLit ? 'true' : 'false'}
                  style={{ '--pin-x': `${node.x}%`, '--pin-y': `${node.y}%` }}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <MapPin
                    status={isSelected ? 'signal' : node.status}
                    active={isSelected}
                    label={node.speed}
                    onClick={() => setHoveredIdx(idx)}
                  />
                  <span className="corridor-city-tag">{node.city}</span>
                </div>
              );
            })}

            <div className="corridor-telemetry-dock">
              <div className="corridor-telemetry-dock__main">
                <StatusChip status={activeNode.status} pulse size="sm">
                  {activeNode.city} · {activeNode.speed}
                </StatusChip>
                <div className="corridor-telemetry-dock__meta">
                  <strong>{activeNode.corridor}</strong>
                  <span>{activeNode.temp} · {activeNode.eta}</span>
                </div>
              </div>
              <IranPlate
                digitsLeft={activeNode.plate.l}
                letter={activeNode.plate.ch}
                digitsRight={activeNode.plate.r}
                iranCode={activeNode.plate.ir}
                size="sm"
              />
            </div>
          </div>
        </PaintedCard>
      </div>
    </section>
  );
}
