import React, { useState } from 'react';

import Alert from '@mui/material/Alert';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import { Strings } from '../resources/Strings';
import { Banner } from '../styles/Banner';
import useProtocolTheme from '../theme/protocolTheme';
import ResultsView from './CompareResults/beta/ResultsView';
import SearchView from './Search/SearchView';
import SnackbarCloseButton from './Shared/SnackbarCloseButton';

const strings: BannerStrings = {
  text: Strings.components.topBanner.text,
  linkText: Strings.components.topBanner.linkText,
  href: Strings.components.topBanner.href,
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

function App() {
  const [alertContainer, setAlertContainer] = useState<HTMLDivElement | null>(
    null,
  );
  const { protocolTheme, toggleColorMode } = useProtocolTheme();
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
            </div>
          </Alert>

          <Router>
            <Routes>
              <Route
                path='/'
                element={
                  <SearchView
                    toggleColorMode={toggleColorMode}
                    protocolTheme={protocolTheme}
                    title={Strings.metaData.pageTitle.search}
                  />
                }
              />

              <Route
                path='/compare-results'
                element={
                  <ResultsView
                    toggleColorMode={toggleColorMode}
                    protocolTheme={protocolTheme}
                    title={Strings.metaData.pageTitle.results}
                  />
                }
              />
            </Routes>
          </Router>
        </SnackbarProvider>
      ) : null}
    </ThemeProvider>
  );
}

interface BannerStrings {
  text: string;
  linkText: string;
  href: string;
}

export default App;
