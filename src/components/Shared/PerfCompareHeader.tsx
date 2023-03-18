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
          margin: '10px 0 40px 0',
          padding: '15px 0',
        }}        
      >
        PerfCompare
      </Typography>
    </Box>
  );
}

export default PerfCompareHeader;
