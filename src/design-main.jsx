import React from 'react';
import { createRoot } from 'react-dom/client';
import '../tokens/tokens.css';
import './styles/fonts.css';
import './ds/ds.css';
import './styles/global.css';
import './styles/website.css';
import './styles/lab.css';
import DesignApp from './DesignApp.jsx';

createRoot(document.getElementById('design-root')).render(
  <React.StrictMode>
    <DesignApp />
  </React.StrictMode>
);
