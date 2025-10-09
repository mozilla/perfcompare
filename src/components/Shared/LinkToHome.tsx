import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';
import { style } from 'typestyle';

import { Spacing } from '../../styles';

export function LinkToHome() {
  const styles = {
    box: style({
      marginBottom: `${Spacing.Small + 1}px`,
    }),
  };

  return (
    <Box className={`${styles.box}`}>
      <Link href='/' aria-label='link to home'>
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
          }}
        >
          <ChevronLeftIcon fontSize='small' />
          <p>Home</p>
        </Stack>
      </Link>
    </Box>
  );
}
