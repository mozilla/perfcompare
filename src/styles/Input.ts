/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { style } from 'typestyle';

import { FontSizeRaw, FontsRaw } from './Fonts';
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
				...FontsRaw.BodyDefault,
        padding,
				height: 'auto',
      },
    },
  }),
  dropDown: style({
		height: '32px',
    $nest: {
      '.MuiSelect-select': {
        padding,
      },
    },
  }),
};
