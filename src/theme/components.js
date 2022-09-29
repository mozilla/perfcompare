import { green } from '@mui/material/colors';
import { red } from '@mui/material/colors';

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
    styleOverrides: {
      root: {
        '&.add-revision-button': {
          fontSize: '2rem',
          height: 'auto',
          width: '100%',
          lineHeight: '1.4375em',
          padding: '16.5px 14px',
        },
        '&.edit-revision-button': {
          width: '50%',
          padding: '0',
          minWidth: '0',
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
        '&.compare-button': {
          lineHeight: '1.4375em',
          padding: '16.5px 14px',
          textTransform: 'uppercase',
          marginBottom: '30px',
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
        '& .label': {
          backgroundColor: 'blue',
          borderRadius: '5px',
          color: 'white',
          padding: '2px 5px',
          margin: '0 2px',
          '&.webrender-sw': {
            backgroundColor: '#008787',
          },
          '&.webgl-ipc': {
            backgroundColor: '#45278d',
          },
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
    styleOverrides: {
      root: {
        '&.perfcompare-header': {
          '&:after': {
            backgroundImage: `url(${zap})`,
            backgroundPosition: '55%',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '25%',
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
  MuiContainer: {
    styleOverrides: {
      root: {
        '&.perfcompare-body': {
          minHeight: '85vh',
        },
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        '&.feedback-alert': {
            backgroundImage: 'linear-gradient( 45deg, rgb(138,35,135) 10%, rgb(233,64,87) 50%, rgb(242,113,33) 100% )',
        },
      },
    },
  },
};

export default components;
