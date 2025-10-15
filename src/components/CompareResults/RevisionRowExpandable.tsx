import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import CommonGraph from './CommonGraph';
import Distribution from './Distribution';
import { MANN_WHITNEY_U, STUDENT_T } from '../../common/constants';
import { Strings } from '../../resources/Strings';
import { Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import { TestVersion } from '../../types/types';
import { formatNumber } from './../../utils/format';

const strings = Strings.components.expandableRow;
const { singleRun, confidenceNote } = strings;

const numberFormatterTwoDigits = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});
const formatNumberTwoDigits = (value: number) =>
  numberFormatterTwoDigits.format(value);

function RevisionRowExpandable(props: RevisionRowExpandableProps) {
  const { result, id, testVersion } = props;

  const {
    base_runs: baseRuns,
    new_runs: newRuns,
    base_runs_replicates: baseRunsReplicates,
    new_runs_replicates: newRunsReplicates,
    platform,
    delta_percentage: deltaPercent,
    delta_value: delta,
    confidence_text: confidenceText,
    confidence: confidenceValue,
    base_median_value: baseMedian,
    new_median_value: newMedian,
    base_measurement_unit: baseUnit,
    new_measurement_unit: newUnit,
    base_app: baseApplication,
    new_app: newApplication,
    more_runs_are_needed: moreRunsAreNeeded,
    lower_is_better: lowerIsBetter,
    new_is_better: newIsBetter,
  } = result;

  const unit = baseUnit || newUnit;
  const deltaUnit = unit ? `${unit}` : '';
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

  //////////// Conditional display of new stats design based on test version ///////////////
  const renderPValCliffsDeltaComp = () => {
    if (testVersion === MANN_WHITNEY_U) {
      return (
        <Box
          sx={{
            backgroundColor: '#FBFBFE',
            padding: 1,
            borderRadius: '5px',
            minWidth: '287px',
          }}
        >
          <table
            style={{ borderCollapse: 'collapse', width: '100%', marginTop: 8 }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Metric</th>
                <th style={{ textAlign: 'left', paddingRight: 16 }}>Value</th>
                <th style={{ textAlign: 'left' }}>Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: 2 }}>{`Cliff's Delta`}</td>
                <td style={{ padding: 2 }}></td>
                <td style={{ padding: 2 }}></td>
              </tr>
              <tr>
                <td style={{ padding: 2 }}>Confidence (p-value)</td>
                <td style={{ padding: 2 }}></td>
                <td style={{ padding: 2 }}></td>
              </tr>
              <tr>
                <td style={{ padding: 2 }}>CLES</td>
                <td style={{ padding: 2 }}></td>
                <td style={{ padding: 2 }}></td>
              </tr>
            </tbody>
          </table>
        </Box>
      );
    }
    return;
  };

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
              <Distribution result={result} />
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
              {/******* student t test rendering **************/}
              {testVersion === STUDENT_T && (
                <>
                  <Box sx={{ whiteSpace: 'nowrap' }}>
                    <b>Difference of means</b>: {deltaPercent}% (
                    {formatNumber(delta)}
                    {deltaUnit ? ' ' + deltaUnit : null})
                  </Box>
                  {newMedian && baseMedian ? (
                    <Box sx={{ whiteSpace: 'nowrap' }}>
                      <b>Difference of medians</b>: {medianPercentage}% (
                      {medianDifference}
                      {deltaUnit ? ' ' + deltaUnit : null})
                    </Box>
                  ) : null}
                  {confidenceText ? (
                    <div>
                      <Box sx={{ whiteSpace: 'nowrap' }}>
                        <b>Confidence</b>: {confidenceText}
                        {confidenceValue ? ' ' + `(${confidenceValue})` : null}
                      </Box>
                      <Box
                        sx={{
                          fontSize: '10px',
                          textTransform: 'uppercase',
                        }}
                      >
                        <b>**Note</b>: {confidenceNote}{' '}
                      </Box>
                    </div>
                  ) : (
                    <Box sx={{ whiteSpace: 'nowrap' }}>
                      <b>Confidence</b>: Not available{' '}
                    </Box>
                  )}
                </>
              )}
              {/******* mann-whiteney rendering **************/}
              {renderPValCliffsDeltaComp()}
            </div>
          </Grid>
        </Grid>
      </Stack>
    </Box>
  );
}

interface RevisionRowExpandableProps {
  result: CompareResultsItem;
  id: string;
  testVersion: TestVersion;
}

export default RevisionRowExpandable;
