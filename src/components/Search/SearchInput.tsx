import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { InputStylesRaw } from '../../styles';
import { InputType, Repository } from '../../types/state';

interface SearchInputProps {
  onFocus: () => unknown;
  inputPlaceholder: string;
  compact: boolean;
  searchType: InputType;
  repository: Repository['name'];
  searchError: null | string;
}

function SearchInput({
  onFocus,
  compact,
  inputPlaceholder,
  searchType,
  repository,
  searchError,
}: SearchInputProps) {
  const { handleChangeSearch } = useHandleChangeSearch();
  const mode = useAppSelector((state) => state.theme.mode);
  const size = compact ? 'small' : undefined;

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
        error={Boolean(searchError)}
        helperText={searchError}
        placeholder={inputPlaceholder}
        id={`search-${searchType}-input`}
        onFocus={onFocus}
        onChange={(e) => handleChangeSearch({ e, searchType, repository })}
        size={size}
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
