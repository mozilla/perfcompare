import { mannWhitneyStrategy } from './mannWhitney';
import { studentTStrategy } from './studentT';
import { TableConfig, TestVersion } from '../../types/types';

export interface TestVersionStrategy {
  getColumns(isSubtestTable: boolean): TableConfig;
}

// Registry mapping each TestVersion to its concrete strategy.
// To add a new test version: create a strategy file, add it here,
// and extend the TestVersion union type in types/types.ts.
const registry: Record<TestVersion, TestVersionStrategy> = {
  'student-t': studentTStrategy,
  'mann-whitney-u': mannWhitneyStrategy,
};

export function getColumnsForVersion(
  testVersion: TestVersion,
  isSubtestTable: boolean,
): TableConfig {
  return registry[testVersion].getColumns(isSubtestTable);
}
