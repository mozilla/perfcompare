/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { style } from 'typestyle';

import { Colors } from './Colors';

export const SwitchRaw = (mode: string) => {
  const isTrueLight = mode == 'light' ? true : false;
  const stylesRaw = {
    padding: 8,
    '&:hover': {
      '& .MuiSwitch-track': {
        backgroundColor: isTrueLight
          ? Colors.SecondaryHover
          : Colors.SecondaryHoverDark,
      },
    },
    '&:active': {
      '& .MuiSwitch-track': {
        backgroundColor: isTrueLight
          ? Colors.SecondaryActive
          : Colors.SecondaryActiveDark,
      },
    },
    '& .MuiButtonBase-root': {
      backgroundColor: Colors.ColorTransparent,
      color: isTrueLight ? Colors.BorderDefault : Colors.BorderDefaultDark,
      margin: 'unset',
      '&:hover': {
        backgroundColor: Colors.ColorTransparent,
      },
      '&:active': {
        backgroundColor: Colors.ColorTransparent,
      },
      '&.Mui-checked': {
        color: isTrueLight ? Colors.Background300 : Colors.Background300Dark,
      },
    },
    '& .MuiSwitch-switchBase': {
      '&.Mui-checked': {
        '& + .MuiSwitch-track': {
          opacity: 1,
          borderColor: isTrueLight ? Colors.PrimaryDefault : Colors.PrimaryDark,
          backgroundColor: isTrueLight
            ? Colors.PrimaryDefault
            : Colors.PrimaryDark,
        },
      },
    },
    '& .MuiSwitch-track': {
      borderRadius: '13px',
      backgroundColor: isTrueLight
        ? Colors.Background100
        : Colors.Background100Dark,
      border: `1px solid ${
        isTrueLight ? Colors.BorderDefault : Colors.BorderDefaultDark
      }`,
      opacity: 1,
      '&:before, &:after': {
        content: '""',
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 16,
        height: 16,
      },
      '&:before': {
        left: 12,
      },
      '&:after': {
        right: 12,
      },
    },
    '& .MuiSwitch-thumb': {
      boxShadow: 'none',
      width: 16,
      height: 16,
      margin: 2,
    },
  };
  const styles = style(stylesRaw);
  const switchStylesBoth = { styled: styles, stylesRaw };
  return switchStylesBoth;
};
