import { style } from 'typestyle';

import { Colors } from './Colors';

const paddingMenu = '8px 4px';
const paddingItem = '8px';
const borderLight = `1px solid ${Colors.BorderDropdownMenu}`;

//DROPDOWN MENU LIGHT 
export const DropDownMenuDefault = style({
  backgroundColor: Colors.Background300,
	padding: paddingMenu,
	border:borderLight,
	boxShadow: Colors.ShadowLight,
});

//DROPDOWN ITEM LIGHT 
export const DropdownItemLight = style({
  backgroundColor: Colors.Background300,
	padding: paddingItem,
	color: Colors.PrimaryText,
	$nest: {
    '&:hover': {
      backgroundColor: Colors.SecondaryHover,
    },
		'&:active': {
      backgroundColor: Colors.PrimaryDefault,
			color: Colors.InvertedText,
    },
  },
});

//DROPDOWN MENU DARK 
export const DropDownMenuDark = style({
  backgroundColor: Colors.Background300Dark,
	padding: paddingMenu,
	boxShadow: Colors.ShadowDark,
});

//DROPDOWN ITEM DARK
export const DropdownItemDark = style({
  backgroundColor: Colors.Background300Dark,
	padding: paddingItem,
	color: Colors.PrimaryTextDark,
	$nest: {
    '&:hover': {
      backgroundColor: Colors.SecondaryHoverDark,
    },
		'&:active': {
      backgroundColor: Colors.PrimaryDark,
			color: Colors.InvertedTextDark,
    },
  },
});