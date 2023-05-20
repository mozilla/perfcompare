import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { style } from 'typestyle';

import useHandleChangeSearch from '../../../hooks/useHandleChangeSearch';
import { InputStylesRaw, Spacing } from '../../../styles';

function SearchInput({
  setFocused,
  view,
  mode,
  inputPlaceholder,
  base,
  inputError,
  inputHelperText,
}: SearchInputProps) {
  const { handleChangeSearch } = useHandleChangeSearch();
  //searchType is to distinguish between base and new search inputs for handleChangeSearch hook
  const [searchState, setState] = useState({
    baseSearch: '',
    newSearch: '',
    searchType: base,
  });
  const size = view == 'compare-results' ? 'small' : undefined;

  useEffect(() => {
    handleChangeSearch(searchState);
  }, [searchState]);

  const updateSearchState = (
    e: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.currentTarget;
    setState((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

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
        helperText={inputError && inputHelperText}
        placeholder={inputPlaceholder}
        id={`search-${base}-input`}
        onFocus={() => setFocused(true)}
        onChange={(e) => updateSearchState(e)}
        size={size}
        name={`${base}Search`}
        className={`search-text-field ${base}`}
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
  inputHelperText: string;
  inputPlaceholder: string;
  view: 'compare-results' | 'search';
  mode: 'light' | 'dark';
  inputError: boolean;
  base: 'base' | 'new';
}

export default SearchInput;
