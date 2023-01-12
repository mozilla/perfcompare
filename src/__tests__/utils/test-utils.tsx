import { ThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { render as rtlRender } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import type { Store } from '../../common/store';
import SnackbarCloseButton from '../../components/Shared/SnackbarCloseButton';
import useProtocolTheme from '../../theme/protocolTheme';

type ChildrenProps = { children: React.ReactElement };

const createStoreProvider = (store: Store) => {
  return function StoreProvider({ children }: ChildrenProps) {
    return <Provider store={store}>{children}</Provider>;
  };
};

type ThemeConfig = Partial<Theme> | null;
const createRender = (store: Store) => {
  function render(ui: React.ReactElement, themeConfig?: ThemeConfig) {
    function Wrapper({ children }: ChildrenProps) {
      const { protocolTheme } = useProtocolTheme();
      const theme = themeConfig ? createTheme(themeConfig) : protocolTheme;
      return (
        <ThemeProvider theme={theme}>
          <SnackbarProvider
            maxSnack={3}
            autoHideDuration={6000}
            action={(snackbarKey) => (
              <SnackbarCloseButton snackbarKey={snackbarKey} />
            )}
          >
            <Provider store={store}>{children}</Provider>
          </SnackbarProvider>
        </ThemeProvider>
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
    theme: ThemeConfig = null,
  ) {
    const render = createRender(store);
    return {
      ...render(
        <Router location={history.location} navigator={history}>
          {ui}
        </Router>,
        theme,
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
    RouterWrapper: ({ children }: ChildrenProps) => (
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
  createRouterWrapper,
  createStoreProvider,
};
