import React, { useEffect, useState } from 'react';
import { Layers, Sparkles, Palette, Menu, X, ChevronLeft } from 'lucide-react';
import { Button, StatusChip } from '../../ds/index.js';
import { toFa } from '../../utils/faDigits.js';

const NAV_ITEMS = [
  { href: '#radar-command', label: 'رادار زنده ناوگان' },
  { href: '#hardware-3d', label: 'سخت‌افزار سه‌بعدی' },
  { href: '#smart-features', label: 'هوش مسیر و سوخت' },
  { href: '#journey', label: 'سفر هوشمند بار' },
  { href: '#roi-calc', label: 'بازگشت سرمایه' },
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

  const fleetLabel = `${toFa(activeFleetCount.toLocaleString('en-US'))} خودرو متصل`;

  return (
    <>
      <div className="fleet-navbar-wrap">
        <header className="fleet-navbar">
          <a href="#hero" className="nav-brand-link" aria-label="صفحه نخست سامانه ناوگان">
            <div className="nav-logo-badge">
              <img src="/brand-clean/logo-clean.svg" alt="" className="nav-logo-badge__img brand-svg-light" />
            </div>
            <img src="/brand-clean/typography-clean.svg" alt="نام برند ناوگان" className="nav-typography-img brand-svg-light" />
          </a>

          <nav className="nav-links" aria-label="ناوبری اصلی">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <StatusChip status="moving" label={fleetLabel} className="nav-desktop-only" />

            {onOpenDesignSystem && (
              <Button
                variant="pill"
                size="sm"
                active
                className="nav-desktop-only"
                onClick={onOpenDesignSystem}
                title="پورتال دیزاین سیستم و توکن‌ها"
              >
                <Palette size={14} aria-hidden="true" />
                <span>دیزاین سیستم</span>
              </Button>
            )}

            {onOpenArch && (
              <Button
                variant="ghost"
                size="sm"
                className="nav-desktop-only"
                onClick={onOpenArch}
                title="معماری سه‌بعدی بخش‌ها"
              >
                <Layers size={14} aria-hidden="true" />
                <span>معماری سه‌بعدی</span>
              </Button>
            )}

            <Button as="a" href="#demo-request" variant="primary" size="sm">
              <Sparkles size={15} aria-hidden="true" />
              <span>دمو رایگان</span>
            </Button>

            <button
              type="button"
              className="nav-hamburger-btn"
              data-mobile-menu-trigger="true"
              aria-label={drawerOpen ? 'بستن منوی ناوبری' : 'باز کردن منوی ناوبری'}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              onClick={() => setDrawerOpen((v) => !v)}
            >
              {drawerOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
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
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ds-between">
              <strong>ناوبری سامانه ناوگان</strong>
              <Button variant="ghost" size="sm" aria-label="بستن منو" onClick={() => setDrawerOpen(false)}>
                <X size={18} aria-hidden="true" />
              </Button>
            </div>

            <StatusChip status="moving" label={`${fleetLabel} به ماهواره`} />

            <nav className="ds-stack-sm" aria-label="لینک‌های موبایل">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="mobile-drawer-link"
                  onClick={() => setDrawerOpen(false)}
                >
                  <span>{item.label}</span>
                  <ChevronLeft size={16} className="ds-accent-text" aria-hidden="true" />
                </a>
              ))}
            </nav>

            {(onOpenDesignSystem || onOpenArch) && (
              <div className="ds-stack-sm">
                {onOpenDesignSystem && (
                  <Button
                    variant="pill"
                    active
                    fullWidth
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenDesignSystem();
                    }}
                  >
                    <Palette size={15} aria-hidden="true" />
                    <span>پورتال دیزاین سیستم</span>
                  </Button>
                )}
                {onOpenArch && (
                  <Button
                    variant="ghost"
                    fullWidth
                    onClick={() => {
                      setDrawerOpen(false);
                      onOpenArch();
                    }}
                  >
                    <Layers size={15} aria-hidden="true" />
                    <span>معماری سه‌بعدی سایت</span>
                  </Button>
                )}
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
