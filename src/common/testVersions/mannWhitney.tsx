import KeyboardDoubleArrowUpIcon from '@mui/icons-material/KeyboardDoubleArrowUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import { MannWhitneyCompareMetrics } from '../../components/CompareResults/MannWhitneyCompareMetrics';
import PValCliffsDeltaComp from '../../components/CompareResults/PValCliffsDeltaComp';
import { StatisticsWarnings } from '../../components/CompareResults/StatisticsWarnings';
import { FontSize } from '../../styles';
import {
  CombinedResultsItemType,
  MannWhitneyResultsItem,
} from '../../types/state';
import { TableConfig } from '../../types/types';
import { bootstrapMedianDiffCI } from '../../utils/bootstrap-ci';
import { adaptUnit, formatNumber } from '../../utils/format';
import { capitalize } from '../../utils/helpers';
import { computeModalityAnalysis } from '../../utils/kdeAnalysis';
import { getBrowserDisplay, getPlatformShortName } from '../../utils/platform';
import {
  determineSign,
  determineStatusHintClass,
} from '../../utils/revisionRowHelpers';
import { shapiroWilkTest } from '../../utils/shapiroWilk';
import { defaultSortFunction } from '../../utils/sortFunctions';
import {
  tooltipBaseMean,
  tooltipModeDelta,
  tooltipNewMean,
  tooltipSignificance,
  tooltipStatusMannWhitney,
  tooltipTotalRuns,
} from '../constants';

const tooltipCliffsDelta = (
  <span>
    Cliff&apos;s Delta (CD) shows how different the New and Base results are. A
    score near 0 means little difference. A score above 0.47 or below -0.47
    means a large difference. A negative score means New values are usually
    higher. See the{' '}
    <a
      href='https://firefox-source-docs.mozilla.org/testing/perfdocs/perfcompare.html#cliffs-delta'
      target='_blank'
      rel='noreferrer'
    >
      documentation
    </a>{' '}
    for more information on how to interpret the Cliff’s Delta score.
  </span>
);

const tooltipEffectSize = (
  <span>
    The Common Language Effect Size (CLES) shows the chance that a New value is
    lower than a Base value. A score near 50% means New and Base are about
    equally likely to be higher. The farther the score is from 50%, the clearer
    the difference. See the{' '}
    <a
      href='https://firefox-source-docs.mozilla.org/testing/perfdocs/perfcompare.html#cliffs-delta'
      target='_blank'
      rel='noreferrer'
    >
      documentation
    </a>{' '}
    for more information on how to interpret the CLES score.
  </span>
);

const PLATFORM_FILTER_VALUES = [
  { label: 'Windows', key: 'windows' },
  { label: 'macOS', key: 'osx' },
  { label: 'Linux', key: 'linux' },
  { label: 'Android', key: 'android' },
  { label: 'iOS', key: 'ios' },
];

const SW_NORMALITY_THRESHOLD = 0.2;

type NormalityResult = 'both' | 'one' | 'neither';

export function checkDistributionNormality(
  result: MannWhitneyResultsItem,
): NormalityResult {
  const baseResult = shapiroWilkTest(result.base_runs);
  const newResult = shapiroWilkTest(result.new_runs);
  const baseNormal =
    baseResult !== null && baseResult.pvalue > SW_NORMALITY_THRESHOLD;
  const newNormal =
    newResult !== null && newResult.pvalue > SW_NORMALITY_THRESHOLD;
  if (baseNormal && newNormal) return 'both';
  if (baseNormal || newNormal) return 'one';
  return 'neither';
}

export function isDistributionNormal(result: MannWhitneyResultsItem): boolean {
  return checkDistributionNormality(result) !== 'neither';
}

