import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function PerfCompareHeader() {
  return (
    <Box>
      <Typography
        variant="h1"
        component="div"
        align="center"
        gutterBottom
        className="perfcompare-header"
      >
        PerfCompare
      </Typography>
    </Box>
  );
}

export default PerfCompareHeader;
