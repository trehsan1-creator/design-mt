import React from 'react';
import { createRoot } from 'react-dom/client';
import '../tokens/tokens.css';
import './styles/fonts.css';
import './ds/ds.css';
import './styles/global.css';
import './styles/website.css';
import './styles/lab.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
