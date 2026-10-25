# مرجع عملیاتی دیزاین سیستم ناوگان (`DESIGN.md`)

این سند مرجع اجرایی توسعه‌دهندگان و طراحان محصول ردیابی خودرو و مدیریت ناوگان است. برای جزئیات استخراج ریاضی از فایل‌های مرجع برند به [`docs/brand-derivation.md`](./docs/brand-derivation.md) مراجعه کنید. پورتال تعاملی دیزاین سیستم در مسیر داخلی `/design/` در دسترس است.

---

## ۱. معماری توکن‌ها و تک‌منبع حقیقت

تنها منبع حقیقت تمام مقادیر بصری، فایل **`tokens/design-tokens.json`** است.

- دستور ساخت خودکار: `npm run tokens:build` (`node scripts/build-tokens.mjs`)
- خروجی‌های تولیدشده (ویرایش دستی ممنوع):
  - `tokens/tokens.css`: متغیرهای CSS شامل لایه پایه و لایه معنایی (`[data-polarity="daylight"]`).
  - `tokens/tokens.js`: ماژول `DESIGN_TOKENS` برای صحنه‌های Three.js و `tailwindFleetPreset`.
- گیت‌های اجباری در `npm run build`:
  1. `npm run lint:tokens`: اجرای `stylelint` روی CSS و اسکن JS/JSX برای جلوگیری از هگز خام، `rgb/rgba` خام، `cubic-bezier` خام و متغیرهای قدیمی.
  2. `npm run test:contrast`: بررسی خودکار کنتراست WCAG 2.1 AA (`>= 4.5:1`) روی تمام زوج‌های رنگی.

