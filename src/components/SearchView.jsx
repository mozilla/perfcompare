import * as React from 'react';

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import SearchInput from './SearchInput';

export default function SearchView() {
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box>
          <Typography variant="h1" component="div" align="center" gutterBottom>
            PerfCompare
          </Typography>
        </Box>
        <SearchInput />
      </Container>
    </React.Fragment>
  );
}
