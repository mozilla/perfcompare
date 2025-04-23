import userEvent from '@testing-library/user-event';

import { loader } from '../../components/Search/loader';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  within,
  renderWithRouter,
  FetchMockSandbox,
} from '../utils/test-utils';

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
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      {
        results: testData,
      },
    );
  });

  it('should show the selected checked revisions once a result checkbox is clicked, and remove it when X button is clicked', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    await renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const noArmsLeft = await screen.findByRole('button', {
      name: /you've got no arms left!/,
    });
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
    const user = userEvent.setup({ delay: null });
    await renderComponent();

    const baseDropdown = screen.getByRole('button', { name: 'Base' });
    expect(baseDropdown).toHaveTextContent('try');

    const firstSearchInput = screen.getAllByPlaceholderText(
      'Search by revision ID, author, bug number and comments',
    )[0];
    await user.click(firstSearchInput);
    await user.click(
      await screen.findByRole('button', {
        name: /you've got no arms left!/,
      }),
    );

    const newDropdown = screen.getAllByRole('button', { name: 'Revisions' })[0];
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
    const user = userEvent.setup({ delay: null });
    await renderComponent();
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    const noArmsLeft = await screen.findByRole('button', {
      name: /you've got no arms left!/,
    });
    await user.click(noArmsLeft);
    const copyIcon = screen.getByTestId('copy-icon');
    await user.click(copyIcon);
    expect(screen.getByText('Copied')).toBeInTheDocument();
  });

  it('should handle copy failure when clipboard API fails', async () => {
    const user = userEvent.setup({ delay: null });
    await renderComponent();
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    const noArmsLeft = await screen.findByRole('button', {
      name: /you've got no arms left!/,
    });
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
