import React from 'react';
import { Layers, Sparkles, Palette } from 'lucide-react';
import { toFa } from '../../utils/faDigits.js';

export default function Navbar3D({ onOpenArch, onOpenDesignSystem, activeFleetCount = 12486 }) {
  return (
    <div className="nav-floating-wrap">
      <header className="nav-capsule">
        {/* Right: Brand Emblem + Cleaned Logotype Lockup */}
        <a
          href="#hero"
          style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: '#E8DECD' }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '31.25%', // Exact gradiant.pdf squircle!
              background: 'linear-gradient(140.24deg, #3D5768 0%, #112835 45%, #132D3F 100%)',
              border: '1px solid rgba(255, 116, 46, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 6px 18px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.25)',
            }}
          >
            <img src="/brand-clean/logo-clean.svg" alt="نشان برند" style={{ height: 24, filter: 'brightness(0) invert(0.95)' }} />
          </div>
          <img src="/brand-clean/typography-clean.svg" alt="نام برند" style={{ height: 24, filter: 'brightness(0) invert(0.94)' }} />
        </a>

        {/* Center Navigation */}
        <nav className="nav-links">
          <a href="#radar-command" className="nav-link">رادار زنده ناوگان</a>
          <a href="#hardware-3d" className="nav-link">کالبد سه‌بعدی سخت‌افزار</a>
          <a href="#smart-features" className="nav-link">هوش مسیر و سوخت</a>
          <a href="#journey" className="nav-link">سفر هوشمند بار</a>
          <a href="#roi-calc" className="nav-link">محاسبه سود ناوگان</a>
          <a href="#pricing" className="nav-link">تعرفه‌ها</a>
        </nav>

        {/* Left: Live Telemetry Status + 3D Architecture Blueprint + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '6px 13px',
              borderRadius: 999,
              background: 'rgba(16, 35, 51, 0.9)',
              border: '1px solid rgba(74, 222, 128, 0.3)',
              fontSize: 12,
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

          <button
            onClick={onOpenDesignSystem}
            className="chip-btn on"
            style={{ padding: '8px 13px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="مشاهده پورتال دیزاین سیستم، توکن‌ها و فونت پیدا"
          >
            <Palette size={14} color="#FF742E" />
            <span>دیزاین سیستم</span>
          </button>

          <button
            onClick={onOpenArch}
            className="chip-btn"
            style={{ padding: '8px 13px', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            title="مشاهده معماری سه‌بعدی بخش‌های سایت"
          >
            <Layers size={14} color="#FF742E" />
            <span>معماری سه‌بعدی</span>
          </button>

          <a href="#demo-request" className="btn-3d-orange" style={{ padding: '9px 20px', fontSize: 13.5, textDecoration: 'none' }}>
            <Sparkles size={15} />
            <span>دمو رایگان</span>
          </a>
        </div>
      </header>
    </div>
  );
}
