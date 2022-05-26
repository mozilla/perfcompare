import React from 'react';

import userEvent from '@testing-library/user-event';
import { BrowserRouter as Router } from 'react-router-dom';

import SearchView from '../../components/Search/SearchView/SearchView';
import getTestData from '../utils/fixtures';
import { render, screen, store } from '../utils/test-utils';

describe('SearchView/fetchRevisionByID', () => {
  it('should fetch revisions by ID if searchValue is a 12 or 40 character hash', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    const spyOnFetch = jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render( <Router>
        <SearchView />
      </Router>);

    await screen.findByRole('button', { name: 'repository' });
    expect(screen.getByText('try')).toBeInTheDocument();

    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'abcdef123456');
    jest.runOnlyPendingTimers();

    await user.clear(searchInput);
    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef123456',
    );
    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
    );

    await screen.findByText("coconut - you've got no arms left!");
    expect(
      screen.getByText("spam - it's just a flesh wound"),
    ).toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });

  it('should reject fetchRevisionsByID if fetch returns no results', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: [],
        }),
      }),
    ) as jest.Mock;
    const spyOnFetch = jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render( <Router>
        <SearchView />
      </Router>);

    await screen.findByRole('button', { name: 'repository' });
    expect(screen.getByText('try')).toBeInTheDocument();

    const searchInput = screen.getByRole('textbox');
    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    jest.runOnlyPendingTimers();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
    );

    await screen.findByText('No results found');
    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe('No results found');
  });

  it('should update error state if fetchRevisionsByID returns an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(
        new Error(
          "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
        ),
      ),
    ) as jest.Mock;
    jest.spyOn(global, 'fetch');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render( <Router>
        <SearchView />
      </Router>);

    await screen.findByRole('button', { name: 'repository' });

    const searchInput = screen.getByRole('textbox');

    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    jest.runOnlyPendingTimers();

    await screen.findByText(
      "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
    );
    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe(
      "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
    );
  });
});
