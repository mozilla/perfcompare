import fetchMock from '@fetch-mock/jest';

import { loader } from '../../components/CompareResults/subtestsCrossPlatformLoader';
import getTestData from '../utils/fixtures';

const BASE_URL =
  'https://perf.compare/subtests-cross-platform-results?baseRev=spam&baseRepo=mozilla-central&newRev=eggs&newRepo=mozilla-central&framework=1';

const forBaseParentSignature =
  (signature: string) =>
  ({ url }: { url: string }) =>
    new URL(url).searchParams.get('base_parent_signature') === signature;

function load(search: string) {
  return loader({ request: new Request(BASE_URL + search) });
}

describe('subtestsCrossPlatformLoader', () => {
  it.each([
    ['', 'The parameter baseParentSignature is missing.'],
    ['&baseParentSignature=1', 'The parameter newParentSignature is missing.'],
    [
      '&baseParentSignature=1&baseParentSignature=3&newParentSignature=2',
      'The parameters baseParentSignature and newParentSignature must be repeated the same number of times.',
    ],
    [
      '&baseParentSignature=spam&newParentSignature=2',
      'The parameters baseParentSignature and newParentSignature should be numbers, but one of them is "spam".',
    ],
  ])('rejects the search %p', (search, message) => {
    expect(() => load(search)).toThrow(message);
  });

  it('fetches each platform and flags the ones that fail', async () => {
    const { subtestsResult } = getTestData();
    fetchMock
      .get(forBaseParentSignature('1'), subtestsResult)
      .get(forBaseParentSignature('3'), 500);

    const { results, testVersion } = load(
      '&baseParentSignature=1&newParentSignature=2&platform=linux' +
        '&baseParentSignature=3&newParentSignature=4&platform=windows',
    );

    expect(testVersion).toBe('mann-whitney-u');
    const [linux, windows] = await results;
    expect(linux).toMatchObject({
      platform: 'linux',
      baseParentSignature: '1',
      results: subtestsResult,
    });
    expect(linux.error).toBeUndefined();
    expect(windows).toMatchObject({ platform: 'windows', results: [] });
    expect(windows.error).toBeTruthy();
  });

  it('takes the platform from the results when the labels mismatch', async () => {
    const { subtestsResult } = getTestData();
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );

    const { results } = load(
      '&baseParentSignature=1&newParentSignature=2&platform=a&platform=b',
    );

    const [platformResult] = await results;
    expect(platformResult.platform).toBe(subtestsResult[0].platform);
  });
});
