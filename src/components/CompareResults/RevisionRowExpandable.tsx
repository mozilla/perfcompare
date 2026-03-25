import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import CommonGraph from './CommonGraph';
import { getStrategy } from '../../common/testVersions';
import { Strings } from '../../resources/Strings';
import { Spacing } from '../../styles';
import type { CombinedResultsItemType } from '../../types/state';
import { TestVersion } from '../../types/types';

const { singleRun } = Strings.components.expandableRow;

function RevisionRowExpandable(props: RevisionRowExpandableProps) {
  const { result, id, testVersion } = props;

  const {
    base_runs: baseRuns,
    new_runs: newRuns,
    base_runs_replicates: baseRunsReplicates,
    new_runs_replicates: newRunsReplicates,
    platform,
    more_runs_are_needed: moreRunsAreNeeded,
    lower_is_better: lowerIsBetter,
    base_app: baseApplication,
    new_app: newApplication,
    base_measurement_unit: baseUnit,
    new_measurement_unit: newUnit,
  } = result;

  const strategy = getStrategy(testVersion);

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
      aria-label='Revision Row Details'
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
              <CommonGraph
                baseValues={baseValues}
                newValues={newValues}
                unit={baseUnit || newUnit}
              />
              {strategy.renderExpandedLeft(result)}
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
                <b>Comparison result</b>: {strategy.getComparisonResult(result)}{' '}
                ({lowerIsBetter ? 'lower' : 'higher'} is better)
              </Box>
              {strategy.renderExpandedRight(result)}
            </div>
          </Grid>
        </Grid>
        <Stack>{strategy.renderExpandedBottom(result)}</Stack>
      </Stack>
    </Box>
  );
}

interface RevisionRowExpandableProps {
  result: CombinedResultsItemType;
  id: string;
  testVersion: TestVersion;
}

export default RevisionRowExpandable;
