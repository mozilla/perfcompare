import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

export function LinkToHome() {
  return (
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
  );
}
