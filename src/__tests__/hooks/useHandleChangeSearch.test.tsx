import { FormEvent } from 'react';

import { Provider } from 'react-redux';

import useHandleChangeSearch from '../../hooks/useHandleChangeSearch';
import { InputType, Repository } from '../../types/state';
import { store } from '../utils/setupTests';
import { renderHook } from '../utils/test-utils';

function renderHandleChangeSearchHook(fetcherLoad = jest.fn()) {
  return renderHook(() => useHandleChangeSearch(fetcherLoad), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
}

describe('Tests useHandleSearchHook', () => {
  const createEvent = (search = '') =>
    ({ currentTarget: { value: search } } as FormEvent<HTMLInputElement>);

  it('should fetch recent revisions if search is empty string', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent(''),
      searchType,
      repository: 'try' as Repository['name'],
    };
    const fetcherLoad = jest.fn();
    const { result } = renderHandleChangeSearchHook(fetcherLoad);
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(fetcherLoad).toHaveBeenCalledWith(
      `/api/recent-revisions/${searchState.repository}`,
    );
  });

  it('should fetch revisions by email', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent('some@email.com'),
      searchType,
      repository: 'try' as Repository['name'],
    };
    const fetcherLoad = jest.fn();
    const { result } = renderHandleChangeSearchHook(fetcherLoad);
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(fetcherLoad).toHaveBeenCalledWith(
      `/api/recent-revisions/${searchState.repository}/by-author/some%40email.com`,
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
    const fetcherLoad = jest.fn();
    const { result } = renderHandleChangeSearchHook(fetcherLoad);
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(fetcherLoad).toHaveBeenCalledWith(
      `/api/recent-revisions/${searchState.repository}/by-hash/abcdef123456`,
    );

    result.current.handleChangeSearch(searchState2);
    jest.runAllTimers();
    expect(fetcherLoad).toHaveBeenCalledWith(
      `/api/recent-revisions/${searchState2.repository}/by-hash/abcdef1234567890abcdef1234567890abcdef12`,
    );
  });

  it('should be debounced', async () => {
    const searchType = 'base' as InputType;
    const searchState = {
      e: createEvent(''),
      searchType,
      repository: 'autoland' as Repository['name'],
    };
    const fetcherLoad = jest.fn();
    const { result } = renderHandleChangeSearchHook(fetcherLoad);
    result.current.handleChangeSearch(searchState);
    result.current.handleChangeSearch(searchState);
    result.current.handleChangeSearch(searchState);
    jest.runAllTimers();
    expect(fetcherLoad).toBeCalledTimes(1);
  });
});
