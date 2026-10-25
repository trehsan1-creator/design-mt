#!/usr/bin/env node
/**
 * آزمون خودکار نسبت کنتراست WCAG 2.1 (scripts/test-contrast.mjs)
 * محاسبه دقیق کنتراست نسبی (Relative Luminance) برای تمام زوج‌های متن/پس‌زمینه
 * در هر دو قطبیت شب راداری (Nocturnal) و روز شنی (Daylight) + دکمه‌ها و وضعیت‌ها
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const raw = JSON.parse(fs.readFileSync(path.join(rootDir, 'tokens', 'design-tokens.json'), 'utf8'));

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function rgbToHex([r, g, b]) {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

// Mix c1 (weight p in 0..1) with c2 (weight 1-p) in sRGB (matching CSS color-mix(in srgb, c1 P%, c2))
function mixSrgb(hex1, pct1, hex2) {
  const w = pct1 / 100;
  const a = hexToRgb(hex1);
  const b = hexToRgb(hex2);
  return rgbToHex([
    a[0] * w + b[0] * (1 - w),
    a[1] * w + b[1] * (1 - w),
    a[2] * w + b[2] * (1 - w),
  ]);
}

function relLuminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(fgHex, bgHex) {
  const l1 = relLuminance(fgHex);
  const l2 = relLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

const brand = raw.color.brand;
const orange = raw.color.scale.orange;
const navy = raw.color.scale.navy;
const sand = raw.color.scale.sand;
const status = raw.color.telemetry;

// Resolve semantic colors
const nocSurface = navy['900'].$value;
const nocRaised = mixSrgb(navy['500'].$value, 86, nocSurface);
const nocSunken = navy['950'].$value;
const nocText = sand['300'].$value;
const nocMuted = mixSrgb(sand['300'].$value, 76, nocSurface);
const nocDim = mixSrgb(sand['300'].$value, 68, nocSurface);

const daySurface = sand['300'].$value;
const dayRaised = sand['100'].$value;
const dayText = navy['600'].$value;
const dayMuted = mixSrgb(navy['600'].$value, 78, daySurface);
const dayDim = mixSrgb(navy['600'].$value, 72, daySurface);

const pairs = [
  // Nocturnal text pairs
  { id: 'noc-body-on-surface', label: 'متن اصلی شب روی بوم پایه', fg: nocText, bg: nocSurface, min: 4.5 },
  { id: 'noc-body-on-raised', label: 'متن اصلی شب روی کارت برجسته', fg: nocText, bg: nocRaised, min: 4.5 },
  { id: 'noc-body-on-clearcoat-top', label: 'متن اصلی شب روی روشن‌ترین نقطه افق (#3D5768)', fg: nocText, bg: navy['100'].$value, min: 4.5 },
  { id: 'noc-muted-on-surface', label: 'متن فرعی (Muted) شب روی بوم پایه', fg: nocMuted, bg: nocSurface, min: 4.5 },
  { id: 'noc-muted-on-raised', label: 'متن فرعی (Muted) شب روی کارت برجسته', fg: nocMuted, bg: nocRaised, min: 4.5 },
  { id: 'noc-dim-on-surface', label: 'متن کم‌رنگ (Dim) شب روی بوم پایه', fg: nocDim, bg: nocSurface, min: 4.5 },
  { id: 'noc-dim-on-raised', label: 'متن کم‌رنگ (Dim) شب روی کارت برجسته', fg: nocDim, bg: nocRaised, min: 4.5 },
  { id: 'noc-accent-on-surface', label: 'اکسنت نارنجی روی بوم شب', fg: brand['signal-orange'].$value, bg: nocSurface, min: 4.5 },
  { id: 'noc-accent-on-navy600', label: 'اکسنت نارنجی روی سرمه‌ای برند (#102333)', fg: brand['signal-orange'].$value, bg: brand['deep-navy'].$value, min: 4.5 },
  { id: 'noc-accent-soft-on-raised', label: 'نارنجی ملایم کپسول روی کارت برجسته', fg: orange['300'].$value, bg: nocRaised, min: 4.5 },

  // Primary Orange CTA button across ALL gradient stops
  { id: 'btn-primary-top', label: 'متن دکمه اصلی (#060E16) روی بالای گرادیان نارنجی', fg: nocSurface, bg: orange['400'].$value, min: 4.5 },
  { id: 'btn-primary-mid', label: 'متن دکمه اصلی (#060E16) روی میانه نارنجی برند (#FF742E)', fg: nocSurface, bg: brand['signal-orange'].$value, min: 4.5 },
  { id: 'btn-primary-bot', label: 'متن دکمه اصلی (#060E16) روی پایین گرادیان نارنجی (#EC601B)', fg: nocSurface, bg: orange['600'].$value, min: 4.5 },

  // Daylight text pairs
  { id: 'day-body-on-sand', label: 'متن سرمه‌ای روی بوم بژ گرم روز (#E8DECD)', fg: dayText, bg: daySurface, min: 4.5 },
  { id: 'day-body-on-cushion', label: 'متن سرمه‌ای روی کارت بالشتکی روشن', fg: dayText, bg: dayRaised, min: 4.5 },
  { id: 'day-muted-on-sand', label: 'متن فرعی (Muted) روز روی بژ گرم', fg: dayMuted, bg: daySurface, min: 4.5 },
  { id: 'day-muted-on-cushion', label: 'متن فرعی (Muted) روز روی کارت بالشتکی', fg: dayMuted, bg: dayRaised, min: 4.5 },
  { id: 'day-dim-on-sand', label: 'متن کم‌رنگ (Dim) روز روی بژ گرم', fg: dayDim, bg: daySurface, min: 4.5 },

  // Telemetry Status Chips on dark chip surface
  ...Object.entries(status).map(([key, tok]) => {
    const chipBg = mixSrgb(tok.$value, 14, nocSunken);
    return {
      id: `status-${key}`,
      label: `چیپ وضعیت (${key}) روی پس‌زمینه کپسول تیره`,
      fg: tok.$value,
      bg: chipBg,
      min: 4.5,
    };
  }),
];

let failed = 0;
const results = pairs.map((p) => {
  const ratio = contrastRatio(p.fg, p.bg);
  const pass = ratio >= p.min;
  if (!pass) failed += 1;
  return { ...p, ratio, pass };
});

const outPath = path.join(rootDir, 'reports', 'contrast-audit.json');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      totalPairs: results.length,
      passedPairs: results.length - failed,
      failedPairs: failed,
      results,
    },
    null,
    2
  )
);

for (const r of results) {
  const mark = r.pass ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${r.ratio}:1 (min ${r.min}:1) | ${r.fg} on ${r.bg} — ${r.label}`);
}

if (failed > 0) {
  console.error(`\n[test:contrast] ${failed} زوج رنگی حداقل کنتراست WCAG AA را احراز نکردند.`);
  process.exit(1);
}

console.log(`\n[test:contrast] تمام ${results.length} زوج رنگی استاندارد WCAG AA (>= 4.5:1) را با موفقیت گذراندند.`);
