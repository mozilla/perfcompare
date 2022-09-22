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
        sx={{ ml: 1 }}
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
