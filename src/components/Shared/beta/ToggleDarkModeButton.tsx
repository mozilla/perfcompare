import { useEffect, useState } from 'react';

import { FormControlLabel, FormGroup, Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import { style } from 'typestyle';

import { Strings } from '../../../resources/Strings';
import { Spacing, FontsRaw, SwitchRaw } from '../../../styles';

const strings = Strings.components.header;
const label = { inputProps: { 'aria-label': 'Dark mode switch' } };

function ToggleDarkMode(props: ToggleDarkModeProps) {
  const { toggleColorMode, theme } = props;
  const themeMode = theme.palette.mode;
  const [light, setLight] = useState(SwitchRaw(themeMode as 'light' | 'dark'));

  useEffect(() => {
    const updatedMode = themeMode === 'light' ? 'light' : 'dark';
    setLight(SwitchRaw(updatedMode));
  }, [themeMode]);

  const styles = {
    box: style({
      display: 'flex',
      alignItems: 'center',
      padding: `${Spacing.xLarge}px`,
      margin: 0,
      $nest: {
        '.toggle-text': {
          ...(themeMode === 'light'
            ? FontsRaw.BodyDefault
            : FontsRaw.BodyDefaultDark),
          margin: 0,
        },
        '.toggle-switch': {
          ...light.stylesRaw,
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
              checked={themeMode == 'dark' ?? true}
              onChange={toggleColorMode}
              className='toggle-switch toggle-dark-mode'
              {...label}
              id={themeMode == 'light' ? strings.darkMode : strings.lightMode}
            />
          }
          label={themeMode == 'light' ? strings.darkMode : strings.lightMode}
        />
      </FormGroup>
    </Box>
  );
}
interface ToggleDarkModeProps {
  theme: Theme;
  toggleColorMode: () => void;
}

export default ToggleDarkMode;
