import React from 'react';
import ReactDOM from 'react-dom/client';

import { initI18n } from './i18n/i18n';
import { App } from './ui/App';
import { ProductMetaboxApp } from './ui/ProductMetaboxApp';
import './index.css';

function mount(id: string, node: React.ReactNode) {
  const el = document.getElementById(id);
  if (!el) return;
  ReactDOM.createRoot(el).render(<React.StrictMode>{node}</React.StrictMode>);
}

const locale = window.XcScribeAdmin?.locale ?? 'en_US';
initI18n(locale).then(() => {
  mount('xc-scribe-root', <App />);
  mount('xc-scribe-product-root', <ProductMetaboxApp />);
});
