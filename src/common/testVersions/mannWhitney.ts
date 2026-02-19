import { MannWhitneyResultsItem } from '../../types/state';
import { TableConfig } from '../../types/types';
import { getPlatformShortName } from '../../utils/platform';
import { defaultSortFunction } from '../../utils/sortFunctions';
import {
  tooltipBaseMean,
  tooltipCliffsDelta,
  tooltipEffectSize,
  tooltipNewMean,
  tooltipSignificance,
  tooltipStatusMannWhitney,
  tooltipTotalRuns,
} from '../constants';

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
        name: 'Total Runs',
        key: 'runs',
        gridWidth: '1fr',
        tooltip: tooltipTotalRuns,
      },
      { key: 'buttons', gridWidth: `calc(${colWidthMultiply} * 34px)` },
      { key: 'expand', gridWidth: '34px' },
    ] as TableConfig;
  },
};
