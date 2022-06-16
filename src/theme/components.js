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
        '&.high': {
          backgroundImage: `url(${high})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '10%',
        },
        '&.med': {
          backgroundImage: `url(${med})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '10%',
        },
        '&.low': {
          backgroundImage: `url(${low})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '10%',
        },
        '&.linux': {
          backgroundImage: `url(${linux})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '10%',
        },
        '&.osx': {
          backgroundImage: `url(${osx})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '10%',
        },
        '&.windows': {
          backgroundImage: `url(${windows})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '10%',
        },
        '&.android': {
          backgroundImage: `url(${android})`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          backgroundSize: '10%',
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
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:nth-of-type(even)': {
          backgroundColor: '#ededf0',
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
};

export default components;
