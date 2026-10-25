import React, { useRef, useState } from 'react';
import { IranPlate, MapPin, StatusChip } from '../../ds';
import PaintedCard from './PaintedCard.jsx';

// مسیر آزادراه دقیقاً از سوکت ورودی بالا (500, 0) آغاز و به سوکت خروجی پایین (500, 500) ختم می‌شود
const CORRIDOR_HIGHWAY_D =
  'M 500,0 C 500,55 680,55 680,115 C 680,175 560,175 560,230 C 560,290 430,285 430,345 C 430,415 500,435 500,500';

const CORRIDOR_NODES = [
  {
    id: 'tabriz',
    city: 'تبریز',
    x: 32,
    y: 23,
    threshold: 0.2,
    speed: '۷۸ km/h',
    status: 'moving',
    plate: { l: '۶۲', ch: 'د', r: '۳۱۵', ir: '۱۵' },
  },
  {
    id: 'tehran',
    city: 'تهران',
    x: 44,
    y: 46,
    threshold: 0.45,
    speed: '۸۶ km/h',
    status: 'signal',
    plate: { l: '۴۸', ch: 'ع', r: '۷۲۹', ir: '۱۱' },
  },
  {
    id: 'isfahan',
    city: 'اصفهان',
    x: 57,
    y: 69,
    threshold: 0.68,
    speed: '۹۱ km/h',
    status: 'corridor',
    plate: { l: '۸۳', ch: 'ط', r: '۴۱۲', ir: '۵۳' },
  },
  {
    id: 'bandar',
    city: 'بندرعباس',
    x: 52.5,
    y: 86,
    threshold: 0.86,
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

  // اتصال مستقیم آزادراه داخلی به همان Playhead واحد مدار نقاش
  const corridorProgressRef = useRef((p) => {
    const dash = `${(1 - p).toFixed(4)}`;
    if (highwayStrokeRef.current) highwayStrokeRef.current.setAttribute('stroke-dashoffset', dash);
    if (highwayGlowRef.current) highwayGlowRef.current.setAttribute('stroke-dashoffset', dash);

    if (highwayCometRef.current && highwayStrokeRef.current?.getTotalLength) {
      if (p > 0.01 && p < 0.99) {
        const len = highwayStrokeRef.current.getTotalLength();
        const pt = highwayStrokeRef.current.getPointAtLength(len * p);
        highwayCometRef.current.setAttribute('transform', `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)})`);
        highwayCometRef.current.setAttribute('opacity', '1');
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
          <span className="story-step-kicker">۰۲ · فصل دوم</span>
          <h2 className="story-chapter-title">
            همان خط سیگنال، وارد نقشه می‌شود و آزادراه ایران را روشن می‌کند.
          </h2>
        </div>

        {/* گره ۳ مدار: اسلب سه‌بعدی کریدور ایران که خط سیگنال از بالا وارد و از پایین آن خارج می‌شود */}
        <PaintedCard
          nodeId="node-corridor"
          tone="horizon"
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
              <ellipse cx="500" cy="250" rx="410" ry="185" className="corridor-contour" />
              <ellipse cx="500" cy="250" rx="280" ry="122" className="corridor-contour" />

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
                <circle r="14" className="painter-spark-halo" />
                <circle r="5.5" className="painter-spark-core" />
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

            <div className="corridor-floating-hud">
              <StatusChip status={activeNode.status} pulse size="sm">
                {activeNode.city} · {activeNode.speed}
              </StatusChip>
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
