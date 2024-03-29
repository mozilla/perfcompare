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
  fetcherLoad: (url: string) => void;
}

function SearchInput({
  onFocus,
  compact,
  inputPlaceholder,
  searchType,
  repository,
  fetcherLoad,
}: SearchInputProps) {
  const { handleChangeSearch, searchRecentRevisions, inputError } =
    useHandleChangeSearch(fetcherLoad);
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

  async function onInputFocus(
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    onFocus();
    const searchTerm = e.currentTarget.value;
    await searchRecentRevisions(repository, searchTerm);
  }

  return (
    <FormControl className={styles.container} fullWidth>
      <TextField
        error={Boolean(inputError)}
        helperText={inputError}
        placeholder={inputPlaceholder}
        id={`search-${searchType}-input`}
        onFocus={(e) => void onInputFocus(e)}
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
