import { getPlatformShortName } from './platform';
import {
  defaultSortFunction,
  defaultSortSubtestFunction,
} from './rowTemplateColumns';
import { CombinedResultsItemType } from '../types/state';
import { TestVersion } from '../types/types';

/* 
this interface defines the layout structure for tables
including column width and platform-specific configurations.
*/
export interface ColumnGridWidths {
  base: string;
  new: string;
  status: string;
  comparisonSign: string;
}

export interface TableLayoutConfig {
  colWidthMultiply: number;
  confidenceGridWidth?: string;
  columnGridWidths: ColumnGridWidths;
  platformConfig: PlatformColumnConfig;
}

interface PlatformColumnConfig {
  name: string;
  key: string;
  gridWidth: string;
  filter?: boolean;
  sortFunction?: (
    resultA: CombinedResultsItemType,
    resultB: CombinedResultsItemType,
  ) => number;
  possibleValues?: Array<{ label: string; key: string }>;
  matchesFunction?: (
    result: CombinedResultsItemType,
    valueKey: string,
  ) => boolean;
}

const PLATFORM_FILTER_VALUES = [
  { label: 'Windows', key: 'windows' },
  { label: 'macOS', key: 'osx' },
  { label: 'Linux', key: 'linux' },
  { label: 'Android', key: 'android' },
  { label: 'iOS', key: 'ios' },
];

function platformMatchesFunction(
  result: CombinedResultsItemType,
  valueKey: string,
  possibleValues: Array<{ label: string; key: string }>,
): boolean {
  const label = possibleValues.find(({ key }) => key === valueKey)?.label;
  const platformName = getPlatformShortName(result.platform);
  return platformName === label;
}

/* 
/* Captures the specific layout configurations for 
/* each test version and table type (main/subtest).
*/
interface VersionLayout {
  colWidthMultiply: number;
  confidenceGridWidth?: string;
  subtestGridWidth: string;
  subtestSortFunction: (
    resultA: CombinedResultsItemType,
    resultB: CombinedResultsItemType,
  ) => number;
  platformGridWidth: string;
  columnGridWidths: ColumnGridWidths;
}

//Adding a new test version is now just a new entry in this object.
const VERSION_LAYOUT: Record<TestVersion, VersionLayout> = {
  'student-t': {
    colWidthMultiply: 3.5,
    confidenceGridWidth: '1.5fr',
    subtestGridWidth: '3fr',
    subtestSortFunction: defaultSortSubtestFunction,
    platformGridWidth: '2fr',
    columnGridWidths: {
      base: '1fr',
      new: '1fr',
      status: '1.5fr',
      comparisonSign: '0.2fr',
    },
  },
  'mann-whitney-u': {
    colWidthMultiply: 2.5,
    subtestGridWidth: '1.5fr',
    subtestSortFunction: defaultSortFunction,
    platformGridWidth: '1.5fr',
    columnGridWidths: {
      base: '.75fr',
      new: '.75fr',
      status: '1.25fr',
      comparisonSign: '0.25fr',
    },
  },
};

export function getTableLayoutConfig(
  testVersion: TestVersion,
  isSubtestTable: boolean,
): TableLayoutConfig {
  const layout = VERSION_LAYOUT[testVersion];

  if (isSubtestTable) {
    return {
      colWidthMultiply: 1,
      ...(layout.confidenceGridWidth
        ? { confidenceGridWidth: layout.confidenceGridWidth }
        : {}),
      columnGridWidths: layout.columnGridWidths,
      platformConfig: {
        name: 'Subtests',
        key: 'subtests',
        gridWidth: layout.subtestGridWidth,
        sortFunction: layout.subtestSortFunction,
      },
    };
  }

  return {
    colWidthMultiply: layout.colWidthMultiply,
    ...(layout.confidenceGridWidth
      ? { confidenceGridWidth: layout.confidenceGridWidth }
      : {}),
    columnGridWidths: layout.columnGridWidths,
    platformConfig: {
      name: 'Platform',
      filter: true,
      key: 'platform',
      gridWidth: layout.platformGridWidth,
      possibleValues: PLATFORM_FILTER_VALUES,
      matchesFunction(result: CombinedResultsItemType, valueKey: string) {
        return platformMatchesFunction(result, valueKey, this.possibleValues!);
      },
    },
  };
}
