import React from 'react';
import { SquircleClipDefs } from './ds/index.js';
import Navbar3D from './components/website/Navbar3D.jsx';
import Hero3DStage from './components/website/Hero3DStage.jsx';
import StoryPainterRibbon from './components/website/StoryPainterRibbon.jsx';
import StoryCardsChapter from './components/website/StoryCardsChapter.jsx';
import LivingCorridorChapter from './components/website/LivingCorridorChapter.jsx';
import ScrollExplodedHardware from './components/website/ScrollExplodedHardware.jsx';
import SmartFinaleChapter from './components/website/SmartFinaleChapter.jsx';

export default function App() {
  return (
    <div className="fleet-site fleet-story-site">
      <SquircleClipDefs />
      <a href="#main-content" className="skip-link">پرش به محتوای اصلی</a>
      <Navbar3D />

      <main id="main-content">
        <Hero3DStage />

        <StoryPainterRibbon>
          <StoryCardsChapter />
          <LivingCorridorChapter />
          <ScrollExplodedHardware />
          <SmartFinaleChapter />
        </StoryPainterRibbon>
      </main>
    </div>
  );
}
