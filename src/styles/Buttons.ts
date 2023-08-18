import { style } from 'typestyle';

import { Colors } from './Colors';
import { Spacing } from './Spacing';

const sharedDropDownBtnStyles = {
  padding: `${Spacing.xSmall + 2}px ${Spacing.Small + 4}px ${
    Spacing.xSmall + 2
  }px ${Spacing.Medium}px`,
  maxHeight: '32px',
  borderRadius: `${Spacing.xSmall}px`,
  marginTop: '0',
};

const sharedButtonStyles = {
  padding: `${Spacing.xSmall}px ${Spacing.Medium}px !important}`,
  height: `${Spacing.xLarge}px`,
  margin: '0 !important',
};

//BUTTONS LIGHT
export const ButtonsLightRaw = {
  Primary: {
    ...sharedButtonStyles,
    color: Colors.InvertedText,
    backgroundColor: Colors.PrimaryDefault,
    $nest: {
      '&:hover': {
        backgroundColor: Colors.PrimaryHover,
      },
      '&:active': {
        backgroundColor: Colors.PrimaryActive,
      },
    },
  },
  Secondary: {
    color: Colors.PrimaryText,
    backgroundColor: Colors.SecondaryDefault,
    '&:hover': {
      backgroundColor: Colors.SecondaryHover,
    },
    '&:active': {
      backgroundColor: Colors.SecondaryActive,
    },
  },
  Dropdown: {
    ...sharedDropDownBtnStyles,
    backgroundColor: Colors.SecondaryDefault,
    borderColor: Colors.SecondaryDefault,

    $nest: {
      '&:hover': {
        backgroundColor: Colors.SecondaryHover,
      },
      '.MuiSelect-select': {
        color: Colors.PrimaryText,
        backgroundColor: 'transparent',
        '&:hover': {
          textDecoration: 'none !important',
          borderBottom: 'none !important',
          '&:before': {
            borderBottom: 'none',
          },
          '&:after': {
            borderBottom: 'none',
          },
        },
        '&:before': {
          borderBottom: 'none',
          backgroundColor: Colors.SecondaryDefault,
        },
        '&:after': {
          borderBottom: 'none',
          backgroundColor: Colors.SecondaryDefault,
        },
      },

      '&:active': {
        backgroundColor: Colors.SecondaryActive,
      },
      '&:before': {
        borderRadius: `${Spacing.xSmall}px`,
        borderBottom: 'none',
      },
      '&:after': {
        borderBottom: 'none',
        borderRadius: `${Spacing.xSmall}px`,
        backgroundColor: Colors.SecondaryDefault,
        '&:hover': {
          borderBottom: 'none',
        },
      },
    },
  },
};

export const ButtonsLight = {
  Primary: style(ButtonsLightRaw.Primary),
  Secondary: style(ButtonsLightRaw.Secondary),
  Dropdown: style(ButtonsLightRaw.Dropdown),
};

////////////////////BUTTONS DARK///////////////////////

export const ButtonsDarkRaw = {
  Primary: {
    ...sharedButtonStyles,
    color: Colors.InvertedTextDark,
    backgroundColor: Colors.PrimaryDark,
    '&:hover': {
      backgroundColor: Colors.PrimaryHoverDark,
    },
    '&:active': {
      backgroundColor: Colors.PrimaryActiveDark,
    },
  },
  Secondary: {
    color: Colors.PrimaryTextDark,
    backgroundColor: Colors.Background300Dark,
    '&:hover': {
      backgroundColor: Colors.SecondaryHoverDark,
    },
    '&:active': {
      backgroundColor: Colors.SecondaryActiveDark,
    },
  },
  Dropdown: {
    ...sharedDropDownBtnStyles,
    backgroundColor: Colors.Background300Dark,
    $nest: {
      '.MuiSelect-select': {
        color: Colors.PrimaryTextDark,
      },
      '&:hover': {
        backgroundColor: Colors.SecondaryHoverDark,
        $nest: {
          '&:before': {
            borderBottom: 'none',
            borderBottomColor: 'transparent',
          },
          '&:after': {
            borderBottom: 'none',
            borderBottomColor: 'transparent',
          },
        },
      },
      '&:active': {
        backgroundColor: Colors.SecondaryActiveDark,
      },
      '&:before': {
        borderBottom: 'none',
        borderRadius: `${Spacing.xSmall}px`,
      },
      '&:after': {
        borderBottom: 'none',
        borderRadius: `${Spacing.xSmall}px`,
        backgroundColor: Colors.SecondaryDark,
      },
    },
  },
};

export const ButtonsDark = {
  Primary: style(ButtonsDarkRaw.Primary),
  Secondary: style(ButtonsDarkRaw.Secondary),
  Dropdown: style(ButtonsDarkRaw.Dropdown),
};

export const ButtonStyles = (mode: string) => {
  const isTrueLight = mode == 'light' ? true : false;
  return isTrueLight ? ButtonsLightRaw : ButtonsDarkRaw;
};

export const ButtonStylesSecondary = (mode: string) => {
  const isTrueLight = mode == 'light' ? true : false;
  return isTrueLight ? ButtonsLight.Secondary : ButtonsDark.Secondary;
};
