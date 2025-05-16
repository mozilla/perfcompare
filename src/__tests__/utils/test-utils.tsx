import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
  Theme,
} from '@mui/material/styles';
import { render as rtlRender } from '@testing-library/react';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import type { LoaderFunction } from 'react-router-dom';
import { VirtuosoMockContext } from 'react-virtuoso';

import { store } from './setupTests';
import SnackbarCloseButton from '../../components/Shared/SnackbarCloseButton';
import getProtocolTheme from '../../theme/protocolTheme';

type ChildrenProps = { children: React.ReactElement };

type ThemeConfig = Partial<Theme> | null;
export function render(ui: React.ReactElement, themeConfig?: ThemeConfig) {
  function Wrapper({ children }: ChildrenProps) {
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
        router={createBrowserRouter([{ path: route, element: ui, loader }])}
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

// See https://www.wheresrhys.co.uk/fetch-mock/ for more information about how
// to use this package.
export { FetchMockSandbox } from 'fetch-mock';
