import 'styles/main.css';

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from 'App';

/**
 * Function to assert type is not null to avoid using the non-null assertion operator "!".
 */
function assertNonNull<T>(value: T | null | undefined): asserts value is T {
  if (value == null) {
    throw new Error(`Fatal error: value ${String(value)} must not be null/undefined.`);
  }
}

const container = document.getElementById('root');
assertNonNull(container);
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
