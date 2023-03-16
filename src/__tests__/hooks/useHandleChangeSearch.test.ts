import { FormEvent } from 'react';

import { renderHook } from '@testing-library/react';

import { useHandleChangeSearch } from '../../hooks/SearchResults';
import { setInputError, updateSearchResults } from '../../reducers/SearchSlice';
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

  it('should update the searchValue', () => {
    const testInput = 'test input';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch(createEvent(testInput));

    const { search: searchSlice } = store.getState();
    expect(searchSlice.searchValue).toBe('test input');
  });

  it('should set search results to []', () => {
    const testInput = 'test input';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    store.dispatch(updateSearchResults(testData));
    const { search: searchSlice } = store.getState();
    expect(searchSlice.searchResults).toEqual(testData);
    result.current.handleChangeSearch(createEvent(testInput));
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice.searchResults).not.toEqual(testData);
    expect(updatedSearchSlice.searchResults).toEqual([]);
  });

  it('should set inputHelperText to empty string', () => {
    const testInput = 'test input';
    const testError = 'test error';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    store.dispatch(setInputError(testError));
    const { search: searchSlice } = store.getState();
    expect(searchSlice.inputHelperText).toBe('test error');
    result.current.handleChangeSearch(createEvent(testInput));
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice.inputHelperText).toBe('');
  });

  it('should update inputHelperText to contain an error if search text does not match email or hash', () => {
    const testInput = 'test input';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch(createEvent(testInput));
    jest.runAllTimers();
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice.inputHelperText).toBe(
      'Search must be a 12- or 40-character hash, or email address',
    );
  });

  it('should fetch recent revisions if search is empty string', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const testInput = '';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    const { repository } = store.getState().search;
    result.current.handleChangeSearch(createEvent(testInput));
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?hide_reviewbot_pushes=true`,
    );
  });

  it('should fetch revisions by email', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const testInput = 'some@email.com';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    const { repository } = store.getState().search;
    result.current.handleChangeSearch(createEvent(testInput));
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?author=some@email.com`,
    );
  });

  it('should fetch revisions by hash', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const hashInput = 'abcdef123456';
    const hashInputLong = 'abcdef1234567890abcdef1234567890abcdef12';
    const { repository } = store.getState().search;
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch(createEvent(hashInput));
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?revision=abcdef123456`,
    );

    result.current.handleChangeSearch(createEvent(hashInputLong));
    jest.runAllTimers();
    expect(spyOnFetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${repository}/push/?revision=abcdef1234567890abcdef1234567890abcdef12`,
    );
  });

  it('should be debounced', () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const testInput = '';
    const { result } = renderHook(() => useHandleChangeSearch(), {
      wrapper: StoreProvider,
    });
    result.current.handleChangeSearch(createEvent(testInput));
    result.current.handleChangeSearch(createEvent(testInput));
    result.current.handleChangeSearch(createEvent(testInput));
    jest.runAllTimers();
    expect(spyOnFetch).toBeCalledTimes(1);
  });
});
