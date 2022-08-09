import type { Dispatch, SetStateAction } from 'react';

import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';

import type { RootState } from '../../common/store';
import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';

function SearchInput(props: SearchInputProps) {
  const { setFocused, inputError, inputHelperText, view } = props;
  const { handleChangeSearch } = useHandleChangeSearch();
  const size = view == 'compare-results' ? 'small' : undefined;
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
    />
  );
}

interface SearchInputProps {
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
