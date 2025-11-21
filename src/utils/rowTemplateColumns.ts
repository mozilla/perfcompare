import { getPlatformShortName } from './platform';
import { MANN_WHITNEY_U, STUDENT_T } from '../common/constants';
import { CompareResultsItem, MannWhitneyResultsItem } from '../types/state';
import {
  CombinedResultsType,
  CompareMannWhitneyResultsTableConfig,
  CompareResultsTableConfig,
  TestVersion,
} from '../types/types';

export const stringComparisonCollator = new Intl.Collator('en', {
  numeric: true,
  sensitivity: 'base',
});

// The default sort orders by header_name (which is a concatenation of suite,
// test and options), and platform, so that the order is stable when reloading
// the page.
export function defaultSortFunction(
  itemA: CombinedResultsType,
  itemB: CombinedResultsType,
) {
  const keyA = itemA.header_name + ' ' + itemA.platform;
  const keyB = itemB.header_name + ' ' + itemB.platform;
  return stringComparisonCollator.compare(keyA, keyB);
}

export const getColumnsConfiguration = (
  isSubtestTable: boolean,
  testVersion: TestVersion,
) => {
  const tableConfigTestSubtestDiff = isSubtestTable
    ? {
        colWidthMultiply: 1,
        confidenceGridWidth: '1.8fr',
        platformConfig: {
          name: 'Subtests',
          key: 'subtests',
          gridWidth: '3fr',
          sortFunction: defaultSortFunction,
        },
      }
    : {
        colWidthMultiply: 3.5,
        confidenceGridWidth: '1.5fr',
        platformConfig: {
          name: 'Platform',
          filter: true,
          key: 'platform',
          gridWidth: '2fr',
          possibleValues: [
            { label: 'Windows', key: 'windows' },
            { label: 'macOS', key: 'osx' },
            { label: 'Linux', key: 'linux' },
            { label: 'Android', key: 'android' },
            { label: 'iOS', key: 'ios' },
          ],
          matchesFunction(result: CompareResultsItem, valueKey: string) {
            const label = this.possibleValues.find(
              ({ key }) => key === valueKey,
            )?.label;
            const platformName = getPlatformShortName(result.platform);
            return platformName === label;
          },
        },
      };

  const columnsConfiguration: CompareResultsTableConfig = [
    {
      ...tableConfigTestSubtestDiff.platformConfig,
    },
    {
      name: 'Base',
      key: 'base',
      gridWidth: '1fr',
      tooltip: 'A summary of all values from Base runs using a mean.',
    },
    {
      key: 'comparisonSign',

      gridWidth: '0.2fr',
    },
    {
      name: 'New',
      key: 'new',

      gridWidth: '1fr',
      tooltip: 'A summary of all values from New runs using a mean.',
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
      matchesFunction(result, valueKey) {
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
      sortFunction(resultA, resultB) {
        return (
          Math.abs(resultA.delta_percentage) -
          Math.abs(resultB.delta_percentage)
        );
      },
      tooltip: 'The percentage difference between the Base and New values',
    },
    {
      name: 'Confidence',
      filter: true,
      key: 'confidence',
      gridWidth: tableConfigTestSubtestDiff.confidenceGridWidth,
      tooltip:
        "Calculated using a Student's T-test comparison. Low is anything under a T value of 3, Medium is between 3 and 5, and High is anything higher than 5.",
      possibleValues: [
        { label: 'No value', key: 'none' },
        { label: 'Low', key: 'low' },
        { label: 'Medium', key: 'medium' },
        { label: 'High', key: 'high' },
      ],
      matchesFunction(result, valueKey) {
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
      sortFunction(resultA, resultB) {
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
      tooltip: 'The total number of tasks/jobs that ran for this metric.',
    },
    // The 2 icons are 24px wide, and they have 5px padding for subtest columns.
    // We use the real pixel value for the buttons, so that everything is improvement aligned.
    // gridwidth 2 or 3 buttons, so at least 3*34px, but give more so that it can "breathe"
    {
      key: 'buttons',
      gridWidth: `calc(${tableConfigTestSubtestDiff.colWidthMultiply} * 34px)`,
    },
    { key: 'expand', gridWidth: '34px' },
  ];

  const tableMannWhitneyConfigTestSubtestDiff = isSubtestTable
    ? {
        colWidthMultiply: 1,
        newGridWidth: '.75fr',
        cliffsDeltaGridWidth: '1.25fr',
        significanceGridWidth: '1fr',
        platformConfig: {
          name: 'Subtests',
          key: 'subtests',
          gridWidth: '1.5fr',
          sortFunction: defaultSortFunction,
        },
      }
    : {
        colWidthMultiply: 2.5,
        newGridWidth: '.5fr',
        cliffsDeltaGridWidth: '1fr',
        significanceGridWidth: '1.5fr',
        platformConfig: {
          name: 'Platform',
          filter: true,
          key: 'platform',
          gridWidth: '1.5fr',
          possibleValues: [
            { label: 'Windows', key: 'windows' },
            { label: 'macOS', key: 'osx' },
            { label: 'Linux', key: 'linux' },
            { label: 'Android', key: 'android' },
            { label: 'iOS', key: 'ios' },
          ],
          matchesFunction(result: MannWhitneyResultsItem, valueKey: string) {
            const label = this.possibleValues.find(
              ({ key }) => key === valueKey,
            )?.label;
            const platformName = getPlatformShortName(result.platform);
            return platformName === label;
          },
        },
      };

  const columnsMannWhitneyConfiguration: CompareMannWhitneyResultsTableConfig =
    [
      {
        ...tableMannWhitneyConfigTestSubtestDiff.platformConfig,
      },
      {
        name: 'Base',
        key: 'base',
        gridWidth: '.5fr',
        tooltip: 'A summary of all values from Base runs using a mean.',
      },
      {
        key: 'comparisonSign',
        gridWidth: '0.2fr',
      },
      {
        name: 'New',
        key: 'new',
        gridWidth: tableMannWhitneyConfigTestSubtestDiff.newGridWidth,
        tooltip: 'A summary of all values from New runs using a mean.',
      },
      {
        name: 'Status',
        filter: true,
        key: 'status',
        gridWidth: '1fr',
        possibleValues: [
          { label: 'No changes', key: 'none' },
          { label: 'Improvement', key: 'improvement' },
          { label: 'Regression', key: 'regression' },
        ],
        matchesFunction(result, valueKey) {
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
        tooltip:
          'Combination of if effect is meaningful (changes are small or greater), direction of change, and if significant',
      },
      {
        name: "Cliff's Delta",
        key: 'delta',
        gridWidth: tableMannWhitneyConfigTestSubtestDiff.cliffsDeltaGridWidth,
        sortFunction(resultA, resultB) {
          return (
            Math.abs(resultA.cliffs_delta) - Math.abs(resultB.cliffs_delta)
          );
        },
        tooltip:
          'Cliff’s Delta quantifies the magnitude of the difference between Base and New values.',
      },
      {
        name: 'Significance',
        key: 'significance',
        filter: true,
        gridWidth: tableMannWhitneyConfigTestSubtestDiff.significanceGridWidth,
        tooltip:
          'Mann Whitney U test p-value indicating statistical significance. Mann Whitney U p-value < .05 indicates a statistically significant difference between Base and New.',
        possibleValues: [
          { label: 'Significant', key: 'significant' },
          { label: 'Not Significant', key: 'not significant' },
        ],
        matchesFunction(result, valueKey) {
          switch (valueKey) {
            case 'none':
              return !result.mann_whitney_test?.interpretation;
            default: {
              const label = this.possibleValues.find(
                ({ key }) => key === valueKey,
              )?.label;
              return result.mann_whitney_test?.interpretation === label;
            }
          }
        },
        sortFunction(
          resultA: MannWhitneyResultsItem,
          resultB: MannWhitneyResultsItem,
        ) {
          if (
            !resultA.mann_whitney_test?.pvalue ||
            !resultB.mann_whitney_test?.pvalue
          ) {
            return 0;
          } else {
            return (
              Math.abs(resultA.mann_whitney_test?.pvalue ?? 0) -
              Math.abs(resultB.mann_whitney_test?.pvalue ?? 0)
            );
          }
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
          if (!resultA.cles?.cles || !resultB.cles?.cles) {
            return 0;
          } else {
            return (
              Math.abs(resultA.cles?.cles) - Math.abs(resultB.cles?.cles ?? 0)
            );
          }
        },
        tooltip:
          'Common Language Effect Size (CLES) percentage is a measure of effect size. CLES >= 0.5 indicates probability Base > New.',
      },
      {
        name: 'Total Runs',
        key: 'runs',
        gridWidth: '1fr',
        tooltip: 'The total number of tasks/jobs that ran for this metric.',
      },
      // We use the real pixel value for the buttons, so that everything is improvement aligned.
      {
        key: 'buttons',
        gridWidth: `calc(${tableMannWhitneyConfigTestSubtestDiff.colWidthMultiply} * 34px)`,
      }, // 2 or 3 buttons, so at least 3*34px, but give more so that it can "breathe"
      { key: 'expand', gridWidth: '34px' }, // 1 button
    ];

  switch (true) {
    case testVersion === MANN_WHITNEY_U:
      return columnsMannWhitneyConfiguration;
    case testVersion === STUDENT_T:
      return columnsConfiguration;
    default:
      return columnsConfiguration;
  }
};

export const getRowGridTemplateColumns = (
  isSubtestTable: boolean,
  testVersion: TestVersion,
) => {
  const rowGridTemplateColumns = getColumnsConfiguration(
    isSubtestTable,
    testVersion,
  )
    .map((config) => config.gridWidth)
    .join(' ');

  return rowGridTemplateColumns;
};
