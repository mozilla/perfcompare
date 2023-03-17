import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function PerfCompareHeader() {
  return (
    <Box className="header-container">
      <Typography
        variant="h1"
        component="div"
        align="center"
        gutterBottom
        className="perfcompare-header"
        sx={{ 
          backgroundColor: '#ffffff', 
          position: 'fixed', 
          width: '100%',
          top: '48px', 
          left: '50%',
          zIndex: '2',
          paddingTop: '10px',
          paddingBottom: '20px',
          transform: 'translateX(-50%)',
          boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.10)',
        }}
      >
        PerfCompare
      </Typography>
    </Box>
  );
}

export default PerfCompareHeader;
