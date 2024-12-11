import React from 'react';

import { StyledEngineProvider } from '@mui/material/styles';
import { createRoot, Root } from 'react-dom/client';
import { Provider } from 'react-redux';

import { store } from './common/store';
import App from './components/App';

const container = document.getElementById('root');

const root: Root = createRoot(container!);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <StyledEngineProvider injectFirst>
        <App />
      </StyledEngineProvider>
    </Provider>
  </React.StrictMode>,
);
