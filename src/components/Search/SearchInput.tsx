/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import type { Dispatch, SetStateAction } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';

import type { RootState } from '../../common/store';
import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { Fonts } from '../../styles/Fonts';
import { InputStyles } from '../../styles/Input';

function SearchInput(props: SearchInputProps) {
  const { setFocused, inputError, inputHelperText, view } = props;
  const { handleChangeSearch } = useHandleChangeSearch();
  const size = view == 'compare-results' ? 'small' : undefined;
  return (
    <FormControl variant="outlined" fullWidth>
      <TextField
        error={inputError}
        helperText={inputHelperText}
        label='Search By Revision ID or Author Email'
				placeholder='Search By Revision ID or Author Email'
        id="search-revision-input"
        onFocus={() => setFocused(true)}
        sx={{ width: '100%' }}
        onChange={(e) => handleChangeSearch(e)}
        size={size}
        className={`${InputStyles.default} ${Fonts.BodyDefault}`}
        InputProps={{
          startAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </FormControl>
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
