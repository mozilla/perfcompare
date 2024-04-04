import type { ChangeEvent } from 'react';

import SearchIcon from '@mui/icons-material/Search';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { InputStylesRaw } from '../../styles';
import { InputType } from '../../types/state';

interface SearchInputProps {
  onFocus: (searchTerm: string) => unknown;
  inputPlaceholder: string;
  compact: boolean;
  searchType: InputType;
  errorText: string | null;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

function SearchInput({
  onFocus,
  compact,
  inputPlaceholder,
  searchType,
  errorText,
  onChange,
}: SearchInputProps) {
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
    const searchTerm = e.currentTarget.value;
    onFocus(searchTerm);
  }

  return (
    <FormControl className={styles.container} fullWidth>
      <TextField
        error={Boolean(errorText)}
        helperText={errorText}
        placeholder={inputPlaceholder}
        id={`search-${searchType}-input`}
        onFocus={(e) => void onInputFocus(e)}
        onChange={onChange}
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
