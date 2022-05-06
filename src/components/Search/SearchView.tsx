import React from 'react';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';

import useFocusInput from '../../hooks/useFocusInput';
import zap from '../../theme/img/zap-10.svg';
import { Revision, State } from '../../types/state';
import AddRevisionButton from './AddRevisionButton';
import SearchDropdown from './SearchDropdown';
import SearchInput from './SearchInput';
import SearchResultsList from './SearchResultsList';

function SearchView(props: SearchViewProps) {
  const { focused, handleParentClick, handleFocus, handleChildClick } =
    useFocusInput();

  const { searchResults } = props;

  return (
    <Container maxWidth="lg" onClick={handleParentClick}>
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
        <Grid item xs={1} />
        <SearchDropdown />
        <SearchInput handleFocus={handleFocus} />
        {/* TODO: add behavior for Add Revision button */}
        <AddRevisionButton />
        <Grid item xs={1} />
        <Grid item xs={11}>
          {searchResults.length > 0 && focused && (
            <SearchResultsList handleChildClick={handleChildClick} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

interface SearchViewProps {
  searchResults: Revision[];
}

function mapStateToProps(state: State) {
  return {
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchView);
