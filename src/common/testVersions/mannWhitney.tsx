import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import Box from '@mui/material/Box';

import { MannWhitneyCompareMetrics } from '../../components/CompareResults/MannWhitneyCompareMetrics';
import { ModeInterpretation } from '../../components/CompareResults/ModeInterpretation';
import PValCliffsDeltaComp from '../../components/CompareResults/PValCliffsDeltaComp';
import { StatisticsWarnings } from '../../components/CompareResults/StatisticsWarnings';
import { FontSize } from '../../styles';
import {
  CombinedResultsItemType,
  MannWhitneyResultsItem,
} from '../../types/state';
import { TableConfig } from '../../types/types';
import { formatNumber } from '../../utils/format';
import { capitalize } from '../../utils/helpers';
import { getBrowserDisplay, getPlatformShortName } from '../../utils/platform';
import {
  determineSign,
  determineStatusHintClass,
} from '../../utils/revisionRowHelpers';
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
        gridWidth: '.75fr',
        tooltip: tooltipBaseMean,
      },
      { key: 'comparisonSign', gridWidth: '0.25fr' },
      { name: 'New', key: 'new', gridWidth: '.75fr', tooltip: tooltipNewMean },
      {
        name: 'MD %',
        key: 'median-diff',
        gridWidth: '.75fr',
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
        gridWidth: '1.25fr',
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
        name: "Cliff's Delta",
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
      },
      {
        name: 'Significance',
        key: 'significance',
        filter: true,
        gridWidth: '1.5fr',
        tooltip: tooltipSignificance,
        possibleValues: [
          { label: 'Significant', key: 'significant' },
          { label: 'Not Significant', key: 'not significant' },
        ],
        matchesFunction(result: MannWhitneyResultsItem, valueKey: string) {
          const label = this.possibleValues.find(
            ({ key }) => key === valueKey?.toLowerCase(),
          )?.label;
          return (
            result.mann_whitney_test?.interpretation === label?.toLowerCase()
          );
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
        name: 'Effect Size (%)',
        key: 'effects',
        gridWidth: '1.25fr',
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          return (
            Math.abs(resultA.cles?.cles ?? 0) -
            Math.abs(resultB.cles?.cles ?? 0)
          );
        },
        tooltip: tooltipEffectSize,
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
    const mann_whitney_interpretation = mann_whitney_test?.interpretation
      ? capitalize(mann_whitney_test.interpretation)
      : '-';
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
            const baseMedian =
              (result as MannWhitneyResultsItem).base_standard_stats?.median ??
              0;
            const newMedian =
              (result as MannWhitneyResultsItem).new_standard_stats?.median ??
              0;
            const pct =
              baseMedian !== 0
                ? ((newMedian - baseMedian) / baseMedian) * 100
                : 0;
            return `${formatNumber(pct)} %`;
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
        <div className='significance cell' role='cell'>
          {mann_whitney_interpretation}
        </div>
        <div className='effects cell' role='cell'>
          {clesVal ? `${clesVal}% ` : '-'}
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

  renderExpandedRight(result: CombinedResultsItemType) {
    const mwResult = result as MannWhitneyResultsItem;
    const { cles, cles_direction } = mwResult.cles ?? {
      cles: '',
      cles_direction: '',
    };
    const { cliffs_delta, cliffs_interpretation } = mwResult;
    const pValue = mwResult.mann_whitney_test?.pvalue;
    const p_value_cles = mwResult.mann_whitney_test?.interpretation
      ? capitalize(mwResult.mann_whitney_test.interpretation)
      : '';

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
        <ModeInterpretation result={mwResult} />
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
    const {
      cliffs_delta,
      direction_of_change,
      mann_whitney_test,
      cles,
      base_standard_stats,
      new_standard_stats,
    } = result as MannWhitneyResultsItem;
    const clesValue = cles?.cles ? `${(cles.cles * 100).toFixed(2)} %` : '-';
    const baseMedian = base_standard_stats?.median ?? 0;
    const newMedian = new_standard_stats?.median ?? 0;
    const medianDiffPct =
      baseMedian !== 0 ? ((newMedian - baseMedian) / baseMedian) * 100 : 0;

    return (
      <>
        <div className='median-diff cell' role='cell'>
          {`${formatNumber(medianDiffPct)} %`}
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
        <div className='significance cell' role='cell'>
          {mann_whitney_test?.interpretation
            ? capitalize(mann_whitney_test.interpretation)
            : '-'}
        </div>
        <div className='effects cell' role='cell'>
          {clesValue}
        </div>
      </>
    );
  },
};
