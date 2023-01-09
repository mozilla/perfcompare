import { render as rtlRender } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import type { Store } from '../../common/store';
import SnackbarCloseButton from '../../components/Shared/SnackbarCloseButton';

type ChildrenProps = { children: React.ReactElement };

const createStoreProvider = (store: Store) => {
  return function StoreProvider({ children }: ChildrenProps) {
    return <Provider store={store}>{children}</Provider>;
  };
};

const createRender = (store: Store) => {
  function render(ui: React.ReactElement) {
    function Wrapper({ children }: ChildrenProps) {
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

const createRouterWrapper = (
  route: string,
  history = createMemoryHistory({ initialEntries: [route] }),
) => {
  return {
    RouterWrapper: ({ children }: { children: React.ReactElement }) => (
      <Router location={history.location} navigator={history}>
        {children}
      </Router>
    ),
    history,
  };
};

// re-export everything
export * from '@testing-library/react';
// override render method
export type Render = ReturnType<typeof createRender>;
export type RenderWithRouter = ReturnType<typeof createRenderWithRouter>;
export {
  createRender,
  createRenderWithRouter,
  createStoreProvider,
  createRouterWrapper,
};
