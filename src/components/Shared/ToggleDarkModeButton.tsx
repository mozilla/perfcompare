import { FormControlLabel, FormGroup } from '@mui/material';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import { style } from 'typestyle';

import { useAppSelector } from '../../hooks/app';
import { Strings } from '../../resources/Strings';
import { Spacing, FontsRaw, SwitchRaw } from '../../styles';

const strings = Strings.components.header;
const label = { inputProps: { 'aria-label': 'Dark mode switch' } };

function ToggleDarkMode(props: ToggleDarkModeProps) {
  const { toggleColorMode } = props;
  const theme = useAppSelector((state) => state.theme.mode);

  const switchStyle = SwitchRaw(theme === 'light' ? 'light' : 'dark');

  const styles = {
    box: style({
      display: 'flex',
      alignItems: 'center',
      padding: `${Spacing.xLarge}px`,
      margin: 0,
      $nest: {
        '.toggle-text': {
          ...(theme === 'light'
            ? FontsRaw.BodyDefault
            : FontsRaw.BodyDefaultDark),
          margin: 0,
        },
        '.toggle-switch': {
          ...switchStyle.stylesRaw,
          marginLeft: `${Spacing.xxLarge}px`,
        },
      },
    }),
  };

  return (
    <Box className={`toggle-dark-mode ${styles.box}`}>
      <FormGroup>
        <FormControlLabel
          className='toggle-text'
          labelPlacement='start'
          control={
            <Switch
              checked={theme == 'dark' ?? true}
              onChange={toggleColorMode}
              className='toggle-switch toggle-dark-mode'
              name='toggle-dark-mode'
              {...label}
              id={theme == 'light' ? strings.darkMode : strings.lightMode}
            />
          }
          label={theme == 'light' ? strings.darkMode : strings.lightMode}
        />
      </FormGroup>
    </Box>
  );
}
interface ToggleDarkModeProps {
  toggleColorMode: () => void;
}

export default ToggleDarkMode;
