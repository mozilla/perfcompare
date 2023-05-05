import { style } from 'typestyle';

import { Colors } from './Colors';
import { FontsRaw } from './Fonts';
import { Spacing } from './Spacing';

const sharedSelectStyles = {
  borderRadius: '4px',
  marginTop: `${Spacing.xSmall}px`,
  height: '156px',
  overflow: 'auto',
  maxWidth: '100%',
  padding: `${Spacing.xSmall}px`,
  border: `1px solid ${Colors.BorderDefault}`,
};

const sharedCaptionStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  borderRadius: '8px',
  padding: `${Spacing.xSmall / 2}px ${Spacing.Small}px`,
  minWidth: '284px',
};

export const SelectListLight = style({
  ...sharedSelectStyles,
  backgroundColor: Colors.Background300,
  $nest: {
    '.MuiListItemButton-root': {
      padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
      $nest: {
        '&:hover': {
          backgroundColor: Colors.SecondaryHover,
          borderRadius: '4px',
        },
        '&:active': {
          backgroundColor: Colors.SecondaryActive,
          borderRadius: '4px',
        },
      },
    },
    '.item-selected': {
      backgroundColor: Colors.SecondaryHover,
      borderRadius: '4px',
    },
    '.revision-hash': {
      ...FontsRaw.BodyDefault,
      marginRight: Spacing.Small,
    },
    '.info-caption': {
      ...sharedCaptionStyles,
      backgroundColor: Colors.Background100,
      $nest: {
        '.info-caption-item': {
          ...FontsRaw.BodySmall,
          display: 'flex',
          alignItems: 'center',
          fontSize: '11px',
        },
      },
    },
    '.MuiTypography-root': {
      ...FontsRaw.BodyDefault,
    },
  },
});

export const SelectListDark = style({
  ...sharedSelectStyles,
  backgroundColor: Colors.Background300Dark,
  color: Colors.SecondaryTextDark,
  $nest: {
    '.MuiListItemButton-root': {
      $nest: {
        '&:hover': {
          backgroundColor: Colors.SecondaryHoverDark,
          borderRadius: '4px',
        },
        '&:active': {
          backgroundColor: Colors.SecondaryActiveDark,
          borderRadius: '4px',
        },
      },
    },
    '.item-selected': {
      backgroundColor: Colors.SecondaryHoverDark,
      borderRadius: '4px',
    },
    '.info-caption': {
      ...sharedCaptionStyles,
      backgroundColor: Colors.SecondaryDark,
      $nest: {
        '.info-caption-item': {
          ...FontsRaw.BodySmallDark,
          display: 'flex',
          alignItems: 'center',
          fontSize: '11px',
        },
      },
    },
    '.MuiTypography-root': {
      ...FontsRaw.BodyDefaultDark,
    },
  },
});