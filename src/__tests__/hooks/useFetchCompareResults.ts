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

  it('Should have the same base and new repo/rev', async () => {
    const {
      result: {
        current: { dispatchFetchCompareResults },
      },
    } = renderHook(() => useFetchCompareResults(), {
      wrapper: StoreProvider,
    });
    const spyOnFetch = jest.spyOn(global, 'fetch');
    await dispatchFetchCompareResults(['fenix'], ['testRev'], '1');
    expect(spyOnFetch).toBeCalledTimes(1);
  });
});
