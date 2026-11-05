import type { CompareResultsItem } from '../types/state';
import type { Platform } from '../types/types';
import {
  buildCrossPlatformLinks,
  crossPlatformGroupKey,
  getCrossPlatformSubtestsLink,
} from '../utils/subtestsLinks';
import getTestData from './utils/fixtures';

const noAdvancedColumns = {
  cliffsDelta: false,
  cles: false,
  significance: false,
};
const noExpandedRow = {
  effectSize: false,
  modes: false,
  statsTable: false,
  warnings: false,
};

function result(overrides: Partial<CompareResultsItem>): CompareResultsItem {
  const [template] = getTestData().testCompareData;
  return { ...template, has_subtests: true, ...overrides };
}

const linux = result({
  platform: 'linux1804-64-shippable-qr',
  base_signature_id: 11,
  new_signature_id: 12,
});
const windows = result({
  platform: 'windows11-64-24h2-shippable' as Platform,
  base_signature_id: 21,
  new_signature_id: 22,
});

describe('getCrossPlatformSubtestsLink', () => {
  it('repeats the signatures and platform for each platform with subtests', () => {
    const link = getCrossPlatformSubtestsLink(
      [linux, windows, result({ has_subtests: false })],
      'mann-whitney-u',
      noAdvancedColumns,
      noExpandedRow,
    );
    const url = new URL(link!, 'https://perf.compare');
    expect(url.pathname).toBe('/subtests-cross-platform-results');
    expect(url.searchParams.getAll('baseParentSignature')).toEqual([
      '11',
      '21',
    ]);
    expect(url.searchParams.getAll('newParentSignature')).toEqual(['12', '22']);
    expect(url.searchParams.getAll('platform')).toEqual([
      linux.platform,
      windows.platform,
    ]);
    expect(url.searchParams.get('test_version')).toBe('mann-whitney-u');
  });

  it('returns null with fewer than 2 platforms with subtests', () => {
    expect(
      getCrossPlatformSubtestsLink(
        [linux, result({ has_subtests: false })],
        'mann-whitney-u',
        noAdvancedColumns,
        noExpandedRow,
      ),
    ).toBeNull();
  });
});

describe('buildCrossPlatformLinks', () => {
  it('groups by test and framework across header groups', () => {
    const android = result({
      platform: 'android-hw-a55-14-0-aarch64-shippable' as Platform,
      header_name: 'a different header',
      extra_options: 'webrender',
    });
    const otherFramework = result({ ...windows, framework_id: 13 });

    const links = buildCrossPlatformLinks(
      [linux, android, otherFramework],
      'mann-whitney-u',
      noAdvancedColumns,
      noExpandedRow,
    );

    expect([...links.keys()]).toEqual([crossPlatformGroupKey(linux)]);
    const url = new URL(links.get(crossPlatformGroupKey(linux))!, 'http://x');
    expect(url.searchParams.getAll('platform')).toEqual([
      linux.platform,
      android.platform,
    ]);
  });
});
