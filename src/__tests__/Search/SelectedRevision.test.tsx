import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';

import { loader } from '../../components/Search/loader';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import { screen, within, renderWithRouter } from '../utils/test-utils';

const searchRevisionPlaceholder =
  Strings.components.searchDefault.base.collapsed.base.inputPlaceholder;

async function renderComponent() {
  renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />, {
    loader,
  });
  const title = 'Compare with a base';
  const compTitle = await screen.findByRole('heading', { name: title });
  expect(compTitle).toBeInTheDocument();
}

describe('SelectedRevision', () => {
  const { testData } = getTestData();

  beforeEach(() => {
    fetchMock.get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: testData,
    });
  });

  it('should show the selected checked revisions once a result checkbox is clicked, and remove it when X button is clicked', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByPlaceholderText(
      searchRevisionPlaceholder,
    )[0];
    await user.click(searchInput);

    const autocompleteOptions = await screen.findAllByTestId(
      'autocomplete-option',
    );
    const noArmsLeft = autocompleteOptions[0];
    const noArmsLeftCheckbox = within(noArmsLeft).getByRole('radio');

    await user.click(noArmsLeft);
    expect(noArmsLeft).toHaveClass('item-selected');
    expect(noArmsLeftCheckbox).toBeChecked();
    expect(noArmsLeft.querySelector('.Mui-checked')).toBeInTheDocument();

    const selectedRevsContainer = screen.getByTestId('selected-rev-item');
    expect(selectedRevsContainer).toMatchSnapshot();

    const removeButton = document.querySelectorAll('[title="remove revision"]');

    const removeIcon = screen.getByTestId('close-icon');
    expect(removeIcon).toBeInTheDocument();
    expect(screen.getAllByTestId('selected-rev-item')[0]).toBeInTheDocument();

    await user.click(removeButton[0]);

    expect(screen.queryByTestId('selected-rev-item')).not.toBeInTheDocument();
  });

  it('should show warning icon on selected try revision when try base is compared with a non try repository', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderComponent();

    const baseDropdown = screen.getByRole('combobox', { name: 'Base' });
    expect(baseDropdown).toHaveTextContent('try');

    const firstSearchInput = screen.getAllByPlaceholderText(
      'Search by revision ID or author email',
    )[0];
    await user.click(firstSearchInput);

    const autocompleteOptions = await screen.findAllByTestId(
      'autocomplete-option',
    );
    const noArmsLeft = autocompleteOptions[0];

    await user.click(noArmsLeft);

    const newDropdown = screen.getByRole('combobox', {
      name: 'Revisions',
    });
    await user.click(newDropdown);
    const mozRepoItem = await screen.findByRole('option', {
      name: 'mozilla-central',
    });
    await user.click(mozRepoItem);
    const alertIcon = await screen.findByRole('img', {
      name: 'Production (e.g. mozilla-central, autoland), and try branches have different performance characteristics due to build differences that can often result in misleading comparisons.',
    });
    expect(alertIcon).toBeInTheDocument();
  });

  it('should copy hash number when copyicon is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderComponent();
    const searchInput = screen.getAllByPlaceholderText(
      searchRevisionPlaceholder,
    )[0];
    await user.click(searchInput);

    const autocompleteOptions = await screen.findAllByTestId(
      'autocomplete-option',
    );
    const noArmsLeft = autocompleteOptions[0];
    await user.click(noArmsLeft);
    const copyIcon = screen.getByTestId('copy-icon');
    await user.click(copyIcon);
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });

  it('should handle copy failure when clipboard API fails', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await renderComponent();

    const searchInput = screen.getAllByPlaceholderText(
      searchRevisionPlaceholder,
    )[0];
    await user.click(searchInput);

    const autocompleteOptions = await screen.findAllByTestId(
      'autocomplete-option',
    );
    const noArmsLeft = autocompleteOptions[0];
    await user.click(noArmsLeft);
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    // Mock clipboard writeText to throw an error
    jest
      .spyOn(navigator.clipboard, 'writeText')
      .mockRejectedValue(new Error('Clipboard write failed'));
    const copyIcon = screen.getByTestId('copy-icon');
    await user.click(copyIcon);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Failed to copy text to clipboard:',
      expect.any(Error),
    );

    // Restore clipboard function after test
    jest.restoreAllMocks();
  });
});
