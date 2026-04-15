import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';

import { loader } from '../../components/Search/loader';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import { screen, renderWithRouter } from '../utils/test-utils';

async function renderSearchViewComponent() {
  renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />, {
    loader,
  });
  const title = 'Compare with a base';
  const compTitle = await screen.findByRole('heading', { name: title });
  expect(compTitle).toBeInTheDocument();
}

describe('Search View/fetchRecentRevisions', () => {
  it('should fetch and display recent results when repository is selected', async () => {
    const { testData } = getTestData();
    fetchMock.get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: testData,
    });

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await renderSearchViewComponent();
    const baseRepoSelect = screen.getByRole('combobox', { name: 'Base' });
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

    const placeholder =
      Strings.components.searchDefault.base.collapsed.base.inputPlaceholder;

    // focus input to show results
    const searchInput = screen.getAllByPlaceholderText(placeholder)[1];
    await user.click(searchInput);
    await screen.findAllByText("you've got no arms left!");

    expect(global.fetch).toHaveFetched(
      'https://treeherder.mozilla.org/api/project/autoland/push/?hide_reviewbot_pushes=true&count=30',
      undefined,
    );
  });

  it('should reject fetchRecentRevisions if fetch returns no results', async () => {
    fetchMock.get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: [],
    });

    await renderSearchViewComponent();

    const errorMessages = await screen.findAllByText('No results found');
    expect(errorMessages).toHaveLength(3);

    const inputs = screen.queryAllByTestId('autocomplete-option');

    expect(inputs[0]).toBeUndefined();
    expect(inputs[1]).toBeUndefined();
    expect(global.fetch).toHaveFetched(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true&count=30',
      undefined,
    );
  });

  it('should update error state if fetchRecentRevisions returns an error', async () => {
    const errorMessage = 'What, ridden on a horse?';
    fetchMock.get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      throws: new Error(errorMessage),
    });

    // This test will output an error to the console. Let's silence it.
    jest.spyOn(console, 'error').mockImplementation(() => {});

    await renderSearchViewComponent();

    const errorMessages = await screen.findAllByText(errorMessage);
    expect(errorMessages).toHaveLength(3);

    const inputs = screen.queryAllByTestId('autocomplete-option');
    expect(inputs[0]).toBeUndefined();
    expect(inputs[1]).toBeUndefined();
    expect(global.fetch).toHaveFetched(
      'https://treeherder.mozilla.org/api/project/try/push/?hide_reviewbot_pushes=true&count=30',
      undefined,
    );
    expect(console.error).toHaveBeenCalledWith(
      'Error while fetching recent revisions:',
      new Error(errorMessage),
    );
  });
});
