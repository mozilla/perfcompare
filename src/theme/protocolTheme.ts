// Style overrides for typography to match Mozilla Protocol design system
// https://protocol.mozilla.org/
import { useMemo } from 'react';

import { createTheme, Theme } from '@mui/material/styles';

import { Colors } from '../styles';
import type { ThemeMode } from '../types/state';
import components from './components';
import typography from './typography';

const lightMode = {
  action: {
    active: Colors.PrimaryDefault,
    hover: Colors.PrimaryHover,
    disabled: Colors.PrimaryDisabled,
  },
  background: {
    default: Colors.Background100,
  },
  primary: {
    main: Colors.PrimaryDefault,
  },
  secondary: {
    main: Colors.SecondaryDefault,
  },
  text: {
    primary: Colors.PrimaryText,
    secondary: Colors.SecondaryText,
    disabled: Colors.TextDisabled,
  },
};

const darkMode = {
  action: {
    active: Colors.PrimaryDark,
    hover: Colors.PrimaryHoverDark,
    disabled: Colors.PrimaryDisabledDark,
  },
  background: {
    default: Colors.Background300Dark,
  },
  primary: {
    main: Colors.PrimaryDark,
  },
  secondary: {
    main: Colors.SecondaryDark,
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
  const protocolTheme: Theme = useMemo(
    () =>
      createTheme(getDesignTokens(storedMode as ThemeMode), {
        components,
        typography,
      }),
    [storedMode],
  );

  return { protocolTheme };
};
export default getProtocolTheme;
