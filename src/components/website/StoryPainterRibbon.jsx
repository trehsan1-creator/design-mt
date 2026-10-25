import React, { useEffect, useRef } from 'react';
import { usePrefersReducedMotion } from '../../utils/usePrefersReducedMotion.js';

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

const CHAPTER_BEATS = [
  { threshold: 0.0, step: '۰۱', label: 'فصل اول · بیداری حسگرها روی بوم شنی' },
  { threshold: 0.3, step: '۰۲', label: 'فصل دوم · نقاشی زنده کریدور ایران' },
  { threshold: 0.58, step: '۰۳', label: 'فصل سوم · کالبدشکافی سه‌بعدی سخت‌افزار' },
  { threshold: 0.82, step: '۰۴', label: 'فصل چهارم · تبدیل مسیر به سود خالص' },
];

/**
 * نوار نقاش سرتاسری بین تمام فصل‌های داستان:
 * هم با اسکرول جلو می‌رود و سکشن‌ها را می‌کشد، هم در برخورد موس مثل تار الاستیک خم و مرتعش می‌شود
 */
export default function StoryPainterRibbon({ storyWrapRef }) {
  const reducedMotion = usePrefersReducedMotion();
  const svgRef = useRef(null);
  const railPathRef = useRef(null);
  const glowPathRef = useRef(null);
  const mainPathRef = useRef(null);
  const brushTipRef = useRef(null);
  const badgeStepRef = useRef(null);
  const badgeTextRef = useRef(null);
  const badgeWrapRef = useRef(null);

  useEffect(() => {
    const host = storyWrapRef?.current;
    if (!host) return undefined;

    // مختصات پایه ۶ گره منحنی در فضای ۱۰۰۰×۴۰۰۰ کل داستان
    const baseAnchors = [
      { x: 500, y: 0 },
      { x: 760, y: 680 },
      { x: 240, y: 1420 },
      { x: 750, y: 2240 },
      { x: 280, y: 3080 },
      { x: 500, y: 4000 },
    ];

    // جابه‌جایی الاستیک هر گره زیر اثر موس (فیزیک فنر)
    const offsets = baseAnchors.map(() => ({ dx: 0, vx: 0 }));
    const mouseDoc = { x: -9999, y: -9999, active: false };

    const buildD = () => {
      const pts = baseAnchors.map((a, i) => ({
        x: a.x + offsets[i].dx,
        y: a.y,
      }));
      let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const curr = pts[i];
        const next = pts[i + 1];
        const midY = (curr.y + next.y) * 0.5;
        d += ` C ${curr.x.toFixed(1)},${midY.toFixed(1)} ${next.x.toFixed(1)},${midY.toFixed(1)} ${next.x.toFixed(1)},${next.y.toFixed(1)}`;
      }
      return d;
    };

    const initialD = buildD();
    [railPathRef.current, glowPathRef.current, mainPathRef.current].forEach((p) => {
      if (p) p.setAttribute('d', initialD);
    });

    if (reducedMotion) {
      if (mainPathRef.current) mainPathRef.current.setAttribute('stroke-dashoffset', '0');
      if (glowPathRef.current) glowPathRef.current.setAttribute('stroke-dashoffset', '0');
      return undefined;
    }

    const onPointerMove = (e) => {
      const rect = host.getBoundingClientRect();
      if (rect.height <= 0) return;
      mouseDoc.x = ((e.clientX - rect.left) / rect.width) * 1000;
      mouseDoc.y = ((e.clientY - rect.top) / rect.height) * 4000;
      mouseDoc.active = e.clientY >= 0 && e.clientY <= window.innerHeight;
    };

    let rafId = 0;
    let smoothDraw = 0.04;
    let activeChapterIdx = -1;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      const rect = host.getBoundingClientRect();
      if (rect.height <= 0) return;

      // میزان پیشروی اسکرول در کل بوم داستان
      const vh = window.innerHeight || 800;
      const targetDraw = clamp((vh * 0.62 - rect.top) / rect.height, 0.02, 1);
      if (Math.abs(targetDraw - smoothDraw) > 0.25) {
        smoothDraw = targetDraw;
      } else {
        smoothDraw += (targetDraw - smoothDraw) * 0.28;
      }

      // فیزیک فنر روی گره‌های میانی هنگام عبور موس از نزدیکی نوار نقاش
      let needsPathRebuild = false;
      for (let i = 1; i < baseAnchors.length - 1; i++) {
        const anchor = baseAnchors[i];
        let forceX = 0;
        if (mouseDoc.active) {
          const dy = Math.abs(mouseDoc.y - anchor.y);
          const dx = mouseDoc.x - anchor.x;
          if (dy < 460 && Math.abs(dx) < 280) {
            const falloff = (1 - dy / 460) * (1 - Math.abs(dx) / 280);
            forceX = dx * falloff * 0.48;
          }
        }
        const spring = (forceX - offsets[i].dx) * 0.12;
        offsets[i].vx = (offsets[i].vx + spring) * 0.78;
        offsets[i].dx += offsets[i].vx;
        if (Math.abs(offsets[i].dx) > 0.15 || Math.abs(offsets[i].vx) > 0.05) {
          needsPathRebuild = true;
        }
      }

      if (needsPathRebuild) {
        const d = buildD();
        if (railPathRef.current) railPathRef.current.setAttribute('d', d);
        if (glowPathRef.current) glowPathRef.current.setAttribute('d', d);
        if (mainPathRef.current) mainPathRef.current.setAttribute('d', d);
      }

      const dashOffset = (1 - smoothDraw).toFixed(4);
      if (mainPathRef.current) mainPathRef.current.setAttribute('stroke-dashoffset', dashOffset);
      if (glowPathRef.current) glowPathRef.current.setAttribute('stroke-dashoffset', dashOffset);

      if (mainPathRef.current && mainPathRef.current.getTotalLength && brushTipRef.current) {
        const total = mainPathRef.current.getTotalLength();
        const d = total * smoothDraw;
        const pt = mainPathRef.current.getPointAtLength(d);
        const ptAhead = mainPathRef.current.getPointAtLength(Math.min(total, d + 8));
        const deg = (Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * 180) / Math.PI;
        brushTipRef.current.setAttribute(
          'transform',
          `translate(${pt.x.toFixed(1)}, ${pt.y.toFixed(1)}) rotate(${deg.toFixed(1)})`
        );
      }

      // به‌روزرسانی برچسب قصه‌گو در پایین صفحه بر اساس فصل فعال
      const visibleInStory = rect.top < vh * 0.72 && rect.bottom > vh * 0.25;
      if (badgeWrapRef.current) {
        badgeWrapRef.current.dataset.visible = visibleInStory ? 'true' : 'false';
      }

      let nextIdx = 0;
      for (let i = 0; i < CHAPTER_BEATS.length; i++) {
        if (smoothDraw >= CHAPTER_BEATS[i].threshold) nextIdx = i;
      }
      if (nextIdx !== activeChapterIdx) {
        activeChapterIdx = nextIdx;
        if (badgeStepRef.current) badgeStepRef.current.textContent = CHAPTER_BEATS[nextIdx].step;
        if (badgeTextRef.current) badgeTextRef.current.textContent = CHAPTER_BEATS[nextIdx].label;
      }
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [reducedMotion, storyWrapRef]);

  return (
    <>
      <svg
        ref={svgRef}
        viewBox="0 0 1000 4000"
        preserveAspectRatio="none"
        className="story-painter-svg"
        aria-hidden="true"
      >
        <path ref={railPathRef} className="story-painter-svg__rail" />
        <path
          ref={glowPathRef}
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="0.96"
          className="story-painter-svg__glow"
        />
        <path
          ref={mainPathRef}
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset="0.96"
          className="story-painter-svg__stroke"
        />
        <g ref={brushTipRef} transform="translate(500, 80)">
          <circle r="22" className="painter-spark-halo" />
          <path
            d="M 14,0 L -9,-8 L -4,0 L -9,8 Z"
            className="story-painter-svg__nib"
          />
        </g>
      </svg>

      {/* کپسول قصه‌گوی شناور پایین صفحه که روایت هر فصل را با پیشروی خط نشان می‌دهد */}
      <div ref={badgeWrapRef} className="story-narrator-pill" data-visible="false" aria-hidden="true">
        <span ref={badgeStepRef} className="story-narrator-pill__step ds-tabular">۰۱</span>
        <span ref={badgeTextRef} className="story-narrator-pill__label">
          فصل اول · بیداری حسگرها روی بوم شنی
        </span>
      </div>
    </>
  );
}
