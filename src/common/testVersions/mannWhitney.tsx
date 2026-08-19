import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import WarningIcon from '@mui/icons-material/Warning';
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
import { AdvancedColumns, TableConfig } from '../../types/types';
import { bootstrapMedianDiffCI } from '../../utils/bootstrap-ci';
import { adaptUnit, formatNumber } from '../../utils/format';
import { capitalize } from '../../utils/helpers';
import { getBrowserDisplay, getPlatformShortName } from '../../utils/platform';
import {
  determineSign,
  determineStatusHintClass,
} from '../../utils/revisionRowHelpers';
import { shapiroWilkTest } from '../../utils/shapiroWilk';
import { defaultSortFunction } from '../../utils/sortFunctions';
import {
  tooltipBaseMean,
  tooltipMagnitude,
  tooltipMedianDiff,
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

// Shapiro-Wilk is run twice (base + new) per call and cell renderers invoke
// this for every row on every render. Cache by the (stable) result object so
// the test runs once per result rather than once per render.
//
// A WeakMap is a lookup table whose keys are objects (here, the result object).
// "Weak" means it does not keep those objects alive: once a result is no longer
// used anywhere else (e.g. the user loads new data), it gets garbage-collected
// and its cache entry disappears on its own — so this cache never leaks memory
// and needs no manual cleanup.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap
const normalityCache = new WeakMap<MannWhitneyResultsItem, NormalityResult>();

export function checkDistributionNormality(
  result: MannWhitneyResultsItem,
): NormalityResult {
  const cached = normalityCache.get(result);
  if (cached !== undefined) return cached;

  const baseResult = shapiroWilkTest(result.base_runs);
  const newResult = shapiroWilkTest(result.new_runs);
  const baseNormal =
    baseResult !== null && baseResult.pvalue > SW_NORMALITY_THRESHOLD;
  const newNormal =
    newResult !== null && newResult.pvalue > SW_NORMALITY_THRESHOLD;
  const value: NormalityResult =
    baseNormal && newNormal
      ? 'both'
      : baseNormal || newNormal
        ? 'one'
        : 'neither';

  normalityCache.set(result, value);
  return value;
}

export function isDistributionNormal(result: MannWhitneyResultsItem): boolean {
  return checkDistributionNormality(result) !== 'neither';
}

function medianOf(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

// Δ median as a signed percentage of the base median, computed from the raw
// runs. This is the same basis as the expanded panel's "Δ median" blurb
// (bootstrapMedianDiffCI's point estimate is median(new) - median(base) over
// the same runs), so the column and the panel always agree.
//
// Cached by the (stable) result object (see the WeakMap note on normalityCache
// above): this is called per row on every render and, in the Δ Median % sort
// comparator, on every comparison — recomputing the median (which sorts both
// run arrays) each time would be wasteful.
const medianDiffPctCache = new WeakMap<MannWhitneyResultsItem, number | null>();

export function medianDiffPct(result: MannWhitneyResultsItem): number | null {
  const cached = medianDiffPctCache.get(result);
  if (cached !== undefined) return cached;

  const baseMedian = medianOf(result.base_runs ?? []);
  const newMedian = medianOf(result.new_runs ?? []);
  let value: number | null;
  if (baseMedian === null || newMedian === null) {
    // No data to compute from → "-".
    value = null;
  } else if (baseMedian === 0) {
    // A zero base median yields 0% rather than an undefined division.
    value = 0;
  } else {
    value = ((newMedian - baseMedian) / baseMedian) * 100;
  }

  medianDiffPctCache.set(result, value);
  return value;
}

export function formatMedianDiffPct(pct: number): string {
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%`;
}

// Status cell: the direction of change (Improvement/Regression/No change),
// with a "Noise" label above it when the result isn't statistically
// significant. The Significance column is hidden by default (it's an advanced
// column), so this keeps the noise signal visible in the simplified view.
// Shared by the main and subtests rows so they render identically.
function renderStatusCell(
  directionOfChange: MannWhitneyResultsItem['direction_of_change'],
  isNoise: boolean,
) {
  const isImprovement = directionOfChange === 'improvement';
  const isRegression = directionOfChange === 'regression';
  return (
    <div className='status cell' role='cell'>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {isNoise ? (
          <Box
            className='noise-label'
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: 600,
              lineHeight: 1.2,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
              color: 'text.secondary',
              bgcolor: 'action.hover',
            }}
          >
            Noise
          </Box>
        ) : null}
        <Box
          sx={{
            bgcolor: isImprovement
              ? 'status.improvement'
              : isRegression
                ? 'status.regression'
                : 'none',
          }}
          className={`status-hint ${determineStatusHintClass(
            isImprovement,
            isRegression,
          )}`}
        >
          {isImprovement ? <ThumbUpIcon color='success' /> : null}
          {isRegression ? <ThumbDownIcon color='error' /> : null}
          {capitalize(directionOfChange ?? '')}
        </Box>
      </Box>
    </div>
  );
}

// Single source of truth for the check, used by the Status cell /
// filter and the Significance cell.
function resultIsNoise(result: MannWhitneyResultsItem): boolean {
  return result.mann_whitney_test?.interpretation === 'not significant';
}

// Magnitude cell — the plain-language Cliff's Delta interpretation
// (negligible/small/medium/large). Shown only in the simplified view; the
// numeric CD column covers it once advanced columns are on. Shared by the
// main and subtests rows.
function renderMagnitudeCell(interpretation: string) {
  return (
    <div className='magnitude cell' role='cell'>
      {interpretation ? capitalize(interpretation) : '-'}
    </div>
  );
}

// Significance cell — plain-language "Real" / "Noise" from the Mann-Whitney-U
// interpretation. Only shown when the (advanced) Significance column is on.
// Shared by the main and subtests rows.
function renderSignificanceCell(interpretation: string | null | undefined) {
  return (
    <div className='significance cell' role='cell'>
      {interpretation === 'significant'
        ? 'Real'
        : interpretation === 'not significant'
          ? 'Noise'
          : '-'}
    </div>
  );
}

// Δ Median % cell, shared by the main and subtests rows. Shows the run-based
// median difference; a warning icon flags non-normal distributions, and "-"
// when the value can't be computed.
function renderMedianDiffCell(result: MannWhitneyResultsItem) {
  const pct = medianDiffPct(result);
  const normality = checkDistributionNormality(result);
  return (
    <div className='median-diff cell' role='cell'>
      {pct === null ? (
        '-'
      ) : (
        <span
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          {formatMedianDiffPct(pct)}
          {normality !== 'both' && (
            <WarningIcon
              titleAccess="Distribution shapes aren't normal."
              sx={{ fontSize: '0.9rem', opacity: 0.5, ml: '4px' }}
            />
          )}
        </span>
      )}
    </div>
  );
}

export const mannWhitneyStrategy = {
  getColumns(
    isSubtestTable: boolean,
    advancedColumns: AdvancedColumns,
  ): TableConfig {
    const {
      cliffsDelta: showCliffsDelta,
      cles: showCles,
      significance: showSignificance,
    } = advancedColumns;
    // Whether an effect-size advanced column (CD/CLES) is showing — used to
    // widen Δ Median %, hide the plain-language Magnitude column, and abbreviate
    // the Significance header so it doesn't crowd Total Trials. Significance is
    // its own independent toggle and doesn't affect these.
    const anyAdvanced = showCliffsDelta || showCles;
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
        name: 'Δ Median',
        key: 'median-diff',
        gridWidth: '1.5fr',
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          // Normalize so positive means "improved" regardless of whether lower
          // or higher is better. Uses the same run-based Δ median % the cell
          // displays, so sort order matches the shown values.
          const normalizedDiffPct = (r: MannWhitneyResultsItem) => {
            const pct = medianDiffPct(r) ?? 0;
            return r.lower_is_better ? -pct : pct;
          };

          return normalizedDiffPct(resultB) - normalizedDiffPct(resultA);
        },
        tooltip: tooltipMedianDiff,
      },
      {
        name: 'Status',
        filter: true,
        key: 'status',
        gridWidth: '1.5fr',
        possibleValues: [
          { label: 'No changes', key: 'none' },
          { label: 'Improvement', key: 'improvement' },
          { label: 'Regression', key: 'regression' },
          { label: 'Noise', key: 'noise' },
        ],
        matchesFunction(result: MannWhitneyResultsItem, valueKey: string) {
          // Noise is mutually exclusive with the direction buckets: a noisy
          // (not-significant) row belongs to "Noise" only, so unchecking Noise
          // hides it, and the direction buckets match only real changes.
          if (valueKey === 'noise') {
            return resultIsNoise(result);
          }
          if (resultIsNoise(result)) {
            return false;
          }
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
      ...(!anyAdvanced
        ? [
            {
              name: 'Magnitude',
              filter: true,
              key: 'magnitude',
              gridWidth: '1.55fr',
              possibleValues: [
                { label: 'Negligible', key: 'negligible' },
                { label: 'Small', key: 'small' },
                { label: 'Medium', key: 'medium' },
                { label: 'Large', key: 'large' },
              ],
              matchesFunction(
                result: MannWhitneyResultsItem,
                valueKey: string,
              ) {
                return result.cliffs_interpretation === valueKey;
              },
              sortFunction(
                resultA: MannWhitneyResultsItem,
                resultB: MannWhitneyResultsItem,
              ) {
                // The interpretation buckets derive from |Cliff's Delta|, so
                // sorting by that magnitude matches the label order
                // (negligible → large).
                return (
                  Math.abs(resultA.cliffs_delta) -
                  Math.abs(resultB.cliffs_delta)
                );
              },
              tooltip: tooltipMagnitude,
            },
          ]
        : []),
      ...(showCliffsDelta
        ? [
            {
              name: 'CD',
              key: 'delta',
              gridWidth: '1fr',
              sortFunction(
                resultA: MannWhitneyResultsItem,
                resultB: MannWhitneyResultsItem,
              ) {
                return (
                  Math.abs(resultA.cliffs_delta) -
                  Math.abs(resultB.cliffs_delta)
                );
              },
              tooltip: tooltipCliffsDelta,
            },
          ]
        : []),
      ...(showCles
        ? [
            {
              name: 'CLES',
              key: 'effects',
              gridWidth: '1.25fr',
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
          ]
        : []),
      // Significance is a power-user column, hidden by default and toggled from
      // the "Advanced columns" dropdown. The noise signal is still surfaced in
      // the simplified view via the Status cell / filter below. When shown
      // alongside CD/CLES the header is crowded, so abbreviate to "Sig";
      // otherwise the full "Significance" label fits.
      ...(showSignificance
        ? [
            {
              name: anyAdvanced ? 'Sig' : 'Significance',
              key: 'significance',
              filter: true,
              gridWidth: '1.25fr',
              tooltip: tooltipSignificance,
              possibleValues: [
                // Plain-language labels matching the cell text; the keys still
                // map to the backend's "significant" / "not significant"
                // interpretation.
                { label: 'Real', key: 'significant' },
                { label: 'Noise', key: 'not significant' },
              ],
              matchesFunction(
                result: MannWhitneyResultsItem,
                valueKey: string,
              ) {
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
          ]
        : []),

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

  renderSubtestColumns(
    result: CombinedResultsItemType,
    expanded: boolean,
    advancedColumns: AdvancedColumns,
  ) {
    const {
      test,
      cliffs_delta,
      cliffs_interpretation,
      mann_whitney_test,
      cles,
      direction_of_change,
      base_measurement_unit: baseUnit,
      new_measurement_unit: newUnit,
      base_app: baseApp,
      new_app: newApp,
    } = result as MannWhitneyResultsItem;
    const clesVal = cles?.cles != null ? (cles.cles * 100).toFixed(2) : null;
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
        {renderMedianDiffCell(result as MannWhitneyResultsItem)}
        {renderStatusCell(
          direction_of_change,
          resultIsNoise(result as MannWhitneyResultsItem),
        )}
        {!advancedColumns.cliffsDelta &&
          !advancedColumns.cles &&
          renderMagnitudeCell(cliffs_interpretation)}
        {advancedColumns.cliffsDelta && (
          <div className='delta cell' role='cell'>
            {' '}
            {cliffs_delta || '-'}
          </div>
        )}
        {advancedColumns.cles && (
          <div className='effects cell' role='cell'>
            {clesVal !== null ? `${clesVal}% ` : '-'}
          </div>
        )}
        {advancedColumns.significance &&
          renderSignificanceCell(mann_whitney_test?.interpretation)}
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
    // A BCa CI needs at least 2 runs per side (see bootstrapMedianDiffCI);
    // with fewer it returns null and we render no interval rather than NaNs.
    const ci =
      baseRuns.length >= 2 && newRuns.length >= 2
        ? bootstrapMedianDiffCI(baseRuns, newRuns)
        : null;
    const rawUnit =
      mwResult.base_measurement_unit ?? mwResult.new_measurement_unit ?? 'ms';
    const { fmt, displayUnit } = ci
      ? adaptUnit([ci.medianDiff, ci.ciLow, ci.ciHigh], rawUnit)
      : adaptUnit([], rawUnit);
    const ciCrossesZero = ci && ci.ciLow < 0 && ci.ciHigh > 0;
    // Same run-based Δ median % the column shows, formatted identically.
    const pctDiff = medianDiffPct(mwResult);
    const summary = ci ? (
      <span>
        <strong>Δ median</strong> = {fmt(ci.medianDiff)} {displayUnit}
        {pctDiff !== null ? ` (${formatMedianDiffPct(pctDiff)})` : ''} 95% CI [
        {fmt(ci.ciLow)}, {fmt(ci.ciHigh)}]
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

  renderColumns(
    result: CombinedResultsItemType,
    advancedColumns: AdvancedColumns,
  ) {
    const mwResult = result as MannWhitneyResultsItem;
    const {
      cliffs_delta,
      cliffs_interpretation,
      direction_of_change,
      mann_whitney_test,
      cles,
    } = mwResult;
    const clesValue =
      cles?.cles != null ? `${(cles.cles * 100).toFixed(2)} %` : '-';

    return (
      <>
        {renderMedianDiffCell(mwResult)}
        {renderStatusCell(direction_of_change, resultIsNoise(mwResult))}
        {!advancedColumns.cliffsDelta &&
          !advancedColumns.cles &&
          renderMagnitudeCell(cliffs_interpretation)}
        {advancedColumns.cliffsDelta && (
          <div className='delta cell' role='cell'>
            {cliffs_delta || '-'}
          </div>
        )}
        {advancedColumns.cles && (
          <div className='effects cell' role='cell'>
            {clesValue}
          </div>
        )}
        {advancedColumns.significance &&
          renderSignificanceCell(mann_whitney_test?.interpretation)}
      </>
    );
  },
};
