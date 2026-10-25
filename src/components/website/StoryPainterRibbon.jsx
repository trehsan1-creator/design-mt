import React, { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

const STORY_ACTS = [
  { id: '۰۱', label: 'فصل اول · قفل شدن حسگرها روی مدار سیگنال' },
  { id: '۰۲', label: 'فصل دوم · جریان زنده کریدور تبریز تا بندرعباس' },
  { id: '۰۳', label: 'فصل سوم · شکافته شدن کالبد سه‌بعدی ردیاب' },
  { id: '۰۴', label: 'فصل چهارم · تبدیل داده مسیر به سود خالص' },
];

/**
 * موتور هماهنگ‌ساز مدار زنده سیگنال (Unified Signal Choreographer):
 * مختصات واقعی تمام گره‌های [data-circuit-node] را در صفحه می‌سنجد، کابل‌های دقیق بین سوکت خروجی هر کارت
 * تا سوکت ورودی کارت بعدی را رسم می‌کند، با حرکت موس مثل سیم کشسان ارتعاش می‌یابد و با یک Playhead واحد
 * تمام کارت‌ها، نقشه کریدور و کالبد سه‌بعدی سخت‌افزار را دقیقاً در لحظه رسیدن خط نارنجی بیدار می‌کند.
 */
export default function StoryPainterRibbon({ children }) {
  const reducedMotion = usePrefersReducedMotion();
  const worldRef = useRef(null);
  const svgRef = useRef(null);
  const cablesGroupRef = useRef(null);
  const leadCometRef = useRef(null);
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

    // محاسبه مختصات دقیق پیکسلی هر گره نسبت به ظرف .story-painter-world
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

      // ساخت کابل‌های SVG بین خروجی هیرو (center, 0) -> گره ۰ -> گره ۱ -> ... -> گره آخر
      cablesGroup.innerHTML = '';
      cablesMeta = [];

      for (let i = 0; i < nodesMeta.length; i += 1) {
        const startX = i === 0 ? worldWidth * 0.5 : nodesMeta[i - 1].cx;
        const startY = i === 0 ? 0 : nodesMeta[i - 1].bottomY;
        const endX = nodesMeta[i].cx;
        const endY = nodesMeta[i].topY;

        const ns = 'http://www.w3.org/2000/svg';
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
          rail,
          glow,
          stroke,
        });
      }

      updateCableGeometry(0, -9999, false);
    };

    const updateCableGeometry = (ptrX, ptrY, ptrInside) => {
      let nearestPluck = null;
      let bestDist = 145;

      cablesMeta.forEach((cb) => {
        const midX = (cb.startX + cb.endX) * 0.5;
        const midY = (cb.startY + cb.endY) * 0.5;
        let tx = 0;
        let ty = 0;

        if (ptrInside && !reducedMotion) {
          const dx = ptrX - midX;
          const dy = ptrY - midY;
          const dist = Math.hypot(dx, dy);
          if (dist < 145) {
            const pull = (1 - dist / 145) * 46;
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
          pluckRingRef.current.setAttribute('opacity', '0.9');
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

      // موقعیت واحد قلم‌موی نقاش در ۶۴٪ ارتفاع دید کاربر
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

      let cometPos = null;

      // ۱. به‌روزرسانی دقیق تمام کابل‌های بین کارت‌ها بر اساس Playhead واحد
      cablesMeta.forEach((cb) => {
        const lenY = Math.max(14, cb.endY - cb.startY);
        const p = reducedMotion ? 1 : clamp((smoothPlayhead - cb.startY) / lenY, 0, 1);
        const dash = `${(1 - p).toFixed(4)}`;
        cb.stroke.setAttribute('stroke-dashoffset', dash);
        cb.glow.setAttribute('stroke-dashoffset', dash);

        if (p > 0.005 && p < 0.995 && cb.stroke.getTotalLength) {
          const total = cb.stroke.getTotalLength();
          if (total > 1) {
            const pt = cb.stroke.getPointAtLength(total * p);
            cometPos = { x: pt.x, y: pt.y };
          }
        }
      });

      // ۲. به‌روزرسانی هم‌زمان انشعاب دوطرفه کادر، سوکت‌ها و رویداد درونی هر گره دقیقاً در لحظه رسیدن خط نارنجی
      nodesMeta.forEach((nd) => {
        const p = reducedMotion ? 1 : clamp((smoothPlayhead - nd.topY) / nd.height, 0, 1);
        const dash = `${(1 - p).toFixed(4)}`;

        if (nd.splitRight) nd.splitRight.setAttribute('stroke-dashoffset', dash);
        if (nd.splitLeft) nd.splitLeft.setAttribute('stroke-dashoffset', dash);

        // بالا آمدن سه‌بعدی نرم کارت هم‌گام با رسم کادر
        nd.el.style.setProperty('--card-rise', p.toFixed(3));
        nd.el.setAttribute('data-awake', p > 0.08 ? 'true' : 'false');

        if (nd.portIn) nd.portIn.setAttribute('data-lit', smoothPlayhead >= nd.topY - 4 ? 'true' : 'false');
        if (nd.portOut) nd.portOut.setAttribute('data-lit', p >= 0.96 ? 'true' : 'false');

        // نمایش دو گوی جرقه چپ و راست در حین شکافته شدن کادر کارت
        const showSplitSparks = !reducedMotion && p > 0.02 && p < 0.98;
        if (nd.sparkRight && nd.splitRight?.getTotalLength) {
          if (showSplitSparks) {
            const lenR = nd.splitRight.getTotalLength();
            const ptR = nd.splitRight.getPointAtLength(lenR * p);
            nd.sparkRight.setAttribute('cx', ptR.x.toFixed(1));
            nd.sparkRight.setAttribute('cy', ptR.y.toFixed(1));
            nd.sparkRight.setAttribute('opacity', '1');
          } else {
            nd.sparkRight.setAttribute('opacity', '0');
          }
        }
        if (nd.sparkLeft && nd.splitLeft?.getTotalLength) {
          if (showSplitSparks) {
            const lenL = nd.splitLeft.getTotalLength();
            const ptL = nd.splitLeft.getPointAtLength(lenL * p);
            nd.sparkLeft.setAttribute('cx', ptL.x.toFixed(1));
            nd.sparkLeft.setAttribute('cy', ptL.y.toFixed(1));
            nd.sparkLeft.setAttribute('opacity', '1');
          } else {
            nd.sparkLeft.setAttribute('opacity', '0');
          }
        }

        // ارسال میزان دقیق پیشروی به گره‌های هوشمند (نقشه کریدور ایران و کالبد سه‌بعدی سخت‌افزار)
        const roundedP = Math.round(p * 200) / 200;
        if (roundedP !== nd.lastSentProgress) {
          nd.lastSentProgress = roundedP;
          nd.el.dispatchEvent(new CustomEvent('circuit-progress', { detail: { progress: roundedP } }));
        }
      });

      if (leadCometRef.current) {
        if (cometPos) {
          leadCometRef.current.setAttribute(
            'transform',
            `translate(${cometPos.x.toFixed(1)}, ${cometPos.y.toFixed(1)})`
          );
          leadCometRef.current.setAttribute('opacity', '1');
        } else {
          leadCometRef.current.setAttribute('opacity', '0');
        }
      }

      // کپسول راوی شناور پایین صفحه هماهنگ با موقعیت واقعی گره‌ها
      const vis = wRect.top < vh * 0.72 && wRect.bottom > vh * 0.25;
      if (vis !== lastVis) {
        lastVis = vis;
        setNarratorVisible(vis);
      }

      let actIdx = 0;
      if (nodesMeta[5] && smoothPlayhead >= nodesMeta[5].topY - 120) actIdx = 3;
      else if (nodesMeta[4] && smoothPlayhead >= nodesMeta[4].topY - 120) actIdx = 2;
      else if (nodesMeta[3] && smoothPlayhead >= nodesMeta[3].topY - 120) actIdx = 1;

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

        {/* حلقه ارتعاش مغناطیسی روی کابل هنگام نزدیک شدن موس */}
        <g ref={pluckRingRef} opacity="0">
          <circle r="16" className="painter-spark-halo" />
          <circle r="5" className="painter-spark-core" />
        </g>

        {/* گوی نقاش پیشرو که از خروجی هر کارت به ورودی کارت بعدی شلیک می‌شود */}
        <g ref={leadCometRef} opacity="0">
          <circle r="15" className="painter-spark-halo" />
          <circle r="6" className="painter-spark-core" />
        </g>
      </svg>

      <aside
        className="story-narrator-pill"
        data-visible={narratorVisible ? 'true' : 'false'}
        aria-live="polite"
      >
        <span className="story-narrator-pill__step">{currentAct.id}</span>
        <span className="story-narrator-pill__label">{currentAct.label}</span>
      </aside>

      {children}
    </div>
  );
}
