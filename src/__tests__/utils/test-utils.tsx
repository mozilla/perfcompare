import { ThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { render as rtlRender } from '@testing-library/react';
import { createMemoryHistory } from 'history';
import { SnackbarProvider } from 'notistack';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import SnackbarCloseButton from '../../components/Shared/SnackbarCloseButton';
import getProtocolTheme from '../../theme/protocolTheme';
import { store } from './setupTests';

type ChildrenProps = { children: React.ReactElement };

type ThemeConfig = Partial<Theme> | null;
export function render(ui: React.ReactElement, themeConfig?: ThemeConfig) {
  function Wrapper({ children }: ChildrenProps) {
    const { protocolTheme } = getProtocolTheme('light');
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

export function renderWithRouter(
  ui: React.ReactElement,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  } = {},
  theme: ThemeConfig = null,
) {
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

// re-export everything
export * from '@testing-library/react';

// This eslint rule wants that every requested package is specified in
// package.json, which is usually a good thing. But in this case we actually
// want the type as used by `fetch-mock-jest`. Ideally `fetch-mock-jest` should
// reexport it but it doesn't. Instead let's disable the eslint rule for this
// specific import.
// See https://www.wheresrhys.co.uk/fetch-mock/ for more information about how
// to use this package.
/* eslint-disable-next-line import/no-extraneous-dependencies */
export { FetchMockSandbox } from 'fetch-mock';
