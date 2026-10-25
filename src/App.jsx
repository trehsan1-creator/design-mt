import React, { Suspense, lazy, useState } from 'react';
import { ArrowRight, Compass, Layers, Radar, Type, Palette } from 'lucide-react';
import { Button } from './ds/index.js';

import Navbar3D from './components/website/Navbar3D.jsx';
import Hero3DStage from './components/website/Hero3DStage.jsx';
import LiveFleetRadarSection from './components/website/LiveFleetRadarSection.jsx';
import Hardware3DTracker from './components/website/Hardware3DTracker.jsx';
import DaylightBentoSection from './components/website/DaylightBentoSection.jsx';
import JourneyTimelineSection from './components/website/JourneyTimelineSection.jsx';
import RoiCalculatorSection from './components/website/RoiCalculatorSection.jsx';
import PricingAndFooter from './components/website/PricingAndFooter.jsx';
import ArchitectureModal from './components/website/ArchitectureModal.jsx';

const DesignSystemPortal = lazy(() => import('./components/design-system/DesignSystemPortal.jsx'));
const ScrollFilmStage = lazy(() => import('./components/ScrollFilmStage.jsx'));
const PeydaShowcase = lazy(() => import('./components/PeydaShowcase.jsx'));
const DerivedPatternsLab = lazy(() => import('./components/DerivedPatternsLab.jsx'));
const CoreGeometryStep1 = lazy(() => import('./components/CoreGeometryStep1.jsx'));

export default function App({ initialView = 'website', onBackToWebsite = true }) {
  const [viewMode, setViewMode] = useState(initialView);
  const [archOpen, setArchOpen] = useState(false);
  const [labTab, setLabTab] = useState('overview');

  const goTopAndSet = (mode) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setViewMode(mode);
  };

  if (viewMode === 'design-system') {
    return (
      <Suspense fallback={<div className="fleet-site" />}>
        <DesignSystemPortal
          onBackToWebsite={onBackToWebsite ? () => goTopAndSet('website') : undefined}
          onOpenLab={() => goTopAndSet('lab')}
        />
      </Suspense>
    );
  }

  if (viewMode === 'lab') {
    const LAB_TABS = [
      { id: 'overview', label: 'نمای کلی پترن‌ها و فونت پیدا', icon: Layers },
      { id: 'peyda', label: 'تایپوگرافی پیدا', icon: Type },
      { id: 'patterns', label: '۶ پترن مشتق‌شده', icon: Radar },
      { id: 'geometry', label: 'کالبدشکافی هندسه مادر', icon: Compass },
    ];
    return (
      <div className="lab-shell">
        <a href="#main-content" className="skip-link">پرش به محتوای اصلی</a>
        <header className="topbar">
          <div className="ds-row-wrap">
            {onBackToWebsite && (
              <Button variant="primary" size="sm" onClick={() => goTopAndSet('website')}>
                <ArrowRight size={16} aria-hidden="true" />
                <span>بازگشت به وب‌سایت ناوگان</span>
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => goTopAndSet('design-system')}>
              <Palette size={15} aria-hidden="true" />
              <span>پورتال دیزاین سیستم</span>
            </Button>
            <div className="brand-title">
              <h1>آزمایشگاه کالبدشکافی هندسه برند</h1>
            </div>
          </div>

          <div
            className="step-tabs"
            role="tablist"
            aria-label="بخش‌های آزمایشگاه هندسه"
            onKeyDown={(e) => {
              const idx = LAB_TABS.findIndex((t) => t.id === labTab);
              if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setLabTab(LAB_TABS[(idx + 1) % LAB_TABS.length].id);
              } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setLabTab(LAB_TABS[(idx - 1 + LAB_TABS.length) % LAB_TABS.length].id);
              }
            }}
          >
            {LAB_TABS.map((t) => {
              const Icon = t.icon;
              const isSelected = labTab === t.id;
              return (
                <button
                  key={t.id}
                  id={`lab-tab-${t.id}`}
                  type="button"
                  role="tab"
                  tabIndex={isSelected ? 0 : -1}
                  aria-selected={isSelected}
                  aria-controls="lab-tabpanel"
                  className={`step-tab ${isSelected ? 'active' : ''}`}
                  onClick={() => setLabTab(t.id)}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        <main id="main-content">
          <Suspense fallback={<div className="fleet-section" />}>
            <div id="lab-tabpanel" role="tabpanel" aria-labelledby={`lab-tab-${labTab}`}>
              <ScrollFilmStage />
              {labTab === 'overview' && (
                <>
                  <PeydaShowcase />
                  <DerivedPatternsLab />
                </>
              )}
              {labTab === 'peyda' && <PeydaShowcase />}
              {labTab === 'patterns' && <DerivedPatternsLab />}
              {labTab === 'geometry' && <CoreGeometryStep1 />}
            </div>
          </Suspense>
        </main>
      </div>
    );
  }

  return (
    <div className="fleet-site nuqta-ambient-bg">
      <a href="#main-content" className="skip-link">پرش به محتوای اصلی</a>
      <Navbar3D
        onOpenArch={() => setArchOpen(true)}
        onOpenDesignSystem={() => goTopAndSet('design-system')}
      />

      <main id="main-content">
        <Hero3DStage />
        <LiveFleetRadarSection />
        <Hardware3DTracker />
        <DaylightBentoSection />
        <JourneyTimelineSection />
        <RoiCalculatorSection />
        <PricingAndFooter
          onOpenArch={() => setArchOpen(true)}
          onOpenDesignSystem={() => goTopAndSet('design-system')}
          onSwitchToLab={() => goTopAndSet('lab')}
        />
      </main>

      <ArchitectureModal
        open={archOpen}
        onClose={() => setArchOpen(false)}
        onOpenDesignSystem={() => goTopAndSet('design-system')}
        onSwitchToLab={() => goTopAndSet('lab')}
      />
    </div>
  );
}
