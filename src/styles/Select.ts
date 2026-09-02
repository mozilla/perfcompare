import { Colors } from './Colors';

// Only a hover background — no `:focus` rule. A focus background lingered after
// the menu closed (the select keeps focus), and its `minWidth: 160px` made that
// background paint past the control's outlined box (the "ghost highlight").
// Focus stays visible via the outline ring in the MuiSelect root override.
export const Select = {
  light: {
    '&:hover': {
      backgroundColor: Colors.SecondaryHover,
    },
  },
  dark: {
    '&:hover': {
      backgroundColor: Colors.SecondaryHoverDark,
    },
  },
};
