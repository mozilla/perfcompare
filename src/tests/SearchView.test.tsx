/**
 * @jest-environment jsdom
 */

import * as React from 'react';

import userEvent from '@testing-library/user-event';

import SearchView from '../components/Search/SearchView';
import testResults from './utils/constants';
import { render, screen, store } from './utils/test-utils';

describe('Search View', () => {
  it('renders correctly when there are no results', () => {
    render(<SearchView />);

    // Title appears
    expect(screen.getByText(/PerfCompare/i)).toBeInTheDocument();

    // Repository Select appears
    expect(screen.getByLabelText(/Repository/i)).toBeInTheDocument();

    // 'try' is selected by default and dropdown is not visible
    expect(screen.queryByText(/try/i)).toBeInTheDocument();
    expect(screen.queryByText(/autoland/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/mozilla-central/i)).not.toBeInTheDocument();
    // Search input appears
    expect(
      screen.getByLabelText(/Search By Revision ID or Author Email/i),
    ).toBeInTheDocument();

    // No list items should appear
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should not call fetch if searchValue is not a hash or email', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'coconut');
    await user.clear(searchInput);
    await user.type(searchInput, 'spam@eggs');
    await user.clear(searchInput);
    await user.type(searchInput, 'spamspamspamand@eggs.');
    await user.clear(searchInput);
    await user.type(searchInput, 'iamalmostlongenoughtobeahashbutnotquite');

    // fetch should only be called when fetching recent results for default
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/',
    );
    await screen.findByText(
      'Search must be a 12- or 40-character hash, or email address',
    );
  });

  it('should clear searchResults if searchValue is cleared', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testResults,
        }),
      }),
    ) as jest.Mock;
    const spyOnFetch = jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });

    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'terryjones@python.com');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenNthCalledWith(
      2,
      'https://treeherder.mozilla.org/api/project/try/push/?author=terryjones@python.com',
    );
    await screen.findByText("coconut - you've got no arms left!");
    expect(store.getState().search.searchResults).toStrictEqual(testResults);
    await user.clear(searchInput);
    expect(store.getState().search.searchResults).toStrictEqual([]);
    expect(
      screen.queryByText("coconut - you've got no arms left!"),
    ).not.toBeInTheDocument();
  });

  it('should hide search results when clicking outside of search input', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testResults,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });

    expect(store.getState().search.searchResults).toStrictEqual(testResults);
    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    await screen.findByText("coconut - you've got no arms left!");
    expect(
      screen.getByText("spam - it's just a flesh wound"),
    ).toBeInTheDocument();

    await user.click(screen.getByText('PerfCompare'));

    expect(
      screen.queryByText("coconut - you've got no arms left!"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("spam - it's just a flesh wound"),
    ).not.toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should not hide search results when clicking search results', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testResults,
        }),
      }),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });

    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    await screen.findByText("coconut - you've got no arms left!");
    expect(
      screen.getByText("spam - it's just a flesh wound"),
    ).toBeInTheDocument();

    await user.click(screen.getByText("coconut - you've got no arms left!"));
    await user.click(screen.getAllByTestId('CheckBoxOutlineBlankIcon')[0]);

    expect(
      screen.queryByText("coconut - you've got no arms left!"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("spam - it's just a flesh wound"),
    ).toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });
});
