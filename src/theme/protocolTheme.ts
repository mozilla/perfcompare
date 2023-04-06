// Style overrides for typography to match Mozilla Protocol design system
// https://protocol.mozilla.org/
import { useMemo, useState, useEffect } from 'react';

import { createTheme, Theme } from '@mui/material/styles';

import { Colors } from '../styles';
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

const getDesignTokens = (modeVal: 'light' | 'dark') => ({
  palette: {
    mode: modeVal,
    ...(modeVal === 'light' ? lightMode : darkMode),
  },
});

const useProtocolTheme = () => {
  const storedMode = localStorage.getItem('theme') || 'light';
  const [mode, setMode] = useState((storedMode as 'light' | 'dark') || 'light');

  useEffect(() => {
    localStorage.setItem('theme', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const protocolTheme: Theme = useMemo(
    () => createTheme(getDesignTokens(mode), { components, typography }),
    [mode],
  );

  return { mode, toggleColorMode, protocolTheme };
};
export default useProtocolTheme;
