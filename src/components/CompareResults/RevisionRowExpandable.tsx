import { useEffect, useMemo, useState, type ReactNode } from 'react';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import CommonGraph from './CommonGraph';
import KdeModesPanel from './KdeModesPanel';
import { MannWhitneyCompareMetrics } from './MannWhitneyCompareMetrics';
import { StatisticsWarnings } from './StatisticsWarnings';
import { MANN_WHITNEY_U } from '../../common/constants';
import { getStrategy } from '../../common/testVersions';
import useExpandedRowOptions from '../../hooks/useExpandedRowOptions';
import { Strings } from '../../resources/Strings';
import { Spacing } from '../../styles';
import type {
  CombinedResultsItemType,
  MannWhitneyResultsItem,
} from '../../types/state';
import { TestVersion } from '../../types/types';
import { bandwidthFor } from '../../utils/kdeAnalysis';

// Show the smoothing slider when the bandwidth exceeds half the data range —
// at that point the KDE curve is genuinely flat and the user may want to dial
// it down to see structure.
const LARGE_BW_RATIO = 0.5;

const { singleRun } = Strings.components.expandableRow;

// Plain-language help shown above the density graph in the simplified
// Mann-Whitney-U expanded view.
const GRAPH_BLURB =
  'This graph shows how the Base and New results are distributed. Two curves ' +
  'that mostly overlap mean the builds performed about the same; curves that ' +
  'sit apart suggest a real difference — the further apart, the bigger the ' +
  'change.';

// A half-width expanded-row cell that fades its contents in on mount, so when a
// user turns an option on from the Advanced options dropdown the newly-shown
// component visibly appears below the graph rather than popping in silently.
function ExpandedCell({ children }: { children: ReactNode }) {
  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Fade in appear timeout={500}>
        <Box>{children}</Box>
      </Fade>
    </Grid>
  );
}

