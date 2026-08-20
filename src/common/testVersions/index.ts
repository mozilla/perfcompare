import type { ReactNode } from 'react';

import { mannWhitneyStrategy } from './mannWhitney';
import { studentTStrategy } from './studentT';
import { CombinedResultsItemType } from '../../types/state';
import { AdvancedColumns, TableConfig, TestVersion } from '../../types/types';

export interface TestVersionStrategy {
  getColumns(
    isSubtestTable: boolean,
    advancedColumns: AdvancedColumns,
  ): TableConfig;
  getAvgValues(result: CombinedResultsItemType): {
    baseAvg: number | null;
    newAvg: number | null;
  };
  renderColumns(
    result: CombinedResultsItemType,
    advancedColumns: AdvancedColumns,
  ): ReactNode;
  renderSubtestColumns(
    result: CombinedResultsItemType,
    expanded: boolean,
    advancedColumns: AdvancedColumns,
  ): ReactNode;
  renderExpandedLeft(result: CombinedResultsItemType): ReactNode;
  getComparisonResult(result: CombinedResultsItemType): string;
  isRegression(result: CombinedResultsItemType): boolean;
  isImprovement(result: CombinedResultsItemType): boolean;
  renderExpandedRight(result: CombinedResultsItemType): ReactNode;
  renderExpandedBottom(result: CombinedResultsItemType): ReactNode;
}

// Registry mapping each TestVersion to its concrete strategy.
// To add a new test version: create a strategy file, add it here,
// and extend the TestVersion union type in types/types.ts.
const registry: Record<TestVersion, TestVersionStrategy> = {
  'student-t': studentTStrategy,
  'mann-whitney-u': mannWhitneyStrategy,
};

const labels: Record<TestVersion, string> = {
  'student-t': 'Student-T',
  'mann-whitney-u': 'Mann-Whitney-U',
};

export function getTestVersionOptions(): {
  type: TestVersion;
  label: string;
}[] {
  return (Object.keys(registry) as TestVersion[]).map((type) => ({
    type,
    label: labels[type],
  }));
}

export function getStrategy(testVersion: TestVersion): TestVersionStrategy {
  return registry[testVersion];
}

export function getColumnsForVersion(
  testVersion: TestVersion,
  isSubtestTable: boolean,
  advancedColumns: AdvancedColumns,
): TableConfig {
  return registry[testVersion].getColumns(isSubtestTable, advancedColumns);
}
