import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import CommonGraph from './CommonGraph';
import Distribution from './Distribution';
import { Strings } from '../../resources/Strings';
import { Spacing } from '../../styles';
import { formatNumber } from '../../utils/format';
import { CompareResultsMannWhitneyItem } from '../../types/state';

const strings = Strings.components.expandableRow;
const { singleRun, confidenceNote } = strings;

const numberFormatterTwoDigits = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});
const formatNumberTwoDigits = (value: number) =>
  numberFormatterTwoDigits.format(value);

function RevisionRowExpandableMannWhitney(props: RevisionRowExpandableMannWhitneyProps) {
  const { result, id } = props;

  const {
    base_runs: baseRuns,
    new_runs: newRuns,
    base_runs_replicates: baseRunsReplicates,
    new_runs_replicates: newRunsReplicates,
    platform,
    base_standard_stats,
    new_standard_stats,
  
    base_app: baseApplication,
    new_app: newApplication,
    more_runs_are_needed: moreRunsAreNeeded,
    lower_is_better: lowerIsBetter,
    new_is_better: newIsBetter,
  } = result;
  const baseMedian = base_standard_stats?.median ?? 0
  const newMedian = base_standard_stats?.median ?? 0
  let medianDifference = '';
  let medianPercentage = '';
  if (baseMedian && newMedian) {
    medianDifference = formatNumberTwoDigits(newMedian - baseMedian);
    medianPercentage = formatNumberTwoDigits(
      ((newMedian - baseMedian) / baseMedian) * 100,
    );
  }

  const baseValues =
    baseRunsReplicates && baseRunsReplicates.length
      ? baseRunsReplicates
      : baseRuns;

  const newValues =
    newRunsReplicates && newRunsReplicates.length ? newRunsReplicates : newRuns;

  return (
    <Box
      component='section'
      id={id}
      aria-label='Revision Row Mann Whitney Details'
      sx={{
        backgroundColor: 'revisionRow.background',
        padding: 2,
        borderRadius: `0px 0px ${Spacing.Small}px ${Spacing.Small}px`,
        marginInlineEnd:
          '34px' /* This value needs to be synchronized with the expand icon size. */,
      }}
    >
      <Stack
        divider={<Divider flexItem />}
        spacing={2}
        sx={{
          backgroundColor: 'expandedRow.background',
          padding: 2,
          borderRadius: 0.5,
        }}
      >
        <b>{platform}</b>
        <Grid container spacing={2}>
          <Grid size={8}>
            <Stack spacing={2}>
         

            </Stack>
          </Grid>
          <Grid size={4}>
            <div>
              {moreRunsAreNeeded && <div>{singleRun} </div>}
              {baseApplication && (
                <div>
                  <b>Base application</b>: {baseApplication}{' '}
                </div>
              )}
              {newApplication && (
                <div>
                  <b>New application</b>: {newApplication}{' '}
                </div>
              )}
              <Box sx={{ whiteSpace: 'nowrap', marginTop: 1 }}>
                <b>Comparison result</b>: {newIsBetter ? 'better' : 'worse'} (
                {lowerIsBetter ? 'lower' : 'higher'} is better)
              </Box>
            </div>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

interface RevisionRowExpandableMannWhitneyProps {
  result: CompareResultsMannWhitneyItem;
  id: string;
}

export default RevisionRowExpandableMannWhitney;
