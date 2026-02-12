import { TableLayoutConfig } from './tableConfigs';
import {
  tooltipBaseMean,
  tooltipCliffsDelta,
  tooltipConfidence,
  tooltipDelta,
  tooltipEffectSize,
  tooltipNewMean,
  tooltipSignificance,
  tooltipStatusMannWhitney,
  tooltipTotalRuns,
} from '../common/constants';
import { CompareResultsItem, MannWhitneyResultsItem } from '../types/state';
import {
  CompareMannWhitneyResultsTableConfig,
  CompareResultsTableConfig,
  TestVersion,
} from '../types/types';

interface ColumnSpec {
  key: string;
  name?: string;
  gridWidth: string | ((config: TableLayoutConfig) => string);
  tooltip?: string;
  versions: TestVersion[];
  filter?: boolean;
  sortable?: boolean;
}

// Single source of truth for all columns
const COLUMN_SPECS: ColumnSpec[] = [
  // Platform/Subtests column is handled separately in tableConfigs
  {
    key: 'base',
    name: 'Base',
    gridWidth: (config) =>
      config.platformConfig.key === 'subtests' ? '.75fr' : '1fr',
    tooltip: tooltipBaseMean,
    versions: ['student-t', 'mann-whitney-u'],
  },
  {
    key: 'comparisonSign',
    gridWidth: (config) =>
      config.platformConfig.key === 'subtests' ? '0.25fr' : '0.2fr',
    versions: ['student-t', 'mann-whitney-u'],
  },
  {
    key: 'new',
    name: 'New',
    gridWidth: (config) =>
      config.platformConfig.key === 'subtests' ? '.75fr' : '1fr',
    tooltip: tooltipNewMean,
    versions: ['student-t', 'mann-whitney-u'],
  },
  {
    key: 'status',
    name: 'Status',
    gridWidth: (config) =>
      config.platformConfig.key === 'subtests' ? '1.25fr' : '1.5fr',
    filter: true,
    versions: ['student-t', 'mann-whitney-u'],
    // Filter logic differs by version - handled in buildColumns
  },
  // Student-T specific: Delta
  {
    key: 'delta',
    name: 'Delta',
    gridWidth: '1fr',
    tooltip: tooltipDelta,
    sortable: true,
    versions: ['student-t'],
  },
  // Student-T specific: Confidence
  {
    key: 'confidence',
    name: 'Confidence',
    gridWidth: (config) => config.confidenceGridWidth ?? '1.5fr',
    tooltip: tooltipConfidence,
    filter: true,
    sortable: true,
    versions: ['student-t'],
  },
  // Mann-Whitney specific: Cliff's Delta
  {
    key: 'delta',
    name: "Cliff's Delta",
    gridWidth: '1.25fr',
    tooltip: tooltipCliffsDelta,
    sortable: true,
    versions: ['mann-whitney-u'],
  },
  // Mann-Whitney specific: Significance
  {
    key: 'significance',
    name: 'Significance',
    gridWidth: '1.5fr',
    tooltip: tooltipSignificance,
    filter: true,
    sortable: true,
    versions: ['mann-whitney-u'],
  },
  // Mann-Whitney specific: Effect Size
  {
    key: 'effects',
    name: 'Effect Size (%)',
    gridWidth: '1.25fr',
    tooltip: tooltipEffectSize,
    sortable: true,
    versions: ['mann-whitney-u'],
  },
  {
    key: 'runs',
    name: 'Total Runs',
    gridWidth: '1fr',
    tooltip: tooltipTotalRuns,
    versions: ['student-t', 'mann-whitney-u'],
  },
  // buttons and expand handled separately as they need dynamic calculation
];

