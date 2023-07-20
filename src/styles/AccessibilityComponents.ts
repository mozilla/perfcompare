import { style } from 'typestyle';

import { Colors } from './Colors';

export const skipLink = style({
    left: '0%',
    top: '0%',
    transform: 'translateY(-110%)',
    borderRadius: '5px',
    position: 'absolute',
    border: 'none',
    color: Colors.PrimaryTextDark,
    background: Colors.Background300Dark,
    height: '3rem',
    padding: '1rem',

  $nest: {
    '&:focus': {
        outline: 'none',
          transform: 'translateY(0%)',
    },
  },
});
