import { style } from 'typestyle';

import { FontSizeRaw } from './Fonts';
import { Spacing } from './Spacing';

const padding = '8px 4px 8px 8px';
const top = `-${Spacing.xSmall + 2}px`;

export const InputStyles = {
  default: style({
    $nest: {
      label: {
				...FontSizeRaw.Small,
        top,
      },
      input: {
        padding,
      },
    },
  }),
  dropDown: style({
    $nest: {
      '.MuiSelect-select': {
        padding,
      },
    },
  }),
};
