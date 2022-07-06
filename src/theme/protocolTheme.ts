// Style overrides for typography to match Mozilla Protocol design system
// https://protocol.mozilla.org/
import { useMemo, useState } from 'react';

import { createTheme, Theme } from '@mui/material/styles';

import components from './components';
import typography from './typography';

const useProtocolTheme = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const protocolTheme: Theme = useMemo(
    () =>
      createTheme({
        palette: { mode },
        components,
        typography,
      }),
    [mode],
  );

  return { mode, toggleColorMode, protocolTheme };
};
export default useProtocolTheme;
