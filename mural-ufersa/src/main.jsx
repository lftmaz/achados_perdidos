import React from 'react';
// Polyfill `global` for libraries that expect a Node-like global variable (e.g. amazon-cognito-identity-js)
if (typeof window !== 'undefined' && typeof window.global === 'undefined') {
  window.global = window;
}
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);