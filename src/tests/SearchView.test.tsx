/**
 * @jest-environment jsdom
 */

import React from 'react';

import userEvent from '@testing-library/user-event';

import SearchView from '../components/Search/SearchView';
import { render, screen, waitFor, store } from './utils/test-utils';

const testResults = [
  {
    id: 1,
    revision: 'coconut',
    author: 'johncleese@python.com',
    push_timestamp: 42,
    repository_id: 4,
    revisions: [
      {
        revision: 'coconut',
        author: 'johncleese@python.com',
        comments: "you've got no arms left!",
      },
    ],
  },
  {
    id: 2,
    revision: 'spam',
    author: 'ericidle@python.com',
    push_timestamp: 42,
    repository_id: 3,
    revisions: [
      {
        revision: 'spam',
        author: 'ericidle@python.com',
        comments: "it's just a flesh wound",
      },
    ],
  },
];

describe('Search View', () => {
  it('renders correctly when there are no results', () => {
    render(<SearchView />);

    // Title appears
    expect(screen.getByText(/PerfCompare/i)).toBeInTheDocument();

    // Repository Select appears
    expect(screen.getByLabelText(/Repository/i)).toBeInTheDocument();

    // try is the default repository and dropdown is not visible
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

  it('should fetch and display recent results when repository is selected', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: testResults,
        }),
      }),
    );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    // Menu items should be visible
    await screen.findByRole('option', { name: 'autoland' });
    expect(screen.getByRole('option', { name: 'try' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'mozilla-central' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'autoland' }));
    jest.runOnlyPendingTimers();

    expect(store.getState().search.searchResults).toStrictEqual(testResults);

    await screen.findByText("coconut - you've got no arms left!");
    expect(
      screen.getByText("spam - it's just a flesh wound"),
    ).toBeInTheDocument();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/',
    );
    expect(document.body).toMatchSnapshot();
  });

  it('should hide search results when clicking outside of search input', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: testResults,
          }),
        }),
      ),
    );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    // Menu items should be visible
    await screen.findByRole('option', { name: 'try' });
    expect(screen.getByText(/autoland/i)).toBeInTheDocument();
    expect(screen.getByText(/mozilla-central/i)).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'autoland' }));

    expect(store.getState().search.searchResults).toStrictEqual(testResults);

    await screen.getByText("coconut - you've got no arms left!");
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

  it('should reject fetchRecentRevisions if fetch returns no results', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: [],
        }),
      }),
    );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    await screen.findByRole('option', { name: 'autoland' });
    await user.click(screen.getByRole('option', { name: 'autoland' }));
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/',
    );
    expect(store.getState().search.searchResults).toStrictEqual([]);
    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe('No results found');
  });

  it('should update error state if fetchRecentRevisions returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(new Error('What, ridden on a horse?')),
      );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    await screen.findByRole('option', { name: 'autoland' });
    await user.click(screen.getByRole('option', { name: 'autoland' }));
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/',
    );
    expect(store.getState().search.searchResults).toStrictEqual([]);
    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe(
      'What, ridden on a horse?',
    );
  });

  it('should fetch revisions by ID if searchValue is a 12 or 40 character hash', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: testResults,
        }),
      }),
    );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    await screen.findByRole('option', { name: 'try' });
    await user.click(screen.getByRole('option', { name: 'autoland' }));

    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenNthCalledWith(
      1,
      'https://treeherder.mozilla.org/api/project/autoland/push/',
    );
    expect(spyOnFetch).toHaveBeenNthCalledWith(
      2,
      'https://treeherder.mozilla.org/api/project/autoland/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
    );

    await waitFor(() =>
      expect(screen.queryByText('try')).not.toBeInTheDocument(),
    );
    await screen.findByText("coconut - you've got no arms left!");
    expect(
      screen.getByText("spam - it's just a flesh wound"),
    ).toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should fetch revisions by author if searchValue is an email address', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: testResults,
        }),
      }),
    );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    await screen.findByRole('option', { name: 'autoland' });
    await user.click(screen.getByRole('option', { name: 'autoland' }));

    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'johncleese@python.com');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?author=johncleese@python.com',
    );

    await waitFor(() =>
      expect(screen.queryByText('try')).not.toBeInTheDocument(),
    );
    await screen.findByText("coconut - you've got no arms left!");
    expect(
      screen.getByText("spam - it's just a flesh wound"),
    ).toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should reject fetchRevisionsByID if fetch returns no results', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: [],
        }),
      }),
    );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    await screen.findByRole('option', { name: 'autoland' });
    await user.click(screen.getByRole('option', { name: 'autoland' }));

    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
    );

    await screen.findByText('No results found');
    expect(screen.queryByText('No results found')).toBeInTheDocument();
    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe('No results found');
  });

  it('should update error state if fetchRevisionsByID returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(
          new Error(
            "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
          ),
        ),
      );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    await screen.findByRole('option', { name: 'autoland' });
    await user.click(screen.getByRole('option', { name: 'autoland' }));

    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
    );

    await screen.findByText(
      "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
    );

    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe(
      "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
    );
  });

  it('should reject fetchRevisionsByAuthor if fetch returns no results', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: [],
        }),
      }),
    );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    await screen.findByRole('option', { name: 'autoland' });
    await user.click(screen.getByRole('option', { name: 'autoland' }));

    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'ericidle@python.com');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?author=ericidle@python.com',
    );

    await screen.findByText('No results found');

    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe('No results found');
  });

  it('should update error state if fetchRevisionsByAuthor returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(new Error('She turned me into a newt')),
      );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    await screen.findByRole('option', { name: 'autoland' });
    await user.click(screen.getByRole('option', { name: 'autoland' }));

    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'grahamchapman@python.com');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?author=grahamchapman@python.com',
    );

    await screen.findByText('She turned me into a newt');

    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe(
      'She turned me into a newt',
    );
  });

  it('should not call fetch if searchValue is not a hash or email', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: [],
        }),
      }),
    );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    expect(screen.getByText(/autoland/i)).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'autoland' }));

    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'coconut');
    await user.clear(searchInput);
    await user.type(searchInput, 'spam@eggs');
    await user.clear(searchInput);
    await user.type(searchInput, 'spamspamspamand@eggs.');
    await user.clear(searchInput);
    await user.type(searchInput, 'iamalmostlongenoughtobeahashbutnotquite');
    jest.runOnlyPendingTimers();

    // fetch should only be called when selecting a repository
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/',
    );

    await screen.findByText(
      'Search must be a 12- or 40-character hash, or email address',
    );

    expect(store.getState().search.inputError).toBe(true);
  });

  it('should clear searchResults if searchValue is cleared', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve({
        json: () => ({
          results: testResults,
        }),
      }),
    );
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    expect(screen.getByRole('option', { name: 'try' })).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'autoland' }));

    const searchInput = screen.getByLabelText(
      'Search By Revision ID or Author Email',
    );
    await user.type(searchInput, 'terryjones@python.com');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?author=terryjones@python.com',
    );

    await waitFor(() =>
      expect(screen.queryByText('try')).not.toBeInTheDocument(),
    );
    await screen.findByText("coconut - you've got no arms left!");

    expect(store.getState().search.searchResults).toStrictEqual(testResults);

    await user.clear(searchInput);
    expect(store.getState().search.searchResults).toStrictEqual([]);
  });

  it('should fetch results if repository is selected after searchValue is input', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: testResults,
          }),
        }),
      ),
    );
    const user = userEvent.setup({ delay: null });

    render(<SearchView />);

    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'terryjones@python.com');

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    await screen.getByRole('option', { name: 'try' });
    await user.click(screen.getByRole('option', { name: 'autoland' }));

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?author=terryjones@python.com',
    );
  });
});
