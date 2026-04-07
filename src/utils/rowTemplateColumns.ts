import { getColumnsForVersion } from '../common/testVersions';
import { TableConfig, TestVersion } from '../types/types';

// Re-exported for consumers that import sort utilities from this module.
export {
  defaultSortFunction,
  defaultSortSubtestFunction,
  stringComparisonCollator,
} from './sortFunctions';

export const getColumnsConfiguration = (
  isSubtestTable: boolean,
  testVersion: TestVersion,
): TableConfig => getColumnsForVersion(testVersion, isSubtestTable);

export { toGridTemplateColumns } from './gridTemplateColumns';
