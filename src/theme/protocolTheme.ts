// Style overrides for typography to match Mozilla Protocol design system
// https://protocol.mozilla.org/
import { createTheme, Theme } from '@mui/material/styles';

import { Colors } from '../styles';
import components from './components';
import typography from './typography';
import type { ThemeMode } from '../types/state';

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
  icons: {
    success: Colors.IconLightSuccess,
    error: Colors.IconLightError,
  },
  status: {
    improvement: Colors.Background500,
    regression: Colors.Background400,
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
  icons: {
    success: Colors.IconDarkSuccess,
    error: Colors.IconDarkError,
  },
  status: {
    improvement: Colors.Background500Dark,
    regression: Colors.Background400Dark,
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
