import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
  Theme,
} from '@mui/material/styles';
import { render as rtlRender } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { createBrowserRouter } from 'react-router';
import type { LoaderFunction } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { VirtuosoMockContext } from 'react-virtuoso';

import { store } from './setupTests';
import SnackbarCloseButton from '../../components/Shared/SnackbarCloseButton';
import {
  updateShowCliffsDelta,
  updateShowCles,
  updateShowSignificance,
} from '../../reducers/ColumnPrefsSlice';
import getProtocolTheme from '../../theme/protocolTheme';

// Turn on all advanced results columns (Cliff's Delta, CLES, Significance) for
// tests that exercise them. They're hidden by default (simplified view), so
// call this before rendering in tests that assert on those columns. The store
// is recreated in each test's beforeEach, so this only affects the current test.
export function enableAdvancedColumns() {
  store.dispatch(updateShowCliffsDelta(true));
  store.dispatch(updateShowCles(true));
  store.dispatch(updateShowSignificance(true));
}

type ThemeConfig = Partial<Theme> | null;
export function render(ui: React.ReactElement, themeConfig?: ThemeConfig) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    const { protocolTheme } = getProtocolTheme('light');
    const theme = themeConfig ? createTheme(themeConfig) : protocolTheme;
    return (
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <VirtuosoMockContext.Provider
            value={{ viewportHeight: 300, itemHeight: 100 }}
          >
            <SnackbarProvider
              maxSnack={3}
              autoHideDuration={6000}
              action={(snackbarKey) => (
                <SnackbarCloseButton snackbarKey={snackbarKey} />
              )}
            >
              <Provider store={store}>{children}</Provider>
            </SnackbarProvider>
          </VirtuosoMockContext.Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper });
}

export function renderWithRouter(
  ui: React.ReactElement,
  {
    route = '/',
    search = '',
    loader = undefined as undefined | LoaderFunction,
  } = {},
  theme: ThemeConfig = null,
) {
  // jsdom doesn't like that we assign to location or location.href directly,
  // because this is a navigation. Instead we use `replaceState` that isn't a
  // navigation and works also for us.
  window.history.replaceState(null, '', route + search);
  return {
    ...render(
      <RouterProvider
        router={createBrowserRouter([
          { path: route, element: ui, loader, HydrateFallback: () => null },
        ])}
      />,
      theme,
    ),
  };
}

// re-export some useful things from testing-library
export {
  act,
  screen,
  fireEvent,
  within,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
