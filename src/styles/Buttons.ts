/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { style } from 'typestyle';

import { Colors } from './Colors';

const dropDownPadding = '6px 12px 6px 16px';

//PRIMARY BUTTON LIGHT
export const PrimaryButton = style({
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
});

//PRIMARY BUTTON DARK
export const PrimaryDarkButton = style({
  color: Colors.InvertedTextDark,
  backgroundColor: Colors.PrimaryDark,
  $nest: {
    '&:hover': {
      backgroundColor: Colors.PrimaryHoverDark,
    },
		'&:active': {
      backgroundColor: Colors.PrimaryActiveDark,
    },
  },
});

//SECONDARY BUTTON LIGHT
export const SecondaryButton = style({
  color: Colors.PrimaryText,
  backgroundColor: Colors.SecondaryDefault,
  $nest: {
    '&:hover': {
      backgroundColor: Colors.SecondaryHover,
    },
		'&:active': {
      backgroundColor: Colors.SecondaryActive,
    },
  },
});

//SECONDARY BUTTON DARK
export const SecondaryButtonDark = style({
  color: Colors.PrimaryTextDark,
  backgroundColor: Colors.SecondaryDark,
  $nest: {
    '&:hover': {
      backgroundColor: Colors.SecondaryHoverDark,
    },
		'&:active': {
      backgroundColor: Colors.SecondaryActiveDark,
    },
  },
});

//DROPDOWN BUTTON LIGHT 
export const DefaultDropDownButton = style({
  backgroundColor: Colors.SecondaryDefault,
	padding: dropDownPadding,
	height: '32px',
  $nest: {
		'.MuiSelect-select': {
			color: Colors.PrimaryText,
		},
    '&:hover': {
      backgroundColor: Colors.SecondaryHover,
    },
		'&:active': {
      backgroundColor: Colors.SecondaryActive,
    },
  },
});

//DROPDOWN BUTTON DARK 
export const DefaultDropDownButtonDark = style({
  backgroundColor: Colors.SecondaryDark,
	padding: dropDownPadding,
  $nest: {
		'.MuiSelect-select': {
			color: Colors.PrimaryTextDark,
		},
    '&:hover': {
      backgroundColor: Colors.SecondaryHoverDark,
    },
		'&:active': {
      backgroundColor: Colors.SecondaryActiveDark,
    },
  },
});