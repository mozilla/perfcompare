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
          marginBottom: '30px'
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
