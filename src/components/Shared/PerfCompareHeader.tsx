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
        role="heading"
        aria-level={1}
      >
        PerfCompare
      </Typography>
    </Box>
  );
}

export default PerfCompareHeader;
