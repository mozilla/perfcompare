import React from 'react';

import { render as rtlRender } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import { store } from '../../common/store';
import SnackbarCloseButton from '../../components/Shared/SnackbarCloseButton';

function render(ui: React.ReactElement) {
  function Wrapper({ children }: { children: React.ReactElement }) {
    return (
      <Provider store={store}>
        {' '}
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={6000}
          action={(snackbarKey) => (
            <SnackbarCloseButton snackbarKey={snackbarKey} />
          )}
        >
          {children}
        </SnackbarProvider>
      </Provider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper });
}

function renderWithRouter(
  ui: React.ReactElement,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) {
  return {
    ...render(
      <Router location={history.location} navigator={history}>
        {ui}
      </Router>,
    ),
    history,
  };
}

// re-export everything
export * from '@testing-library/react';
// override render method
export { render, renderWithRouter };
export { store };