function RevisionRowExpandable(props: RevisionRowExpandableProps) {
  const { result, id, testVersion } = props;

  // Valley-depth threshold for the mode-detection slider rendered next to the
  // chart. Lifted to this row so the future mode-blurb panel can read the same
  // detected modes without recomputing the KDE.
  const [vt, setVt] = useState(0.5);
  const [showModes, setShowModes] = useState(true);

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
  const isMannWhitney = testVersion === MANN_WHITNEY_U;
  const expandedRow = useExpandedRowOptions();

  // Both of these are only read inside the `isMannWhitney` JSX branch below;
  // they're computed here (rather than in the branch) just to keep the render
  // return readable. They're harmless no-ops for the Student-T render.
  // `mwResult` narrows the result for the Mann-Whitney-U-only statistics table
  // and data warnings; `anyExpandedCell` is whether any expanded-row option is on.
  const mwResult = result as MannWhitneyResultsItem;
  const anyExpandedCell =
    expandedRow.effectSize ||
    expandedRow.modes ||
    expandedRow.statsTable ||
    expandedRow.warnings;

  const baseValues =
    baseRunsReplicates && baseRunsReplicates.length
      ? baseRunsReplicates
      : baseRuns;

  const newValues =
    newRunsReplicates && newRunsReplicates.length ? newRunsReplicates : newRuns;

  const isSubtest = result.base_parent_signature !== null;

  // The chart's smoothing slider and the blurb's mode detection
  // see the same effective KDE bandwidth.
  const [bwMultiplier, setBwMultiplier] = useState(1.0);
  useEffect(() => setBwMultiplier(1.0), [baseValues, newValues]);

  const { sharedBw, isLargeBw } = useMemo(() => {
    const baseBw = bandwidthFor(baseValues, isSubtest) ?? 0;
    const newBw = bandwidthFor(newValues, isSubtest) ?? 0;
    const rawSharedBw = Math.max(baseBw, newBw);
    const sharedBwOut =
      rawSharedBw > 0 ? rawSharedBw * bwMultiplier : undefined;
    // `isLargeBw` keys on the UNSCALED bandwidth so the slider stays visible
    // even after the user dials the multiplier down — otherwise it would
    // vanish out from under them.
    const allValues = [...baseValues, ...newValues];
    let isLargeBwOut = false;
    if (allValues.length >= 2 && rawSharedBw > 0) {
      const range = Math.max(...allValues) - Math.min(...allValues);
      if (range > 0) isLargeBwOut = rawSharedBw / range > LARGE_BW_RATIO;
    }
    return { sharedBw: sharedBwOut, isLargeBw: isLargeBwOut };
  }, [baseValues, newValues, isSubtest, bwMultiplier]);

  // Rendered identically in both layouts; declared once so the two branches
  // don't duplicate the (long) prop lists.
  const graph =
    baseValues.length > 0 || newValues.length > 0 ? (
      <CommonGraph
        baseValues={baseValues}
        newValues={newValues}
        unit={baseUnit || newUnit}
        sharedBw={sharedBw}
        bwMultiplier={bwMultiplier}
        onBwMultiplierChange={setBwMultiplier}
        isLargeBw={isLargeBw}
        vt={vt}
        onVtChange={setVt}
        // Mode controls/overlays are always available on the graph in the
        // simplified view, driven only by this "Show modes" state — not by the
        // "Mode analysis" expanded-row option (which gates the breakdown panel).
        showModes={showModes}
        onShowModesChange={setShowModes}
        infoTooltip={isMannWhitney ? GRAPH_BLURB : undefined}
      />
    ) : null;

  const modesPanel = (
    <KdeModesPanel
      baseValues={baseValues}
      newValues={newValues}
      unit={baseUnit || newUnit}
      sharedBw={sharedBw}
      vt={vt}
      showModes={showModes}
      lowerIsBetter={lowerIsBetter ?? true}
      // In the MWU grid the "Mode analysis" cell should never be left blank;
      // fall back to a placeholder when there's no breakdown to show.
      showEmptyState={isMannWhitney}
    />
  );

  const comparisonSummary = (
    <>
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
        <b>Comparison result</b>: {strategy.getComparisonResult(result)} (
        {lowerIsBetter ? 'lower' : 'higher'} is better)
      </Box>
    </>
  );

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
        {isMannWhitney ? (
          // Simplified Mann-Whitney-U view: The heavier statistical components
          // are shown only when their  "Advanced options → Expanded row" checkbox
          // is on, laid out below the graph in a two-column grid so they pair up
          // (effect size + mode analysis on one row, statistics table + data warnings
          // on the next) instead of each spanning the full width.
          <Stack spacing={2}>
            <div>{comparisonSummary}</div>
            {graph}
            {anyExpandedCell && (
              <Grid container spacing={2}>
                {expandedRow.effectSize && (
                  <ExpandedCell>
                    {strategy.renderExpandedRight(result)}
                  </ExpandedCell>
                )}
                {expandedRow.modes && <ExpandedCell>{modesPanel}</ExpandedCell>}
                {expandedRow.statsTable && (
                  <ExpandedCell>
                    <MannWhitneyCompareMetrics result={mwResult} />
                  </ExpandedCell>
                )}
                {expandedRow.warnings && (
                  <ExpandedCell>
                    <StatisticsWarnings result={mwResult} />
                  </ExpandedCell>
                )}
              </Grid>
            )}
          </Stack>
        ) : (
          <>
            <Grid container spacing={2}>
              <Grid size={8}>
                <Stack spacing={2}>
                  {graph}
                  {strategy.renderExpandedLeft(result)}
                </Stack>
              </Grid>
              <Grid size={4}>
                <div>
                  {comparisonSummary}
                  {strategy.renderExpandedRight(result)}
                  {modesPanel}
                </div>
              </Grid>
            </Grid>
            <Stack>{strategy.renderExpandedBottom(result)}</Stack>
          </>
        )}
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
