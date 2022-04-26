/**
 * @jest-environment jsdom
 */

import React from 'react';

import userEvent from '@testing-library/user-event';

import SearchView from '../components/Search/SearchView';
import { render, screen, waitFor, store } from './utils/test-utils';

const { getByLabelText, getByRole, getByText, queryByRole, queryByText } =
  screen;

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
    expect(getByText(/PerfCompare/i)).toBeInTheDocument();

    // Repository Select appears
    expect(getByLabelText(/Repository/i)).toBeInTheDocument();

    // No repositories are selected and dropdown is not visible
    expect(queryByText(/autoland/i)).not.toBeInTheDocument();
    expect(queryByText(/try/i)).not.toBeInTheDocument();
    expect(queryByText(/mozilla-central/i)).not.toBeInTheDocument();
    // Search input appears
    expect(
      getByLabelText(/Search By Revision ID or Author Email/i),
    ).toBeInTheDocument();

    // No list items should appear
    expect(queryByRole('listitem')).not.toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should fetch and display recent results when repository is selected', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: testResults,
          }),
        }),
      ),
    );
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    // Menu items should be visible
    expect(getByText(/autoland/i)).toBeInTheDocument();
    expect(getByText(/try/i)).toBeInTheDocument();
    expect(getByText(/mozilla-central/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    expect(store.getState().search.searchResults).toStrictEqual(testResults);

    await waitFor(() =>
      expect(
        queryByText("coconut - you've got no arms left!"),
      ).toBeInTheDocument(),
    );
    expect(getByText("coconut - you've got no arms left!")).toBeInTheDocument();
    expect(getByText("spam - it's just a flesh wound")).toBeInTheDocument();

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
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    // Menu items should be visible
    expect(getByText(/autoland/i)).toBeInTheDocument();
    expect(getByText(/try/i)).toBeInTheDocument();
    expect(getByText(/mozilla-central/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    expect(store.getState().search.searchResults).toStrictEqual(testResults);

    await waitFor(() =>
      expect(
        queryByText("coconut - you've got no arms left!"),
      ).toBeInTheDocument(),
    );
    expect(getByText("coconut - you've got no arms left!")).toBeInTheDocument();
    expect(getByText("spam - it's just a flesh wound")).toBeInTheDocument();

    await user.click(getByText('PerfCompare'));

    expect(
      queryByText("coconut - you've got no arms left!"),
    ).not.toBeInTheDocument();
    expect(
      queryByText("spam - it's just a flesh wound"),
    ).not.toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should catch error if element clicked has no parent element', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: testResults,
          }),
        }),
      ),
    );
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    // Menu items should be visible
    expect(getByText(/autoland/i)).toBeInTheDocument();
    expect(getByText(/try/i)).toBeInTheDocument();
    expect(getByText(/mozilla-central/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    expect(store.getState().search.searchResults).toStrictEqual(testResults);

    await waitFor(() =>
      expect(
        queryByText("coconut - you've got no arms left!"),
      ).toBeInTheDocument(),
    );
    expect(getByText("coconut - you've got no arms left!")).toBeInTheDocument();
    expect(getByText("spam - it's just a flesh wound")).toBeInTheDocument();

    try {
      await user.click(document.getElementsByTagName('html')[0]);
    } catch (e) {
      expect(e).toBeInstanceOf(TypeError);
    }
    expect(
      queryByText("coconut - you've got no arms left!"),
    ).not.toBeInTheDocument();
    expect(
      queryByText("spam - it's just a flesh wound"),
    ).not.toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should reject fetchRecentRevisions if fetch returns no results', async () => {
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

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/try/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/',
    );
    expect(store.getState().search.searchResults).toStrictEqual([]);
    expect(store.getState().search.errorMessage).toBe('No results found');
  });

  it('should update error state if fetchRecentRevisions returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(new Error('What, ridden on a horse?')),
      );
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/autoland/i)).toBeInTheDocument();
    await user.click(getByRole('option', { name: 'autoland' }));

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/',
    );
    expect(store.getState().search.searchResults).toStrictEqual([]);
    expect(store.getState().search.errorMessage).toBe(
      'What, ridden on a horse?',
    );
  });

  it('should fetch revisions by ID if searchValue is a 12 or 40 character hash', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: testResults,
          }),
        }),
      ),
    );
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/try/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    const searchInput = getByRole('textbox');

    await user.type(
      searchInput,
      'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    );

    expect(spyOnFetch).toHaveBeenNthCalledWith(
      1,
      'https://treeherder.mozilla.org/api/project/autoland/push/',
    );
    expect(spyOnFetch).toHaveBeenNthCalledWith(
      2,
      'https://treeherder.mozilla.org/api/project/autoland/push/?revision=abcdef123456',
    );
    expect(spyOnFetch).toHaveBeenNthCalledWith(
      3,
      'https://treeherder.mozilla.org/api/project/autoland/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
    );

    await waitFor(() => expect(queryByText('try')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(
        queryByText("coconut - you've got no arms left!"),
      ).toBeInTheDocument(),
    );
    expect(getByText("coconut - you've got no arms left!")).toBeInTheDocument();
    expect(getByText("spam - it's just a flesh wound")).toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should fetch revisions by author if searchValue is an email address', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: testResults,
          }),
        }),
      ),
    );
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/try/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    const searchInput = getByRole('textbox');

    await user.type(searchInput, 'johncleese@python.com');

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?author=johncleese@python.com',
    );

    await waitFor(() => expect(queryByText('try')).not.toBeInTheDocument());
    await waitFor(() =>
      expect(
        queryByText("coconut - you've got no arms left!"),
      ).toBeInTheDocument(),
    );
    expect(getByText("coconut - you've got no arms left!")).toBeInTheDocument();
    expect(getByText("spam - it's just a flesh wound")).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('should reject fetchRevisionsByID if fetch returns no results', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: [],
          }),
        }),
      ),
    );
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/try/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    const searchInput = getByRole('textbox');

    await user.type(
      searchInput,
      'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    );

    expect(store.getState().search.errorMessage).toBe('No results found');
  });

  it('should update error state if fetchRevisionsByID returns an error', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(
          new Error(
            "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
          ),
        ),
      );
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/try/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    const searchInput = getByRole('textbox');

    await user.type(
      searchInput,
      'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
    );

    expect(store.getState().search.errorMessage).toBe(
      "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
    );
  });

  it('should reject fetchRevisionsByAuthor if fetch returns no results', async () => {
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

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/try/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    const searchInput = getByRole('textbox');

    await user.type(searchInput, 'ericidle@python.com');

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?author=ericidle@python.com',
    );

    expect(store.getState().search.errorMessage).toBe('No results found');
  });

  it('should update error state if fetchRevisionsByAuthor returns an error', async () => {
    const spyOnFetch = jest
      .spyOn(global, 'fetch')
      .mockImplementation(() =>
        Promise.reject(new Error('She turned me into a newt')),
      );
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/try/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    const searchInput = getByRole('textbox');

    await user.type(searchInput, 'grahamchapman@python.com');

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?author=grahamchapman@python.com',
    );

    expect(store.getState().search.errorMessage).toBe(
      'She turned me into a newt',
    );
  });

  it('should not call fetch if searchValue is not a hash or email', async () => {
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/autoland/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    const searchInput = getByRole('textbox');

    await user.type(searchInput, 'coconut');
    await user.clear(searchInput);
    await user.type(searchInput, 'spam@eggs');
    await user.clear(searchInput);
    await user.type(searchInput, 'spamspamspamand@eggs.');
    await user.clear(searchInput);
    await user.type(searchInput, 'iamalmostlongenoughtobeahashbutnotquite');
    await user.clear(searchInput);

    // fetch should only be called when selecting a repository
    expect(spyOnFetch).toHaveBeenCalledTimes(1);
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/',
    );
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
    const user = userEvent.setup();

    render(<SearchView />);

    const searchInput = getByRole('textbox');
    await user.type(searchInput, 'terryjones@python.com');

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/try/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?author=terryjones@python.com',
    );
  });

  it('should clear searchResults if searchValue is cleared', async () => {
    jest.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        Promise.resolve({
          json: () => ({
            results: testResults,
          }),
        }),
      ),
    );
    const user = userEvent.setup();

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(getByRole('button', { name: 'repository' }));

    expect(getByText(/try/i)).toBeInTheDocument();

    await user.click(getByRole('option', { name: 'autoland' }));

    const searchInput = getByRole('textbox');
    await user.type(searchInput, 'terryjones@python.com');
    expect(store.getState().search.searchResults).toStrictEqual(testResults);

    await user.clear(searchInput);
    expect(store.getState().search.searchResults).toStrictEqual([]);
  });
});
