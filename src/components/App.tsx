import React from 'react';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import protocolTheme from '../theme/protocolTheme';
import ResultsView from './Results/ResultsView';
import SearchView from './Search/SearchView/SearchView';

function App() {
  return (
    <ThemeProvider theme={protocolTheme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<SearchView />} />
          <Route path="/results" element={<ResultsView />} />
          {/*  Your routes go here .. */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
