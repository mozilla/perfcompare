import { render as rtlRender } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { SnackbarProvider } from 'notistack';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import type { Store } from '../../common/store';
import SnackbarCloseButton from '../../components/Shared/SnackbarCloseButton';

const createRender = (store: Store) => {
  function render(ui: React.ReactElement) {
    function Wrapper({ children }: { children: React.ReactElement }) {
      return (
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={6000}
          action={(snackbarKey) => (
            <SnackbarCloseButton snackbarKey={snackbarKey} />
          )}
        >
          <Provider store={store}>{children}</Provider>
        </SnackbarProvider>
      );
    }
    return rtlRender(ui, { wrapper: Wrapper });
  }
  return render;
};

const createRenderWithRouter = (store: Store) => {
  function renderWithRouter(
    ui: React.ReactElement,
    {
      route = '/',
      history = createMemoryHistory({ initialEntries: [route] }),
    } = {},
  ) {
    const render = createRender(store);
    return {
      ...render(
        <Router location={history.location} navigator={history}>
          {ui}
        </Router>,
      ),
      history,
    };
  }
  return renderWithRouter;
};

const actJestRunOnlyPendingTimers = async () =>
  act(() => void jest.runOnlyPendingTimers());

// re-export everything
export * from '@testing-library/react';
// override render method
export type Render = ReturnType<typeof createRender>;
export { actJestRunOnlyPendingTimers, createRender, createRenderWithRouter };
