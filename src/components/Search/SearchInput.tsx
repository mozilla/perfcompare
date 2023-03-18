import type { Dispatch, SetStateAction } from 'react';

import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';

import type { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import type { SearchState } from '../../types/state';

function SearchInput(props: SearchInputProps) {
  const { focused, setFocused, inputError, inputHelperText, view } = props;
  const { handleChangeSearch } = useHandleChangeSearch();
  const size = view == 'compare-results' ? 'small' : undefined;
  const search: SearchState = useAppSelector(
    (state: RootState) => state.search,
  );
  return (
    <TextField
      error={inputError}
      helperText={inputHelperText}
      label="Search By Revision ID or Author Email"
      id="search-revision-input"
      onFocus={() => setFocused(true)}
      variant="outlined"
      sx={{ width: '100%' }}
      onChange={(e) => handleChangeSearch(e)}
      size={size}
      InputProps={{
        endAdornment: ( focused && !inputError && !search.searchResults.length ? (
          <InputAdornment position="end">
            <CircularProgress size={25} thickness={4} color="inherit" />
          </InputAdornment>
        ) : 
        <></>),
      }}
    />
  );
}

interface SearchInputProps {
  focused: boolean;
  setFocused: Dispatch<SetStateAction<boolean>>;
  inputError: boolean;
  inputHelperText: string;
  view: 'compare-results' | 'search';
}

function mapStateToProps(state: RootState) {
  return {
    inputError: state.search.inputError,
    inputHelperText: state.search.inputHelperText,
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchInput);
