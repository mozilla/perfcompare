import React, { useState, useMemo } from 'react';

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import {
  createBrowserRouter,
  RouterProvider,
  createRoutesFromElements,
  Route,
} from 'react-router-dom';

import { useAppSelector } from '../hooks/app';
import { Strings } from '../resources/Strings';
import { Banner } from '../styles/Banner';
import getProtocolTheme from '../theme/protocolTheme';
import { loader as compareLoader } from './CompareResults/loader';
import ResultsView from './CompareResults/ResultsView';
import SearchView from './Search/SearchView';
import { PageError } from './Shared/PageError';
import SnackbarCloseButton from './Shared/SnackbarCloseButton';

const strings: InfoStrings = {
  text: Strings.components.topBanner.text,
  linkText: Strings.components.topBanner.linkText,
  href: Strings.components.topBanner.href,
};

const contact: InfoStrings = {
  text: Strings.components.contact.text,
  linkText: Strings.components.contact.linkText,
  href: Strings.components.contact.href,
};

type DivProps = React.HTMLProps<HTMLDivElement>;

const AlertContainer = React.forwardRef<HTMLDivElement, DivProps>(
  (props, ref) => (
    <div
      ref={ref}
      className='alert-container'
      role='alert'
      aria-live={'assertive'}
    >
      {props.children}
    </div>
  ),
);

AlertContainer.displayName = 'AlertContainer';

// The router should be statically defined outside of the React tree.
// See https://reactrouter.com/en/main/routers/router-provider for more information.
// It's exported so that we can control it in tests. Do not use it directly in
// application code!
export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route
        path='/'
        element={<SearchView title={Strings.metaData.pageTitle.search} />}
      />

      <Route
        path='/compare-results'
        loader={compareLoader}
        element={<ResultsView title={Strings.metaData.pageTitle.results} />}
        errorElement={<PageError title={Strings.metaData.pageTitle.results} />}
      />

      <Route path='/taskcluster-auth' />
    </>,
  ),
);

function App() {
  const [alertContainer, setAlertContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const storedMode = useAppSelector((state) => state.theme.mode);
  const { protocolTheme } = useMemo(
    () => getProtocolTheme(storedMode),
    [storedMode],
  );

  return (
    <ThemeProvider theme={protocolTheme}>
      <AlertContainer ref={setAlertContainer} />
      {alertContainer ? (
        <SnackbarProvider
          domRoot={alertContainer}
          maxSnack={3}
          autoHideDuration={6000}
          action={(snackbarKey) => (
            <SnackbarCloseButton snackbarKey={snackbarKey} />
          )}
        >
          <CssBaseline />
          <Alert className={Banner} severity='warning'>
            <div className='banner-text'>
              {strings.text}{' '}
              <Link href={strings.href} target='_blank'>
                {strings.linkText}
              </Link>{' '}
              {contact.text}{' '}
              <Link href={contact.href} target='_blank'>
                {contact.linkText}
              </Link>
              .
            </div>
          </Alert>
          <RouterProvider router={router} />
        </SnackbarProvider>
      ) : null}
    </ThemeProvider>
  );
}

interface InfoStrings {
  text: string;
  linkText: string;
  href: string;
}

export default App;
