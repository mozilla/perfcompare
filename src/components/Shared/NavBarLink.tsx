import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';

import { useAppSelector } from '../../hooks/app';
import { FontsRaw } from '../../styles';

export function NavBarLink({
  href,
  text,
  tooltip,
}: {
  href: string;
  text: string;
  tooltip: string;
}) {
  const themeMode = useAppSelector((state) => state.theme.mode);
  const linkFont =
    themeMode === 'light' ? FontsRaw.BodyDefault : FontsRaw.BodyDefaultDark;

  return (
    <Box sx={{ mb: 3 }}>
      <Link
        target='_blank'
        href={href}
        aria-label={text}
        title={tooltip}
        sx={{
          display: 'inline-flex',
          ...linkFont,
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
