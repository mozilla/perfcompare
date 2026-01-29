import React, { useState, useMemo } from 'react';

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { useAppSelector } from '../hooks/app';
import { Strings } from '../resources/Strings';
import { Banner } from '../styles/Banner';
import getProtocolTheme from '../theme/protocolTheme';
import { loader as hashToCommitLoader } from './CompareResults/hashToCommitLoader';
import { loader as landoToCommitLoader } from './CompareResults/landoToCommitLoader';
import { loader as compareLoader } from './CompareResults/loader';
import { loader as compareOverTimeLoader } from './CompareResults/overTimeLoader';
import OverTimeResultsView from './CompareResults/OverTimeResultsView';
import ResultsView from './CompareResults/ResultsView';
import { loader as compareSubtestsLoader } from './CompareResults/subtestsLoader';
import { loader as compareSubtestsOverTimeLoader } from './CompareResults/subtestsOverTimeLoader';
import SubtestsOverTimeResultsView from './CompareResults/SubtestsResults/SubtestsOverTimeResultsView';
import SubtestsResultsView from './CompareResults/SubtestsResults/SubtestsResultsView';
import { loader as homeLoader } from './Search/loader';
import SearchView from './Search/SearchView';
import { PageError } from './Shared/PageError';
import SnackbarCloseButton from './Shared/SnackbarCloseButton';
import { loader as authenticationLoader } from './TaskclusterAuth/loader';
import TaskclusterCallback from './TaskclusterAuth/TaskclusterCallback';

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

const docs: InfoStrings = {
  text: Strings.components.docs.text,
  linkText: Strings.components.docs.linkText,
  href: Strings.components.docs.href,
};

const source: InfoStrings = {
  text: Strings.components.source.text,
  linkText: Strings.components.source.linkText,
  href: Strings.components.source.href,
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
        loader={homeLoader}
        element={<SearchView title={Strings.metaData.pageTitle.search} />}
        errorElement={<PageError title={Strings.metaData.pageTitle.search} />}
        hydrateFallbackElement={<></>}
      />

      <Route
        path='/compare-results'
        loader={compareLoader}
        element={<ResultsView title={Strings.metaData.pageTitle.results} />}
        errorElement={<PageError title={Strings.metaData.pageTitle.results} />}
        hydrateFallbackElement={<></>}
      />

      <Route
        path='/compare-hash-results'
        loader={hashToCommitLoader}
        element={<ResultsView title={Strings.metaData.pageTitle.results} />}
        errorElement={<PageError title={Strings.metaData.pageTitle.results} />}
        hydrateFallbackElement={<></>}
      />

      <Route
        path='/compare-lando-results'
        loader={landoToCommitLoader}
        element={<ResultsView title={Strings.metaData.pageTitle.results} />}
        errorElement={<PageError title={Strings.metaData.pageTitle.results} />}
        hydrateFallbackElement={<></>}
      />

      <Route
        path='/compare-over-time-results'
        loader={compareOverTimeLoader}
        element={
          <OverTimeResultsView title={Strings.metaData.pageTitle.results} />
        }
        errorElement={<PageError title={Strings.metaData.pageTitle.results} />}
        hydrateFallbackElement={<></>}
      />

      <Route
        path='/subtests-compare-results'
        loader={compareSubtestsLoader}
        element={
          <SubtestsResultsView title={Strings.metaData.pageTitle.subtests} />
        }
        errorElement={<PageError title={Strings.metaData.pageTitle.subtests} />}
        hydrateFallbackElement={<></>}
      />

      <Route
        path='/subtests-compare-over-time-results'
        loader={compareSubtestsOverTimeLoader}
        element={
          <SubtestsOverTimeResultsView
            title={Strings.metaData.pageTitle.subtests}
          />
        }
        errorElement={<PageError title={Strings.metaData.pageTitle.subtests} />}
        hydrateFallbackElement={<></>}
      />

      <Route
        path='/taskcluster-auth'
        loader={authenticationLoader}
        element={<TaskclusterCallback />}
        errorElement={<PageError title={'Error'} />}
        hydrateFallbackElement={<></>}
      />
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
              </Link>
              {'. '}
              {contact.text}{' '}
              <Link href={contact.href} target='_blank'>
                {contact.linkText}
              </Link>
              {'. '}
              {docs.text}{' '}
              <Link href={docs.href} target='_blank'>
                {docs.linkText}
              </Link>
              {'. '}
              {source.text}{' '}
              <Link href={source.href} target='_blank'>
                {source.linkText}
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
