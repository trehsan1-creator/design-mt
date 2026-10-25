import React from 'react';
import { X } from 'lucide-react';
import { Button, Card, Capsule } from '../../ds/index.js';
import { useModalFocusTrap } from '../../utils/useModalFocusTrap.js';

const ARCH_ACTS = [
  {
    act: 'پرده ۰۱ · قهرمان (Hero)',
    zLayer: 'Z-0 .. Z-40',
    geometry: 'نسبت طلایی ۳۸.۱٪ : ۶۱.۹٪ + مونتاژ ۴ قطعه لوگو + مسیر کلوتوئیدی',
    polarity: 'سرمه‌ای راداری + گرادیان افق ۱۴۰.۲۴°',
  },
  {
    act: 'پرده ۰۲ · مرکز فرماندهی و رادار زنده',
    zLayer: 'Z-10 .. Z-30',
    geometry: 'مخروط رادار ۳۰.۶° + حلقه‌های چهارگوش‌نرم ۳۱.۲۵٪ + شاخص سوخت ۲۶.۸۴°',
    polarity: 'سرمه‌ای شبانه + سیگنال نارنجی',
  },
  {
    act: 'پرده ۰۳ · کالبد سه‌بعدی ردیاب GPS',
    zLayer: 'Z-40 (WebGL)',
    geometry: 'بدنه چهارگوش‌نرم ۳۱.۲۵٪ + پخ ۶۰٪ + زبری مات ۰.۴۰ + نشان برجسته',
    polarity: 'پلیمر سرمه‌ای + آنتن سرامیکی بژ گرم',
  },
  {
    act: 'پرده ۰۴ · هوش سوخت، راننده و ژئوفنس',
    zLayer: 'Z-20 .. Z-30',
    geometry: 'چیدمان ۲×۲ متناوب کارت‌های بالشتکی و پخ‌خورده',
    polarity: 'قطبیت روز شنی با کنتراست ۱۲.۰۳:۱',
  },
  {
    act: 'پرده ۰۵ · سفر هوشمند محموله در جاده',
    zLayer: 'Z-20',
    geometry: 'نوار پیشرفت ۴ ایستگاهی با شماره‌گذارهای چهارگوش‌نرم',
    polarity: 'سرمه‌ای شبانه + نشانگرهای وضعیت',
  },
  {
    act: 'پرده ۰۶ · ماشین‌حساب بازگشت سرمایه',
    zLayer: 'Z-30',
    geometry: 'شاخص مورب ۲۶.۸۴° + اسلایدرهای لمسی ۴۴ پیکسل',
    polarity: 'گرادیان چهارمرحله‌ای افق',
  },
  {
    act: 'پرده ۰۷ · تعرفه‌ها، دمو و فوتر',
    zLayer: 'Z-0 .. Z-30',
    geometry: 'کارت مرکزی برجسته + ماتریس نقطه‌های واکنش‌گرا در فوتر',
    polarity: 'تاریکی عمیق پایه + اکسنت نارنجی',
  },
];

export default function ArchitectureModal({ open, onClose, onOpenDesignSystem, onSwitchToLab }) {
  const modalRef = useModalFocusTrap(open, onClose);

  if (!open) return null;

  return (
    <div className="arch-modal-backdrop" onClick={onClose}>
      <div
        ref={modalRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="معماری فضایی و سه‌بعدی وب‌سایت"
        className="arch-modal-card ds-stack-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ds-between">
          <div className="ds-stack-xs">
            <div>
              <Capsule variant="slash">معماری فضایی و سه‌بعدی ۷ پرده وب‌سایت</Capsule>
            </div>
            <h2>ساختار لایه‌های عمق (Z-Layers) و قطبیت رنگی</h2>
          </div>

          <Button variant="ghost" size="sm" aria-label="بستن نقشه معماری" onClick={onClose}>
            <X size={18} aria-hidden="true" />
          </Button>
        </div>

        <div className="kpi-4-grid">
          {[
            ['Z-0 · بوم پایه', 'شبکه نقطه‌های مربعی ۲۴ پیکسل'],
            ['Z-10 · صفحه مسیر', 'کریدورهای کلوتوئیدی و رادار'],
            ['Z-20 · پنل افق', 'گرادیان چهارمرحله‌ای ۱۴۰.۲۴°'],
            ['Z-40 · احجام WebGL', 'مدل‌های سه‌بعدی لوگو و سخت‌افزار'],
          ].map(([t, d], i) => (
            <Card key={i} variant="panel" compact className="ds-stack-xs">
              <strong className="ds-accent-text">{t}</strong>
              <span className="ds-muted">{d}</span>
            </Card>
          ))}
        </div>

        <div className="ds-stack-sm">
          {ARCH_ACTS.map((row, idx) => (
            <Card key={idx} variant="panel" compact className="arch-row-grid">
              <div className="ds-stack-xs">
                <strong>{row.act}</strong>
                <span className="ltr-code ds-accent-soft-text">{row.zLayer}</span>
              </div>
              <div className="ds-stack-xs">
                <span>{row.geometry}</span>
                <span className="ds-muted">{row.polarity}</span>
              </div>
            </Card>
          ))}
        </div>

        <div className="ds-between-wrap">
          <span className="ds-muted">
            مستندات کامل توکن‌ها در فایل‌های <span className="ltr-code">DESIGN.md</span> و <span className="ltr-code">tokens/design-tokens.json</span> قرار دارد.
          </span>

          <div className="ds-row-wrap">
            {onOpenDesignSystem && (
              <Button
                variant="pill"
                size="sm"
                active
                onClick={() => {
                  onClose();
                  onOpenDesignSystem();
                }}
              >
                پورتال دیزاین سیستم
              </Button>
            )}
            {onSwitchToLab && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onClose();
                  onSwitchToLab();
                }}
              >
                آزمایشگاه هندسه
              </Button>
            )}
            <Button variant="primary" size="sm" onClick={onClose}>
              بازگشت به وب‌سایت
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
