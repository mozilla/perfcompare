import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { Container } from '@mui/system';
import { SnackbarProvider } from 'notistack';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import useProtocolTheme from '../theme/protocolTheme';
import CompareResultsView from './CompareResults/CompareResultsView';
import SearchView from './Search/SearchView';
import SnackbarCloseButton from './Shared/SnackbarCloseButton';
import SwitchDarkModeButton from './Shared/SwitchDarkModeButton';

function App() {
  const { mode, toggleColorMode, protocolTheme } = useProtocolTheme();
  return (
    <ThemeProvider theme={protocolTheme}>
      <Container maxWidth="lg" className="header-container">
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={6000}
          action={(snackbarKey) => (
            <SnackbarCloseButton snackbarKey={snackbarKey} />
          )}
        >
          <CssBaseline />
          <Box display="flex" justifyContent="flex-start" alignItems="flex-start">
            <SwitchDarkModeButton 
              toggleColorMode={toggleColorMode}
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
      </Container>
    </ThemeProvider>
  );
}

export default App;
