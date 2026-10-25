import React, { useState } from 'react';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { Button } from '../../ds/index.js';
import { useModalFocusTrap } from '../../utils/useModalFocusTrap.js';

const NAV_ITEMS = [
  { href: '#story-cards', label: 'بیداری حسگرها' },
  { href: '#radar-command', label: 'کریدور زنده' },
  { href: '#hardware-3d', label: 'کالبد سه‌بعدی' },
  { href: '#finale-portal', label: 'بازده ناوگان' },
];

export default function Navbar3D() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useModalFocusTrap(drawerOpen, () => setDrawerOpen(false));

  return (
    <>
      <div className="fleet-navbar-wrap">
        <header className="fleet-navbar">
          <a href="#hero" className="nav-brand-link" aria-label="صفحه نخست سامانه ناوگان">
            <div className="nav-logo-badge ds-squircle">
              <img src="/brand-clean/logo-clean.svg" alt="" className="nav-logo-badge__img brand-svg-light" />
            </div>
            <img src="/brand-clean/typography-clean.svg" alt="نام برند ناوگان" className="nav-typography-img brand-svg-light" />
          </a>

          <nav className="nav-links" aria-label="ناوبری فصل‌های داستان">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <Button as="a" href="#finale-portal" variant="primary" size="sm">
              <span>شروع زنده</span>
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
            ref={drawerRef}
            tabIndex={-1}
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="منوی ناوبری موبایل"
            className="mobile-drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ds-between">
              <strong>فصل‌های داستان ناوگان</strong>
              <Button variant="ghost" size="sm" aria-label="بستن منو" onClick={() => setDrawerOpen(false)}>
                <X size={18} aria-hidden="true" />
              </Button>
            </div>

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

            <Button
              as="a"
              href="#finale-portal"
              variant="primary"
              size="md"
              className="ds-full-w"
              onClick={() => setDrawerOpen(false)}
            >
              <span>شروع تجربه زنده</span>
            </Button>
          </aside>
        </div>
      )}
    </>
  );
}
