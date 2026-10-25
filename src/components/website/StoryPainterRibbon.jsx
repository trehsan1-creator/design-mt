import React, { useEffect, useRef, useState } from 'react';
import { LOGO_PARTS } from '../../data/geometryData.js';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function evalCubic1D(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return (
    mt * mt * mt * p0 +
    3 * mt * mt * t * p1 +
    3 * mt * t * t * p2 +
    t * t * t * p3
  );
}

// جدول سبک ۲۴ نقطه‌ای طول کمان بزیه برای محاسبه آنی مختصات توتم بدون فراخوانی getPointAtLength در اسکرول
function buildCubicLut(x0, y0, x1, y1, x2, y2, x3, y3) {
  const steps = 24;
  const xs = new Float32Array(steps + 1);
  const ys = new Float32Array(steps + 1);
  const cum = new Float32Array(steps + 1);
  xs[0] = x0;
  ys[0] = y0;
  cum[0] = 0;
  let total = 0;
  for (let i = 1; i <= steps; i += 1) {
    const t = i / steps;
    const x = evalCubic1D(x0, x1, x2, x3, t);
    const y = evalCubic1D(y0, y1, y2, y3, t);
    xs[i] = x;
    ys[i] = y;
    total += Math.hypot(x - xs[i - 1], y - ys[i - 1]);
    cum[i] = total;
  }
  return { xs, ys, cum, total, steps };
}

function sampleCubicLut(lut, frac) {
  if (!lut || lut.total <= 0.5) return null;
  const target = clamp(frac, 0, 1) * lut.total;
  let lo = 0;
  let hi = lut.steps;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (lut.cum[mid] < target) lo = mid;
    else hi = mid;
  }
  const segLen = Math.max(0.0001, lut.cum[hi] - lut.cum[lo]);
  const alpha = clamp((target - lut.cum[lo]) / segLen, 0, 1);
  return {
    x: lut.xs[lo] + (lut.xs[hi] - lut.xs[lo]) * alpha,
    y: lut.ys[lo] + (lut.ys[hi] - lut.ys[lo]) * alpha,
  };
}

// محاسبه تحلیلی دقیق موقعیت جرقه‌های کادر PaintedCard بدون نیاز به کوئری SVG در هر فریم
function evalCardHalfPerimeter(w, h, p, isRight) {
  const s = 1.5;
  const r = Math.min(28, w * 0.12, h * 0.22);
  const rad = Math.max(0, r - s);
  const cx = w * 0.5;
  const len1 = Math.max(0, cx - r);
  const lenArc = 0.5 * Math.PI * rad;
  const len3 = Math.max(0, h - 2 * r);
  const total = len1 + lenArc + len3 + lenArc + len1;
  if (total <= 1) return { x: cx, y: s };

  let d = clamp(p, 0, 1) * total;

  if (d <= len1) {
    const u = len1 > 0 ? d / len1 : 0;
    return {
      x: isRight ? cx + (w - r - cx) * u : cx + (r - cx) * u,
      y: s,
    };
  }
  d -= len1;

  if (d <= lenArc) {
    const u = lenArc > 0 ? d / lenArc : 0;
    const ang = isRight ? -Math.PI * 0.5 + u * Math.PI * 0.5 : -Math.PI * 0.5 - u * Math.PI * 0.5;
    const ox = isRight ? w - r : r;
    return {
      x: ox + rad * Math.cos(ang),
      y: r + rad * Math.sin(ang),
    };
  }
  d -= lenArc;

  if (d <= len3) {
    const u = len3 > 0 ? d / len3 : 0;
    return {
      x: isRight ? w - s : s,
      y: r + len3 * u,
    };
  }
  d -= len3;

  if (d <= lenArc) {
    const u = lenArc > 0 ? d / lenArc : 0;
    const ang = isRight ? u * Math.PI * 0.5 : Math.PI - u * Math.PI * 0.5;
    const ox = isRight ? w - r : r;
    return {
      x: ox + rad * Math.cos(ang),
      y: h - r + rad * Math.sin(ang),
    };
  }
  d -= lenArc;

  const u = len1 > 0 ? clamp(d / len1, 0, 1) : 1;
  return {
    x: isRight ? w - r + (cx - (w - r)) * u : r + (cx - r) * u,
    y: h - s,
  };
}

