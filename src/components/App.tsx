import { Switch } from '@mui/material';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import { ThemeProvider } from '@mui/material/styles';
import { Container } from '@mui/system';
import { SnackbarProvider } from 'notistack';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';

import useProtocolTheme from '../theme/protocolTheme';
import CompareResultsView from './CompareResults/CompareResultsView';
import SearchView from './Search/SearchView';
import FeedbackAlert from './Shared/FeedbackAlert';
import SnackbarCloseButton from './Shared/SnackbarCloseButton';

function App() {
  const { mode, toggleColorMode, protocolTheme } = useProtocolTheme();
  return (
    <ThemeProvider theme={protocolTheme}>
      <Container maxWidth="lg" className="background-container">
        <SnackbarProvider
          maxSnack={3}
          autoHideDuration={6000}
          action={(snackbarKey) => (
            <SnackbarCloseButton snackbarKey={snackbarKey} />
          )}
        >
          <CssBaseline />
          <Box display="flex" justifyContent="flex-start" alignItems="flex-start">
            <FeedbackAlert />
            <FormGroup>
              <FormControlLabel className="darkMode"
                control={
                  <Switch 
                    className="switch-button"
                    onChange={toggleColorMode}
                    color={'default'} 
                  />
                    }
                    sx={
                      { ml: 2,
                        mt: 3,
                      }
                    }
                    label="Dark Mode"
                    labelPlacement="start"
                    data-testid="switch-button"
                    aria-checked="true"
                    
                  />
            </FormGroup>  
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
