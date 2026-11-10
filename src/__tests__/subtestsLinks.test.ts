import type { CompareResultsItem } from '../types/state';
import {
  buildCrossPlatformLinks,
  crossPlatformGroupKey,
  decodeParentSignatures,
  encodeParentSignatures,
  getCrossPlatformSubtestsLink,
} from '../utils/subtestsLinks';
import getTestData from './utils/fixtures';

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
  platform: 'windows11-64-24h2-shippable',
  base_signature_id: 21,
  new_signature_id: 22,
});

describe('getCrossPlatformSubtestsLink', () => {
  it('lists the signatures of each platform with subtests', () => {
    const link = getCrossPlatformSubtestsLink(
      [linux, windows, result({ has_subtests: false })],
      'mann-whitney-u',
    );
    const url = new URL(link!, 'https://perf.compare');
    expect(url.pathname).toBe('/subtests-cross-platform-results');
    expect(url.searchParams.get('sigs')).toBe('11_12.21_22');
    // The platforms come from the fetched results.
    expect(url.searchParams.has('platform')).toBe(false);
    expect(url.searchParams.get('test_version')).toBe('mann-whitney-u');
    // The view doesn't show the Advanced options.
    expect(url.searchParams.has('advanced_columns')).toBe(false);
    expect(url.searchParams.has('advanced_expanded')).toBe(false);
  });

  it('returns null with fewer than 2 platforms with subtests', () => {
    expect(
      getCrossPlatformSubtestsLink(
        [linux, result({ has_subtests: false })],
        'mann-whitney-u',
      ),
    ).toBeNull();
  });
});

describe('buildCrossPlatformLinks', () => {
  it('groups by test and framework across header groups', () => {
    const android = result({
      platform: 'android-hw-a55-14-0-aarch64-shippable',
      header_name: 'a different header',
      extra_options: 'webrender',
    });
    const otherFramework = result({ ...windows, framework_id: 13 });

    const links = buildCrossPlatformLinks(
      [linux, android, otherFramework],
      'mann-whitney-u',
    );

    expect([...links.keys()]).toEqual([crossPlatformGroupKey(linux)]);
    const url = new URL(links.get(crossPlatformGroupKey(linux))!, 'http://x');
    expect(decodeParentSignatures(url.searchParams.get('sigs')!)).toHaveLength(
      2,
    );
  });
});

describe('parent signatures parameter', () => {
  const pairs = [
    { baseParentSignature: '4085770', newParentSignature: '4085770' },
    { baseParentSignature: '11', newParentSignature: '12' },
  ];

  it('lists a shared signature once, and both otherwise', () => {
    expect(encodeParentSignatures(pairs)).toBe('4085770.11_12');
  });

  it('decodes what it encodes, unescaped in a URL', () => {
    const params = new URLSearchParams({ sigs: encodeParentSignatures(pairs) });
    expect(params.toString()).toBe('sigs=4085770.11_12');
    expect(decodeParentSignatures(params.get('sigs')!)).toEqual(pairs);
  });

  it.each(['', '1..2', '1_2_3', 'spam', '1_'])('rejects %p', (value) => {
    expect(() => decodeParentSignatures(value)).toThrow(
      'The parameter sigs should list signatures',
    );
  });
});
