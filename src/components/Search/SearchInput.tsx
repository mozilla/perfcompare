import React from 'react';

import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';

import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { State } from '../../types/state';

function SearchInput(props: SearchInputProps) {
  const { handleFocus, inputError, inputHelperText } = props;
  const { handleChangeSearch } = useHandleChangeSearch();
  return (
    <Grid item xs={6}>
      {!inputError && !inputHelperText ? (
        /* text field without errors */
        <TextField
          label="Search By Revision ID or Author Email"
          id="search-revision-input"
          onFocus={handleFocus}
          variant="outlined"
          sx={{ width: '100%' }}
          onChange={(e) => handleChangeSearch(e)}
        />
      ) : (
        /* text field with errors */
        <TextField
          error
          helperText={inputHelperText}
          label="Search By Revision ID or Author Email"
          id="search-revision-input"
          onFocus={handleFocus}
          variant="outlined"
          sx={{ width: '100%' }}
          onChange={(e) => handleChangeSearch(e)}
        />
      )}
    </Grid>
  );
}

interface SearchInputProps {
  handleFocus: (e: React.FocusEvent) => void;
  inputError: boolean;
  inputHelperText: string;
}

function mapStateToProps(state: State) {
  return {
    inputError: state.search.inputError,
    inputHelperText: state.search.inputHelperText,
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchInput);
