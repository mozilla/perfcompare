import { style } from 'typestyle';

import { Colors } from './Colors';

const dropDownPadding = '6px 12px 6px 16px';

//BUTTONS LIGHT
export const ButtonsLightRaw = {
  Primary: {
    color: Colors.InvertedText,
    backgroundColor: Colors.PrimaryDefault,
    '&:hover': {
      backgroundColor: Colors.PrimaryHover,
    },
    '&:active': {
      backgroundColor: Colors.PrimaryActive,
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
    backgroundColor: Colors.SecondaryDefault,
    padding: dropDownPadding,
    height: '32px',
    '& .MuiSelect-select': {
      color: Colors.PrimaryText,
    },
    '&:hover': {
      backgroundColor: Colors.SecondaryHover,
    },
    '&:active': {
      backgroundColor: Colors.SecondaryActive,
    },
  },
};

export const ButtonsLight = {
  Primary: style(ButtonsLightRaw.Primary),
  Secondary: style(ButtonsLightRaw.Secondary),
  Dropdown: style(ButtonsLightRaw.Dropdown),
};

//BUTTONS DARK

export const ButtonsDarkRaw = {
  Primary: {
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
    backgroundColor: Colors.SecondaryDark,
    padding: dropDownPadding,
    '& .MuiSelect-select': {
      color: Colors.PrimaryTextDark,
    },
    '&:hover': {
      backgroundColor: Colors.SecondaryHoverDark,
    },
    '&:active': {
      backgroundColor: Colors.SecondaryActiveDark,
    },
  },
};

export const ButtonsDark = {
  Primary: style(ButtonsDarkRaw.Primary),
  Secondary: style(ButtonsDarkRaw.Secondary),
  Dropdown: style(ButtonsDarkRaw.Dropdown),
};
