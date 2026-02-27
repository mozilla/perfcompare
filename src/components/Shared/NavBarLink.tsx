
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/system';

export function NavBarLink({ href, text }: { href: string, text: string }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Link target="_blank" href={href} aria-label={text} sx={{ display: "inline-flex" }}>
            <Stack direction='row'
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
