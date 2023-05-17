import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { style } from 'typestyle';

import useHandleChangeSearch from '../../../hooks/useHandleChangeSearch';
import { InputStylesRaw, Spacing } from '../../../styles';

function SearchInput(props: SearchInputProps) {
  const {
    setFocused,
    view,
    mode,
    inputPlaceholder,
    base,
    inputError,
    inputHelperText,
  } = props;
  const { handleChangeSearch } = useHandleChangeSearch();
  const [searchState, setState] = useState({
    baseSearch: '',
    newSearch: '',
    searchType: base,
  });

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
  view: 'compare-results' | 'search';
  mode: 'light' | 'dark';
  inputPlaceholder: string;
  base: 'base' | 'new';
  inputError: boolean;
  inputHelperText: string;
}

export default SearchInput;
