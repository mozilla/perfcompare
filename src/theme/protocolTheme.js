// Style overrides for typography to match Mozilla Protocol design system
// https://protocol.mozilla.org/
import { createTheme } from '@mui/material/styles';

import components from './components';
import typography from './typography';

const protocolTheme = createTheme({
  components,
  typography,
});

export default protocolTheme;
