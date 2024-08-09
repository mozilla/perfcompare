import { useState, useCallback } from 'react';

import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField, Box, IconButton } from '@mui/material';

import { Strings } from '../../resources/Strings';
import { simpleDebounce } from '../../utils/simple-debounce';

interface SearchInputProps {
  onChange: (searchTerm: string) => unknown;
}
function SearchInput({ onChange }: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState('');

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

  const inputStrings = Strings.components.searchResultsInput;

  return (
    <Box
      component='form'
      aria-label={inputStrings.label}
      onSubmit={onSubmit}
      sx={{ display: 'flex', marginRight: 'auto', width: '100%' }}
    >
      <TextField
        placeholder={inputStrings.placeholder}
        inputProps={{ 'aria-label': inputStrings.label }}
        size='small'
        value={searchTerm}
        onChange={onValueChange}
        sx={{ flex: 'auto' }}
        InputProps={{
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
        }}
      />
    </Box>
  );
}

export default SearchInput;
