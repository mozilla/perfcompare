import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import type { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';

function ToggleDarkMode(props: ToggleDarkModeProps) {
  const { theme, toggleColorMode } = props;
  return (
    <Box className="toggle-dark-mode">
      <IconButton
        sx={{
          ml: 1,
          position: 'fixed',
          top: '60px',
          right: '20px',
          zIndex: '4',
          '@media (max-width: 890px)': { // Tablet screen size
            top: '90px',
            right: '20px',
          },
          '@media (max-width: 500px)': { // Mobile screen size
            top: '105px',
            right: '10px',
          },
        }}
        onClick={toggleColorMode}
        color="inherit"
        aria-label="toggle-dark-mode"
      >
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon />
        ) : (
          <Brightness4Icon />
        )}
      </IconButton>
    </Box>
  );
}

interface ToggleDarkModeProps {
  theme: Theme;
  toggleColorMode: () => void;
}

export default ToggleDarkMode;