/**
 * Lazily run (and cache) the client-side modality analysis for a single
 * row. The first call computes KDE + mode detection + matchModes; every
 * subsequent call returns immediately. Same lazy strategy as
 * `getBootstrapCi` for the Sig column — keeps the loader cheap at the
 * cost of a one-time burst when the user engages with the Mode Δ column.
 *
 * Cached fields on the result: `modeDeltaPct`, `baseModeCount`,
 * `newModeCount`. The presence of `modeDeltaPct !== undefined` is the
 * "already computed" sentinel (null distinguishes "computed but couldn't
 * yield a value" — too few samples / no matched pairs).
 *
 * `isSubtest` controls the bandwidth strategy used by KDE: subtest tables
 * use ISJ, top-level tables use the wider SJ approximation. Pass the same
 * value the column config's `getColumns(isSubtestTable)` was created with.
 */
export function ensureModalityAnalysis(
  result: MannWhitneyResultsItem,
  isSubtest: boolean,
): void {
  if (result.modeDeltaPct !== undefined) return;
  // Prefer replicates when present — same selection KdeModesPanel and the
  // chart use in RevisionRowExpandable. Otherwise the cached counts /
  // peak-shift would run KDE on fewer samples than the blurb, and the
  // Distribution Interpretation row could disagree with the blurb.
  const baseValues =
    result.base_runs_replicates && result.base_runs_replicates.length
      ? result.base_runs_replicates
      : (result.base_runs ?? []);
  const newValues =
    result.new_runs_replicates && result.new_runs_replicates.length
      ? result.new_runs_replicates
      : (result.new_runs ?? []);
  const analysis = computeModalityAnalysis(baseValues, newValues, isSubtest);
  result.modeDeltaPct = analysis.largestPeakShiftPct;
  result.baseModeCount = analysis.baseModes.peakLocs.length;
  result.newModeCount = analysis.newModes.peakLocs.length;
}

/**
 * Format the Mode Δ cell text:
 *   - cached number   → "X.XX %"
 *   - cached `null`   → "No modes"  (modality pipeline ran, no usable pair)
 *   - uncached        → "~X.XX %" using the backend's `delta_percentage`,
 *                       prefixed with `~` to signal "approximate, click
 *                       the column to compute the real Mode Δ"
 *   - no fallback     → "No modes"
 *
 * Cell renders run for EVERY row on every render. Triggering the modality
 * pipeline here would re-introduce the per-row load cost the lazy
 * refactor removed. So cells stay cheap; the real value populates after
 * the first sort click via `ensureModalityAnalysis`.
 */
function formatModeDelta(result: MannWhitneyResultsItem): string {
  const cached = result.modeDeltaPct;
  if (typeof cached === 'number') return `${cached.toFixed(2)} %`;
  if (cached === null) return 'No modes';
  // Not yet computed — fall back to the backend's median diff percentage.
  const fallback = result.delta_percentage;
  if (typeof fallback === 'number' && Number.isFinite(fallback)) {
    return `~${fallback.toFixed(2)} %`;
  }
  return 'No modes';
}

