import { renderHook } from '@testing-library/react';

import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import {
  setInputErrorBase,
  updateSearchResults,
} from '../../reducers/SearchSlice';
import getTestData from '../utils/fixtures';
import { store, StoreProvider } from '../utils/setupTests';

jest.useFakeTimers();

describe('Tests useHandleSearchHook', () => {
  const { testData } = getTestData();

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
  });

  it('should update the searchValue', () => {
    const searchState = {
      baseSearch: 'test input',
      newSearch: '',
      searchType: 'base' as 'base' | 'new',
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch(searchState);

    const { search: searchSlice } = store.getState();
    expect(searchSlice.searchValue).toBe('test input');
  });

  it('should set search results to []', () => {
    const searchState = {
      baseSearch: 'test input',
      newSearch: '',
      searchType: 'base' as 'base' | 'new',
    };
    const searchResults = {
      payload: testData,
      searchType: 'base' as 'base' | 'new',
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    store.dispatch(updateSearchResults(searchResults));
    const { search: searchSlice } = store.getState();
    expect(searchSlice.searchResults).toEqual(testData);
    result.current.handleChangeSearch(searchState);
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice.searchResults).not.toEqual(testData);
    expect(updatedSearchSlice.searchResults).toEqual([]);
  });

  it('should set inputHelperText to empty string', () => {
    const searchState = {
      baseSearch: 'test input',
      newSearch: '',
      searchType: 'base' as 'base' | 'new',
    };

    const testError = 'test error';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    store.dispatch(setInputErrorBase(testError));
    const { search: searchSlice } = store.getState();
    expect(searchSlice.inputHelperText).toBe('test error');
    result.current.handleChangeSearch(searchState);
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice.inputHelperText).toBe('');
  });

  it('should update inputHelperText to contain an error if search text does not match email or hash', () => {
    const searchState = {
      baseSearch: 'test input',
      newSearch: '',
      searchType: 'base' as 'base' | 'new',
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice.inputHelperText).toBe(
      'Search must be a 12- or 40-character hash, or email address',
    );
  });

  it('should fetch recent revisions if search is empty string', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const searchState = {
      baseSearch: '',
      newSearch: '',
      searchType: 'base' as 'base' | 'new',
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    const repository = store.getState().search.baseRepository;
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?hide_reviewbot_pushes=true`,
    );
  });

  it('should fetch revisions by email', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const searchState = {
      baseSearch: 'some@email.com',
      newSearch: '',
      searchType: 'base' as 'base' | 'new',
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    const repository = store.getState().search.baseRepository;
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?author=some@email.com`,
    );
  });

  it('should fetch revisions by hash', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const searchState1 = {
      baseSearch: 'abcdef123456',
      newSearch: '',
      searchType: 'base' as 'base' | 'new',
    };
    const searchState2 = {
      ...searchState1,
      baseSearch: 'abcdef1234567890abcdef1234567890abcdef12',
    };
    const repository = store.getState().search.baseRepository;
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch(searchState1);
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?revision=abcdef123456`,
    );

    result.current.handleChangeSearch(searchState2);
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?revision=abcdef1234567890abcdef1234567890abcdef12`,
    );
  });

  it('should be debounced', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const searchState = {
      baseSearch: '',
      newSearch: '',
      searchType: 'base' as 'base' | 'new',
    };
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch(searchState);
    result.current.handleChangeSearch(searchState);
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(spyOnFetch).toBeCalledTimes(1);
  });
});
