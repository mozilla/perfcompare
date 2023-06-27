import { style } from 'typestyle';

export const skipLink = style({
    left: '0%',
    top: '0%',
    transform: 'translateY(-110%)',
    borderRadius: '5px',
    position: 'absolute',
    border: 'none',
    color: 'white',
    background: '#424242',
    height: '3rem',
    padding: '1rem',

  $nest: {
    '&:focus': {
        outline: 'none',
          transform: 'translateY(0%)',
    },
  },
});
