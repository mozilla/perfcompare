import type { TypographyVariantsOptions } from '@mui/material/styles';

import { FontsRaw, FontSizeRaw } from '../styles/Fonts';

// Style overrides for typography to match Mozilla Protocol design system
// https://protocol.mozilla.org/
const h1Size = '3.5rem';

const typography: TypographyVariantsOptions = {
  h1: {
    fontFamily: 'Zilla Slab',
    fontSize: h1Size,
    lineHeight: '1.5',
  },
  h2: {
    ...FontsRaw.HeadingDefault,
    ...FontSizeRaw.xxLarge,
    lineHeight: '1.5',
  },
  h3: {
    ...FontsRaw.HeadingXS,
    ...FontSizeRaw.xSmall,
    lineHeight: '1.5',
  },
  button: {
    textTransform: 'none',
  },
  fontFamily: 'Inter',
};

export default typography;