const CHAPTER_NARRATION = [
  {
    id: '۰۱',
    label: 'گام اول · ثبت خودکار تردد، سوخت و حریم مسیر',
    activeParts: ['p1', 'p2'],
  },
  {
    id: '۰۲',
    label: 'گام دوم · اتاق فرمان زنده کریدورهای ایران',
    activeParts: ['p0'],
  },
  {
    id: '۰۳',
    label: 'گام سوم · سخت‌افزار صنعتی ضدضربه و آفلاین',
    activeParts: ['p0', 'p1', 'p2', 'p3'],
  },
  {
    id: '۰۴',
    label: 'گام چهارم · محاسبه سود خالص و بازگشت سرمایه',
    activeParts: ['p3'],
  },
];

// ایستگاه‌های مفهومی مشتری در پیچ‌وخم مسیر بین کامپوننت‌ها
const HIGHWAY_WAYPOINTS = [
  {
    cableIndex: 1,
    code: 'دقت ۹۹.۴٪',
    title: 'تشخیص آنی افت ناگهانی باک',
  },
  {
    cableIndex: 2,
    code: 'هشدار فوری',
    title: 'کنترل خروج از محدوده مجاز',
  },
  {
    cableIndex: 3,
    code: 'سراسر ایران',
    title: 'پایش زنده دما و کریدور ترانزیت',
  },
  {
    cableIndex: 4,
    code: '۷۲ ساعت',
    title: 'ذخیره آفلاین در نقاط کور کوهستانی',
  },
  {
    cableIndex: 5,
    code: '۴ ماهه',
    title: 'بازگشت کامل سرمایه ناوگان',
  },
];

