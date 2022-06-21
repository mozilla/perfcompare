import type { TypographyOptions } from '@mui/material/styles/createTypography';
// Style overrides for typography to match Mozilla Protocol design system
// https://protocol.mozilla.org/
const h1Size = '3.5rem';

const typography: TypographyOptions = {
  h1: {
    fontFamily: 'Zilla Slab',
    fontSize: h1Size,
  },
  button: {
    textTransform: 'none',
  },
  fontFamily: 'Inter',
};

export default typography;
