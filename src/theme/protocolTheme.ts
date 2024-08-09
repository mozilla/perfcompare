// Style overrides for typography to match Mozilla Protocol design system
// https://protocol.mozilla.org/
import { createTheme, Theme } from '@mui/material/styles';

import { Colors } from '../styles';
import type { ThemeMode } from '../types/state';
import components from './components';
import typography from './typography';

const lightMode = {
  background: {
    default: Colors.Background300,
  },
  primary: {
    main: Colors.PrimaryDefault,
  },
  secondary: {
    main: Colors.SecondaryDefault,
    dark: Colors.SecondaryHover,
  },
  text: {
    primary: Colors.PrimaryText,
    secondary: Colors.SecondaryText,
    disabled: Colors.TextDisabled,
  },
};

const darkMode = {
  background: {
    default: Colors.Background100Dark,
  },
  primary: {
    main: Colors.PrimaryDark,
  },
  secondary: {
    main: Colors.Background300Dark,
    dark: Colors.SecondaryHoverDark,
  },
  text: {
    primary: Colors.PrimaryTextDark,
    secondary: Colors.SecondaryTextDark,
    disabled: Colors.TextDisabledDark,
  },
};

const getDesignTokens = (modeVal: ThemeMode) => ({
  palette: {
    mode: modeVal,
    ...(modeVal === 'light' ? lightMode : darkMode),
  },
});

const getProtocolTheme = (storedMode: string) => {
  const protocolTheme: Theme = createTheme(
    getDesignTokens(storedMode as ThemeMode),
    {
      components,
      typography,
    },
  );

  return { protocolTheme };
};
export default getProtocolTheme;
