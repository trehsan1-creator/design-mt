import React, { useState } from 'react';
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

import DesignSystemPortal from './components/design-system/DesignSystemPortal.jsx';

import ScrollFilmStage from './components/ScrollFilmStage.jsx';
import PeydaShowcase from './components/PeydaShowcase.jsx';
import DerivedPatternsLab from './components/DerivedPatternsLab.jsx';
import CoreGeometryStep1 from './components/CoreGeometryStep1.jsx';

export default function App({ initialView = 'website' }) {
  const [viewMode, setViewMode] = useState(initialView);
  const [archOpen, setArchOpen] = useState(false);
  const [labTab, setLabTab] = useState('overview');

  const goTopAndSet = (mode) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setViewMode(mode);
  };

  if (viewMode === 'design-system') {
    return (
      <DesignSystemPortal
        onBackToWebsite={() => goTopAndSet('website')}
        onOpenLab={() => goTopAndSet('lab')}
      />
    );
  }

  if (viewMode === 'lab') {
    return (
      <div className="lab-shell">
        <header className="topbar">
          <div className="ds-row-wrap">
            <Button variant="primary" size="sm" onClick={() => goTopAndSet('website')}>
              <ArrowRight size={16} aria-hidden="true" />
              <span>بازگشت به وب‌سایت ناوگان</span>
            </Button>
            <Button variant="secondary" size="sm" onClick={() => goTopAndSet('design-system')}>
              <Palette size={15} aria-hidden="true" />
              <span>پورتال دیزاین سیستم</span>
            </Button>
          </div>

          <div className="step-tabs" role="tablist" aria-label="بخش‌های آزمایشگاه هندسه">
            {[
              { id: 'overview', label: 'نمای کلی پترن‌ها و فونت پیدا', icon: Layers },
              { id: 'peyda', label: 'تایپوگرافی پیدا', icon: Type },
              { id: 'patterns', label: '۶ پترن مشتق‌شده', icon: Radar },
              { id: 'geometry', label: 'کالبدشکافی هندسه مادر', icon: Compass },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = labTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
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
    );
  }

  return (
    <div className="fleet-site nuqta-ambient-bg">
      <Navbar3D
        onOpenArch={() => setArchOpen(true)}
        onOpenDesignSystem={() => goTopAndSet('design-system')}
      />

      <main>
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
