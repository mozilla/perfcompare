import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField } from '@mui/material';
import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete';
import FormControl from '@mui/material/FormControl';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { InputStylesRaw, Spacing } from '../../styles';

interface AutocompleteInputProps {
  params: AutocompleteRenderInputParams;
  searchError: string | null;
  inputPlaceholder: string;
  searchType: 'base' | 'new';
  compact: boolean;
}

function AutocompleteInput({
  params,
  searchError,
  inputPlaceholder,
  searchType,
  compact,
}: AutocompleteInputProps) {
  const mode = useAppSelector((state) => state.theme.mode);

  // Styling from original SearchInput
  const inputStyles = {
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
    inputAdornment: {
      marginLeft: `${Spacing.Small}px`,
      marginRight: 0,
    },
  };

  return (
    <FormControl className={inputStyles.container} fullWidth>
      <TextField
        {...params}
        error={Boolean(searchError)}
        helperText={searchError}
        placeholder={inputPlaceholder}
        id={`search-${searchType}-input`}
        size={compact ? 'small' : undefined}
        className={`search-text-field ${searchType}`}
        slotProps={{
          input: {
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position='start' sx={inputStyles.inputAdornment}>
                <SearchIcon />
              </InputAdornment>
            ),
          },
          htmlInput: {
            'aria-label': inputPlaceholder,
            ...params.inputProps,
          },
        }}
      />
    </FormControl>
  );
}

export default AutocompleteInput;
