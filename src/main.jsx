import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';
import App from './App.jsx';

const rootElement = document.getElementById('muffin-extension-popup') || document.getElementById('root');
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);