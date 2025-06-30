import { useState, useCallback } from 'react';

import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import {
  InputAdornment,
  TextField,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';

import { simpleDebounce } from '../../utils/simple-debounce';

interface SearchInputProps {
  defaultValue?: string;
  strings: { placeholder: string; label: string; description: string };
  onChange: (searchTerm: string) => unknown;
}
function SearchInput({ defaultValue, strings, onChange }: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue ?? '');

  // By using useCallback, we ensure that we always have the same instance of
  // onDebouncedChange, so that when calling `clear` the timeout will always be
  // appropriately cleared.
  const onDebouncedChange = useCallback(simpleDebounce(onChange), [onChange]);

  const onValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setSearchTerm(value);
    onDebouncedChange(value);
  };

  const clearSearchTerm = () => {
    setSearchTerm('');
    onDebouncedChange.clear();
    onChange('');
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onDebouncedChange.clear();
    onChange(searchTerm);
  };

  return (
    <Box
      component='form'
      aria-label={strings.label}
      onSubmit={onSubmit}
      sx={{ display: 'flex', marginRight: 'auto', width: '100%' }}
    >
      <Tooltip
        title={strings.label + '. ' + strings.description}
        arrow
        enterDelay={250}
        slotProps={{
          tooltip: {
            // This is a quite long tooltip, let's give it some more space.
            sx: { maxWidth: '30em' },
          },
        }}
      >
        <TextField
          placeholder={strings.placeholder}
          size='small'
          value={searchTerm}
          onChange={onValueChange}
          sx={{ flex: 'auto' }}
          slotProps={{
            // This removes the aria-label added by the Tooltip above. We'll add
            // it again in the input below.
            root: { 'aria-label': undefined },
            input: {
              startAdornment: (
                <InputAdornment position='start'>
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    aria-label='Clear the search input'
                    size='small'
                    edge='end'
                    onClick={clearSearchTerm}
                  >
                    <Close />
                  </IconButton>
                </InputAdornment>
              ),
            },
            htmlInput: {
              type: 'search',
              'aria-label': strings.label,
              'aria-description': strings.description,
            },
          }}
        />
      </Tooltip>
    </Box>
  );
}

export default SearchInput;
