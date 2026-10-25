#!/usr/bin/env node
/**
 * مشتق‌سازی پالت وضعیت‌های ناوگان در فضای ادراکی OKLCH
 * هم‌تراز با روشنایی ادراکی نارنجی برند (#FF742E → L = 0.716, C = 0.187, h = 43.8°)
 */
import { clampChroma, formatHex, oklch, wcagContrast } from 'culori';

const brand = oklch('#FF742E');

const SPECS = [
  { key: 'moving', h: 150, l: 0.72, c: 0.165, label: 'حرکت فعال ناوگان' },
  { key: 'cold-chain', h: 198, l: 0.72, c: 0.16, label: 'زنجیره سرد یخچالی' },
  { key: 'corridor', h: 230, l: 0.72, c: 0.16, label: 'کریدور مصوب ترانزیت' },
  { key: 'idle', h: 90, l: 0.74, c: 0.165, label: 'توقف درجا / در انتظار' },
  { key: 'critical', h: 25, l: 0.716, c: 0.185, label: 'هشدار حیاتی / انحراف مسیر' },
];

console.log(
  `[derive-oklch] مرجع برند #FF742E → OKLCH(${(brand.l * 100).toFixed(1)}%, ${brand.c.toFixed(3)}, ${brand.h.toFixed(1)}°)`
);

for (const s of SPECS) {
  const clamped = clampChroma({ mode: 'oklch', l: s.l, c: s.c, h: s.h }, 'oklch');
  const hex = formatHex(clamped).toUpperCase();
  const ratioNight = wcagContrast(hex, '#060E16').toFixed(2);
  console.log(
    `  ${s.key.padEnd(11)} → ${hex} | OKLCH(${(clamped.l * 100).toFixed(1)}%, ${clamped.c.toFixed(3)}, ${s.h}°) | کنتراست شب: ${ratioNight}:1 — ${s.label}`
  );
}
