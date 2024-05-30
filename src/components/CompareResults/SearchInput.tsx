import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, TextField, Button } from '@mui/material';
import { style } from 'typestyle';

import { Spacing } from '../../styles';

const styles = {
  container: style({
    // TODO: to be added at the implementation time
    display: 'none',
    marginRight: 'auto',
    $nest: {
      '.form-container': {
        maxWidth: '447px',
      },
      '.MuiButtonBase-root': {
        marginLeft: Spacing.Small,
      },
    },
  }),
};

function SearchInput() {
  return (
    <div className={styles.container} data-testid={'search-by-title-test-name'}>
      <div className='form-container'>
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
      </div>
      <Button disabled>Apply</Button>
    </div>
  );
}

export default SearchInput;
