import {
  CombinedResultsItemType,
  CompareResultsItem,
  MannWhitneyResultsItem,
} from './state';

/* --- Types for configuring the behavior and styles of the results tables columns --- */

// A basic column, without special properties.
export interface BasicColumn {
  // The label that will be shown in the header.
  name?: string;
  // A unique key that will be used in arrays when rendering, or saving state.
  key: string;
  // Used in the grid CSS property to configure the width of the column.
  gridWidth: string;
  tooltip?: string;
}

// This interface is used for a column that can be filtered.
interface FilterableColumnMixin {
  name: string;
  // Always true for filterable columns.
  filter: true;
  // All values this column might have.
  possibleValues: Array<{ label: string; key: string }>;
  // This function returns whether this result matches the value for this column.
  matchesFunction: (
    this: FilterableColumnMixin,
    result: CompareResultsItem,
    value: string,
  ) => boolean;
}

interface FilterableMannWhitneyColumnMixin {
  name: string;
  // Always true for filterable columns.
  filter: true;
  // All values this column might have.
  possibleValues: Array<{ label: string; key: string }>;
  // This function returns whether this result matches the value for this column.
  matchesFunction: (
    this: FilterableMannWhitneyColumnMixin,
    result: MannWhitneyResultsItem,
    value: string,
  ) => boolean;
}

// This interface is used for a column that can be sorted.
interface SortableColumnMixin {
  name: string;
  sortFunction: (
    resultA: CompareResultsItem,
    resultB: CompareResultsItem,
  ) => number;
}

interface SortableMannWhitneyColumnMixin {
  name: string;
  sortFunction: (
    resultA: MannWhitneyResultsItem,
    resultB: MannWhitneyResultsItem,
  ) => number;
}
// These types represent actual column types, by mixing a BasicColumn with the
// mixins for Filterable and Sortable columns.
// The "&" intersection works better than interface "extends" here, because the
// "name" property has different types in the interfaces, so Typescript bails
// out when using "extends".
export type FilterableColumn = BasicColumn & FilterableColumnMixin;
export type SortableColumn = BasicColumn & SortableColumnMixin;
export type FilterableAndSortableColumn = FilterableColumn &
  SortableColumnMixin;
export type FilterableMannWhitneyColumn = BasicColumn &
  FilterableMannWhitneyColumnMixin;
export type SortableMannWhitneyColumn = BasicColumn &
  SortableMannWhitneyColumnMixin;
export type FilterableAndSortableMannWhitneyColumn =
  FilterableMannWhitneyColumn & SortableMannWhitneyColumnMixin;

// A column can be one of these types.
export type CompareResultsTableColumn =
  | BasicColumn
  | FilterableColumn
  | SortableColumn
  | FilterableAndSortableColumn;

export type CompareMannWhitneyResultsTableColumn =
  | BasicColumn
  | FilterableMannWhitneyColumn
  | SortableMannWhitneyColumn
  | FilterableAndSortableMannWhitneyColumn;

// The full configuration for a results table.
export type CompareResultsTableConfig = CompareResultsTableColumn[];
export type CompareMannWhitneyResultsTableConfig =
  CompareMannWhitneyResultsTableColumn[];

/* --- End of types for configuring the behavior and styles of the results tables columns --- */

export type ConfidenceText = 'High' | 'Medium' | 'Low' | '';

export type MeasurementUnit =
  | 'W'
  | 'MHz'
  | '%'
  | 'score'
  | 'mAh'
  | 'ms'
  | 'mWh'
  | 'KB'
  | 'fps'
  | 'bytes'
  | null;

export type Framework =
  | { id: 1; name: 'talos' }
  | { id: 2; name: 'build_metrics' }
  | { id: 4; name: 'awsy' }
  | { id: 6; name: 'platform_microbench' }
  | { id: 10; name: 'raptor' }
  | { id: 11; name: 'js-bench' }
  | { id: 12; name: 'devtools' }
  | { id: 13; name: 'browsertime' }
  | { id: 15; name: 'mozperftest' }
  | { id: 16; name: 'fxrecord' };

export type SupportedPerfdocsFramework = 'talos' | 'awsy' | 'devtools';

export type TimeRange =
  | { value: 86400; text: 'Last day' }
  | { value: 172800; text: 'Last 2 days' }
  | { value: 604800; text: 'Last 7 days' }
  | { value: 1209600; text: 'Last 14 days' }
  | { value: 2592000; text: 'Last 30 days' }
  | { value: 5184000; text: 'Last 60 days' }
  | { value: 7776000; text: 'Last 90 days' }
  | { value: 31536000; text: 'Last year' };

export type FilterValue = {
  name: string;
  value: string;
};

export type ActiveFilters = {
  platform: string[];
  test: string[];
  confidence: string[];
};

export type FilteredResults = {
  data: CompareResultsItem[];
  activeFilters: ActiveFilters;
  isFiltered: boolean;
};

export type FilteredMannWhitneyResults = {
  data: MannWhitneyResultsItem[];
  activeFilters: ActiveFilters;
  isFiltered: boolean;
};

