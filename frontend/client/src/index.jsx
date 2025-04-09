import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const trackMetric = (metric) => {
  const payload = {
    ...metric,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    screenResolution: `${window.screen.width}x${window.screen.height}`
  };

  fetch('/api/metrics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true
  }).catch(err => console.error('Metric send error:', err));
};

if (process.env.NODE_ENV === 'production') {
  const { getCLS, getFID, getLCP, getFCP, getTTFB } = require('web-vitals');
  
  [getCLS, getFID, getLCP, getFCP, getTTFB].forEach(fn => fn(trackMetric));

  const startTime = performance.now();
  window.addEventListener('load', () => {
    trackMetric({
      name: 'PAGE_LOAD',
      value: performance.now() - startTime,
      rating: 'good'
    });
  });

  window.addEventListener('error', (event) => {
    trackMetric({
      name: 'FRONTEND_ERROR',
      value: 1,
      message: event.message,
      stack: event.error?.stack
    });
  });
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);