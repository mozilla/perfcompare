import userEvent from '@testing-library/user-event';

import SearchView from '../../components/Search/SearchView';
import getTestData from '../utils/fixtures';
import { render, screen, store } from '../utils/test-utils';

describe('SearchView/fetchRecentRevisions', () => {
  it('should fetch and display recent results when repository is selected', async () => {
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

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });
    await user.click(screen.getByRole('button', { name: 'repository' }));

    // Menu items should be visible
    expect(
      screen.getByRole('option', { name: 'autoland' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'try' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'mozilla-central' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'autoland' }));
    jest.runOnlyPendingTimers();
    expect(screen.queryByText('try')).not.toBeInTheDocument();

    expect(store.getState().search.searchResults).toStrictEqual(testData);

    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);
    await screen.findByText("coconut - you've got no arms left!");
    expect(
      screen.getByText("spam - it's just a flesh wound"),
    ).toBeInTheDocument();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?hide_reviewbot_pushes=true',
    );
    expect(document.body).toMatchSnapshot();
  });

  it('should reject fetchRecentRevisions if fetch returns no results', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: [],
        }),
      }),
    ) as jest.Mock;
    const spyOnFetch = jest.spyOn(global, 'fetch');

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
    );
    expect(store.getState().search.searchResults).toStrictEqual([]);
    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe('No results found');
  });

  it('should update error state if fetchRecentRevisions returns an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('What, ridden on a horse?')),
    ) as jest.Mock;
    const spyOnFetch = jest.spyOn(global, 'fetch');

    render(<SearchView />);

    await screen.findByRole('button', { name: 'repository' });

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
    );
    expect(store.getState().search.searchResults).toStrictEqual([]);
    expect(store.getState().search.inputError).toBe(true);
    expect(store.getState().search.inputHelperText).toBe(
      'What, ridden on a horse?',
    );
  });
});
