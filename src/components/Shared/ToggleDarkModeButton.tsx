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
        title="Toggle dark mode"
        data-testid="dark-mode-toggle-button"
      >
        {theme.palette.mode === 'dark' ? (
          <Brightness7Icon alt="Toggle dark mode - Light mode" />
        ) : (
          <Brightness4Icon alt="Toggle dark mode - Dark mode" />
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
