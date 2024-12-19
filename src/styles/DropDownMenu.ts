import { style } from 'typestyle';

import { Colors } from './Colors';
import { Spacing } from './Spacing';

const sharedDropDownStyles = {
  display: 'flex',
  justifyContent: 'space-between',
  flexDirection: 'column',
  minWidth: '200px',
  borderRadius: `${Spacing.xSmall}px`,
  marginTop: `${Spacing.Small}px`,
};

const sharedListStyles = {
  border: `${Spacing.xSmall / 2}px solid transparent`,
  borderRadius: `${Spacing.xSmall}px`,
  padding: `${Spacing.Small}px`,
  margin: `${Spacing.xSmall}px ${Spacing.Small}px`,
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
    backgroundColor: Colors.Background200Dark,
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
      '&.Mui-selected': {
        backgroundColor: Colors.SecondaryActive,
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
      '&.Mui-selected': {
        backgroundColor: Colors.SecondaryActiveDark,
      },
    },
  },
};

export const DropDownItems = {
  Light: style(DropDownItemRaw.Light),
  Dark: style(DropDownItemRaw.Dark),
};
