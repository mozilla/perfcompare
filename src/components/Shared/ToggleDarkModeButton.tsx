import { FormControlLabel, FormGroup } from '@mui/material';
import Box from '@mui/material/Box';
import Switch from '@mui/material/Switch';
import { style } from 'typestyle';

import { useAppSelector, useAppDispatch } from '../../hooks/app';
import { updateThemeMode } from '../../reducers/ThemeSlice';
import { Strings } from '../../resources/Strings';
import { Spacing, FontsRaw, SwitchRaw } from '../../styles';
import { ThemeMode } from '../../types/state';

const strings = Strings.components.header;

function ToggleDarkMode() {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.theme.mode);

  const switchStyle = SwitchRaw(theme === 'light' ? 'light' : 'dark');

  const toggleColorMode = () => {
    const themeMode = theme === 'light' ? 'dark' : 'light';
    dispatch(updateThemeMode(themeMode as ThemeMode));
    localStorage.setItem('theme', themeMode);
  };

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
              checked={theme == 'dark'}
              onChange={toggleColorMode}
              className='toggle-switch toggle-dark-mode'
              name='toggle-dark-mode'
              slotProps={{ input: { 'aria-label': 'Dark mode switch' } }}
              id={theme == 'light' ? strings.darkMode : strings.lightMode}
            />
          }
          label={theme == 'light' ? strings.darkMode : strings.lightMode}
        />
      </FormGroup>
    </Box>
  );
}

export default ToggleDarkMode;
