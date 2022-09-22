import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import useProtocolTheme from '../theme/protocolTheme';
import CompareResultsView from './CompareResults/CompareResultsView';
import SearchView from './Search/SearchView';
import FeedbackAlert from './Shared/FeedbackAlert';
import SnackbarCloseButton from './Shared/SnackbarCloseButton';
import ToggleDarkMode from './Shared/ToggleDarkModeButton';

function App() {
  const { mode, toggleColorMode, protocolTheme } = useProtocolTheme();
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
        <Alert severity="warning" sx={{ textAlign: 'center' }}>
          This is an unstable <strong>pre-release</strong> version. Some
          features may not yet be supported. Please file any bugs on the{' '}
          <Link href="https://github.com/mozilla/perfcompare/issues">
            Github Repo
          </Link>
          .
        </Alert>
        <Box display="flex" justifyContent="flex-end" alignItems="flex-end">
          <FeedbackAlert />
          <ToggleDarkMode
            toggleColorMode={toggleColorMode}
            theme={protocolTheme}
          />
        </Box>
        <Router>
          <Routes>
            <Route path="/" element={<SearchView />} />
            <Route
              path="/compare-results"
              element={<CompareResultsView mode={mode} />}
            />
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
