import { CompareResultsItem } from '../../types/state';
import { TableConfig } from '../../types/types';
import { getPlatformShortName } from '../../utils/platform';
import { defaultSortSubtestFunction } from '../../utils/sortFunctions';
import {
  tooltipBaseMean,
  tooltipConfidence,
  tooltipDelta,
  tooltipNewMean,
  tooltipTotalRuns,
} from '../constants';

const PLATFORM_FILTER_VALUES = [
  { label: 'Windows', key: 'windows' },
  { label: 'macOS', key: 'osx' },
  { label: 'Linux', key: 'linux' },
  { label: 'Android', key: 'android' },
  { label: 'iOS', key: 'ios' },
];

export const studentTStrategy = {
  getColumns(isSubtestTable: boolean): TableConfig {
    const platformConfig = isSubtestTable
      ? {
          name: 'Subtests',
          key: 'subtests',
          gridWidth: '3fr',
          sortFunction: defaultSortSubtestFunction,
        }
      : {
          name: 'Platform',
          filter: true,
          key: 'platform',
          gridWidth: '2fr',
          possibleValues: PLATFORM_FILTER_VALUES,
          matchesFunction(result: CompareResultsItem, valueKey: string) {
            const label = this.possibleValues.find(
              ({ key }) => key === valueKey,
            )?.label;
            return getPlatformShortName(result.platform) === label;
          },
        };

    const colWidthMultiply = isSubtestTable ? 1 : 3.5;
    const confidenceGridWidth = isSubtestTable ? '1.8fr' : '1.5fr';

    return [
      platformConfig,
      { name: 'Base', key: 'base', gridWidth: '1fr', tooltip: tooltipBaseMean },
      { key: 'comparisonSign', gridWidth: '0.2fr' },
      { name: 'New', key: 'new', gridWidth: '1fr', tooltip: tooltipNewMean },
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
        matchesFunction(result: CompareResultsItem, valueKey: string) {
          switch (valueKey) {
            case 'improvement':
              return result.is_improvement;
            case 'regression':
              return result.is_regression;
            default:
              return !result.is_improvement && !result.is_regression;
          }
        },
      },
      {
        name: 'Delta',
        key: 'delta',
        gridWidth: '1fr',
        sortFunction(resultA: CompareResultsItem, resultB: CompareResultsItem) {
          return (
            Math.abs(resultA.delta_percentage) -
            Math.abs(resultB.delta_percentage)
          );
        },
        tooltip: tooltipDelta,
      },
      {
        name: 'Confidence',
        filter: true,
        key: 'confidence',
        gridWidth: confidenceGridWidth,
        tooltip: tooltipConfidence,
        possibleValues: [
          { label: 'No value', key: 'none' },
          { label: 'Low', key: 'low' },
          { label: 'Medium', key: 'medium' },
          { label: 'High', key: 'high' },
        ],
        matchesFunction(result: CompareResultsItem, valueKey: string) {
          switch (valueKey) {
            case 'none':
              return !result.confidence_text;
            default: {
              const label = this.possibleValues.find(
                ({ key }) => key === valueKey,
              )?.label;
              return result.confidence_text === label;
            }
          }
        },
        sortFunction(resultA: CompareResultsItem, resultB: CompareResultsItem) {
          const confidenceA =
            resultA.confidence_text && resultA.confidence !== null
              ? resultA.confidence
              : -1;
          const confidenceB =
            resultB.confidence_text && resultB.confidence !== null
              ? resultB.confidence
              : -1;
          return confidenceA - confidenceB;
        },
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
