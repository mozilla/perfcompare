import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import { Strings } from '../resources/Strings';
import { Banner } from '../styles/Banner';
import useProtocolTheme from '../theme/protocolTheme';
import CompareResultsView from './CompareResults/CompareResultsView';
import SearchViewBeta from './Search/beta/SearchView';
import SearchView from './Search/SearchView';
import FeedbackAlert from './Shared/FeedbackAlert';
import SnackbarCloseButton from './Shared/SnackbarCloseButton';

const strings: BannerStrings = {
  text: Strings.components.topBanner.text,
  linkText: Strings.components.topBanner.linkText,
  href: Strings.components.topBanner.href,
};
function App() {
  const { protocolTheme, toggleColorMode } = useProtocolTheme();
  return (
    <ThemeProvider theme={protocolTheme}>
      <SnackbarProvider
        maxSnack={3}
        autoHideDuration={6000}
        action={(snackbarKey) => (
          <SnackbarCloseButton snackbarKey={snackbarKey} />
        )}
      >
        <CssBaseline />
        <Alert className={Banner} severity='warning'>
          <div className='banner-text'>
            {strings.text} <Link href={strings.href}>{strings.linkText}</Link>
          </div>
          <Box display='flex' justifyContent='flex-end' alignItems='flex-end'>
            <FeedbackAlert />
          </Box>
        </Alert>

        <Router>
          <Routes>
            <Route
              path='/'
              element={
                <SearchView
                  toggleColorMode={toggleColorMode}
                  protocolTheme={protocolTheme}
                />
              }
            />
            <Route
              path='/beta'
              element={
                <SearchViewBeta
                  toggleColorMode={toggleColorMode}
                  protocolTheme={protocolTheme}
                />
              }
            />
            <Route
              path='/compare-results'
              element={<CompareResultsView theme={protocolTheme} />}
            />
            <Route
              path='/beta/compare-results'
              element={<CompareResultsView theme={protocolTheme} />}
            />
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

interface BannerStrings {
  text: string;
  linkText: string;
  href: string;
}

export default App;
