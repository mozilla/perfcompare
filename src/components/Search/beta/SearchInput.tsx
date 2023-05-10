import type { Dispatch, SetStateAction } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { connect } from 'react-redux';
import { style } from 'typestyle';

import type { RootState } from '../../../common/store';
import useHandleChangeSearch from '../../../hooks/useHandleChangeSearch';
import { Strings } from '../../../resources/Strings';
import { InputStylesRaw, Spacing } from '../../../styles';

const strings = Strings.components.searchDefault.base.collapedBase;

function SearchInput(props: SearchInputProps) {
  const { setFocused, inputError, inputHelperText, view, mode } = props;
  const { handleChangeSearch } = useHandleChangeSearch();
  const size = view == 'compare-results' ? 'small' : undefined;

  const styles = {
    container: style({
      $nest: {
        '.hide': {
          visibility: 'hidden',
        },
        '.search-text-field': {
          width: '100%',
          marginTop: `${Spacing.xSmall / 2}px`,
        },
        '.MuiInputBase-root': {
          ...(mode == 'light' ? InputStylesRaw.Light : InputStylesRaw.Dark),
          flexDirection: 'row',
        },
      },
    }),
  };
  return (
    <FormControl className={styles.container} fullWidth>
      <div className='hide'>Block</div>
      <TextField
        error={inputError}
        helperText={inputHelperText}
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        placeholder={strings.inputPlaceholder}
        id='search-revision-input'
        onFocus={() => setFocused(true)}
        onChange={(e) => handleChangeSearch(e)}
        size={size}
        className='search-text-field'
        InputProps={{
          startAdornment: (
            <InputAdornment position='end'>
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
  mode: 'light' | 'dark';
}

function mapStateToProps(state: RootState) {
  return {
    inputError: state.search.inputError,
    inputHelperText: state.search.inputHelperText,
    searchResults: state.search.searchResults,
  };
}

export default connect(mapStateToProps)(SearchInput);
