import Close from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import { FormControl, InputAdornment, TextField, Button } from '@mui/material';
import { style } from 'typestyle';

import { ButtonsLightRaw, Spacing } from '../../../styles';

const styles = {
  container: style({
    display: 'flex',
    marginRight: 'auto',
    $nest: {
      '.form-container': {
        maxWidth: '447px',
      },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      '.MuiButtonBase-root': {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        ...ButtonsLightRaw.Secondary,
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
