import React, { Suspense, lazy, useState } from 'react';
import { ArrowRight, Compass, Layers, Radar, Type, Palette } from 'lucide-react';
import { Button, SquircleClipDefs } from './ds/index.js';
import ArchitectureModal from './components/website/ArchitectureModal.jsx';

const DesignSystemPortal = lazy(() => import('./components/design-system/DesignSystemPortal.jsx'));
const ScrollFilmStage = lazy(() => import('./components/ScrollFilmStage.jsx'));
const PeydaShowcase = lazy(() => import('./components/PeydaShowcase.jsx'));
const DerivedPatternsLab = lazy(() => import('./components/DerivedPatternsLab.jsx'));
const CoreGeometryStep1 = lazy(() => import('./components/CoreGeometryStep1.jsx'));

function getInitialDesignView() {
  if (typeof window === 'undefined') return 'portal';
  const params = new URLSearchParams(window.location.search);
  return params.get('view') === 'lab' || params.get('tab') === 'lab' ? 'lab' : 'portal';
}

export default function DesignApp() {
  const [view, setView] = useState(getInitialDesignView);
  const [labTab, setLabTab] = useState('overview');
  const [archOpen, setArchOpen] = useState(false);

  const LAB_TABS = [
    { id: 'overview', label: 'نمای کلی پترن‌ها و فونت پیدا', icon: Layers },
    { id: 'peyda', label: 'تایپوگرافی پیدا', icon: Type },
    { id: 'patterns', label: '۶ پترن مشتق‌شده', icon: Radar },
    { id: 'geometry', label: 'کالبدشکافی هندسه مادر', icon: Compass },
  ];

  return (
    <>
      <SquircleClipDefs />
      {view === 'portal' ? (
        <Suspense fallback={<div className="fleet-site" />}>
          <DesignSystemPortal
            onBackToWebsite={() => {
              window.location.href = '/';
            }}
            onOpenLab={() => setView('lab')}
            onOpenArch={() => setArchOpen(true)}
          />
        </Suspense>
      ) : (
        <div className="lab-shell">
          <a href="#main-content" className="skip-link">پرش به محتوای اصلی</a>
          <header className="topbar">
            <div className="ds-row-wrap">
              <Button as="a" href="/" variant="primary" size="sm">
                <ArrowRight size={16} aria-hidden="true" />
                <span>وب‌سایت محصول (/)</span>
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setView('portal')}>
                <Palette size={15} aria-hidden="true" />
                <span>پورتال دیزاین سیستم</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setArchOpen(true)}>
                <Layers size={15} aria-hidden="true" />
                <span>معماری لایه‌های عمق</span>
              </Button>
              <div className="brand-title">
                <h1>آزمایشگاه مهندسی هندسه برند</h1>
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
      )}

      <ArchitectureModal
        open={archOpen}
        onClose={() => setArchOpen(false)}
        onOpenDesignSystem={() => setView('portal')}
        onSwitchToLab={() => setView('lab')}
      />
    </>
  );
}
