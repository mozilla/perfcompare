import { FormEvent } from 'react';

import { Provider } from 'react-redux';

import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { setInputError, updateSearchResults } from '../../reducers/SearchSlice';
import { InputType, Repository } from '../../types/state';
import getTestData from '../utils/fixtures';
import { store } from '../utils/setupTests';
import { renderHook, FetchMockSandbox } from '../utils/test-utils';

function renderHandleChangeSearchHook() {
  return renderHook(() => useHandleChangeSearch(), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
}

describe('Tests useHandleSearchHook', () => {
  const { testData } = getTestData();
  const createEvent = (search = '') =>
    ({ currentTarget: { value: search } } as FormEvent<HTMLInputElement>);

  beforeEach(() => {
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      {
        results: testData,
      },
    );
  });

  it('should update the searchValue', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('test input'),
      searchType,
      repository: 'try' as Repository['name'],
    };
    const { result } = renderHandleChangeSearchHook();
    result.current.handleChangeSearch(searchState);
    const { search: searchSlice } = store.getState();
    expect(searchSlice[searchType].searchValue).toBe('test input');
  });

  it('should set search results to []', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('test input'),
      searchType,
      repository: 'try' as Repository['name'],
    };
    const searchResults = {
      results: testData,
      searchType,
    };
    const { result } = renderHandleChangeSearchHook();

    store.dispatch(updateSearchResults(searchResults));

    const { search: searchSlice } = store.getState();
    expect(searchSlice[searchType].searchResults).toEqual(testData);
    result.current.handleChangeSearch(searchState);
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice[searchType].searchResults).not.toEqual(testData);
    expect(updatedSearchSlice[searchType].searchResults).toEqual([]);
  });

  it('should set inputHelperText to empty string', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('test input'),
      searchType,
      repository: 'try' as Repository['name'],
    };
    const testError = 'test error';
    const { result } = renderHandleChangeSearchHook();

    store.dispatch(setInputError({ errorMessage: testError, searchType }));

    const { search: searchSlice } = store.getState();
    expect(searchSlice[searchType].inputHelperText).toBe('test error');
    result.current.handleChangeSearch(searchState);
    const { search: updatedSearchSlice } = store.getState();
    expect(updatedSearchSlice[searchType].inputHelperText).toBe('');
  });

  it('should update inputHelperText to contain an error if search text does not match email or hash', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('test input'),
      searchType,
      repository: 'try' as Repository['name'],
    };
    const { result } = renderHandleChangeSearchHook();
    result.current.handleChangeSearch(searchState);
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
      repository: 'try' as Repository['name'],
    };
    const { result } = renderHandleChangeSearchHook();
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(global.fetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${searchState.repository}/push/?hide_reviewbot_pushes=true`,
      undefined,
    );
  });

  it('should fetch revisions by email', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('some@email.com'),
      searchType,
      repository: 'try' as Repository['name'],
    };
    const { result } = renderHandleChangeSearchHook();
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(global.fetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${searchState.repository}/push/?author=some@email.com`,
      undefined,
    );
  });

  it('should fetch revisions by hash', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('abcdef123456'),
      searchType,
      repository: 'try' as Repository['name'],
    };
    const searchState2 = {
      e: createEvent('abcdef1234567890abcdef1234567890abcdef12'),
      searchType,
      repository: 'mozilla-central' as Repository['name'],
    };
    const { result } = renderHandleChangeSearchHook();
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(global.fetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${searchState.repository}/push/?revision=abcdef123456`,
      undefined,
    );

    result.current.handleChangeSearch(searchState2);
    jest.runAllTimers();
    expect(global.fetch).toHaveBeenCalledWith(
      `https://treeherder.mozilla.org/api/project/${searchState2.repository}/push/?revision=abcdef1234567890abcdef1234567890abcdef12`,
      undefined,
    );
  });

  it('should be debounced', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent(''),
      searchType,
      repository: 'autoland' as Repository['name'],
    };
    const { result } = renderHandleChangeSearchHook();
    result.current.handleChangeSearch(searchState);
    result.current.handleChangeSearch(searchState);
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(global.fetch).toBeCalledTimes(1);
  });
});
