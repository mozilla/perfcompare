import { style } from 'typestyle';

import { ThemeMode } from '../types/state';
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

export const captionStylesLight = {
  ...sharedCaptionStyles,
  backgroundColor: Colors.Background100,

  $nest: {
    '.info-caption-item': {
      ...FontsRaw.BodySmallDark,
      display: 'flex',
      alignItems: 'center',
      fontSize: '11px',
      color: Colors.SecondaryText,
    },
  },
};

export const captionStylesDark = {
  ...sharedCaptionStyles,
  backgroundColor: Colors.SecondaryDark,

  $nest: {
    '.info-caption-item': {
      ...FontsRaw.BodySmall,
      display: 'flex',
      alignItems: 'center',
      fontSize: '11px',
      color: Colors.SecondaryTextDark,
    },
  },
};

export const SelectListRaw = {
  Light: {
    ...sharedSelectStyles,
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
        ...captionStylesLight,
      },
      '.MuiTypography-root': {
        ...FontsRaw.BodyDefault,
      },
    },
  },

  Dark: {
    ...sharedSelectStyles,
    $nest: {
      '.MuiListItemButton-root': {
        padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
        $nest: {
          '&:hover': {
            backgroundColor: Colors.SecondaryHoverDark,
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
        ...captionStylesDark,
      },
      '.MuiTypography-root': {
        ...FontsRaw.BodyDefaultDark,
      },
    },
  },
};

export const SelectListLight = style({
  backgroundColor: Colors.Background300,
  zIndex: 100,
  position: 'relative',
  ...SelectListRaw.Light,
});

export const SelectListDark = style({
  backgroundColor: Colors.Background300Dark,
  zIndex: 100,
  position: 'relative',
  ...SelectListRaw.Dark,
});

export const SelectListStyles = (mode: string) => {
  const themeMode = mode as ThemeMode;
  return themeMode === 'light' ? SelectListLight : SelectListDark;
};