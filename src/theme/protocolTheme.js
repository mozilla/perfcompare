// Style overrides for typography to match Mozilla Protocol design system
// https://protocol.mozilla.org/
import { createTheme } from '@mui/material/styles';

import typography from './typography';

const protocolTheme = createTheme({
  typography,
});

export default protocolTheme;
