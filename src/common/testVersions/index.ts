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
}

// Registry mapping each TestVersion to its concrete strategy.
// To add a new test version: create a strategy file, add it here,
// and extend the TestVersion union type in types/types.ts.
const registry: Record<TestVersion, TestVersionStrategy> = {
  'student-t': studentTStrategy,
  'mann-whitney-u': mannWhitneyStrategy,
};

export function getStrategy(testVersion: TestVersion): TestVersionStrategy {
  return registry[testVersion];
}

export function getColumnsForVersion(
  testVersion: TestVersion,
  isSubtestTable: boolean,
): TableConfig {
  return registry[testVersion].getColumns(isSubtestTable);
}
