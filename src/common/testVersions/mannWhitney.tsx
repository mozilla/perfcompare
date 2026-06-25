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
import { TableConfig } from '../../types/types';
import {
  bootstrapMedianDiffCI,
  type BootstrapCI,
} from '../../utils/bootstrap-ci';
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
  tooltipMedianDiff,
  tooltipNewMean,
  tooltipSignificance,
  tooltipStatusMannWhitney,
  tooltipTotalRuns,
} from '../constants';

const tooltipCliffsDelta = (
  <span>
    <a
      href='https://en.wikipedia.org/wiki/Effect_size#Effect_size_for_ordinal_data'
      target='_blank'
      rel='noreferrer'
    >
      Cliff&apos;s Delta
    </a>{' '}
    quantifies the magnitude of the difference between Base and New values.
    Anything beyond ±0.47 is considered a large difference while anything below
    ±0.15 is negligible. A negative value means a New value is consistently
    larger than a Base value.
  </span>
);

const tooltipEffectSize = (
  <span>
    <a
      href='https://en.wikipedia.org/wiki/Probability_of_superiority'
      target='_blank'
      rel='noreferrer'
    >
      The Common Language Effect Size (CLES)
    </a>{' '}
    is a percentage, from 0% to 100%, providing a clearer indication of how
    large or meaningful the change is. An improvement or regression being shown
    here means that the effect size is meaningful. If the effect size is close
    to 50%, the distributions are probably identical, if not, they probably
    differ. The sign of the Cliff&apos;s delta is also important, as it
    indicates the direction of the change. If shifted to the left, it&apos;s
    negative; to the right, it&apos;s positive. Pair this with higher is better
    or lower is better to understand whether the change is an improvement or
    regression. For example, given a Cliff&apos;s delta of 0.54 and CLES of 77%,
    there&apos;s a 77% chance a value from new is lower than a value from old
    (lower is better).
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

// Cap on the per-side sample count fed into BCa. Replicates arrays can
// run 300–600 values; BCa cost is roughly proportional to sample size, so
// uncapped it dominates page load on tables with many rows. CI quality is
// dominated by iteration count above ~50–100 samples — capping here keeps
// the interval statistically equivalent while bounding cost.
const BOOTSTRAP_SAMPLE_CAP = 100;
// Fewer iterations than bootstrap-ci.ts's 9999 default. 1999 is still
// well above the textbook BCa minimum (~1000) and ~5× cheaper.
const BOOTSTRAP_ITERATIONS = 1999;

// Stride-based subsample: pick `cap` evenly-spaced values from a larger
// array. Deterministic (no RNG), preserves the full distribution shape,
// and is O(cap) regardless of input length.
function downsampleForBootstrap(values: number[]): number[] {
  if (values.length <= BOOTSTRAP_SAMPLE_CAP) return values;
  const out: number[] = new Array<number>(BOOTSTRAP_SAMPLE_CAP);
  const stride = values.length / BOOTSTRAP_SAMPLE_CAP;
  for (let i = 0; i < BOOTSTRAP_SAMPLE_CAP; i++) {
    out[i] = values[Math.floor(i * stride)];
  }
  return out;
}

// Resolve a row's KDE/BCa input sample set: prefer replicates over the
// aggregated runs. Mirrors RevisionRowExpandable's selection for the chart
// and KdeModesPanel so every view of the row uses the same underlying data.
// Returned arrays are NOT downsampled — callers feeding BCa should pass
// them through `downsampleForBootstrap` first.
function runsFor(result: MannWhitneyResultsItem): {
  baseRuns: number[];
  newRuns: number[];
} {
  const baseRuns =
    result.base_runs_replicates && result.base_runs_replicates.length
      ? result.base_runs_replicates
      : (result.base_runs ?? []);
  const newRuns =
    result.new_runs_replicates && result.new_runs_replicates.length
      ? result.new_runs_replicates
      : (result.new_runs ?? []);
  return { baseRuns, newRuns };
}

/**
 * Lazily compute (and cache) the bootstrap (BCa) [see
 * src/utils/bootstrap-ci.ts#L163-L203] CI for the difference of medians
 * on a single row.
 *
 * The lazy strategy: at load time we do NO BCa work (matches production
 * speed). The Sig column's `matchesFunction`/`sortFunction`/cell-render
 * call this helper as needed. Result is cached on `result.bootstrapCi`
 * so the second click on the column is free.
 *
 * `undefined` vs `null`:
 *   - `undefined` ⇒ never computed
 *   - `null`      ⇒ computed but couldn't produce a CI (< 2 samples)
 * We check `=== undefined` instead of `?? null` to keep that distinction.
 *
 * Uses the replicates-preferred sample selection (via `runsFor`) and the
 * downsampled-for-BCa cap so per-row cost stays bounded regardless of how
 * many replicates the backend ships. See `BOOTSTRAP_SAMPLE_CAP` and
 * `BOOTSTRAP_ITERATIONS` above.
 */
export function getBootstrapCi(
  result: MannWhitneyResultsItem,
): BootstrapCI | null {
  if (result.bootstrapCi !== undefined) return result.bootstrapCi;
  const { baseRuns, newRuns } = runsFor(result);
  const baseSamples = downsampleForBootstrap(baseRuns);
  const newSamples = downsampleForBootstrap(newRuns);
  const ci =
    baseSamples.length >= 2 && newSamples.length >= 2
      ? bootstrapMedianDiffCI(baseSamples, newSamples, BOOTSTRAP_ITERATIONS)
      : null;
  result.bootstrapCi = ci;
  return ci;
}

// Decide whether the Sig cell should render "S" or "NS".
//
// Cell renders run for EVERY row on every render — we can't afford to
// compute BCa here at load time. So the cell uses whichever signal is
// available without forcing compute:
//   - If the CI has been cached (filter/sort has been used, or the
//     expanded-row alert ran), use it — keeps the column consistent with
//     the rest of the UI on rows the user has engaged with.
//   - Otherwise fall back to the backend's `mann_whitney_test.interpretation`
//     — close to production's pre-branch behavior and free to read.
//
// First filter/sort click populates `bootstrapCi` for all rows; from then
// on the column reads the CI-based verdict everywhere. So you only see the
// fallback on first render before any Sig interaction.
function isSignificantForDisplay(result: MannWhitneyResultsItem): boolean {
  if (result.bootstrapCi !== undefined) {
    return result.bootstrapCi?.significant ?? false;
  }
  return result.mann_whitney_test?.interpretation === 'significant';
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
        name: 'MD (%)',
        key: 'median-diff',
        gridWidth: '1fr',
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          // Compute a normalized median diff percentage where positive
          // means "improved" regardless of whether lower or higher is better.
          const normalizedDiffPct = (r: MannWhitneyResultsItem) => {
            const base = r.base_standard_stats?.median ?? 0;
            const newVal = r.new_standard_stats?.median ?? 0;
            const rawPct = base !== 0 ? ((newVal - base) / base) * 100 : 0;
            return r.lower_is_better ? -rawPct : rawPct;
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
        gridWidth: '1fr',
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          return (
            Math.abs(resultA.cliffs_delta) - Math.abs(resultB.cliffs_delta)
          );
        },
        tooltip: tooltipCliffsDelta,
      },
      {
        name: 'CLES (%)',
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
      {
        name: 'Sig',
        key: 'significance',
        filter: true,
        gridWidth: '1.25fr',
        tooltip: tooltipSignificance,
        possibleValues: [
          {
            label: 'Significant',
            key: 'significant',
            icon: <div>S</div>,
          },
          {
            label: 'Not Significant',
            key: 'not significant',
            icon: <div>NS</div>,
          },
        ],
        matchesFunction(result: MannWhitneyResultsItem, valueKey: string) {
          // Lazily compute and cache the CI on first filter-click. After
          // that, the CI is read straight from `result.bootstrapCi` on
          // every subsequent comparison/render (see getBootstrapCi above).
          const ci = getBootstrapCi(result);
          const isSig = ci?.significant ?? false;
          return (isSig ? 'significant' : 'not significant') === valueKey;
        },
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          // ASC semantics — useTableSort swaps args for DESC. So in DESC mode
          // this produces "significant first, then |medianDiff| desc"; in ASC
          // mode the inverse. Significance is the primary key, magnitude the
          // tie-breaker so the biggest changes float to the top of each group.
          //
          // First sort-click pays the BCa cost across all rows (the
          // comparator is invoked O(n log n) times but each row is computed
          // only once and cached via getBootstrapCi). Subsequent sorts are
          // free.
          const ciA = getBootstrapCi(resultA);
          const ciB = getBootstrapCi(resultB);
          const sigA = ciA?.significant ?? false;
          const sigB = ciB?.significant ?? false;
          if (sigA !== sigB) return sigA ? 1 : -1;
          const magA = Math.abs(ciA?.medianDiff ?? 0);
          const magB = Math.abs(ciB?.medianDiff ?? 0);
          return magA - magB;
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
    const mwResult = result as MannWhitneyResultsItem;
    const {
      test,
      cliffs_delta,
      cles,
      direction_of_change,
      base_measurement_unit: baseUnit,
      new_measurement_unit: newUnit,
      base_app: baseApp,
      new_app: newApp,
    } = mwResult;
    // See `isSignificantForDisplay` above — uses the cached CI when one
    // exists and falls back to the backend interpretation otherwise.
    // Computing BCa here on every cell render would re-introduce the
    // per-row load cost we just removed.
    const sigDisplay = isSignificantForDisplay(mwResult) ? 'S' : 'NS';
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
        <div className='median-diff cell' role='cell'>
          {(() => {
            const mwResult = result as MannWhitneyResultsItem;
            const normality = checkDistributionNormality(mwResult);
            if (normality === 'neither') return '-';
            const baseMedian = mwResult.base_standard_stats?.median ?? 0;
            const newMedian = mwResult.new_standard_stats?.median ?? 0;
            const pct =
              baseMedian !== 0
                ? ((newMedian - baseMedian) / baseMedian) * 100
                : 0;
            return (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {`${formatNumber(pct)} %`}
                {normality === 'one' && (
                  <WarningIcon
                    titleAccess="Distribution shapes aren't normal."
                    sx={{ fontSize: '0.9rem', opacity: 0.5, ml: '4px' }}
                  />
                )}
              </span>
            );
          })()}
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
          {sigDisplay}
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

    // Prefer the precomputed CI populated by the loader. Fall back to an
    // inline compute for backwards compatibility (e.g. tests that mount the
    // strategy without going through a loader, or stale results without the
    // field). `baseRuns`/`newRuns` is the full replicates-preferred set
    // (used for the median below); the BCa fallback runs on the capped
    // downsample so it can't hang on rich-replicates rows.
    const { baseRuns, newRuns } = runsFor(mwResult);
    const ci = (() => {
      if (mwResult.bootstrapCi !== undefined) return mwResult.bootstrapCi;
      const baseSamples = downsampleForBootstrap(baseRuns);
      const newSamples = downsampleForBootstrap(newRuns);
      return baseSamples.length >= 2 && newSamples.length >= 2
        ? bootstrapMedianDiffCI(baseSamples, newSamples, BOOTSTRAP_ITERATIONS)
        : null;
    })();
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
    const {
      cliffs_delta,
      direction_of_change,
      cles,
      base_standard_stats,
      new_standard_stats,
    } = mwResult;
    // See `isSignificantForDisplay` — uses the cached CI if a filter/sort
    // populated it, otherwise the backend's interpretation. Cell renders
    // can't afford to trigger BCa on every row at load time.
    const sigDisplay = isSignificantForDisplay(mwResult) ? 'S' : 'NS';
    const clesValue = cles?.cles ? `${(cles.cles * 100).toFixed(2)} %` : '-';
    const baseMedian = base_standard_stats?.median ?? 0;
    const newMedian = new_standard_stats?.median ?? 0;
    const medianDiffPct =
      baseMedian !== 0 ? ((newMedian - baseMedian) / baseMedian) * 100 : 0;
    const normality = checkDistributionNormality(
      result as MannWhitneyResultsItem,
    );

    return (
      <>
        <div className='median-diff cell' role='cell'>
          {normality === 'neither' ? (
            '-'
          ) : (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {`${formatNumber(medianDiffPct)} %`}
              {normality === 'one' && (
                <WarningIcon
                  titleAccess="Distribution shapes aren't normal."
                  sx={{ fontSize: '0.9rem', opacity: 0.5, ml: '4px' }}
                />
              )}
            </span>
          )}
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
          {sigDisplay}
        </div>
      </>
    );
  },
};
