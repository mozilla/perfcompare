import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';

export function NavBarLink({
  href,
  text,
  tooltip,
}: {
  href: string;
  text: string;
  tooltip: string;
}) {
  return (
    <Box>
      <Link
        target='_blank'
        href={href}
        aria-label={text}
        title={tooltip}
        sx={{
          display: 'inline-flex',
          color: 'inherit',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        <Stack
          direction='row'
          sx={{
            alignItems: 'center',
            gap: 0.5,
            display: 'inline-flex',
          }}
        >
          <Box component='span'>{text}</Box>
        </Stack>
      </Link>
    </Box>
  );
}
