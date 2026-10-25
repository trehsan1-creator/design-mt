import React from 'react';
import { X, Layers, Sparkles, Compass, CheckCircle2, Lock } from 'lucide-react';

const ARCH_ACTS = [
  {
    act: 'پرده ۰۱ · قهرمان (Hero)',
    zLayer: 'Z-0 تا Z-4 (WebGL + 3-Layer Parallax)',
    geometry: 'نسبت طلایی ۳۸.۱٪ : ۶۱.۹٪ + مونتاژ فنری ۴ قطعه سه‌بعدی لوگو + بزرگراه کلوتوئیدی κ = 0.50',
    polarity: 'سرمه‌ای راداری + موج افق ۱۴۰.۲۴°',
  },
  {
    act: 'پرده ۰۲ · مرکز فرماندهی و رادار زنده',
    zLayer: 'Z-1 تا Z-3 (Sonar Field + HUD)',
    geometry: 'مخروط رادار ۳۰.۶° (رقم ۷ پیدا) + امواج سونار اسکوئیرکل ۳۱.۲۵٪ + شاخص سوخت ۲۶.۸۴°',
    polarity: 'سرمه‌ای عمیق + پالس نارنجی #FF742E',
  },
  {
    act: 'پرده ۰۳ · کالبد سه‌بعدی ردیاب GPS',
    zLayer: 'Z-4 (Three.js Exploded 4-Layer Mesh)',
    geometry: 'بدنه اسکوئیرکل ۳۱.۲۵٪ + پخ ۶۰٪ + زبری مات ۰.۴۰ + برجسته‌کاری نشان برند روی پوسته',
    polarity: 'پلیمر سرمه‌ای + آنتن سرامیکی بژ گرم',
  },
  {
    act: 'پرده ۰۴ · هوش سوخت، راننده و ژئوفنس',
    zLayer: 'Z-2 تا Z-3 (3D Perspective Tilt Bento)',
    geometry: 'توپولوژی قطری ۲×۲ لوگو (ترکیب کارت‌های بالشتکی Inflate ۷۶٪ و پخ‌خورده Chisel ۶۰٪)',
    polarity: 'قطبیت روز شنی (#E8DECD) با کنتراست ۱۲.۰۳:۱',
  },
  {
    act: 'پرده ۰۵ · سفر هوشمند محموله در جاده',
    zLayer: 'Z-2 (Clothoid Signal Stepper)',
    geometry: 'مسیر پیوسته ۴ ایستگاهی با اسکوئیرکل‌های ۳۱.۲۵٪ و دنباله نوری سیگنال',
    polarity: 'سرمه‌ای شبانه + نشانگرهای سبز و نارنجی',
  },
  {
    act: 'پرده ۰۶ · ماشین‌حساب بازگشت سرمایه',
    zLayer: 'Z-3 (Clearcoat Interactive Panel)',
    geometry: 'تیغه‌های مورب ۲۶.۸۴° سرکش «ک» فونت پیدا + اسلایدرهای اسکوئیرکل + تایپوگرافی پیدا ۹۰۰',
    polarity: 'گرادیان چهارمرحله‌ای بدنه خودرو',
  },
  {
    act: 'پرده ۰۷ · تعرفه‌ها، رزرو دمو و فوتر مغناطیسی',
    zLayer: 'Z-0 تا Z-3 (Magnetic Nuqta Matrix)',
    geometry: 'کارت مرکزی پخ‌خورده نارنجی + دگردیسی زنده نقطه‌های مربعی ۱×۱ به کپسول ۲×۱ در فوتر',
    polarity: 'تاریکی عمیق #050B12 + اکسنت #FF742E',
  },
];

export default function ArchitectureModal({ open, onClose, onOpenDesignSystem, onSwitchToLab }) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 120,
        background: 'rgba(4, 10, 16, 0.82)',
        backdropFilter: 'blur(14px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cad-card"
        style={{
          maxWidth: 980,
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          border: '1.5px solid rgba(255, 116, 46, 0.45)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <span className="kaf-slash-tag">معماری فضایی و سه‌بعدی ۷ پرده وب‌سایت</span>
            <h2 style={{ fontSize: 23, fontWeight: 900, marginTop: 6 }}>
              چگونه هندسه هسته برند، تمام بخش‌های وب‌سایت را ساخته است؟
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="بستن نقشه معماری"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: '1px solid rgba(232,222,205,0.2)',
              background: 'rgba(16,35,51,0.8)',
              color: '#E8DECD',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Z-Depth Stack Legend */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            ['Z-0 · بوم پایه', 'ماتریس نقطه‌های مربعی ۲۴px'],
            ['Z-1 · صفحه مسیر', 'بزرگراه‌های کلوتوئیدی و رادار'],
            ['Z-2 · پنل Clearcoat', 'موج نوری چهارمرحله‌ای ۱۴۰.۲۴°'],
            ['Z-3 · کارت‌های لمسی', 'بالشتکی ۷۶٪ و پخ ۶۰٪ با Tilt'],
            ['Z-4 · احجام WebGL', 'لوگو و سخت‌افزار اکسترودشده'],
          ].map(([t, d], i) => (
            <div
              key={i}
              style={{
                padding: '10px 12px',
                borderRadius: 14,
                background: 'rgba(7,17,26,0.8)',
                border: '1px solid rgba(232,222,205,0.12)',
              }}
            >
              <div style={{ fontSize: 12.5, fontWeight: 800, color: '#FF742E' }}>{t}</div>
              <div style={{ fontSize: 12, color: 'var(--beige-muted)', marginBlockStart: 2 }}>{d}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBlockEnd: 20 }}>
          {ARCH_ACTS.map((row, idx) => (
            <div
              key={idx}
              className="arch-row-grid"
              style={{
                padding: '13px 16px',
                borderRadius: 16,
                background: 'rgba(8, 19, 29, 0.72)',
                border: '1px solid rgba(232,222,205,0.1)',
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{row.act}</div>
                <div className="ltr-code" style={{ fontSize: 12, color: '#38BDF8' }}>{row.zLayer}</div>
              </div>
              <div style={{ fontSize: 13.5, color: 'rgba(232,222,205,0.84)' }}>{row.geometry}</div>
              <div style={{ fontSize: 12.5, color: '#FFB085', fontWeight: 700, textAlign: 'end' }}>{row.polarity}</div>
            </div>
          ))}
        </div>

        {/* Step Status & Switch */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            paddingTop: 14,
            borderTop: '1px solid rgba(232,222,205,0.12)',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--beige-muted)' }}>
            <strong style={{ color: '#4ADE80' }}>وضعیت سامانه:</strong> وب‌سایت سه‌بعدی ۷ پرده + دیزاین سیستم کامل (`DESIGN.md` و `tokens/`) فعال است.
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                onClose();
                if (onOpenDesignSystem) onOpenDesignSystem();
              }}
              className="chip-btn on"
            >
              پورتال دیزاین سیستم و توکن‌ها
            </button>
            <button
              onClick={() => {
                onClose();
                onSwitchToLab();
              }}
              className="chip-btn"
            >
              آزمایشگاه کالبدشکافی و پترن‌ها
            </button>
            <button onClick={onClose} className="btn-3d-orange" style={{ padding: '8px 18px', fontSize: 13 }}>
              بازگشت به وب‌سایت اصلی
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
