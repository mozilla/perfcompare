import { style } from 'typestyle';

const padding = '8px 4px 8px 8px';

export const InputStyles = {
  default: style({
    $nest: {
      label: {
        top: '-6px',
        fontSize: '0.875rem',
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
