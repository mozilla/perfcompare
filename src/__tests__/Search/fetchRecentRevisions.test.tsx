import userEvent from '@testing-library/user-event';

import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import getTestData from '../utils/fixtures';
import { renderWithRouter } from '../utils/setupTests';
import { screen, renderHook, FetchMockSandbox } from '../utils/test-utils';

describe('Search View/fetchRecentRevisions', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;

  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;

  it('should fetch and display recent results when repository is selected', async () => {
    const { testData } = getTestData();
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      {
        results: testData,
      },
    );

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title={Strings.metaData.pageTitle.search}
      />,
    );

    const baseRepoSelect = screen.getAllByRole('button', { name: 'Base' })[0];
    expect(baseRepoSelect).toHaveTextContent('try');
    await user.click(baseRepoSelect);

    // Menu items should be visible
    expect(
      screen.getByRole('option', { name: 'autoland' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'try' })).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'mozilla-central' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('option', { name: 'autoland' }));
    expect(baseRepoSelect).toHaveTextContent('autoland');

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    await screen.findAllByText("you've got no arms left!");

    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/autoland/push/?hide_reviewbot_pushes=true',
      undefined,
    );
  });

  it('should reject fetchRecentRevisions if fetch returns no results', async () => {
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      {
        results: [],
      },
    );

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title={Strings.metaData.pageTitle.search}
      />,
    );

    const errorMessages = await screen.findAllByText('No results found');
    expect(errorMessages).toHaveLength(2);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toBeInvalid();
    expect(inputs[1]).toBeInvalid();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
      undefined,
    );
  });

  it('should update error state if fetchRecentRevisions returns an error', async () => {
    const errorMessage = 'What, ridden on a horse?';
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      {
        throws: new Error(errorMessage),
      },
    );

    // This test will output an error to the console. Let's silence it.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title={Strings.metaData.pageTitle.search}
      />,
    );

    const errorMessages = await screen.findAllByText(errorMessage);
    expect(errorMessages).toHaveLength(2);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs[0]).toBeInvalid();
    expect(inputs[1]).toBeInvalid();
    expect(global.fetch).toHaveBeenCalledWith(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true',
      undefined,
    );
    expect(console.error).toHaveBeenCalledWith(
      'FetchRecentRevisions ERROR: ',
      new Error(errorMessage),
    );
  });
});
