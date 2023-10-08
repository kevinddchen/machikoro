import 'styles/main.css';

import { assertNonNull } from 'common/typescript';

import React from 'react';
import { createRoot } from 'react-dom/client';

import App from 'App';

const container = document.getElementById('root');
assertNonNull(container);
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
