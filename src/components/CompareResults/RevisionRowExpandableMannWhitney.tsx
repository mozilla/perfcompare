import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import { Strings } from '../../resources/Strings';
import { Spacing } from '../../styles';
import { MannWhitneyResultsItem } from '../../types/state';

const strings = Strings.components.expandableRow;
const { singleRun } = strings;

function RevisionRowExpandableMannWhitney(
  props: RevisionRowExpandableMannWhitneyProps,
) {
  const { result, id } = props;

  const {
    platform,
    base_app: baseApplication,
    new_app: newApplication,
    more_runs_are_needed: moreRunsAreNeeded,
    lower_is_better: lowerIsBetter,
    new_is_better: newIsBetter,
    cliffs_delta,
  } = result;

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
            <Stack spacing={2}></Stack>
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
              <Box sx={{ whiteSpace: 'nowrap' }}>
                <b>Cliffs Delta</b>: {cliffs_delta}%
              </Box>
            </div>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

interface RevisionRowExpandableMannWhitneyProps {
  result: MannWhitneyResultsItem;
  id: string;
}

export default RevisionRowExpandableMannWhitney;
