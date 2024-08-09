import { green, red } from '@mui/material/colors';

import { Spacing, FontsRaw, FontSizeRaw } from '../styles';
import android from './img/android.svg';
import high from './img/high.svg';
import linux from './img/linux.svg';
import low from './img/low.svg';
import med from './img/med.svg';
import osx from './img/osx.svg';
import windows from './img/windows.svg';
import zap from './img/zap-10.svg';

const components = {
  MuiButton: {
    defaultProps: {
      // The props to change the default for.
      disableElevation: true, // No more ripple, on the whole application 💣!
      variant: 'contained',
    },
    styleOverrides: {
      contained: {
        height: 32,
        padding: '4px 16px',
      },
      root: {
        '&.add-revision-button': {
          height: 'auto',
          width: '100%',
          lineHeight: '1.4375em',
        },
        '&.edit-revision-button': {
          width: '100%',
          justifyContent: 'end',
          fontSize: FontSizeRaw.xSmall.fontSize,
          maxWidth: '100px',
          padding: `${Spacing.xSmall}px ${Spacing.Small}px`,
          backgroundColor: 'transparent',
          '&:hover': {
            backgroundColor: 'transparent',
          },

          '& .MuiSvgIcon-root': {
            width: 'auto',
            height: '2.4rem',
            borderRadius: '5px',
            '&.accept': {
              color: green[500],
              '&:hover': {
                backgroundColor: green[100],
              },
            },
            '&.cancel': {
              color: red[500],
              '&:hover': {
                backgroundColor: red[100],
              },
            },
          },
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        '&.filter-status .MuiAlert-icon': {
          paddingTop: '17px',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        '.cellStyle': {
          fontWeight: 600,
          borderRadius: '2.5px',
          padding: '5px',
          display: 'flex',
          color: '#737373',
          width: '50px',
          border: 'solid 1px #737373',
        },
        '.dragIndicatorWrapper': {
          display: 'flex',
          alignItems: 'center',
        },
        '&.commit-message': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '450px',
        },
        '.graph-icon-color:hover': {
          borderBottom: '1px dotted blue',
        },
        '&.background-icon': {
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '17.5%',
        },
        '&.background-icon.dark-mode': {
          filter: 'invert(100%)',
        },
        '&.high': {
          backgroundImage: `url(${high})`,
        },
        '&.med': {
          backgroundImage: `url(${med})`,
        },
        '&.low': {
          backgroundImage: `url(${low})`,
        },
        '&.linux': {
          backgroundImage: `url(${linux})`,
        },
        '&.osx': {
          backgroundImage: `url(${osx})`,
        },
        '&.windows': {
          backgroundImage: `url(${windows})`,
        },
        '&.android': {
          backgroundImage: `url(${android})`,
        },
        '&.unknown-confidence': {
          display: 'flex',
          flexDirection: 'column',
        },
      },
    },
  },
  MuiTableContainer: {
    styleOverrides: {
      root: {
        '&.layout': {
          marginBottom: '2rem',
          tableLayout: 'fixed',
        },
      },
    },
  },
  MuiTypography: {
    defaultProps: {
      variantMapping: {
        body1: 'span',
        body2: 'span',
      },
    },
    styleOverrides: {
      body1: {
        ...FontsRaw.BodyDefault,
      },
      root: {
        '&.perfcompare-header': {
          '&:after': {
            backgroundImage: `url(${zap})`,
            backgroundPosition: '55%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '290px',
            content: '""',
            display: 'block',
            height: '0.3em',
            marginTop: '-5px',
          },
        },
      },
    },
  },
  MuiGrid: {
    styleOverrides: {
      root: {
        '&.compare-button-section': {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
        },
      },
    },
  },
  MuiSvgIcon: {
    styleOverrides: {
      root: {
        '&.compare-icon': {
          marginLeft: '15px',
        },
        '&.missing-confidence-icon': {
          color: '#EE4B2B',
          fontSize: '1.5rem',
        },
      },
    },
  },
  MuiPopover: {
    styleOverrides: {
      root: {
        '&.edit-revision-popover': {
          '& .MuiPaper-root': {
            width: '100%',
            maxWidth: '1152px',
            padding: '6px',
          },
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        '&.missing-confidence-button': {
          borderRadius: '0',
          paddingBottom: '0',

          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        '&.feedback-alert': {
          backgroundImage:
            'linear-gradient( 45deg, rgb(138,35,135) 10%, rgb(233,64,87) 50%, rgb(242,113,33) 100% )',
        },
      },
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: {
        '&.Mui-focused': {
          outline: '1px auto',
        },
      },
    },
  },
};

export default components;
