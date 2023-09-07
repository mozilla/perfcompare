import { FormEvent } from 'react';

import { renderHook, act } from '@testing-library/react';

import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { setInputError, updateSearchResults } from '../../reducers/SearchSlice';
import { InputType } from '../../types/state';
import getTestData from '../utils/fixtures';
import { store, StoreProvider } from '../utils/setupTests';

jest.useFakeTimers();

describe('Tests useHandleSearchHook', () => {
  const { testData } = getTestData();
  const createEvent = (search = '') =>
    ({ currentTarget: { value: search } } as FormEvent<HTMLInputElement>);

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
  });

  it('should update the searchValue', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('test input'),
      searchType,
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    const { search: searchSlice } = store.getState();
    expect(searchSlice[searchType].searchValue).toBe('test input');
  });

  it('should set search results to []', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('test input'),
      searchType,
    };
    const searchResults = {
      results: testData,
      searchType,
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });

    await act(async () => {
      store.dispatch(updateSearchResults(searchResults));
    });

    const { search: searchSlice } = store.getState();
    expect(searchSlice[searchType].searchResults).toEqual(testData);
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice[searchType].searchResults).not.toEqual(testData);
    expect(updatedSearchSlice[searchType].searchResults).toEqual([]);
  });

  it('should set inputHelperText to empty string', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('test input'),
      searchType,
    };
    const testError = 'test error';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });

    act(() => {
      store.dispatch(setInputError({ errorMessage: testError, searchType }));
    });

    const { search: searchSlice } = store.getState();
    expect(searchSlice[searchType].inputHelperText).toBe('test error');
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice[searchType].inputHelperText).toBe('');
  });

  it('should update inputHelperText to contain an error if search text does not match email or hash', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('test input'),
      searchType,
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    jest.runAllTimers();
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice[searchType].inputHelperText).toBe(
      'Search must be a 12- or 40-character hash, or email address',
    );
  });

  it('should fetch recent revisions if search is empty string', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent(''),
      searchType,
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    const repository = store.getState().search[searchType].repository;
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    jest.runAllTimers();
    expect(global.fetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?hide_reviewbot_pushes=true`,
    );
  });

  it('should fetch revisions by email', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('some@email.com'),
      searchType,
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    const repository = store.getState().search[searchType].repository;
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    jest.runAllTimers();
    expect(global.fetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?author=some@email.com`,
    );
  });

  it('should fetch revisions by hash', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('abcdef123456'),
      searchType,
    };
    const searchState2 = {
      e: createEvent('abcdef1234567890abcdef1234567890abcdef12'),
      searchType,
    };
    const repository = store.getState().search[searchType].repository;
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    jest.runAllTimers();
    expect(global.fetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?revision=abcdef123456`,
    );

    await act(async () => {
      result.current.handleChangeSearch(searchState2);
    });
    jest.runAllTimers();
    expect(global.fetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?revision=abcdef1234567890abcdef1234567890abcdef12`,
    );
  });

  it('should be debounced', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent(''),
      searchType,
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    await act(async () => {
      result.current.handleChangeSearch(searchState);
    });
    jest.runAllTimers();
    expect(global.fetch).toBeCalledTimes(1);
  });
});