export default function StoryPainterRibbon({ children }) {
  const reducedMotion = usePrefersReducedMotion();
  const worldRef = useRef(null);
  const svgRef = useRef(null);
  const cablesGroupRef = useRef(null);
  const leadTotemRef = useRef(null);
  const pluckRingRef = useRef(null);
  const waypointElsRef = useRef([]);

  const [activeAct, setActiveAct] = useState(0);
  const [narratorVisible, setNarratorVisible] = useState(false);

  useEffect(() => {
    const world = worldRef.current;
    const svg = svgRef.current;
    const cablesGroup = cablesGroupRef.current;
    if (!world || !svg || !cablesGroup) return undefined;

    let nodesMeta = [];
    let cablesMeta = [];
    let worldWidth = 0;
    let worldHeight = 0;
    let worldDocTop = 0;
    let cachedVh = window.innerHeight || 800;
    let cachedWinW = window.innerWidth || 1280;
    let cablesSleeping = false;
    let smoothPlayhead = -1;
    let lastRenderedPlayhead = -999;
    let lastTotemTf = '';
    let lastTotemOp = '';
    let lastPluckOp = '0';
    let lastAct = -1;
    let lastVis = false;
    let rafId = 0;

    const createSvgPath = (cls) => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('class', cls);
      return p;
    };

    const updateCableGeometry = (ptrX, ptrY, ptrInside, forceWrite = false) => {
      if (!forceWrite && !ptrInside && cablesSleeping) return;

      let nearestPluck = null;
      let anyMoving = false;
      const isCompact = worldWidth <= 900;

      cablesMeta.forEach((cb) => {
        const midX = (cb.startX + cb.endX) * 0.5;
        const midY = (cb.startY + cb.endY) * 0.5;
        let targetPluck = 0;

        if (ptrInside && !reducedMotion && ptrY >= cb.startY - 70 && ptrY <= cb.endY + 70) {
          const dist = Math.hypot(ptrX - midX, ptrY - midY);
          if (dist < 260) {
            const pull = Math.pow(1 - dist / 260, 1.45);
            targetPluck = clamp((ptrX - midX) * 0.55 * pull, -96, 96);
            if (!nearestPluck || dist < nearestPluck.dist) {
              nearestPluck = { x: midX + targetPluck * 0.52, y: midY, dist };
            }
          }
        }

        const force = (targetPluck - cb.pluckX) * 0.16;
        cb.vx = (cb.vx + force) * 0.75;
        cb.pluckX += cb.vx;

        if (Math.abs(cb.pluckX) > 0.04 || Math.abs(cb.vx) > 0.01) {
          anyMoving = true;
        } else {
          cb.pluckX = 0;
          cb.vx = 0;
        }

        if (forceWrite || Number.isNaN(cb.lastRenderedPluck) || Math.abs(cb.pluckX - cb.lastRenderedPluck) > 0.08) {
          cb.lastRenderedPluck = cb.pluckX;
          const spanY = Math.max(28, cb.endY - cb.startY);
          const dx = Math.abs(cb.endX - cb.startX);

          // قوس S-Curve کلوتوئیدی پویا هم در موبایل و هم در دسکتاپ تا مسیر هرگز یک خط صاف ساده نباشد
          const dirSign = cb.idx % 2 === 0 ? 1 : -1;
          const maxSwing = isCompact ? 56 : 98;
          const naturalWave =
            dx < 75 && spanY > 70
              ? Math.min(maxSwing, spanY * 0.36) * dirSign
              : spanY > 110
                ? (isCompact ? 34 : 46) * dirSign
                : 0;

          const c1x = cb.startX + naturalWave + cb.pluckX * 0.85;
          const c1y = cb.startY + spanY * 0.42;
          const c2x = cb.endX - naturalWave * 0.85 + cb.pluckX * 0.85;
          const c2y = cb.endY - spanY * 0.42;

          const d = `M ${cb.startX.toFixed(1)},${cb.startY.toFixed(1)} C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${cb.endX.toFixed(1)},${cb.endY.toFixed(1)}`;
          const dCyan = `M ${(cb.startX - 9).toFixed(1)},${cb.startY.toFixed(1)} C ${(c1x - 13).toFixed(1)},${c1y.toFixed(1)} ${(c2x + 11).toFixed(1)},${c2y.toFixed(1)} ${(cb.endX - 9).toFixed(1)},${cb.endY.toFixed(1)}`;
          const dWarm = `M ${(cb.startX + 9).toFixed(1)},${cb.startY.toFixed(1)} C ${(c1x + 13).toFixed(1)},${c1y.toFixed(1)} ${(c2x - 11).toFixed(1)},${c2y.toFixed(1)} ${(cb.endX + 9).toFixed(1)},${cb.endY.toFixed(1)}`;

          cb.laneCyan.setAttribute('d', dCyan);
          cb.laneWarm.setAttribute('d', dWarm);
          cb.rail.setAttribute('d', d);
          cb.glow.setAttribute('d', d);
          cb.stroke.setAttribute('d', d);
          cb.pulseTrack.setAttribute('d', d);
          cb.lut = buildCubicLut(cb.startX, cb.startY, c1x, c1y, c2x, c2y, cb.endX, cb.endY);

          const curveMidX = 0.125 * cb.startX + 0.375 * c1x + 0.375 * c2x + 0.125 * cb.endX;
          const curveMidY = 0.125 * cb.startY + 0.375 * c1y + 0.375 * c2y + 0.125 * cb.endY;
          const wpEl = waypointElsRef.current[cb.idx];
          if (wpEl) {
            if (spanY >= 64) {
              const physLeftPct = (curveMidX / worldWidth) * 100;
              const safeMargin = isCompact ? 30 : 18;
              wpEl.style.setProperty('--wp-x', `${clamp(physLeftPct, safeMargin, 100 - safeMargin).toFixed(2)}%`);
              wpEl.style.setProperty('--wp-top', `${curveMidY.toFixed(1)}px`);
              wpEl.style.display = 'inline-flex';
            } else {
              wpEl.style.display = 'none';
            }
          }
        }
      });

      cablesSleeping = !ptrInside && !anyMoving;

      if (pluckRingRef.current) {
        if (nearestPluck) {
          pluckRingRef.current.setAttribute(
            'transform',
            `translate(${nearestPluck.x.toFixed(1)}, ${nearestPluck.y.toFixed(1)})`
          );
          if (lastPluckOp !== '0.94') {
            lastPluckOp = '0.94';
            pluckRingRef.current.setAttribute('opacity', '0.94');
          }
        } else if (lastPluckOp !== '0') {
          lastPluckOp = '0';
          pluckRingRef.current.setAttribute('opacity', '0');
        }
      }
    };

    const measureCircuit = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const wRect = world.getBoundingClientRect();
      worldDocTop = wRect.top + scrollY;
      cachedVh = window.innerHeight || 800;
      cachedWinW = window.innerWidth || 1280;
      worldWidth = Math.max(320, wRect.width);
      worldHeight = Math.max(600, world.scrollHeight || wRect.height);
      svg.setAttribute('viewBox', `0 0 ${worldWidth} ${worldHeight}`);

      const nodeEls = Array.from(world.querySelectorAll('[data-circuit-node]'));
      nodesMeta = nodeEls.map((el) => {
        const prevTransform = el.style.transform;
        el.style.transform = 'none';
        const r = el.getBoundingClientRect();
        el.style.transform = prevTransform;

        const topY = r.top - wRect.top;
        const bottomY = r.bottom - wRect.top;
        const centerX = r.left - wRect.left + r.width * 0.5;

        return {
          el,
          id: el.getAttribute('data-circuit-node') || '',
          topY,
          bottomY,
          width: Math.max(120, r.width),
          height: Math.max(48, bottomY - topY),
          inX: centerX,
          inY: topY,
          outX: centerX,
          outY: bottomY,
          hasOut: Boolean(el.querySelector('[data-port-out]')),
          portIn: el.querySelector('[data-port-in]'),
          portOut: el.querySelector('[data-port-out]'),
          splitRight: el.querySelector('[data-split-right]'),
          splitLeft: el.querySelector('[data-split-left]'),
          sparkRight: el.querySelector('[data-spark-right]'),
          sparkLeft: el.querySelector('[data-spark-left]'),
          lastDash: '',
          lastRise: '',
          lastAwake: '',
          lastFormed: '',
          lastLitIn: '',
          lastLitOut: '',
          lastSparkOp: '',
          lastSentProgress: -1,
        };
      });

      const neededCables = [];
      if (nodesMeta.length > 0) {
        neededCables.push({
          idx: 0,
          startX: worldWidth * 0.5,
          startY: 0,
          endX: nodesMeta[0].inX,
          endY: nodesMeta[0].inY,
        });
        for (let i = 0; i < nodesMeta.length - 1; i += 1) {
          if (nodesMeta[i].hasOut) {
            neededCables.push({
              idx: i + 1,
              startX: nodesMeta[i].outX,
              startY: nodesMeta[i].outY,
              endX: nodesMeta[i + 1].inX,
              endY: nodesMeta[i + 1].inY,
            });
          }
        }
      }

      if (cablesMeta.length !== neededCables.length) {
        cablesGroup.innerHTML = '';
        cablesMeta = neededCables.map((spec) => {
          const laneCyan = createSvgPath('story-painter-svg__cyan-lane');
          const laneWarm = createSvgPath('story-painter-svg__lane');
          const rail = createSvgPath('story-painter-svg__rail');
          const glow = createSvgPath('story-painter-svg__glow');
          const stroke = createSvgPath('story-painter-svg__stroke');
          const pulseTrack = createSvgPath('story-painter-svg__pulse');
          pulseTrack.setAttribute('opacity', '0');
          pulseTrack.setAttribute('data-flowing', 'false');

          glow.setAttribute('pathLength', '1');
          glow.setAttribute('stroke-dasharray', '1');
          glow.setAttribute('stroke-dashoffset', reducedMotion ? '0' : '1');

          stroke.setAttribute('pathLength', '1');
          stroke.setAttribute('stroke-dasharray', '1');
          stroke.setAttribute('stroke-dashoffset', reducedMotion ? '0' : '1');

          cablesGroup.appendChild(laneCyan);
          cablesGroup.appendChild(laneWarm);
          cablesGroup.appendChild(rail);
          cablesGroup.appendChild(glow);
          cablesGroup.appendChild(stroke);
          cablesGroup.appendChild(pulseTrack);

          return {
            ...spec,
            laneCyan,
            laneWarm,
            rail,
            glow,
            stroke,
            pulseTrack,
            lut: null,
            pluckX: 0,
            vx: 0,
            lastRenderedPluck: NaN,
            lastDash: '',
            lastFlowing: '',
            lastPassed: '',
          };
        });
      } else {
        neededCables.forEach((spec, idx) => {
          cablesMeta[idx].idx = spec.idx;
          cablesMeta[idx].startX = spec.startX;
          cablesMeta[idx].startY = spec.startY;
          cablesMeta[idx].endX = spec.endX;
          cablesMeta[idx].endY = spec.endY;
          cablesMeta[idx].lastRenderedPluck = NaN;
          cablesMeta[idx].lastDash = '';
        });
      }

      cablesSleeping = false;
      updateCableGeometry(0, -9999, false, true);
      lastRenderedPlayhead = -999;
    };

    const ptr = { x: 0, y: -9999, inside: false };
    const onPointerMove = (e) => {
      if (reducedMotion || e.pointerType === 'touch') return;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const wTop = worldDocTop - scrollY;
      ptr.x = e.clientX;
      ptr.y = e.clientY - wTop;
      ptr.inside = ptr.y >= 0 && ptr.y <= worldHeight;
      if (ptr.inside) cablesSleeping = false;
    };
    const onPointerLeave = () => {
      ptr.inside = false;
    };

    const onWindowResize = () => {
      cachedVh = window.innerHeight || 800;
      const nextWinW = window.innerWidth || 1280;
      // نادیده گرفتن تغییر ارتفاع نوار آدرس مرورگر موبایل حین اسکرول و اندازه‌گیری مجدد فقط در تغییر عرض واقعی
      if (Math.abs(nextWinW - cachedWinW) >= 2) {
        measureCircuit();
      }
    };

    const onObserverResize = () => {
      const nextW = Math.max(320, world.clientWidth);
      const nextH = Math.max(600, world.scrollHeight);
      if (Math.abs(nextW - worldWidth) >= 2 || Math.abs(nextH - worldHeight) >= 3) {
        measureCircuit();
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    world.addEventListener('pointerleave', onPointerLeave, { passive: true });

    measureCircuit();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureCircuit);
    }

    const ro = new ResizeObserver(onObserverResize);
    ro.observe(world);
    window.addEventListener('resize', onWindowResize, { passive: true });

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (document.hidden) return;

      const scrollY = window.scrollY || window.pageYOffset || 0;
      const wTop = worldDocTop - scrollY;
      const vh = cachedVh;

      const targetPlayhead = reducedMotion
        ? worldHeight
        : clamp(vh * 0.68 - wTop, 0, worldHeight);

      if (smoothPlayhead < 0 || Math.abs(targetPlayhead - smoothPlayhead) > 360) {
        smoothPlayhead = targetPlayhead;
      } else {
        smoothPlayhead += (targetPlayhead - smoothPlayhead) * 0.28;
      }

      updateCableGeometry(ptr.x, ptr.y, ptr.inside);

      const vis = wTop < vh * 0.72 && wTop + worldHeight > vh * 0.25;
      if (vis !== lastVis) {
        lastVis = vis;
        setNarratorVisible(vis);
      }

      if (Math.abs(smoothPlayhead - lastRenderedPlayhead) < 0.2) {
        return;
      }
      lastRenderedPlayhead = smoothPlayhead;

      let totemPos = null;

      cablesMeta.forEach((cb) => {
        const lenY = Math.max(14, cb.endY - cb.startY);
        const p = reducedMotion ? 1 : clamp((smoothPlayhead - cb.startY) / lenY, 0, 1);
        const dash = (1 - p).toFixed(4);

        if (dash !== cb.lastDash) {
          cb.lastDash = dash;
          cb.stroke.setAttribute('stroke-dashoffset', dash);
          cb.glow.setAttribute('stroke-dashoffset', dash);
        }

        const flowing = p > 0.12 ? 'true' : 'false';
        if (flowing !== cb.lastFlowing) {
          cb.lastFlowing = flowing;
          cb.pulseTrack.setAttribute('opacity', flowing === 'true' ? '0.78' : '0');
          cb.pulseTrack.setAttribute('data-flowing', flowing);
        }

        const wpEl = waypointElsRef.current[cb.idx];
        if (wpEl) {
          const passed = p >= 0.45 ? 'true' : 'false';
          if (passed !== cb.lastPassed) {
            cb.lastPassed = passed;
            wpEl.setAttribute('data-passed', passed);
          }
        }

        if (p > 0.005 && p < 0.995 && cb.lut) {
          const pt = sampleCubicLut(cb.lut, p);
          if (pt) totemPos = pt;
        }
      });

      nodesMeta.forEach((nd) => {
        const p = reducedMotion ? 1 : clamp((smoothPlayhead - nd.topY) / nd.height, 0, 1);
        const dash = (1 - p).toFixed(4);
        const rise = p.toFixed(3);
        const awake = p > 0.03 ? 'true' : 'false';
        const formed = p >= 0.97 ? 'true' : 'false';
        const litIn = smoothPlayhead >= nd.topY - 4 ? 'true' : 'false';
        const litOut = p >= 0.96 ? 'true' : 'false';

        if (dash !== nd.lastDash) {
          nd.lastDash = dash;
          if (nd.splitRight) nd.splitRight.setAttribute('stroke-dashoffset', dash);
          if (nd.splitLeft) nd.splitLeft.setAttribute('stroke-dashoffset', dash);
        }

        if (rise !== nd.lastRise) {
          nd.lastRise = rise;
          nd.el.style.setProperty('--card-rise', rise);
        }
        if (awake !== nd.lastAwake) {
          nd.lastAwake = awake;
          nd.el.setAttribute('data-awake', awake);
        }
        if (formed !== nd.lastFormed) {
          nd.lastFormed = formed;
          nd.el.setAttribute('data-formed', formed);
        }
        if (litIn !== nd.lastLitIn && nd.portIn) {
          nd.lastLitIn = litIn;
          nd.portIn.setAttribute('data-lit', litIn);
        }
        if (litOut !== nd.lastLitOut && nd.portOut) {
          nd.lastLitOut = litOut;
          nd.portOut.setAttribute('data-lit', litOut);
        }

        const showSplitSparks = !reducedMotion && p > 0.02 && p < 0.98;
        if (showSplitSparks) {
          if (nd.sparkRight) {
            const ptR = evalCardHalfPerimeter(nd.width, nd.height, p, true);
            nd.sparkRight.setAttribute('cx', ptR.x.toFixed(1));
            nd.sparkRight.setAttribute('cy', ptR.y.toFixed(1));
          }
          if (nd.sparkLeft) {
            const ptL = evalCardHalfPerimeter(nd.width, nd.height, p, false);
            nd.sparkLeft.setAttribute('cx', ptL.x.toFixed(1));
            nd.sparkLeft.setAttribute('cy', ptL.y.toFixed(1));
          }
          if (nd.lastSparkOp !== '1') {
            nd.lastSparkOp = '1';
            if (nd.sparkRight) nd.sparkRight.setAttribute('opacity', '1');
            if (nd.sparkLeft) nd.sparkLeft.setAttribute('opacity', '1');
          }
        } else if (nd.lastSparkOp !== '0') {
          nd.lastSparkOp = '0';
          if (nd.sparkRight) nd.sparkRight.setAttribute('opacity', '0');
          if (nd.sparkLeft) nd.sparkLeft.setAttribute('opacity', '0');
        }

        const roundedP = Math.round(p * 200) / 200;
        if (roundedP !== nd.lastSentProgress) {
          nd.lastSentProgress = roundedP;
          nd.el.dispatchEvent(new CustomEvent('circuit-progress', { detail: { progress: roundedP } }));
        }
      });

      if (leadTotemRef.current) {
        if (totemPos) {
          const tf = `translate(${totemPos.x.toFixed(1)}, ${totemPos.y.toFixed(1)})`;
          if (tf !== lastTotemTf) {
            lastTotemTf = tf;
            leadTotemRef.current.setAttribute('transform', tf);
          }
          if (lastTotemOp !== '1') {
            lastTotemOp = '1';
            leadTotemRef.current.setAttribute('opacity', '1');
          }
        } else if (lastTotemOp !== '0') {
          lastTotemOp = '0';
          leadTotemRef.current.setAttribute('opacity', '0');
        }
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
      window.removeEventListener('resize', onWindowResize);
    };
  }, [reducedMotion]);

  const currentAct = CHAPTER_NARRATION[activeAct] || CHAPTER_NARRATION[0];
  const activePartSet = new Set(currentAct.activeParts);

  return (
    <div ref={worldRef} className="story-painter-world">
      {/* ایستگاه‌های مفهومی زنده در پیچ‌وخم مسیر بین کامپوننت‌ها */}
      <div className="highway-waypoints-layer" aria-hidden="true">
        {HIGHWAY_WAYPOINTS.map((wp) => (
          <div
            key={wp.cableIndex}
            ref={(el) => {
              waypointElsRef.current[wp.cableIndex] = el;
            }}
            data-passed="false"
            className="highway-waypoint-pill"
          >
            <span className="highway-waypoint-pill__dot" />
            <strong className="highway-waypoint-pill__code">{wp.code}</strong>
            <span className="highway-waypoint-pill__title">{wp.title}</span>
          </div>
        ))}
      </div>

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

        <g ref={leadTotemRef} opacity="0">
          <circle r="28" className="totem-carrier-halo" />
          <circle r="16" className="totem-carrier-disc" />
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