// TODO: Needs review: as new platforms are available the type will need updates
export type Platform =
  | 'linux32'
  | 'linux-shippable'
  | 'linux32-devedition'
  | 'linux-devedition'
  | 'linux32-shippable'
  | 'linux1804-32'
  | 'linux1804-32-qr'
  | 'linux1804-32-shippable'
  | 'linux1804-32-shippable-qr'
  | 'linux64'
  | 'linux64-asan'
  | 'linux64-asan-qr'
  | 'linux64-asan-reporter'
  | 'linux64-add-on-devel'
  | 'linux64-devedition'
  | 'linux64-shippable-qr'
  | 'linux64-qr'
  | 'linux64-shippable'
  | 'linux64-ccov'
  | 'linux64-noopt'
  | 'linux64-aarch64'
  | 'linux1804-64'
  | 'linux1804-64-qr'
  | 'linux1804-64-shippable'
  | 'linux1804-64-shippable-qr'
  | 'linux1804-64-devedition'
  | 'linux1804-64-devedition-qr'
  | 'linux1804-64-asan'
  | 'linux1804-64-asan-qr'
  | 'linux1804-64-tsan'
  | 'linux1804-64-tsan-qr'
  | 'linux1804-64-ccov'
  | 'linux1804-64-ccov-qr'
  | 'linux1804-64-clang-trunk'
  | 'osx-cross'
  | 'osx-shippable'
  | 'osx-aarch64-shippable'
  | 'osx-aarch64-devedition'
  | 'osx-cross-noopt'
  | 'osx-cross-add-on-devel'
  | 'osx-cross-ccov'
  | 'osx-cross-devedition'
  | 'macosx1014-64'
  | 'osx-1014-64'
  | 'macosx1014-64-qr'
  | 'macosx1014-64-shippable'
  | 'osx-1014-64-shippable'
  | 'macosx1014-64-shippable-qr'
  | 'macosx1014-64-devedition'
  | 'macosx1014-64-devedition-qr'
  | 'macosx1014-64-ccov'
  | 'macosx1015-64'
  | 'macosx1015-64-qr'
  | 'macosx1015-64-shippable'
  | 'macosx1015-64-shippable-qr'
  | 'macosx1015-64-devedition'
  | 'macosx1015-64-devedition-qr'
  | 'macosx1100-64'
  | 'macosx1100-64-qr'
  | 'macosx1100-64-shippable'
  | 'macosx1100-64-shippable-qr'
  | 'macosx1100-64-devedition'
  | 'macosx1100-64-devedition-qr'
  | 'macosx64'
  | 'osx'
  | 'macosx64-shippable'
  | 'macosx64-devedition'
  | 'macosx64-aarch64'
  | 'win32-shippable'
  | 'win32-devedition'
  | 'windows7-32'
  | 'windows7-32-qr'
  | 'windows7-32-devedition'
  | 'windows7-32-shippable-qr'
  | 'windows7-32-shippable'
  | 'windows7-32-mingwclang'
  | 'windows10-32'
  | 'windows10-32-qr'
  | 'windows10-32-shippable'
  | 'windows10-32-shippable-qr'
  | 'windows10-32-mingwclang'
  | 'windows10-32-mingwclang-qr'
  | 'windows10-32-2004'
  | 'windows10-32-2004-qr'
  | 'windows10-32-2004-shippable'
  | 'windows10-32-2004-shippable-qr'
  | 'windows10-32-2004-mingwclang'
  | 'windows10-32-2004-mingwclang-qr'
  | 'windows10-64'
  | 'win64-shippable'
  | 'win64-devedition'
  | 'windows10-64-asan-qr'
  | 'windows10-64-ccov'
  | 'windows10-64-ccov-qr'
  | 'windows10-64-devedition'
  | 'windows10-64-shippable'
  | 'windows10-64-shippable-qr'
  | 'windows10-64-devedition-qr'
  | 'windows10-64-qr'
  | 'windows10-64-ref-hw-2017'
  | 'windows10-64-ref-hw-2017-qr'
  | 'windows10-64-mingwclang'
  | 'windows10-64-mingwclang-qr'
  | 'windows10-aarch64'
  | 'windows10-aarch64-qr'
  | 'windows10-64-2004-ccov-qr'
  | 'windows10-64-2004-qr'
  | 'windows10-64-2004-asan-qr'
  | 'windows10-64-2004-shippable-qr'
  | 'windows10-64-2004-devedition-qr'
  | 'windows10-64-2004-mingwclang'
  | 'windows10-64-2004-mingwclang-qr'
  | 'windows11-64-2009-qr'
  | 'windows2012-32'
  | 'windows2012-32-shippable'
  | 'windows2012-32-add-on-devel'
  | 'windows2012-32-noopt'
  | 'windows2012-32-devedition'
  | 'windows2012-64'
  | 'windows2012-64-shippable'
  | 'win64-asan-reporter'
  | 'windows2012-64-add-on-devel'
  | 'windows2012-64-noopt'
  | 'windows2012-64-devedition'
  | 'windows2012-aarch64'
  | 'windows2012-aarch64-shippable'
  | 'windows2012-aarch64-devedition'
  | 'windows-mingw32'
  | 'win32'
  | 'win64'
  | 'android-4-0-armv7-api16'
  | 'android-4-0-armv7'
  | 'android-4-0-armv7-api16-beta'
  | 'android-4-0-armv7-api16-release'
  | 'android-4-0-armv7-api16-shippable'
  | 'android-4-0-armv7-shippable'
  | 'android-4-0-armv7-api16-ccov'
  | 'android-4-0-geckoview-fat-aar'
  | 'android-4-0-geckoview-fat-aar-shippable'
  | 'android-4-1-armv7'
  | 'android-4-1-x86'
  | 'android-4-1-x86-shippable-lite'
  | 'android-4-1-armv7-beta'
  | 'android-4-1-armv7-release'
  | 'android-4-1-armv7-shippable'
  | 'android-4-1-armv7-ccov'
  | 'android-4-1-armv7-shippable-lite'
  | 'android-4-1-geckoview-fat-aar'
  | 'android-4-1-geckoview-fat-aar-shippable'
  | 'android-4-2-x86'
  | 'android-4-2-x86-beta'
  | 'android-4-2-x86-release'
  | 'android-4-2-x86-shippable'
  | 'android-5-0-armv7'
  | 'android-5-0-armv7-shippable'
  | 'android-5-0-aarch64'
  | 'android-5-0-aarch64-beta'
  | 'android-5-0-aarch64-release'
  | 'android-5-0-aarch64-shippable'
  | 'android-5-0-aarch64-shippable-lite'
  | 'android-5-0-x86'
  | 'android-5-0-x86-shippable'
  | 'android-5-0-x86_64'
  | 'android-5-0-x86_64-beta'
  | 'android-5-0-x86_64-release'
  | 'android-5-0-x86_64-shippable'
  | 'android-5-0-x86_64-shippable-lite'
  | 'android-5-0-geckoview-fat-aar-shippable'
  | 'android-em-7-0-x86'
  | 'android-em-7-0-x86-beta'
  | 'android-em-7-0-x86-release'
  | 'android-em-7-0-x86_64'
  | 'android-em-7-0-x86_64-qr'
  | 'android-em-7-0-x86_64-beta'
  | 'android-em-7-0-x86_64-release'
  | 'android-em-7-0-x86_64-shippable'
  | 'android-em-7-0-x86_64-lite'
  | 'android-em-7-0-x86_64-lite-qr'
  | 'android-em-7-0-x86_64-shippable-lite-qr'
  | 'android-em-7-0-x86_64-shippable-qr'
  | 'android-em-7.0-x86_64-shippable-lite'
  | 'android-hw-g5-7-0-arm7-api-16'
  | 'android-hw-g5-7-0-arm7-api-16-shippable'
  | 'android-hw-g5-7-0-arm7-api-16-qr'
  | 'android-hw-g5-7-0-arm7-api-16-shippable-qr'
  | 'android-hw-p2-8-0-arm7-api-16'
  | 'android-hw-p2-8-0-arm7-api-16-qr'
  | 'android-hw-p2-8-0-arm7-api-16-shippable'
  | 'android-hw-g5-7-0-arm7'
  | 'android-hw-g5-7-0-arm7-shippable'
  | 'android-hw-g5-7-0-arm7-qr'
  | 'android-hw-g5-7-0-arm7-shippable-qr'
  | 'android-hw-p2-8-0-arm7'
  | 'android-hw-p2-8-0-arm7-qr'
  | 'android-hw-p2-8-0-arm7-shippable'
  | 'android-hw-p2-8-0-arm7-shippable-qr'
  | 'android-hw-p2-8-0-android-aarch64'
  | 'android-hw-p2-8-0-android-aarch64-shippable'
  | 'android-hw-p2-8-0-android-aarch64-qr'
  | 'android-hw-p2-8-0-android-aarch64-shippable-qr'
  | 'android-hw-a51-11-0-arm7-qr'
  | 'android-hw-a51-11-0-arm7-shippable-qr'
  | 'android-hw-a51-11-0-aarch64-qr'
  | 'android-hw-a51-11-0-aarch64-shippable-qr';

export type FakeCommitHash =
  | 'bb6a5e451dace3b9c7be42d24c9272738d73e6db'
  | '9d50665254899d8431813bdc04178e6006ce6d59'
  | 'a998c42399a8fcea623690bf65bef49de20535b4';

export type UserCredentials = {
  expires: string;
  credentials: { clientId: string; accessToken: string };
};

export type UserCredentialsDictionary = Record<string, UserCredentials>;

export type TokenBearer = {
  access_token: string;
  token_type: 'Bearer';
};

export type TestVersion = 'student-t' | 'mann-whitney-u';

export type SortFunc = (
  resultA: CombinedResultsItemType,
  resultB: CombinedResultsItemType,
) => number;
