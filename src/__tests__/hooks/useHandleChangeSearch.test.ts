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
    const baseSearch = 'test input';
    const newSearch = '';
    const searchType = 'base';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });

    const { search: searchSlice } = store.getState();
    expect(searchSlice.searchValue).toBe('test input');
  });

  it('should set search results to []', () => {
    const baseSearch = 'test input';
    const newSearch = '';
    const searchType = 'base';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    store.dispatch(updateSearchResults({ payload: testData, searchType }));
    const { search: searchSlice } = store.getState();
    expect(searchSlice.searchResults).toEqual(testData);
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice.baseSearchResults).not.toEqual(testData);
    expect(updatedSearchSlice.baseSearchResults).toEqual([]);
  });

  it('should set inputHelperText to empty string', () => {
    const baseSearch = 'test input';
    const newSearch = '';
    const testError = 'test error';
    const searchType = 'base';

    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    store.dispatch(setInputErrorBase(testError));
    const { search: searchSlice } = store.getState();
    expect(searchSlice.inputHelperText).toBe('test error');
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice.inputHelperText).toBe('');
  });

  it('should update inputHelperText to contain an error if search text does not match email or hash', () => {
    const baseSearch = 'test input';
    const newSearch = '';
    const searchType = 'base';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    jest.runAllTimers();
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice.inputHelperText).toBe(
      'Search must be a 12- or 40-character hash, or email address',
    );
  });

  it('should fetch recent revisions if search is empty string', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const baseSearch = '';
    const newSearch = '';
    const searchType = 'base';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    const { baseRepository } = store.getState().search;
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${baseRepository}/push/?hide_reviewbot_pushes=true`,
    );
  });

  it('should fetch revisions by email', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const baseSearch = 'some@email.com';
    const newSearch = '';
    const searchType = 'base';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    const { baseRepository } = store.getState().search;
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${baseRepository}/push/?author=some@email.com`,
    );
  });

  it('should fetch revisions by hash', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    let baseSearch = 'abcdef123456';
    const newSearch = '';
    const searchType = 'base';

    const { baseRepository } = store.getState().search;
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${baseRepository}/push/?revision=abcdef123456`,
    );

    baseSearch = 'abcdef1234567890abcdef1234567890abcdef12';

    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${baseRepository}/push/?revision=abcdef1234567890abcdef1234567890abcdef12`,
    );
  });

  it('should be debounced', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const baseSearch = '';
    const newSearch = '';
    const searchType = 'base';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    result.current.handleChangeSearch({ baseSearch, newSearch, searchType });
    jest.runAllTimers();
    expect(spyOnFetch).toBeCalledTimes(1);
  });
});
