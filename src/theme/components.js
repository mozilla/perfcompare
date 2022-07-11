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
        '&.compare-button': {
          lineHeight: '1.4375em',
          padding: '16.5px 14px',
          textTransform: 'uppercase',
          marginBottom: '30px',
        },
      },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        '&.compare-results-selected-table': {
          '& .MuiTableCell-root': {
            paddingTop: '0',
            paddingBottom: '0',
          },
        },
        '&.search-selected-table': {
          '& .MuiTableCell-root': {
            paddingTop: '10px',
            paddingBottom: '10px',
          },
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        paddingTop: '10px',
        paddingBottom: '10px',
        '.cellStyle': {
          fontWeight: 600,
          borderRadius: '2.5px',
          padding: '5px',
          display: 'flex',
          color: '#737373',
          width: '50px',
          border: 'solid 1px #737373',
        },
        '.commit-message': {
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          width: '400px',
        },
        '&.background-icon': {
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '10%',
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
            paddingTop: '6px',
          },
        },
      },
    },
  },
};

export default components;
