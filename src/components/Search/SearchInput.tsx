import type { Dispatch, SetStateAction } from 'react';

import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';

import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { State } from '../../types/state';

function SearchInput(props: SearchInputProps) {
  const { setFocused, inputError, inputHelperText, size } = props;
  const { handleChangeSearch } = useHandleChangeSearch();
  return (
    <TextField
      error={inputError}
      helperText={inputHelperText}
      label="Search By Revision ID or Author Email"
      id="search-revision-input"
      onFocus={() => setFocused(true)}
      variant="outlined"
      sx={{ width: '100%' }}
      size={size}
      onChange={(e) => handleChangeSearch(e)}
    />
  );
}

interface SearchInputProps {
  setFocused: Dispatch<SetStateAction<boolean>>;
  inputError: boolean;
  inputHelperText: string;
  size?: 'small' | 'medium' | undefined;
}

function mapStateToProps(state: State) {
  return {
    inputError: state.search.inputError,
    inputHelperText: state.search.inputHelperText,
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchInput);
