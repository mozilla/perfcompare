import { getColumnsForVersion } from '../common/testVersions';
import { AdvancedColumns, TableConfig, TestVersion } from '../types/types';

// Re-exported for consumers that import sort utilities from this module.
export {
  defaultSortFunction,
  defaultSortSubtestFunction,
  stringComparisonCollator,
} from './sortFunctions';

export const getColumnsConfiguration = (
  isSubtestTable: boolean,
  testVersion: TestVersion,
  advancedColumns: AdvancedColumns,
): TableConfig =>
  getColumnsForVersion(testVersion, isSubtestTable, advancedColumns);

export { toGridTemplateColumns } from './gridTemplateColumns';
