import { renderHook } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import { InputType } from '../../types/state';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

describe('Search View/fetchRevisionByID', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;

  it('should fetch revisions by ID if searchValue is a 12 or 40 character hash', async () => {
    const { testData } = getTestData();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title={Strings.metaData.pageTitle.search}
      />,
    );

    await screen.findAllByTestId('dropdown-select-base');
    expect(screen.getAllByText('try')[0]).toBeInTheDocument();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'abcdef123456');
    await act(async () => void jest.runOnlyPendingTimers());

    await user.clear(searchInput);
    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    jest.runOnlyPendingTimers();

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef123456',
    );
    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
    );
    await screen.findByText("you've got no arms left!");
    await screen.findByText('What, ridden on a horse?');
  });

  it('should reject fetchRevisionsByID if fetch returns no results', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: [],
        }),
      }),
    ) as jest.Mock;
    const searchType = 'base' as InputType;

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title={Strings.metaData.pageTitle.search}
      />,
    );

    await screen.findAllByRole('button', { name: 'Base' });
    expect(screen.getAllByText('try')[0]).toBeInTheDocument();

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    await act(async () => void jest.runOnlyPendingTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef1234567890abcdef1234567890abcdef12',
    );

    await screen.findAllByText('No results found');
    expect(store.getState().search[searchType].searchResults).toStrictEqual([]);
    expect(store.getState().search[searchType].inputError).toBe(true);
    expect(store.getState().search[searchType].inputHelperText).toBe(
      'No results found',
    );
  });

  it('should update error state if fetchRevisionsByID returns an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(
        new Error(
          "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
        ),
      ),
    ) as jest.Mock;
    const searchType = 'base' as InputType;

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <>
        <SearchView
          toggleColorMode={toggleColorMode}
          protocolTheme={protocolTheme}
          title={Strings.metaData.pageTitle.search}
        />
      </>,
    );

    await screen.findAllByRole('button', { name: 'Base' });
    const searchInput = screen.getAllByRole('textbox')[0];

    await user.type(searchInput, 'abcdef1234567890abcdef1234567890abcdef12');
    await act(async () => void jest.runOnlyPendingTimers());
    await screen.findAllByText(
      "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
    );
    expect(store.getState().search[searchType].searchResults).toStrictEqual([]);
    expect(store.getState().search[searchType].inputError).toBe(true);
    expect(store.getState().search[searchType].inputHelperText).toBe(
      "You've got two empty 'alves of coconuts and you're bangin' 'em togetha!",
    );
  });

  it('should update error state with generic message if fetch error message is undefined', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error())) as jest.Mock;
    const searchType = 'base' as InputType;

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title={Strings.metaData.pageTitle.search}
      />,
    );

    await act(async () => void jest.runOnlyPendingTimers());
    await screen.findAllByRole('button', { name: 'Base' });
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.type(searchInput, 'abcdef123456');
    await act(async () => void jest.runOnlyPendingTimers());

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?revision=abcdef123456',
    );

    await screen.findAllByText('An error has occurred');
    expect(store.getState().search[searchType].searchResults).toStrictEqual([]);
    expect(store.getState().search[searchType].inputError).toBe(true);
    expect(store.getState().search[searchType].inputHelperText).toBe(
      'An error has occurred',
    );
  });
});
