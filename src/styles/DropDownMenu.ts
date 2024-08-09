import { style } from 'typestyle';

import { Colors } from './Colors';
import { Spacing } from './Spacing';

const sharedDropDownStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  minWidth: '200px',
  borderRadius: `${Spacing.xSmall}px`,
  marginTop: `${Spacing.xSmall}px`,
};

const sharedListStyles = {
  border: `${Spacing.xSmall / 2}px solid transparent`,
  borderRadius: `${Spacing.xSmall}px`,
  padding: `${Spacing.Small}px ${Spacing.xSmall}px`,
};

export const DropDownMenuRaw = {
  Light: {
    ...sharedDropDownStyles,
    backgroundColor: Colors.Background300,
    border: `1px solid ${Colors.BorderDefault}`,
    boxShadow: Colors.ShadowLight,
  },

  Dark: {
    ...sharedDropDownStyles,
    backgroundColor: Colors.Background300Dark,
    border: `1px solid ${Colors.Background300Dark}`,
    boxShadow: Colors.ShadowDark,
  },
};

//DROPDOWN ITEM
export const DropDownItemRaw = {
  Light: {
    ...sharedListStyles,
    color: Colors.PrimaryText,
    $nest: {
      '&:hover': {
        backgroundColor: Colors.SecondaryHover,
      },
      '&:active': {
        backgroundColor: Colors.SecondaryActive,
      },
      '&:focus': {
        backgroundColor: Colors.SecondaryDefault,
        borderColor: Colors.PrimaryDefault,
      },
    },
  },

  Dark: {
    ...sharedListStyles,
    color: Colors.PrimaryTextDark,
    $nest: {
      '&:hover': {
        backgroundColor: Colors.SecondaryHoverDark,
      },
      '&:active': {
        backgroundColor: Colors.SecondaryActiveDark,
        color: Colors.InvertedTextDark,
      },
      '&:focus': {
        backgroundColor: Colors.SecondaryDark,
        borderColor: Colors.PrimaryDark,
      },
    },
  },
};

export const DropDownItems = {
  Light: style(DropDownItemRaw.Light),
  Dark: style(DropDownItemRaw.Dark),
};
