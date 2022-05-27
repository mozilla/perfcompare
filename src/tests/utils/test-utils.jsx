import React from 'react';

import { render as rtlRender } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import { store } from '../../common/store';

function render(ui) {
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  }
  return rtlRender(ui, { wrapper: Wrapper });
}

function renderWithRouter(
  ui,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
) {
  return {
    ...render(
      <Router location={history.location} history={history} navigator={history}>
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
