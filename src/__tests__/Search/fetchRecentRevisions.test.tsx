import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import SearchView from '../../components/Search/beta/SearchView';
import SearchComponent from '../../components/Shared/beta/SearchComponent';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

const stringsBase = Strings.components.searchDefault.base.collaped.base;

describe('SearchView/fetchRecentRevisions', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;

  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;
  it('should fetch and display recent results when repository is selected', async () => {
    const { testData } = getTestData();
    const baseRepo = store.getState().search.baseRepository;
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

    renderWithRouter(
      <SearchComponent
        {...stringsBase}
        view='search'
        mode='light'
        base='base'
        repository={baseRepo}
      />,
    );

    await screen.findAllByRole('button', { name: 'Base' });
    await user.click(screen.getAllByRole('button', { name: 'Base' })[0]);

    // Menu items should be visible
    expect(
      screen.getAllByRole('option', { name: 'autoland' })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('option', { name: 'try' })[0],
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole('option', { name: 'mozilla-central' })[0],
    ).toBeInTheDocument();

    await user.click(screen.getAllByRole('option', { name: 'autoland' })[0]);

    act(() => void jest.runOnlyPendingTimers());
    expect(screen.queryByText('mozilla-central')).not.toBeInTheDocument();

    expect(store.getState().search.baseSearchResults).toStrictEqual(testData);

    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);
    await screen.findAllByText("you've got no arms left!");
    expect(
      screen.getAllByText("it's just a flesh wound")[0],
    ).toBeInTheDocument();

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?hide_reviewbot_pushes=true',
    );
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

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );
    await act(async () => void jest.runOnlyPendingTimers());
    await screen.findAllByRole('button', { name: 'Base' });

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
    );
    expect(store.getState().search.baseSearchResults).toStrictEqual([]);
    expect(store.getState().search.inputErrorBase).toBe(true);
    expect(store.getState().search.inputHelperText).toBe('No results found');
  });

  it('should update error state if fetchRecentRevisions returns an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('What, ridden on a horse?')),
    ) as jest.Mock;
    const spyOnFetch = jest.spyOn(global, 'fetch');

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );
    await act(async () => void jest.runOnlyPendingTimers());
    await screen.findAllByRole('button', { name: 'Base' });

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
    );
    expect(store.getState().search.baseSearchResults).toStrictEqual([]);
    expect(store.getState().search.inputErrorBase).toBe(true);
    expect(store.getState().search.inputHelperText).toBe(
      'What, ridden on a horse?',
    );
  });
});
