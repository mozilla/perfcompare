import React from 'react';

import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import CssBaseline from '@mui/material/CssBaseline';
import IconButton from '@mui/material/IconButton';
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

/* Newely added for Alert with close buttton */


function App() {
  const { mode, toggleColorMode, protocolTheme } = useProtocolTheme();
  const [open, setOpen] = React.useState(true);
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
         

         {/* Alert Box with close button*/}
         
        <Box sx={{ textAlign: 'center', alignContent: 'center' }}>
          <Collapse in={open}>
            <Alert
              severity="warning"
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              This is an unstable <strong>pre-release</strong> version. Some
              features may not yet be supported. Please file any bugs on the{' '}
              <Link
                href="https://github.com/mozilla/perfcompare/issues"
                title="View Github Link"
              >
                Github Repo
              </Link>
            </Alert>
          </Collapse>
          <Button
            disabled={open}
            sx={{ mt: 2 }}
            variant="contained"
            color="info"
            size="medium"
            onClick={() => {
              setOpen(true);
            }}
            endIcon={<InfoIcon />}
          >
            Warning
          </Button>
        </Box>

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
