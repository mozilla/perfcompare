import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { connect } from 'react-redux';

import type { State } from '../../types/state';
import HeaderAlert from './HeaderAlert';

function PerfCompareHeader(props: PerfCompareHeaderProps) {
  const { isAlert } = props;
  return (
    <Box>
      <Grid container sx={{ height: '3rem' }}>
        <Grid item xs={4} />
        <Grid item xs={4}>
          {isAlert && <HeaderAlert />}
        </Grid>
        <Grid item xs={4} />
      </Grid>
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

interface PerfCompareHeaderProps {
  isAlert: boolean;
}

function mapStateToProps(state: State) {
  return {
    isAlert: state.alert.isAlert,
  };
}

export default connect(mapStateToProps)(PerfCompareHeader);
