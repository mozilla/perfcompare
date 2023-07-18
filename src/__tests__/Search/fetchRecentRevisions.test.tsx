import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import SearchComponent from '../../components/Search/SearchComponent';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import { InputType } from '../../types/state';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

const stringsBase = Strings.components.searchDefault.base.collapsed.base;

describe('SearchView/fetchRecentRevisions', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;

  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;

  it('should fetch and display recent results when repository is selected', async () => {
    const { testData } = getTestData();
    const searchType = 'base' as InputType;

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
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
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

    act(() => {
      expect(store.getState().search[searchType].searchResults).toStrictEqual(
        testData,
      );
    });


    const searchInput = screen.getAllByRole('textbox')[0];
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
    const searchType = 'base' as InputType;
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const SearchPropsBase = {
      searchType,
      mode: 'light' as 'light' | 'dark',
      view: 'search' as 'search' | 'compare-results',
      isWarning: false,
      ...stringsBase,
    };

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );
    renderWithRouter(<SearchComponent {...SearchPropsBase} />);
    await act(async () => void jest.runOnlyPendingTimers());
    await screen.findAllByRole('button', { name: 'Base' });

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
    );
    expect(store.getState().search[searchType].searchResults).toStrictEqual([]);
    expect(store.getState().search[searchType].inputError).toBe(true);
    expect(store.getState().search[searchType].inputHelperText).toBe(
      'No results found',
    );
  });

  it('should update error state if fetchRecentRevisions returns an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('What, ridden on a horse?')),
    ) as jest.Mock;
    const searchType = 'base' as InputType;
    const spyOnFetch = jest.spyOn(global, 'fetch');
    const SearchPropsBase = {
      searchType,
      mode: 'light' as 'light' | 'dark',
      view: 'search' as 'search' | 'compare-results',
      isWarning: false,
      ...stringsBase,
    };

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
      />,
    );
    renderWithRouter(<SearchComponent {...SearchPropsBase} />);
    await act(async () => void jest.runOnlyPendingTimers());
    await screen.findAllByRole('button', { name: 'Base' });

    expect(spyOnFetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
    );
    expect(store.getState().search[searchType].searchResults).toStrictEqual([]);
    expect(store.getState().search[searchType].inputError).toBe(true);
    expect(store.getState().search[searchType].inputHelperText).toBe(
      'What, ridden on a horse?',
    );
  });
});
