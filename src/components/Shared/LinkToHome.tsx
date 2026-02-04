import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';

export function LinkToHome() {
  return (
    <Box sx={{ mb: 3 }}>
      <Link href='/' aria-label='link to home' sx={{ display: 'inline-flex' }}>
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            gap: 0.5,
            display: 'inline-flex',
          }}
        >
          <ChevronLeftIcon fontSize='small' />
          <Box component='span'>Home</Box>
        </Stack>
      </Link>
    </Box>
  );
}
