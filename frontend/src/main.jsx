import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

console.log('BrazilFit App Loading...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Root element not found!');
} else {
  try {
    console.log('Creating React root...');
    const root = ReactDOM.createRoot(rootElement);
    console.log('React root created, rendering app...');

    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log('App rendered successfully!');
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = `<div style="color: red; padding: 20px;">Error: ${error.message}</div>`;
  }
}
