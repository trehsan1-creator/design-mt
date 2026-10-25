#!/usr/bin/env node
/**
 * گیت خودکار بازرسی توکن‌ها (Token & Style Lint Gate)
 * ۱. اجرای stylelint روی تمام فایل‌های CSS درون src/
 * ۲. بازرسی تمام فایل‌های JS/JSX درون src/ برای جلوگیری از:
 *    - کدهای هگز خام (#RRGGBB)
 *    - توابع رنگ خام rgb() / rgba()
 *    - منحنی حرکتی خام cubic-bezier()
 *    - متغیرهای قدیمی منسوخ‌شده (--brand-*, --beige-*, --navy-*)
 *    - افراط در استایل‌های درون‌خطی ثابت (style={{}})
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

function walk(dir, exts) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full, exts));
    else if (exts.some((e) => ent.name.endsWith(e))) out.push(full);
  }
  return out;
}

let hasError = false;

// 1. Run stylelint on src/**/*.css
try {
  execFileSync('npx', ['stylelint', 'src/**/*.css'], {
    cwd: rootDir,
    stdio: 'inherit',
  });
} catch {
  console.error('[lint:tokens] خطا در قوانین CSS توسط stylelint.');
  hasError = true;
}

// 2. Scan JS/JSX files in src/
const jsFiles = walk(srcDir, ['.js', '.jsx']);
const violations = [];
let inlineStyleCount = 0;

for (const file of jsFiles) {
  const rel = path.relative(rootDir, file);
  const content = fs.readFileSync(file, 'utf8');
  // Strip comments for accurate token check
  const stripped = content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '');

  const lines = stripped.split('\n');
  lines.forEach((line, idx) => {
    const lineNo = idx + 1;
    // Allow URL hash anchors like href="#radar" or id="#..." or SVG url(#id)
    const withoutAnchors = line
      .replace(/href=["']#[A-Za-z0-9_-]+["']/g, '')
      .replace(/url\(#[^)]+\)/g, '')
      .replace(/#[a-z][a-z0-9-]+/g, (m) => {
        // Check if 3 or 6 or 8 hex digits only
        return /^#[0-9a-fA-F]{3,8}$/.test(m) ? m : '';
      });

    const hexMatch = withoutAnchors.match(/#[0-9A-Fa-f]{3,8}\b/);
    if (hexMatch) {
      violations.push(`${rel}:${lineNo} -> هگز خام غیرمجاز (${hexMatch[0]}). از DESIGN_TOKENS یا var(--ds-*) استفاده کنید.`);
    }

    if (/\brgba?\s*\(/.test(line)) {
      violations.push(`${rel}:${lineNo} -> رنگ خام rgb/rgba غیرمجاز. از color-mix و var(--ds-*) استفاده کنید.`);
    }

    if (/cubic-bezier\s*\(/.test(line)) {
      violations.push(`${rel}:${lineNo} -> منحنی حرکتی خام cubic-bezier غیرمجاز. از var(--ds-ease-*) استفاده کنید.`);
    }

    if (/var\(--(brand|beige|navy|grad-stop|horizon-gradient|spring-overshoot|ease-cinematic)/.test(line)) {
      violations.push(`${rel}:${lineNo} -> متغیر قدیمی منسوخ‌شده. از var(--ds-*) استفاده کنید.`);
    }

    if (/style=\{\{/.test(line)) {
      inlineStyleCount += 1;
    }
  });
}

if (violations.length > 0) {
  console.error(`\n[lint:tokens] ${violations.length} تخلف توکن در فایل‌های JS/JSX یافت شد:`);
  violations.slice(0, 40).forEach((v) => console.error('  - ' + v));
  if (violations.length > 40) {
    console.error(`  ... و ${violations.length - 40} مورد دیگر.`);
  }
  hasError = true;
}

const MAX_DYNAMIC_INLINE_STYLES = 35;
if (inlineStyleCount > MAX_DYNAMIC_INLINE_STYLES) {
  console.error(
    `[lint:tokens] تعداد style={{}} درون‌خطی (${inlineStyleCount}) بیش از سقف مجاز برای مقادیر دینامیک (${MAX_DYNAMIC_INLINE_STYLES}) است.`
  );
  hasError = true;
}

if (hasError) {
  process.exit(1);
}

console.log(
  `[lint:tokens] تمام بررسی‌ها با موفقیت گذشت (۰ هگز خام، ۰ rgba خام، ۰ cubic-bezier خام، style={{}} فقط دینامیک: ${inlineStyleCount}).`
);
