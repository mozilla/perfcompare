import { style, cssRule } from 'typestyle';

import { Colors } from './Colors';
import { FontSizeRaw, FontsRaw } from './Fonts';
import { Spacing } from './Spacing';

const padding = `${Spacing.Small}px ${Spacing.xSmall}px ${Spacing.Small}px 0px`;
const top = `${Spacing.xSmall + 2}px`;

cssRule('body::-webkit-scrollbar-thumb, body::-moz-scrollbar', {
  borderRadius: '4px',
});

const InputStylesShared = {
  padding,
  display: 'flex',
  alignItems: 'center',
  borderRadius: Spacing.xSmall,
  maxHeight: '32px',
};

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
    maxHeight: '32px',
    $nest: {
      '.MuiSelect-select': {
        padding,
      },
    },
  }),
};

export const InputStylesRaw = {
  Light: {
    ...InputStylesShared,
    backgroundColor: Colors.Background300,
    $nest: {
      '.MuiSvgIcon-root': {
        color: Colors.IconLight,
        width: '16px',
        height: '16px',
      },
      '.MuiInputBase-input': {
        ...FontsRaw.BodyDefault,
        color: Colors.Normal,
        padding: 0,
      },
    },
  },

  Dark: {
    ...InputStylesShared,
    backgroundColor: Colors.Background300Dark,
    $nest: {
      '.MuiSvgIcon-root': {
        color: Colors.IconDark,
        width: '16px',
        height: '16px',
      },
      '.MuiInputBase-input': {
        ...FontsRaw.BodyDefault,
        color: Colors.PrimaryTextDark,
        padding: 0,
      },
    },
  },
};
