import { Colors } from './Colors';

export const Select = {
  light: {
    '&:focus': {
      backgroundColor: Colors.SecondaryDefault,
      minWidth: '160px',
    },
    '&:hover': {
      backgroundColor: Colors.SecondaryHover,
    },
  },
  dark: {
    '&:focus': {
      backgroundColor: Colors.Background300Dark,
      minWidth: '160px',
    },
    '&:hover': {
      backgroundColor: Colors.SecondaryHoverDark,
    },
  },
};
