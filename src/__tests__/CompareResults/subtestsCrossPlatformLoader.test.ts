import fetchMock from '@fetch-mock/jest';

import { loader } from '../../components/CompareResults/subtestsCrossPlatformLoader';
import getTestData from '../utils/fixtures';

const BASE_PARAMS =
  'baseRev=spam&baseRepo=mozilla-central&newRev=eggs&newRepo=try&framework=1';

// The subtests fetch is memoized in a module-global map, so every test uses
// its own signature numbers rather than relying on a reset between tests.
function request(search: string) {
  return { request: new Request(`http://localhost/foo?${search}`) };
}

describe('subtestsCrossPlatformLoader', () => {
  it('throws when no parent signature is given', () => {
    expect(() => loader(request(BASE_PARAMS))).toThrow(
      'The parameter baseParentSignature is missing.',
    );
  });

  it('throws when the two signature parameters are repeated a different number of times', () => {
    expect(() =>
      loader(
        request(
          `${BASE_PARAMS}&baseParentSignature=1&baseParentSignature=2&newParentSignature=3`,
        ),
      ),
    ).toThrow('must be repeated the same number of times');
  });

  it('throws when a signature is not a number', () => {
    expect(() =>
      loader(
        request(
          `${BASE_PARAMS}&baseParentSignature=notanumber&newParentSignature=3`,
        ),
      ),
    ).toThrow('should be a number');
  });

  it('fetches one result set per signature pair and labels them from the URL', async () => {
    const { subtestsResult } = getTestData();
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );

    const { results, pairs } = loader(
      request(
        `${BASE_PARAMS}&test_version=student-t` +
          '&baseParentSignature=11&newParentSignature=12&platform=linux1804-64-shippable-qr' +
          '&baseParentSignature=13&newParentSignature=14&platform=windows10-64-shippable-qr',
      ),
    );

    expect(pairs).toHaveLength(2);
    const platformResults = await results;
    expect(platformResults.map((entry) => entry.platform)).toEqual([
      'linux1804-64-shippable-qr',
      'windows10-64-shippable-qr',
    ]);
    expect(platformResults[0].results).toHaveLength(subtestsResult.length);

    const fetchedUrls = fetchMock.callHistory
      .calls()
      .map((call) => call.args[0] as string);
    expect(fetchedUrls).toHaveLength(2);
    expect(fetchedUrls[0]).toContain('base_parent_signature=11');
    expect(fetchedUrls[1]).toContain('base_parent_signature=13');
  });

  it('reports a failing platform as an empty column instead of failing the page', async () => {
    const { subtestsResult } = getTestData();
    fetchMock
      .get({
        url: 'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
        query: { base_parent_signature: '21' },
        response: subtestsResult,
      })
      .get({
        url: 'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
        query: { base_parent_signature: '23' },
        response: 500,
      });

    const { results } = loader(
      request(
        `${BASE_PARAMS}&test_version=student-t` +
          '&baseParentSignature=21&newParentSignature=22&platform=linux' +
          '&baseParentSignature=23&newParentSignature=24&platform=windows',
      ),
    );

    const platformResults = await results;
    expect(platformResults[0].error).toBeUndefined();
    expect(platformResults[1].error).toEqual(expect.any(String));
    expect(platformResults[1].results).toEqual([]);
  });

  it('forces replicates on for Mann-Whitney-U', async () => {
    const { subtestsMannWhitneyResult } = getTestData();
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsMannWhitneyResult,
    );

    const { replicates, results } = loader(
      request(`${BASE_PARAMS}&baseParentSignature=31&newParentSignature=32`),
    );
    await results;

    expect(replicates).toBe(true);
    const [url] = fetchMock.callHistory.calls().map((call) => call.args[0]);
    expect(url).toContain('replicates=true');
    expect(url).toContain('test_version=mann-whitney-u');
  });

  it('ignores the platform parameter when it is not repeated as often as the signatures', async () => {
    const { subtestsResult } = getTestData();
    fetchMock.get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      subtestsResult,
    );

    const { results } = loader(
      request(
        `${BASE_PARAMS}&test_version=student-t` +
          '&baseParentSignature=41&newParentSignature=42' +
          '&baseParentSignature=43&newParentSignature=44&platform=linux',
      ),
    );

    // Falls back to the platform carried by the fetched results.
    const platformResults = await results;
    expect(platformResults.map((entry) => entry.platform)).toEqual([
      subtestsResult[0].platform,
      subtestsResult[0].platform,
    ]);
  });
});
