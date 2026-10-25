import React, { useState } from 'react';
import { ArrowRight, Compass, Layers, Radar, Type, Palette } from 'lucide-react';
import './styles/website.css';

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

export default function App() {
  const [viewMode, setViewMode] = useState('website'); // 'website' | 'design-system' | 'lab'
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
      <div className="cad-backdrop">
        <div className="shell">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button className="btn-3d-orange" onClick={() => goTopAndSet('website')}>
                <ArrowRight size={16} />
                <span>بازگشت به وب‌سایت اصلی ناوگان</span>
              </button>
              <button className="btn-3d-navy" onClick={() => goTopAndSet('design-system')}>
                <Palette size={15} />
                <span>پورتال دیزاین سیستم و توکن‌ها</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[
                { id: 'overview', label: 'نمای کلی پترن‌ها و فونت پیدا', icon: Layers },
                { id: 'peyda', label: 'تایپوگرافی پیدا (۹ وزن)', icon: Type },
                { id: 'patterns', label: '۶ پترن حرکتی مشتق‌شده', icon: Radar },
                { id: 'geometry', label: 'کالبدشکافی هندسه مادر', icon: Compass },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    className={`mat-tab ${labTab === t.id ? 'selected' : ''}`}
                    onClick={() => setLabTab(t.id)}
                  >
                    <Icon size={15} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
      </div>
    );
  }

  return (
    <div className="site-root">
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
