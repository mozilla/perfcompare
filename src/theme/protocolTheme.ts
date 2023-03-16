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
        palette: { 
          mode, 
          ...(mode === 'light' ? {
            background: {
              default: '#ffffff',
            },
          } : {
            background: {
              default: '#f5f5f5',
            },
            text: {
              primary: '#000000',
              secondary: '#808080',
            },
          }),
        },
        components,
        typography,
      }),
    [mode],
  );

  return { mode, toggleColorMode, protocolTheme };
};
export default useProtocolTheme;
