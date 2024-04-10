/* eslint-disable jest/no-disabled-tests */
import userEvent from '@testing-library/user-event';

import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  within,
  renderWithRouter,
  FetchMockSandbox,
} from '../utils/test-utils';

function renderComponent() {
  renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />);
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

    renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const noArmsLeft = await screen.findByRole('button', {
      name: /you've got no arms left!/,
    });
    const noArmsLeftCheckbox = within(noArmsLeft).getByRole('checkbox');

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
    renderComponent();

    // TODO The second dropdown incorrectly also has the name "Base".
    const baseDropdown = screen.getAllByRole('button', { name: 'Base' })[0];
    expect(baseDropdown).toHaveTextContent('try');

    const firstSearchInput = screen.getAllByPlaceholderText(
      'Search base by ID number or author email',
    )[0];
    await user.click(firstSearchInput);
    await user.click(
      await screen.findByRole('button', {
        name: /you've got no arms left!/,
      }),
    );

    // TODO This dropdown incorrectly has the name "Base".
    const newDropdown = screen.getAllByRole('button', { name: 'Base' })[1];
    await user.click(newDropdown);
    const mozRepoItem = await screen.findByRole('option', {
      name: 'mozilla-central',
    });
    await user.click(mozRepoItem);
    const alertIcon = await screen.findByRole('img', {
      name: 'Comparing “try” repository to any repository aside from “try” is not recommended.',
    });
    expect(alertIcon).toBeInTheDocument();
  });
});