export const mannWhitneyStrategy = {
  getColumns(isSubtestTable: boolean): TableConfig {
    const platformConfig = isSubtestTable
      ? {
          name: 'Subtests',
          key: 'subtests',
          gridWidth: '1.5fr',
          sortFunction: defaultSortFunction,
        }
      : {
          name: 'Platform',
          filter: true,
          key: 'platform',
          gridWidth: '1.5fr',
          possibleValues: PLATFORM_FILTER_VALUES,
          matchesFunction(result: MannWhitneyResultsItem, valueKey: string) {
            const label = this.possibleValues.find(
              ({ key }) => key === valueKey,
            )?.label;
            return getPlatformShortName(result.platform) === label;
          },
        };

    const colWidthMultiply = isSubtestTable ? 1 : 2.5;

    return [
      platformConfig,
      {
        name: 'Base',
        key: 'base',
        gridWidth: '1fr',
        tooltip: tooltipBaseMean,
      },
      { key: 'comparisonSign', gridWidth: '0.25fr' },
      { name: 'New', key: 'new', gridWidth: '1fr', tooltip: tooltipNewMean },
      {
        name: 'Mode Δ (%)',
        key: 'mode-delta',
        gridWidth: '1.75fr',
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          // ASC semantics — useTableSort swaps args for DESC. So in DESC
          // mode this produces "biggest improvement first" (largest
          // normalized first); in ASC mode the inverse. The normalization
          // makes a positive value always mean "improved" regardless of
          // metric direction; rows without a computed shift sort as 0.
          //
          // First sort-click pays the modality-pipeline cost across all
          // rows (the comparator is invoked O(n log n) times but each row
          // is computed only once and cached via `ensureModalityAnalysis`).
          // Subsequent sorts are free.
          ensureModalityAnalysis(resultA, isSubtestTable);
          ensureModalityAnalysis(resultB, isSubtestTable);
          const normalized = (r: MannWhitneyResultsItem) => {
            const pct = r.modeDeltaPct ?? 0;
            return r.lower_is_better ? -pct : pct;
          };
          return normalized(resultA) - normalized(resultB);
        },
        tooltip: tooltipModeDelta,
        tooltipIcon: true,
      },
      {
        name: 'Status',
        filter: true,
        key: 'status',
        gridWidth: '1.75fr',
        tooltipIcon: true,
        possibleValues: [
          { label: 'No changes', key: 'none' },
          { label: 'Improvement', key: 'improvement' },
          { label: 'Regression', key: 'regression' },
        ],
        matchesFunction(result: MannWhitneyResultsItem, valueKey: string) {
          switch (valueKey) {
            case 'improvement':
              return result.direction_of_change === 'improvement';
            case 'regression':
              return result.direction_of_change === 'regression';
            default:
              return (
                !result.direction_of_change ||
                result.direction_of_change === 'no change'
              );
          }
        },
        tooltip: tooltipStatusMannWhitney,
      },
      {
        name: 'CD',
        key: 'delta',
        gridWidth: '1.25fr',
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          return (
            Math.abs(resultA.cliffs_delta) - Math.abs(resultB.cliffs_delta)
          );
        },
        tooltip: tooltipCliffsDelta,
        tooltipIcon: true,
      },
      {
        name: 'CLES (%)',
        key: 'effects',
        gridWidth: '1.5fr',
        tooltipIcon: true,
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          return (
            Math.abs((resultA.cles?.cles ?? 0.5) - 0.5) -
            Math.abs((resultB.cles?.cles ?? 0.5) - 0.5)
          );
        },
        tooltip: tooltipEffectSize,
      },
      {
        name: 'Sig',
        key: 'significance',
        filter: true,
        gridWidth: '1.5fr',
        tooltip: tooltipSignificance,
        tooltipIcon: true,
        possibleValues: [
          {
            label: 'Significant',
            key: 'significant',
            icon: <KeyboardDoubleArrowUpIcon fontSize='small' />,
          },
          {
            label: 'Not Significant',
            key: 'not significant',
            icon: <div>-</div>,
          },
        ],
        matchesFunction(result: MannWhitneyResultsItem, valueKey: string) {
          return result.mann_whitney_test?.interpretation === valueKey;
        },
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          return (
            Math.abs(resultA.mann_whitney_test?.pvalue ?? 0) -
            Math.abs(resultB.mann_whitney_test?.pvalue ?? 0)
          );
        },
      },

      {
        name: 'Total Trials',
        key: 'trials',
        gridWidth: '1fr',
        tooltip: tooltipTotalRuns,
      },
      { key: 'buttons', gridWidth: `calc(${colWidthMultiply} * 34px)` },
      { key: 'expand', gridWidth: '34px' },
    ] as TableConfig;
  },

  getAvgValues(result: CombinedResultsItemType) {
    const resultItem = result as MannWhitneyResultsItem;
    return {
      baseAvg: resultItem.base_standard_stats?.mean ?? null,
      newAvg: resultItem.new_standard_stats?.mean ?? null,
    };
  },

  renderSubtestColumns(result: CombinedResultsItemType, expanded: boolean) {
    const {
      test,
      cliffs_delta,
      mann_whitney_test,
      cles,
      direction_of_change,
      base_measurement_unit: baseUnit,
      new_measurement_unit: newUnit,
      base_app: baseApp,
      new_app: newApp,
    } = result as MannWhitneyResultsItem;
    const clesVal = ((cles?.cles ?? 0) * 100).toFixed(2);
    const baseAvgValue =
      (result as MannWhitneyResultsItem).base_standard_stats?.mean ?? 0;
    const newAvgValue =
      (result as MannWhitneyResultsItem).new_standard_stats?.mean ?? 0;
    return (
      <>
        <div title={test} className='subtests subtests-mannwhitney' role='cell'>
          {test}
        </div>
        <div className='mann-witney-browser-name cell' role='cell'>
          {formatNumber(baseAvgValue)} {baseUnit}
          {getBrowserDisplay(baseApp, newApp, expanded) && (
            <span className={FontSize.xSmall}>({baseApp})</span>
          )}
        </div>
        <div className='comparison-sign cell' role='cell'>
          {determineSign(baseAvgValue, newAvgValue)}
        </div>
        <div className='mann-witney-browser-name cell' role='cell'>
          {formatNumber(newAvgValue)} {newUnit}
          {getBrowserDisplay(baseApp, newApp, expanded) && (
            <span className={FontSize.xSmall}>({newApp})</span>
          )}
        </div>
        <div className='mode-delta cell' role='cell'>
          {formatModeDelta(result as MannWhitneyResultsItem)}
        </div>
        <div className='status cell' role='cell'>
          <Box
            sx={{
              bgcolor:
                direction_of_change === 'improvement'
                  ? 'status.improvement'
                  : direction_of_change === 'regression'
                    ? 'status.regression'
                    : 'none',
            }}
            className={`status-hint ${determineStatusHintClass(
              direction_of_change === 'improvement',
              direction_of_change === 'regression',
            )}`}
          >
            {direction_of_change === 'improvement' ? (
              <ThumbUpIcon color='success' />
            ) : null}
            {direction_of_change === 'regression' ? (
              <ThumbDownIcon color='error' />
            ) : null}
            {capitalize(direction_of_change ?? '')}
          </Box>
        </div>
        <div className='delta cell' role='cell'>
          {' '}
          {cliffs_delta || '-'}
        </div>

        <div className='effects cell' role='cell'>
          {clesVal ? `${clesVal}% ` : '-'}
        </div>
        <div className='significance cell' role='cell'>
          {mann_whitney_test?.interpretation === 'significant' ? (
            <KeyboardDoubleArrowUpIcon fontSize='small' />
          ) : (
            '-'
          )}
        </div>
      </>
    );
  },

  renderExpandedLeft() {
    return null;
  },

  getComparisonResult(result: CombinedResultsItemType) {
    return capitalize(
      (result as MannWhitneyResultsItem).direction_of_change ?? '',
    );
  },

  isRegression(result: CombinedResultsItemType): boolean {
    return (
      (result as MannWhitneyResultsItem).direction_of_change === 'regression'
    );
  },

  isImprovement(result: CombinedResultsItemType): boolean {
    return (
      (result as MannWhitneyResultsItem).direction_of_change === 'improvement'
    );
  },

  renderExpandedRight(result: CombinedResultsItemType) {
    const mwResult = result as MannWhitneyResultsItem;
    const { cles, cles_direction, mann_whitney_u_cles } = mwResult.cles ?? {
      cles: '',
      cles_direction: '',
      mann_whitney_u_cles: '',
    };
    const { cliffs_delta, cliffs_interpretation } = mwResult;
    const pValue = mwResult.mann_whitney_test?.pvalue;
    const p_value_cles = mwResult.mann_whitney_test?.interpretation
      ? capitalize(mwResult.mann_whitney_test.interpretation)
      : '';

    const baseRuns = mwResult.base_runs ?? [];
    const newRuns = mwResult.new_runs ?? [];
    const ci =
      baseRuns.length > 0 && newRuns.length > 0
        ? bootstrapMedianDiffCI(baseRuns, newRuns)
        : null;
    const rawUnit =
      mwResult.base_measurement_unit ?? mwResult.new_measurement_unit ?? 'ms';
    const { fmt, displayUnit } = ci
      ? adaptUnit([ci.medianDiff, ci.ciLow, ci.ciHigh], rawUnit)
      : adaptUnit([], rawUnit);
    const ciCrossesZero = ci && ci.ciLow < 0 && ci.ciHigh > 0;
    const baseMedian = (() => {
      if (!baseRuns.length) return null;
      const s = [...baseRuns].sort((a, b) => a - b);
      const m = Math.floor(s.length / 2);
      return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
    })();
    const pctDiff =
      baseMedian && ci ? ((ci.medianDiff / baseMedian) * 100).toFixed(1) : null;
    const summary = ci ? (
      <span>
        <strong>Δ median</strong> = {fmt(ci.medianDiff)} {displayUnit}
        {pctDiff !== null
          ? ` (${Number(pctDiff) >= 0 ? '+' : ''}${pctDiff}%)`
          : ''}{' '}
        95% CI [{fmt(ci.ciLow)}, {fmt(ci.ciHigh)}]
        {ciCrossesZero
          ? ' ⚠ interval includes zero — effect direction uncertain'
          : ''}
      </span>
    ) : null;
    const confidenceInterval = ci && (
      <span>
        <strong>Confidence Interval</strong>: We are 95% confident the median
        difference is between <strong>{fmt(ci.ciLow)}</strong> and{' '}
        <strong>{fmt(ci.ciHigh)}</strong>
      </span>
    );

    return (
      <>
        <PValCliffsDeltaComp
          cliffs_delta={cliffs_delta}
          cliffs_interpretation={cliffs_interpretation}
          pValue={pValue}
          p_value_cles={p_value_cles}
          cles={cles}
          cles_direction={cles_direction}
        />
        <Alert severity='info'>
          <strong>Effect Size:</strong> {mann_whitney_u_cles}
        </Alert>
        {summary && <Alert severity='info'>{summary}</Alert>}
        {confidenceInterval && (
          <Alert severity='info'>{confidenceInterval}</Alert>
        )}
      </>
    );
  },

  renderExpandedBottom(result: CombinedResultsItemType) {
    const mwResult = result as MannWhitneyResultsItem;
    return (
      <div style={{ display: 'flex' }}>
        <MannWhitneyCompareMetrics result={mwResult} />
        <StatisticsWarnings result={mwResult} />
      </div>
    );
  },

  renderColumns(result: CombinedResultsItemType) {
    const mwResult = result as MannWhitneyResultsItem;
    const { cliffs_delta, direction_of_change, mann_whitney_test, cles } =
      mwResult;
    const clesValue = cles?.cles ? `${(cles.cles * 100).toFixed(2)} %` : '-';

    return (
      <>
        <div className='mode-delta cell' role='cell'>
          {formatModeDelta(mwResult)}
        </div>
        <div className='status cell' role='cell'>
          <Box
            sx={{
              bgcolor:
                direction_of_change === 'improvement'
                  ? 'status.improvement'
                  : direction_of_change === 'regression'
                    ? 'status.regression'
                    : 'none',
            }}
            className={`status-hint ${determineStatusHintClass(
              direction_of_change === 'improvement',
              direction_of_change === 'regression',
            )}`}
          >
            {direction_of_change === 'improvement' ? (
              <ThumbUpIcon color='success' />
            ) : null}
            {direction_of_change === 'regression' ? (
              <ThumbDownIcon color='error' />
            ) : null}
            {capitalize(direction_of_change ?? '')}
          </Box>
        </div>
        <div className='delta cell' role='cell'>
          {cliffs_delta || '-'}
        </div>
        <div className='effects cell' role='cell'>
          {clesValue}
        </div>
        <div className='significance cell' role='cell'>
          {mann_whitney_test?.interpretation === 'significant' ? (
            <KeyboardDoubleArrowUpIcon fontSize='small' />
          ) : (
            '-'
          )}
        </div>
      </>
    );
  },
};
