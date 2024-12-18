import { Colors } from './Colors';

export const SelectStyles = {
  light: {
    '&:focus': {
      backgroundColor: Colors.SecondaryDefault,
      minWidth: '160px',
    },
    '&:hover': {
      backgroundColor: Colors.SecondaryHover,
      paddingTop: '0px',
      paddingBottom: '0px',
    },
  },
  dark: {
    '&:focus': {
      backgroundColor: Colors.Background300Dark,
      minWidth: '160px',
    },
    '&:hover': {
      backgroundColor: Colors.SecondaryHoverDark,
      paddingTop: '0px',
      paddingBottom: '0px',
    },
  },
};
