import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import zap from '../../theme/img/zap-10.svg';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';

export default function SearchView() {
  return (
    <Container maxWidth="lg">
      <Box>
        <Typography
          variant="h1"
          component="div"
          align="center"
          gutterBottom
          sx={{
            '&:after': {
              backgroundImage: `url(${zap})`,
              backgroundPosition: '55%',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '25%',
              content: '""',
              display: 'block',
              height: '0.3em',
              marginTop: '-5px',
            },
          }}
        >
          PerfCompare
        </Typography>
      </Box>
      <Grid container>
        <Grid item xs={2} />
        <SearchDropdown />
        <SearchInput />
        <Grid item xs={2} />
      </Grid>
    </Container>
  );
}
