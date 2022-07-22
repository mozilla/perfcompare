import React from 'react';

import { createRoot, Root } from 'react-dom/client';
import { Provider } from 'react-redux';

import { store } from './common/store';
import App from './components/App';

const container = document.getElementById('root');

// React 18 documentation instructs to use ! for Typescript application,
// but this causes linting to fail due to unsafe assignment and call of 'any'
// type, and non-null assertion: https://typescript-eslint.io/rules/no-non-null-assertion/
/* eslint-disable */
const root: Root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
);
