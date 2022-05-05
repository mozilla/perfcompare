import React from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import protocolTheme from '../theme/protocolTheme';
import SearchView from './Search/SearchView';

function App() {
  return (
    <React.Fragment key="App Component">
      <ThemeProvider theme={protocolTheme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<SearchView />} />
            {/*  Your routes go here .. */}
          </Routes>
        </Router>
      </ThemeProvider>
    </React.Fragment>
  );
}

export default App;
