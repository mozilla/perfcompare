import type { ReactNode } from 'react';

import { mannWhitneyStrategy } from './mannWhitney';
import { studentTStrategy } from './studentT';
import { CombinedResultsItemType } from '../../types/state';
import { TableConfig, TestVersion } from '../../types/types';

export interface TestVersionStrategy {
  getColumns(isSubtestTable: boolean): TableConfig;
  getAvgValues(result: CombinedResultsItemType): {
    baseAvg: number | null;
    newAvg: number | null;
  };
  renderColumns(result: CombinedResultsItemType): ReactNode;
  renderSubtestColumns(
    result: CombinedResultsItemType,
    expanded: boolean,
  ): ReactNode;
  renderExpandedLeft(result: CombinedResultsItemType): ReactNode;
  getComparisonResult(result: CombinedResultsItemType): string;
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
): TableConfig {
  return registry[testVersion].getColumns(isSubtestTable);
}
