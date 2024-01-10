import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import { StoreProvider } from '../utils/setupTests';
import { renderHook, FetchMockSandbox } from '../utils/test-utils';

describe('Tests useFetchCompareResults', () => {
  beforeEach(() => {
    (global.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/perfcompare/results/',
      [],
    );
  });

  it('Should have the same base and new repo/rev if called with arrays of length 1', async () => {
    const {
      result: {
        current: { dispatchFetchCompareResults },
      },
    } = renderHook(() => useFetchCompareResults(), { wrapper: StoreProvider });
    dispatchFetchCompareResults(['fenix'], ['testRev'], '1');
    const url = (global.fetch as FetchMockSandbox).lastUrl() ?? '';
    const searchParams = new URL(url).searchParams;
    expect(searchParams.get('base_revision')).toBe('testRev');
    expect(searchParams.get('new_revision')).toBe('testRev');
    expect(searchParams.get('base_repository')).toBe('fenix');
    expect(searchParams.get('new_repository')).toBe('fenix');
  });

  it('Should have different base/new values if called with 2 element arrays', async () => {
    const {
      result: {
        current: { dispatchFetchCompareResults },
      },
    } = renderHook(() => useFetchCompareResults(), { wrapper: StoreProvider });
    dispatchFetchCompareResults(
      ['fenix', 'try'],
      ['testRev1', 'testRev2'],
      '1',
    );
    const url = (global.fetch as FetchMockSandbox).lastUrl() ?? '';
    const searchParams = new URL(url).searchParams;
    expect(searchParams.get('base_revision')).toBe('testRev1');
    expect(searchParams.get('new_revision')).toBe('testRev2');
    expect(searchParams.get('base_repository')).toBe('fenix');
    expect(searchParams.get('new_repository')).toBe('try');
  });

  it('Should fetch if provided with 4 revs', async () => {
    const {
      result: {
        current: { dispatchFetchCompareResults },
      },
    } = renderHook(() => useFetchCompareResults(), { wrapper: StoreProvider });
    dispatchFetchCompareResults(
      ['fenix', 'try', 'mozilla-beta', 'autoland'],
      ['testRev1', 'testRev2', 'testRev3', 'testRev4'],
      '1',
    );
    expect(global.fetch).toBeCalledTimes(3);
  });

  it('Should not fetch if provided with 5 or more revs', async () => {
    const {
      result: {
        current: { dispatchFetchCompareResults },
      },
    } = renderHook(() => useFetchCompareResults(), { wrapper: StoreProvider });
    dispatchFetchCompareResults(
      ['fenix', 'try', 'mozilla-beta', 'autoland', 'mozilla-central'],
      ['testRev1', 'testRev2', 'testRev3', 'testRev4', 'testRev5'],
      '1',
    );
    expect(global.fetch).not.toBeCalled();
  });
});
