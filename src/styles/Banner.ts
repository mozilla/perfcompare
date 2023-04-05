import { style } from 'typestyle';

export const Banner = style({
  alignItems: 'center',

  $nest: {
    '&.MuiPaper-root': {
      padding: '0 16px',
    },

    '.MuiAlert-message': {
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      justifyContent: 'space-between',
    },
  },
});
