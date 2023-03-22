import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, TextField, Button } from '@mui/material';

function SearchInput() {
  return (
    <section className='d-flex'>
      <FormControl variant='outlined'>
        <TextField
          disabled
          placeholder='Search by title'
          id='search-revision-input'
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <Close />
              </InputAdornment>
            ),
          }}
        />
      </FormControl>
      <Button disabled>Apply</Button>
    </section>
  );
}

export default SearchInput;
