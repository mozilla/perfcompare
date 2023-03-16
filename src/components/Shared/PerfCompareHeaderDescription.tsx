import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function PerfCompareHeaderDescription() {
  return (
    <Box className="descriptiontext-container">
      <Typography
        variant="body2"
        component="p"
        align="center"
        sx={
          { pt: 2, 
            pb: 6,
          }
        }
        className="description-header"
      >
        <strong>
          Analyze results of performance tests to detect regressions <br/> and identify
          opportunities for improvement.
        </strong>
      </Typography>
    </Box>
  );
}

export default PerfCompareHeaderDescription;