export function buildColumnsForVersion(
  testVersion: TestVersion,
  layoutConfig: TableLayoutConfig,
): CompareResultsTableConfig | CompareMannWhitneyResultsTableConfig {
  const relevantColumns = COLUMN_SPECS.filter((spec) =>
    spec.versions.includes(testVersion),
  );

  const columns: any[] = [layoutConfig.platformConfig];

  for (const spec of relevantColumns) {
    const gridWidth =
      typeof spec.gridWidth === 'function'
        ? spec.gridWidth(layoutConfig)
        : spec.gridWidth;

    const baseColumn: any = {
      key: spec.key,
      name: spec.name,
      gridWidth,
      tooltip: spec.tooltip,
    };

    // Add filter functionality
    if (spec.filter) {
      if (spec.key === 'status') {
        columns.push(buildStatusColumn(testVersion, gridWidth));
      } else if (spec.key === 'confidence') {
        columns.push(buildConfidenceColumn(gridWidth));
      } else if (spec.key === 'significance') {
        columns.push(buildSignificanceColumn(gridWidth));
      }
    }
    // Add sort functionality
    else if (spec.sortable) {
      if (spec.key === 'delta') {
        columns.push(buildDeltaColumn(testVersion, baseColumn));
      } else if (spec.key === 'confidence') {
        columns.push(buildConfidenceColumn(gridWidth));
      } else if (spec.key === 'significance') {
        columns.push(buildSignificanceColumn(gridWidth));
      } else if (spec.key === 'effects') {
        columns.push(buildEffectSizeColumn(gridWidth));
      }
    } else {
      columns.push(baseColumn);
    }
  }

  // Add buttons and expand columns
  columns.push({
    key: 'buttons',
    gridWidth: `calc(${layoutConfig.colWidthMultiply} * 34px)`,
  });
  columns.push({ key: 'expand', gridWidth: '34px' });

  return columns;
}

// Column builders with specific filter/sort logic

function buildStatusColumn(testVersion: TestVersion, gridWidth: string): any {
  const possibleValues = [
    { label: 'No changes', key: 'none' },
    { label: 'Improvement', key: 'improvement' },
    { label: 'Regression', key: 'regression' },
  ];

  if (testVersion === 'mann-whitney-u') {
    return {
      name: 'Status',
      filter: true,
      key: 'status',
      gridWidth,
      possibleValues,
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
    };
  }

  // Student-T
  return {
    name: 'Status',
    filter: true,
    key: 'status',
    gridWidth,
    possibleValues,
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
  };
}

function buildDeltaColumn(testVersion: TestVersion, baseColumn: any): any {
  if (testVersion === 'mann-whitney-u') {
    return {
      ...baseColumn,
      sortFunction(
        resultA: MannWhitneyResultsItem,
        resultB: MannWhitneyResultsItem,
      ) {
        return Math.abs(resultA.cliffs_delta) - Math.abs(resultB.cliffs_delta);
      },
    };
  }

  // Student-T
  return {
    ...baseColumn,
    sortFunction(resultA: CompareResultsItem, resultB: CompareResultsItem) {
      return (
        Math.abs(resultA.delta_percentage) - Math.abs(resultB.delta_percentage)
      );
    },
  };
}

function buildConfidenceColumn(gridWidth: string): any {
  return {
    name: 'Confidence',
    filter: true,
    key: 'confidence',
    gridWidth,
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
            ({ key }: { key: string }) => key === valueKey,
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
  };
}

function buildSignificanceColumn(gridWidth: string): any {
  return {
    name: 'Significance',
    key: 'significance',
    filter: true,
    gridWidth,
    tooltip: tooltipSignificance,
    possibleValues: [
      { label: 'Significant', key: 'significant' },
      { label: 'Not Significant', key: 'not significant' },
    ],
    matchesFunction(result: MannWhitneyResultsItem, valueKey: string) {
      const label = this.possibleValues.find(
        ({ key }: { key: string }) => key === valueKey?.toLowerCase(),
      )?.label;
      return result.mann_whitney_test?.interpretation === label?.toLowerCase();
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
  };
}

function buildEffectSizeColumn(gridWidth: string): any {
  return {
    name: 'Effect Size (%)',
    key: 'effects',
    gridWidth,
    sortFunction(
      resultA: MannWhitneyResultsItem,
      resultB: MannWhitneyResultsItem,
    ) {
      return (
        Math.abs(resultA.cles?.cles ?? 0) - Math.abs(resultB.cles?.cles ?? 0)
      );
    },
    tooltip: tooltipEffectSize,
  };
}
