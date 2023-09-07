import { renderHook } from '@testing-library/react';

import useFetchCompareResults from '../../hooks/useFetchCompareResults';
import getTestData from '../utils/fixtures';
import { StoreProvider } from '../utils/setupTests';

describe('Tests useFetchCompareResults', () => {
  beforeEach(() => {
    const { testCompareData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testCompareData,
        }),
      }),
    ) as jest.Mock;
  });

  it('Should have the same base and new repo/rev if called with arrays of length 1', async () => {
    const {
      result: {
        current: { dispatchFetchCompareResults },
      },
    } = renderHook(() => useFetchCompareResults(), { wrapper: StoreProvider });
    const spyOnFetch = jest.spyOn(global, 'fetch');
    await dispatchFetchCompareResults(['fenix'], ['testRev'], '1');
    const url = new URL(spyOnFetch.mock.calls[0][0] as string);
    const searchParams = new URLSearchParams(url.search);
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
    const spyOnFetch = jest.spyOn(global, 'fetch');
    await dispatchFetchCompareResults(
      ['fenix', 'try'],
      ['testRev1', 'testRev2'],
      '1',
    );
    const url = new URL(spyOnFetch.mock.calls[0][0] as string);
    const searchParams = new URLSearchParams(url.search);
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
    const spyOnFetch = jest.spyOn(global, 'fetch');
    await dispatchFetchCompareResults(
      ['fenix', 'try', 'mozilla-beta', 'autoland'],
      ['testRev1', 'testRev2', 'testRev3', 'testRev4'],
      '1',
    );
    expect(spyOnFetch).toBeCalledTimes(3);
  });

  it('Should not fetch if provided with 5 or more revs', async () => {
    const {
      result: {
        current: { dispatchFetchCompareResults },
      },
    } = renderHook(() => useFetchCompareResults(), { wrapper: StoreProvider });
    const spyOnFetch = jest.spyOn(global, 'fetch');
    await dispatchFetchCompareResults(
      ['fenix', 'try', 'mozilla-beta', 'autoland', 'mozilla-central'],
      ['testRev1', 'testRev2', 'testRev3', 'testRev4', 'testRev5'],
      '1',
    );
    expect(spyOnFetch).not.toBeCalled();
  });
});
