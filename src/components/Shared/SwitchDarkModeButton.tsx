import { Switch, Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';

function SwitchDarkMode(props: ToggleDarkModeProps) {
  const { toggleColorMode } = props;
  return (
    <FormGroup>
      <FormControlLabel className="darkMode"
        control={
          <Switch 
            className="switch-button"
            onChange={toggleColorMode}
          />
        }
        sx={{ mt: 3 }}
        label={
          <Typography 
            sx={
              { 
                fontSize: 14, 
                fontWeight: 600, 
                mr: 5,
                mt: 1,
              }
            }
          >
            Dark Mode
          </Typography>
        }
        labelPlacement="start"
        data-testid="switch-button"
      />
    </FormGroup>  
  );
}

interface ToggleDarkModeProps {
  toggleColorMode: () => void;
}

export default SwitchDarkMode;

