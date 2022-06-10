import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import protocolTheme from '../theme/protocolTheme';
import ResultsView from './Results/ResultsView';
import SearchView from './Search/SearchView';
import SnackbarCloseButton from './Shared/SnackbarCloseButton';

function App() {
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
        <Router>
          <Routes>
            <Route path="/" element={<SearchView />} />
            <Route path="/results" element={<ResultsView />} />
          </Routes>
        </Router>
      </SnackbarProvider>
    </ThemeProvider>
  );
}

export default App;
