/**
 * @jest-environment jsdom
 */

import React from 'react';

import userEvent from '@testing-library/user-event';

import store from '../common/store';
import SearchInput from '../components/Search/SearchInput';
import SearchResultsList from '../components/Search/SearchResultsList';
import SearchView from '../components/Search/SearchView';
import {
  updateRepository,
  updateSearchResults,
  updateSearchValue,
} from '../reducers/SearchSlice';
import { render, fireEvent, screen } from './utils/test-utils';

const unmockedFetch = global.fetch;

beforeEach(() => {
  global.fetch = () =>
    Promise.resolve(
      Promise.resolve({
        json: () => [],
      }),
    );
});

afterEach(() => {
  global.fetch = unmockedFetch;
  store.dispatch(updateSearchValue(''));
  store.dispatch(updateSearchResults([]));
  store.dispatch(updateRepository(''));
  jest.clearAllMocks();
  jest.resetAllMocks();
  jest.restoreAllMocks();
});

describe('Search View', () => {
  it('renders correctly', () => {
    const searchView = render(<SearchView />);

    // Title appears
    expect(screen.getByText(/PerfCompare/i)).toBeInTheDocument();

    // Repository Select appears
    expect(screen.getByLabelText(/Repository/i)).toBeInTheDocument();

    // No repositories are selected and dropdown is not visible
    expect(screen.queryByText(/autoland/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/try/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mozilla-central/i)).not.toBeInTheDocument();
    // Search input appears
    expect(
      screen.getByLabelText(/Search By Revision ID or Author Email/i),
    ).toBeInTheDocument();

    // No list items should appear
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    expect(searchView).toMatchSnapshot();
  });
});

describe('Search Input', () => {
  it('should fetch recent revisions when a repository is selected', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: [],
          }),
        }),
      ),
    );
    const user = userEvent.setup();
    render(<SearchInput />);
    const spyOnDispatch = jest.spyOn(store, 'dispatch');
    const spyOnGetState = jest.spyOn(store, 'getState');

    // Click Dropdown
    fireEvent.mouseDown(screen.getByRole('button', { name: 'repository' }));

    // Menu items should be visible
    expect(screen.getByText(/autoland/i)).toBeInTheDocument();
    expect(screen.getByText(/try/i)).toBeInTheDocument();
    expect(screen.getByText(/mozilla-central/i)).toBeInTheDocument();

    // Should call fetch, getState, and dispatch when an item is clicked
    await user.click(screen.getByRole('option', { name: 'autoland' }));
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnGetState).toHaveBeenCalled();
    expect(spyOnDispatch).toHaveBeenCalledTimes(2);
  });
});

describe('Search Results List', () => {
  it('should show results if searchResults is not empty', () => {
    const results = [
      {
        id: 1,
        revision: 'coconut',
        author: 'johncleese@python.com',
        push_timestamp: 42,
        repository_id: 4,
      },
      {
        id: 2,
        revision: 'spam',
        author: 'ericidle@python.com',
        push_timestamp: 42,
        repository_id: 3,
      },
    ];
    store.dispatch(updateSearchResults(results));

    const searchResultsList = render(<SearchResultsList store={store} />);

    expect(store.getState().search.searchResults).toBe(results);
    expect(screen.getByText('coconut')).toBeInTheDocument();
    expect(screen.getByText('spam')).toBeInTheDocument();

    expect(searchResultsList).toMatchSnapshot();
  });
});
