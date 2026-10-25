import React, { useEffect, useRef, useState } from 'react';
import { LOGO_PARTS } from '../../data/geometryData.js';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

const STORY_ACTS = [
  {
    id: '۰۱',
    activeParts: ['p1', 'p2'],
    label: 'فصل اول · ستون دروازه و بازوی افق ← پلاک‌خوان و گیج سوخت',
  },
  {
    id: '۰۲',
    activeParts: ['p0'],
    label: 'فصل دوم · کمان کلوتوئیدی لوگو ← بزرگراه هوشمند ایران',
  },
  {
    id: '۰۳',
    activeParts: ['p0', 'p1', 'p2', 'p3'],
    label: 'فصل سوم · چهارگوش نرم لوگو ← کالبد چهارلایه ردیاب',
  },
  {
    id: '۰۴',
    activeParts: ['p3'],
    label: 'فصل چهارم · تیغه مکان‌نمای ۱۳۶.۵۴° ← قطب‌نمای سود ناوگان',
  },
];

export default function StoryPainterRibbon({ children }) {
  const reducedMotion = usePrefersReducedMotion();
  const worldRef = useRef(null);
  const svgRef = useRef(null);
  const cablesGroupRef = useRef(null);
  const leadTotemRef = useRef(null);
  const pluckRingRef = useRef(null);

  const [activeAct, setActiveAct] = useState(0);
  const [narratorVisible, setNarratorVisible] = useState(false);

  useEffect(() => {
    const world = worldRef.current;
    const svg = svgRef.current;
    const cablesGroup = cablesGroupRef.current;
    if (!world || !svg || !cablesGroup) return undefined;

    let nodesMeta = [];
    let cablesMeta = [];
    let worldWidth = world.clientWidth || 1280;
    let worldHeight = Math.max(800, world.scrollHeight || 3200);

    const measureCircuit = () => {
      const wRect = world.getBoundingClientRect();
      worldWidth = Math.max(320, wRect.width);
      worldHeight = Math.max(600, world.offsetHeight);
      svg.setAttribute('viewBox', `0 0 ${worldWidth} ${worldHeight}`);

      const domNodes = Array.from(world.querySelectorAll('[data-circuit-node]'));
      nodesMeta = domNodes.map((el) => {
        const r = el.getBoundingClientRect();
        const topY = r.top - wRect.top;
        const bottomY = r.bottom - wRect.top;
        const cx = r.left - wRect.left + r.width * 0.5;
        return {
          el,
          cx,
          topY,
          bottomY,
          height: Math.max(40, r.height),
          portIn: el.querySelector('[data-port-in]'),
          portOut: el.querySelector('[data-port-out]'),
          splitRight: el.querySelector('[data-split-right]'),
          splitLeft: el.querySelector('[data-split-left]'),
          sparkRight: el.querySelector('[data-spark-right]'),
          sparkLeft: el.querySelector('[data-spark-left]'),
          lastSentProgress: -1,
        };
      });

      cablesGroup.innerHTML = '';
      cablesMeta = [];

      for (let i = 0; i < nodesMeta.length; i += 1) {
        const startX = i === 0 ? worldWidth * 0.5 : nodesMeta[i - 1].cx;
        const startY = i === 0 ? 0 : nodesMeta[i - 1].bottomY;
        const endX = nodesMeta[i].cx;
        const endY = nodesMeta[i].topY;

        const ns = 'http://www.w3.org/2000/svg';
        const laneL = document.createElementNS(ns, 'path');
        laneL.setAttribute('class', 'story-painter-svg__lane');

        const laneR = document.createElementNS(ns, 'path');
        laneR.setAttribute('class', 'story-painter-svg__lane');

        const rail = document.createElementNS(ns, 'path');
        rail.setAttribute('class', 'story-painter-svg__rail');

        const glow = document.createElementNS(ns, 'path');
        glow.setAttribute('class', 'story-painter-svg__glow');
        glow.setAttribute('pathLength', '1');
        glow.setAttribute('stroke-dasharray', '1');
        glow.setAttribute('stroke-dashoffset', reducedMotion ? '0' : '1');

        const stroke = document.createElementNS(ns, 'path');
        stroke.setAttribute('class', 'story-painter-svg__stroke');
        stroke.setAttribute('pathLength', '1');
        stroke.setAttribute('stroke-dasharray', '1');
        stroke.setAttribute('stroke-dashoffset', reducedMotion ? '0' : '1');

        cablesGroup.appendChild(laneL);
        cablesGroup.appendChild(laneR);
        cablesGroup.appendChild(rail);
        cablesGroup.appendChild(glow);
        cablesGroup.appendChild(stroke);

        cablesMeta.push({
          startX,
          startY,
          endX,
          endY,
          ox: 0,
          oy: 0,
          lastOx: 9999,
          lastOy: 9999,
          vx: 0,
          vy: 0,
          laneL,
          laneR,
          rail,
          glow,
          stroke,
        });
      }

      updateCableGeometry(0, -9999, false);
    };

    const updateCableGeometry = (ptrX, ptrY, ptrInside) => {
      let nearestPluck = null;
      let bestDist = 155;

      cablesMeta.forEach((cb) => {
        const midX = (cb.startX + cb.endX) * 0.5;
        const midY = (cb.startY + cb.endY) * 0.5;
        let tx = 0;
        let ty = 0;

        if (ptrInside && !reducedMotion) {
          const dx = ptrX - midX;
          const dy = ptrY - midY;
          const dist = Math.hypot(dx, dy);
          if (dist < 155) {
            const pull = (1 - dist / 155) * 48;
            tx = (dx / (dist || 1)) * pull;
            ty = (dy / (dist || 1)) * pull * 0.35;
            if (dist < bestDist) {
              bestDist = dist;
              nearestPluck = { x: midX + cb.ox * 0.65, y: midY + cb.oy * 0.65 };
            }
          }
        }

        cb.vx = (cb.vx + (tx - cb.ox) * 0.14) * 0.76;
        cb.vy = (cb.vy + (ty - cb.oy) * 0.14) * 0.76;
        cb.ox += cb.vx;
        cb.oy += cb.vy;

        if (Math.abs(cb.ox - cb.lastOx) > 0.08 || Math.abs(cb.oy - cb.lastOy) > 0.08) {
          cb.lastOx = cb.ox;
          cb.lastOy = cb.oy;
          const spanY = Math.max(24, cb.endY - cb.startY);
          const c1x = cb.startX + cb.ox * 0.85;
          const c1y = cb.startY + spanY * 0.52 + cb.oy;
          const c2x = cb.endX + cb.ox * 0.85;
          const c2y = cb.endY - spanY * 0.48 + cb.oy;

          const d = `M ${cb.startX.toFixed(1)},${cb.startY.toFixed(1)} C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${cb.endX.toFixed(1)},${cb.endY.toFixed(1)}`;
          const dL = `M ${(cb.startX - 7).toFixed(1)},${cb.startY.toFixed(1)} C ${(c1x - 7).toFixed(1)},${c1y.toFixed(1)} ${(c2x - 7).toFixed(1)},${c2y.toFixed(1)} ${(cb.endX - 7).toFixed(1)},${cb.endY.toFixed(1)}`;
          const dR = `M ${(cb.startX + 7).toFixed(1)},${cb.startY.toFixed(1)} C ${(c1x + 7).toFixed(1)},${c1y.toFixed(1)} ${(c2x + 7).toFixed(1)},${c2y.toFixed(1)} ${(cb.endX + 7).toFixed(1)},${cb.endY.toFixed(1)}`;

          cb.laneL.setAttribute('d', dL);
          cb.laneR.setAttribute('d', dR);
          cb.rail.setAttribute('d', d);
          cb.glow.setAttribute('d', d);
          cb.stroke.setAttribute('d', d);
        }
      });

      if (pluckRingRef.current) {
        if (nearestPluck) {
          pluckRingRef.current.setAttribute(
            'transform',
            `translate(${nearestPluck.x.toFixed(1)}, ${nearestPluck.y.toFixed(1)})`
          );
          pluckRingRef.current.setAttribute('opacity', '0.92');
        } else {
          pluckRingRef.current.setAttribute('opacity', '0');
        }
      }
    };

    const ptr = { x: 0, y: -9999, inside: false };
    const onPointerMove = (e) => {
      if (reducedMotion) return;
      const r = world.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
      ptr.inside = ptr.y >= 0 && ptr.y <= r.height;
    };
    const onPointerLeave = () => {
      ptr.inside = false;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    world.addEventListener('pointerleave', onPointerLeave, { passive: true });

    measureCircuit();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureCircuit);
    }

    const ro = new ResizeObserver(measureCircuit);
    ro.observe(world);
    window.addEventListener('resize', measureCircuit, { passive: true });

    let smoothPlayhead = -1;
    let lastRenderedPlayhead = -999;
    let lastAct = -1;
    let lastVis = false;
    let rafId = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);

      const wRect = world.getBoundingClientRect();
      const vh = window.innerHeight || 800;

      const targetPlayhead = reducedMotion
        ? worldHeight
        : clamp(vh * 0.64 - wRect.top, 0, worldHeight);

      if (smoothPlayhead < 0 || Math.abs(targetPlayhead - smoothPlayhead) > 360) {
        smoothPlayhead = targetPlayhead;
      } else {
        smoothPlayhead += (targetPlayhead - smoothPlayhead) * 0.28;
      }

      updateCableGeometry(ptr.x, ptr.y, ptr.inside);

      if (Math.abs(smoothPlayhead - lastRenderedPlayhead) < 0.2) {
        return;
      }
      lastRenderedPlayhead = smoothPlayhead;

      let totemPos = null;

      cablesMeta.forEach((cb) => {
        const lenY = Math.max(14, cb.endY - cb.startY);
        const p = reducedMotion ? 1 : clamp((smoothPlayhead - cb.startY) / lenY, 0, 1);
        const dash = `${(1 - p).toFixed(4)}`;
        cb.stroke.setAttribute('stroke-dashoffset', dash);
        cb.glow.setAttribute('stroke-dashoffset', dash);

        if (p > 0.005 && p < 0.995 && cb.stroke.getTotalLength) {
          try {
            const total = cb.stroke.getTotalLength();
            if (total > 1) {
              const pt = cb.stroke.getPointAtLength(total * p);
              if (pt) totemPos = { x: pt.x, y: pt.y };
            }
          } catch {
            // SVG hidden during breakpoint transition
          }
        }
      });

      const isMobile = window.innerWidth <= 768;

      nodesMeta.forEach((nd) => {
        const p = reducedMotion ? 1 : clamp((smoothPlayhead - nd.topY) / nd.height, 0, 1);
        const dash = `${(1 - p).toFixed(4)}`;

        if (nd.splitRight) nd.splitRight.setAttribute('stroke-dashoffset', dash);
        if (nd.splitLeft) nd.splitLeft.setAttribute('stroke-dashoffset', dash);

        nd.el.style.setProperty('--card-rise', p.toFixed(3));
        nd.el.setAttribute('data-awake', p > 0.08 ? 'true' : 'false');

        if (nd.portIn) nd.portIn.setAttribute('data-lit', smoothPlayhead >= nd.topY - 4 ? 'true' : 'false');
        if (nd.portOut) nd.portOut.setAttribute('data-lit', p >= 0.96 ? 'true' : 'false');

        const showSplitSparks = !isMobile && !reducedMotion && p > 0.02 && p < 0.98;
        if (nd.sparkRight && nd.splitRight?.getTotalLength) {
          if (showSplitSparks) {
            try {
              const lenR = nd.splitRight.getTotalLength();
              if (lenR > 1) {
                const ptR = nd.splitRight.getPointAtLength(lenR * p);
                if (ptR) {
                  nd.sparkRight.setAttribute('cx', ptR.x.toFixed(1));
                  nd.sparkRight.setAttribute('cy', ptR.y.toFixed(1));
                  nd.sparkRight.setAttribute('opacity', '1');
                }
              }
            } catch {
              nd.sparkRight.setAttribute('opacity', '0');
            }
          } else {
            nd.sparkRight.setAttribute('opacity', '0');
          }
        }
        if (nd.sparkLeft && nd.splitLeft?.getTotalLength) {
          if (showSplitSparks) {
            try {
              const lenL = nd.splitLeft.getTotalLength();
              if (lenL > 1) {
                const ptL = nd.splitLeft.getPointAtLength(lenL * p);
                if (ptL) {
                  nd.sparkLeft.setAttribute('cx', ptL.x.toFixed(1));
                  nd.sparkLeft.setAttribute('cy', ptL.y.toFixed(1));
                  nd.sparkLeft.setAttribute('opacity', '1');
                }
              }
            } catch {
              nd.sparkLeft.setAttribute('opacity', '0');
            }
          } else {
            nd.sparkLeft.setAttribute('opacity', '0');
          }
        }

        const roundedP = Math.round(p * 200) / 200;
        if (roundedP !== nd.lastSentProgress) {
          nd.lastSentProgress = roundedP;
          nd.el.dispatchEvent(new CustomEvent('circuit-progress', { detail: { progress: roundedP } }));
        }
      });

      // حرکت توتم ۴ تکه لوگو روی کابل‌های بین سکشن‌ها
      if (leadTotemRef.current) {
        if (totemPos) {
          leadTotemRef.current.setAttribute(
            'transform',
            `translate(${totemPos.x.toFixed(1)}, ${totemPos.y.toFixed(1)})`
          );
          leadTotemRef.current.setAttribute('opacity', '1');
        } else {
          leadTotemRef.current.setAttribute('opacity', '0');
        }
      }

      const vis = wRect.top < vh * 0.72 && wRect.bottom > vh * 0.25;
      if (vis !== lastVis) {
        lastVis = vis;
        setNarratorVisible(vis);
      }

      let actIdx = 0;
      const nLen = nodesMeta.length;
      if (nLen >= 4 && smoothPlayhead >= nodesMeta[nLen - 1].topY - 120) actIdx = 3;
      else if (nLen >= 4 && smoothPlayhead >= nodesMeta[nLen - 2].topY - 120) actIdx = 2;
      else if (nLen >= 4 && smoothPlayhead >= nodesMeta[nLen - 3].topY - 120) actIdx = 1;

      if (actIdx !== lastAct) {
        lastAct = actIdx;
        setActiveAct(actIdx);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      world.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('resize', measureCircuit);
    };
  }, [reducedMotion]);

  const currentAct = STORY_ACTS[activeAct] || STORY_ACTS[0];
  const activePartSet = new Set(currentAct.activeParts);

  return (
    <div ref={worldRef} className="story-painter-world">
      <svg
        ref={svgRef}
        viewBox="0 0 1280 3200"
        preserveAspectRatio="none"
        className="story-painter-svg"
        aria-hidden="true"
      >
        <g ref={cablesGroupRef} />

        <g ref={pluckRingRef} opacity="0">
          <circle r="16" className="painter-spark-halo" />
          <circle r="5" className="painter-spark-core" />
        </g>

        {/* توتم زنده ۴ تکه لوگو که همراه خط سیگنال پایین می‌آید و قطعه فعال هر فصل در آن می‌درخشد */}
        <g ref={leadTotemRef} opacity="0">
          <circle r="22" className="totem-carrier-halo" />
          <circle r="15" className="totem-carrier-disc" />
          <g transform="translate(-6.5, -9) scale(0.056)">
            {LOGO_PARTS.map((part) => (
              <path
                key={part.id}
                d={part.d}
                className={
                  activePartSet.has(part.id)
                    ? 'totem-carrier-part totem-carrier-part--active'
                    : 'totem-carrier-part'
                }
              />
            ))}
          </g>
        </g>
      </svg>

      <aside
        className="story-narrator-pill"
        data-visible={narratorVisible ? 'true' : 'false'}
        aria-live="polite"
      >
        <span className="story-narrator-pill__emblem" aria-hidden="true">
          <svg viewBox="0 0 234.21 324.76" width="14" height="19">
            {LOGO_PARTS.map((part) => (
              <path
                key={part.id}
                d={part.d}
                className={
                  activePartSet.has(part.id)
                    ? 'totem-carrier-part totem-carrier-part--active'
                    : 'totem-carrier-part'
                }
              />
            ))}
          </svg>
        </span>
        <span className="story-narrator-pill__step">{currentAct.id}</span>
        <span className="story-narrator-pill__label">{currentAct.label}</span>
      </aside>

      {children}
    </div>
  );
}
