import React, { useEffect, useState } from 'react';
import { Layers, Sparkles, Palette, Menu, X, ChevronLeft } from 'lucide-react';
import { toFa } from '../../utils/faDigits.js';

const NAV_ITEMS = [
  { href: '#radar-command', label: 'رادار زنده ناوگان' },
  { href: '#hardware-3d', label: 'کالبد سه‌بعدی سخت‌افزار' },
  { href: '#smart-features', label: 'هوش مسیر و سوخت' },
  { href: '#journey', label: 'سفر هوشمند بار' },
  { href: '#roi-calc', label: 'محاسبه سود ناوگان' },
  { href: '#pricing', label: 'تعرفه‌ها' },
];

export default function Navbar3D({ onOpenArch, onOpenDesignSystem, activeFleetCount = 12486 }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  return (
    <>
      <div className="nav-floating-wrap">
        <header className="nav-capsule">
          <a href="#hero" className="nav-brand-link" aria-label="صفحه نخست سامانه ناوگان">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '31.25%',
                background: 'linear-gradient(140.24deg, #3D5768 0%, #112835 45%, #132D3F 100%)',
                border: '1px solid rgba(255, 116, 46, 0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.25)',
              }}
            >
              <img src="/brand-clean/logo-clean.svg" alt="" style={{ height: 24, filter: 'brightness(0) invert(0.95)' }} />
            </div>
            <img src="/brand-clean/typography-clean.svg" alt="نام برند ناوگان" style={{ height: 22, filter: 'brightness(0) invert(0.94)' }} />
          </a>

          <nav className="nav-links" aria-label="ناوبری اصلی">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-desktop-actions">
            <div
              className="nav-desktop-only"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                borderRadius: 999,
                background: 'rgba(16, 35, 51, 0.9)',
                border: '1px solid rgba(74, 222, 128, 0.3)',
                fontSize: 12.5,
                fontWeight: 700,
                color: '#E8DECD',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2.5,
                  background: '#4ADE80',
                  boxShadow: '0 0 10px #4ADE80',
                }}
              />
              <span>{toFa(activeFleetCount.toLocaleString('en-US'))} خودرو متصل</span>
            </div>

            {onOpenDesignSystem && (
              <button
                onClick={onOpenDesignSystem}
                className="chip-btn on nav-desktop-only"
                title="مشاهده پورتال دیزاین سیستم، توکن‌ها و فونت پیدا"
              >
                <Palette size={14} color="#FF742E" />
                <span>دیزاین سیستم</span>
              </button>
            )}

            {onOpenArch && (
              <button
                onClick={onOpenArch}
                className="chip-btn nav-desktop-only"
                title="مشاهده معماری سه‌بعدی بخش‌های سایت"
              >
                <Layers size={14} color="#FF742E" />
                <span>معماری سه‌بعدی</span>
              </button>
            )}

            <a href="#demo-request" className="btn-3d-orange" style={{ padding: '10px 18px', fontSize: 14, textDecoration: 'none' }}>
              <Sparkles size={15} />
              <span>دمو رایگان</span>
            </a>

            <button
              type="button"
              className="mobile-menu-btn"
              data-mobile-menu-trigger="true"
              aria-label={drawerOpen ? 'بستن منوی ناوبری' : 'باز کردن منوی ناوبری'}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              {drawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </header>
      </div>

      {drawerOpen && (
        <div className="mobile-drawer-backdrop" onClick={() => setDrawerOpen(false)}>
          <aside
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="منوی ناوبری موبایل"
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 900, fontSize: 17 }}>ناوبری سامانه ناوگان</span>
              <button
                type="button"
                className="mobile-menu-btn"
                style={{ display: 'inline-flex' }}
                aria-label="بستن منو"
                onClick={() => setDrawerOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 14px',
                borderRadius: 12,
                background: 'rgba(16, 35, 51, 0.9)',
                border: '1px solid rgba(74, 222, 128, 0.35)',
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 2.5, background: '#4ADE80' }} />
              <span>{toFa(activeFleetCount.toLocaleString('en-US'))} خودرو متصل به ماهواره</span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }} aria-label="لینک‌های موبایل">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="mobile-drawer-link"
                  onClick={() => setDrawerOpen(false)}
                >
                  <span>{item.label}</span>
                  <ChevronLeft size={16} color="#FF742E" />
                </a>
              ))}
            </nav>

            {(onOpenDesignSystem || onOpenArch) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBlockStart: 8, borderBlockStart: '1px solid rgba(232,222,205,0.12)' }}>
                {onOpenDesignSystem && (
                  <button
                    type="button"
                    className="chip-btn on"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenDesignSystem();
                    }}
                  >
                    <Palette size={15} />
                    <span>پورتال دیزاین سیستم</span>
                  </button>
                )}
                {onOpenArch && (
                  <button
                    type="button"
                    className="chip-btn"
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenArch();
                    }}
                  >
                    <Layers size={15} />
                    <span>معماری سه‌بعدی سایت</span>
                  </button>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
