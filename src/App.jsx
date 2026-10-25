import React from 'react';
import { SquircleClipDefs } from './ds/index.js';
import Navbar3D from './components/website/Navbar3D.jsx';
import Hero3DStage from './components/website/Hero3DStage.jsx';
import LiveFleetRadarSection from './components/website/LiveFleetRadarSection.jsx';
import Hardware3DTracker from './components/website/Hardware3DTracker.jsx';
import DaylightBentoSection from './components/website/DaylightBentoSection.jsx';
import JourneyTimelineSection from './components/website/JourneyTimelineSection.jsx';
import RoiCalculatorSection from './components/website/RoiCalculatorSection.jsx';
import PricingAndFooter from './components/website/PricingAndFooter.jsx';

export default function App() {
  return (
    <div className="fleet-site nuqta-ambient-bg">
      <SquircleClipDefs />
      <a href="#main-content" className="skip-link">پرش به محتوای اصلی</a>
      <Navbar3D />

      <main id="main-content">
        <Hero3DStage />
        <LiveFleetRadarSection />
        <Hardware3DTracker />
        <DaylightBentoSection />
        <JourneyTimelineSection />
        <RoiCalculatorSection />
        <PricingAndFooter />
      </main>
    </div>
  );
}