| انجام دهید (Do) | انجام ندهید (Don't) |
| :--- | :--- |
| در کامپوننت‌ها فقط از توکن‌های معنایی مانند `var(--ds-surface)`، `var(--ds-on-surface)` و `var(--ds-accent)` استفاده کنید. | از کد هگز مستقیم یا `rgba(...)` درون فایل‌های CSS و JSX استفاده نکنید. برای شفافیت از `color-mix(in srgb, var(--ds-...) XX%, transparent)` بهره ببرید. |
| برای تغییر یک رنگ یا شعاع، تنها `tokens/design-tokens.json` را ویرایش و `npm run tokens:build` را اجرا کنید. | فایل‌های `tokens/tokens.css` و `tokens/tokens.js` را به صورت دستی ویرایش نکنید. |

---

## ۲. سیستم رنگ، قطبیت دوگانه و کنتراست

سامانه دارای دو قطبیت معنایی است که بدون تغییر کد کامپوننت‌ها، تنها با صفت `data-polarity` جابه‌جا می‌شوند:

1. **قطبیت پیش‌فرض — شب راداری (`:root` / `[data-polarity="nocturnal"]`)**:
   - بوم پایه: `--ds-surface` (`#060E16`) | کارت برجسته: `--ds-surface-raised`
   - متن اصلی: `--ds-on-surface` (`#E8DECD` — کنتراست `14.56:1`) | متن فرعی: `--ds-on-surface-muted` (`>= 7.07:1`).
2. **قطبیت روز شنی (`[data-polarity="daylight"]`)**:
   - بوم پایه: `--ds-surface` (`#E8DECD`) | کارت برجسته: `--ds-surface-raised` (`#F6EFE4`)
   - متن اصلی: `--ds-on-surface` (`#102333` — کنتراست `12.03:1`) | متن فرعی: `--ds-on-surface-muted` (`>= 6.61:1`).
3. **دکمه اصلی نارنجی (`--ds-grad-signal-flare`)**:
   - متن روی دکمه نارنجی همواره `--ds-on-accent` (`#060E16`) با وزن `800` است که در تمام نقاط گرادیان کنتراست `5.78:1` تا `8.37:1` را تضمین می‌کند.
4. **رنگ‌های وضعیت ناوگان (هم‌تراز در فضای OKLCH با `L ≈ 71.6%`)**:
   - `--ds-status-moving`، `--ds-status-corridor`، `--ds-status-cold-chain`، `--ds-status-signal`، `--ds-status-idle`، `--ds-status-critical`.

| انجام دهید (Do) | انجام ندهید (Don't) |
| :--- | :--- |
| روی دکمه‌ها و بج‌های نارنجی از متن سرمه‌ای تیره (`var(--ds-on-accent)`) استفاده کنید. | هرگز متن سفید (`#FFFFFF`) روی پس‌زمینه نارنجی `#FF742E` قرار ندهید (کنتراست حدود `2.7:1` و مردود در WCAG AA). |
| هر وضعیت تله‌متری را همراه با آیکن متمایز و برچسب فارسی (`<StatusChip />`) نمایش دهید. | وضعیت خودرو یا هشدار را صرفاً با یک نقطه رنگی بدون متن یا شکل متمایز نشان ندهید. |

---

## ۳. تایپوگرافی فارسی `Peyda` و مقیاس فاصله‌گذاری `S`

- **فونت**: ۷ وزن بهینه‌سازی‌شده WOFF2 (`300` تا `900`) در `public/fonts/` با حجم کل حدود `130 KB` و `font-display: swap`. اوزان `100` و `200` به دلیل خوانایی ناکافی در رابط عملیاتی حذف شده‌اند.
- **حداقل اندازه فونت**: متن بدنه `>= 14px` (`--ds-text-sm`)؛ برچسب‌های فرعی و کدها `>= 12px` (`--ds-text-xs`).
- **اعداد هم‌عرض**: در تمامی سرعت‌ها، پلاک‌ها، مختصات، زمان‌ها و جداول کلاس `.ds-tabular` (`font-variant-numeric: tabular-nums`) به همراه تبدیل ارقام فارسی (`toFa`) الزامی است.
- **مقیاس فاصله‌گذاری مدول `S = 23.145px`**:
  - `--ds-space-0_25s` (`5.79px`) · `--ds-space-0_5s` (`11.57px`) · `--ds-space-0_75s` (`17.36px`) · `--ds-space-1s` (`23.15px`) · `--ds-space-1_5s` (`34.72px`) · `--ds-space-2s` (`46.29px`) · `--ds-space-3s` (`69.44px`) · `--ds-space-4s` (`92.58px`) · `--ds-space-6s` (`138.87px`).

---

## ۴. کتابخانه کامپوننت‌های مشترک (`src/ds/`)

تمامی نماهای محصول (`/`) و پورتال داخلی (`/design/`) مستقیماً از کامپوننت‌های زیر استفاده می‌کنند:

- `Button`: گونه‌های `primary`، `secondary`، `ghost`، `pill` با حداقل ابعاد لمسی `44 × 44px`.
- `Card`: گونه‌های `panel`، `glass`، `chisel` (سرمه‌ای افق)، `cushion` (روشن بالشتکی) با پشتیبانی اختیاری `tilt` (غیرفعال در `prefers-reduced-motion`).
- `IranPlate`: پلاک استاندارد خودروهای عمومی/سنگین (`public` زرد) و شخصی (`private` سفید) با پرچم برداری و `aria-label` کامل.
- `MapPin`: پین مکان‌نمای `136.54°` با پیکان جهت حرکت و برچسب سرعت.
- `Gauge`: گیج سگمنتی مورب `-26.84deg` با نقش `role="meter"` و صفات ARIA.
- `StatusChip` و `Capsule`: نشانگرهای وضعیت آیکن‌دار و برچسب‌های سرتیتر.
- `SquircleClipDefs`: مسیر سوپرالیپس پیوسته (`n = 4.2`) همراه با `corner-shape: squircle` و جایگزین `31.25%`.
- کامپوننت‌های عملیاتی ناوگان فارسی: `JalaliRangePicker`، `TelemetryTable` و `RtlTelemetryChart`.

---

## ۵. حرکت، WebGL سه‌بعدی، رسپانسیو و دسترس‌پذیری

- **زبان حرکتی واحد (`Signal`)**: حرکت اصلی سامانه، جریان سیگنال نارنجی در طول مسیر و واکنش لمسی فنری (`--ds-ease-spring-lock` و `--ds-ease-clothoid-cruise`) است. در صورت فعال بودن `prefers-reduced-motion: reduce`، تمام انیمیشن‌های CSS و حلقه‌های `requestAnimationFrame` جاوااسکریپت متوقف شده و نمای پایدار نهایی نمایش می‌یابد.
- **استاندارد WebGL**: بارگذاری تنبل (`React.lazy` + `IntersectionObserver`)، استفاده از `MeshPhysicalMaterial` با `PMREMGenerator`، محدودسازی `pixelRatio <= 1.5` در موبایل، و آزادسازی کامل حافظه GPU (`dispose()` + `forceContextLoss()`).
- **نقاط شکست واحد و RTL منطقی**: تنها نقاط شکست مجاز `640px`، `1024px` و `1280px` هستند. استفاده از ویژگی‌های منطقی CSS (`margin-inline-*`، `padding-inline-*`، `inset-inline-*`، `text-align: start/end`) به جای چپ/راست فیزیکی الزامی است.
