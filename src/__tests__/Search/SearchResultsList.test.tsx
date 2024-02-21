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

describe('SearchResultsList', () => {
  beforeEach(() => {
    const { testData } = getTestData();
    (global.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/project/try/push/',
      {
        results: testData,
      },
    );
  });

  it('should match snapshot', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    await screen.findByText(/flesh wound/);
    expect(document.body).toMatchSnapshot();
  });

  it('should fill the checkbox when a result is clicked', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const fleshWound = await screen.findAllByText("it's just a flesh wound");

    await user.click(fleshWound[0]);
    expect(screen.getAllByTestId('checkbox-1')[0]).toHaveClass('Mui-checked');
  });

  it('should clear the checkbox when a checked result is clicked', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderComponent();

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const fleshWound = await screen.findByRole('button', {
      name: /it's just a flesh wound/,
    });
    const fleshWoundCheckbox = within(fleshWound).getByRole('checkbox');

    await user.click(fleshWound);
    expect(fleshWound).toHaveClass('item-selected');
    expect(fleshWoundCheckbox).toBeChecked();
    expect(fleshWound.querySelector('.Mui-checked')).toBeInTheDocument();

    await user.click(fleshWound);
    expect(fleshWound).not.toHaveClass('item-selected');
    expect(fleshWoundCheckbox).not.toBeChecked();
    expect(fleshWound.querySelector('.Mui-checked')).toBeNull();
  });

  it('should not allow selecting more than 1 revisions on Base Search', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    await user.click((await screen.findAllByTestId('checkbox-0'))[0]);
    await user.click(screen.getAllByTestId('checkbox-1')[0]);

    expect(screen.getAllByTestId('checkbox-0')[0]).toHaveClass('Mui-checked');
    expect(screen.getAllByTestId('checkbox-1')[0]).not.toHaveClass(
      'Mui-checked',
    );

    expect(screen.getByText('Maximum 1 revision(s).')).toBeInTheDocument();

    // Should allow unchecking revisions even after four have been selected
    await user.click(screen.getAllByTestId('checkbox-1')[0]);
    expect(screen.getAllByTestId('checkbox-1')[0]).not.toHaveClass(
      'Mui-checked',
    );
  });
});
