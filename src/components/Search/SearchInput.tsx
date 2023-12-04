import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { InputStylesRaw } from '../../styles';
import { InputType, ThemeMode, View } from '../../types/state';

interface SearchInputProps {
  onFocus: () => unknown;
  inputPlaceholder: string;
  view: View;
  mode: ThemeMode;
  searchType: InputType;
}

function SearchInput({
  onFocus,
  view,
  mode,
  inputPlaceholder,
  searchType,
}: SearchInputProps) {
  const { handleChangeSearch } = useHandleChangeSearch();
  const searchState = useAppSelector((state) => state.search[searchType]);
  const { inputError, inputHelperText, repository } = searchState;

  const size = view == 'compare-results' ? 'small' : undefined;

  const styles = {
    container: style({
      $nest: {
        '.hide': {
          visibility: 'hidden',
        },
        '.search-text-field': {
          width: '100%',
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
      <TextField
        error={inputError}
        helperText={inputError && inputHelperText}
        placeholder={inputPlaceholder}
        id={`search-${searchType}-input`}
        onFocus={onFocus}
        onChange={(e) => handleChangeSearch({ e, searchType, repository })}
        size={size}
        name={`${searchType}Search`}
        className={`search-text-field ${searchType}`}
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

export default SearchInput;
