import { getPlatformShortName } from './platform';
import {
  defaultSortFunction,
  defaultSortSubtestFunction,
} from './rowTemplateColumns';
import { CompareResultsItem, MannWhitneyResultsItem } from '../types/state';
import { TestVersion } from '../types/types';

//interface - Defines layout structure for tables
//including column width and platform-specific configurations.
export interface TableLayoutConfig {
  colWidthMultiply: number;
  confidenceGridWidth?: string;
  platformConfig: PlatformColumnConfig;
}

interface PlatformColumnConfig {
  name: string;
  key: string;
  gridWidth: string;
  filter?: boolean;
  sortFunction?: (resultA: any, resultB: any) => number;
  possibleValues?: Array<{ label: string; key: string }>;
  matchesFunction?: (result: any, valueKey: string) => boolean;
}

const PLATFORM_FILTER_VALUES = [
  { label: 'Windows', key: 'windows' },
  { label: 'macOS', key: 'osx' },
  { label: 'Linux', key: 'linux' },
  { label: 'Android', key: 'android' },
  { label: 'iOS', key: 'ios' },
];

function platformMatchesFunction(
  result: CompareResultsItem | MannWhitneyResultsItem,
  valueKey: string,
  possibleValues: Array<{ label: string; key: string }>,
): boolean {
  const label = possibleValues.find(({ key }) => key === valueKey)?.label;
  const platformName = getPlatformShortName(result.platform);
  return platformName === label;
}

export function getTableLayoutConfig(
  testVersion: TestVersion,
  isSubtestTable: boolean,
): TableLayoutConfig {
  const isMannWhitney = testVersion === 'mann-whitney-u';

  if (isSubtestTable) {
    return {
      colWidthMultiply: 1,
      ...(isMannWhitney ? {} : { confidenceGridWidth: '1.8fr' }),
      platformConfig: {
        name: 'Subtests',
        key: 'subtests',
        gridWidth: isMannWhitney ? '1.5fr' : '3fr',
        sortFunction: isMannWhitney
          ? defaultSortFunction
          : defaultSortSubtestFunction,
      },
    };
  }

  return {
    colWidthMultiply: isMannWhitney ? 2.5 : 3.5,
    ...(isMannWhitney ? {} : { confidenceGridWidth: '1.5fr' }),
    platformConfig: {
      name: 'Platform',
      filter: true,
      key: 'platform',
      gridWidth: isMannWhitney ? '1.5fr' : '2fr',
      possibleValues: PLATFORM_FILTER_VALUES,
      matchesFunction(result: any, valueKey: string) {
        return platformMatchesFunction(result, valueKey, this.possibleValues!);
      },
    },
  };
}
