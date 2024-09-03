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

    await renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    await screen.findByText(/flesh wound/);
    expect(document.body).toMatchSnapshot();
  });

  it('should fill the checkbox when a result is clicked', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    await renderComponent();
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

    await renderComponent();

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const fleshWound = await screen.findByRole('button', {
      name: /it's just a flesh wound/,
    });
    const fleshWoundCheckbox = within(fleshWound).getByRole('radio');

    await user.click(fleshWound);
    expect(fleshWound).toHaveClass('item-selected');
    expect(fleshWoundCheckbox).toBeChecked();
    expect(fleshWound.querySelector('.Mui-checked')).toBeInTheDocument();

    await user.click(fleshWound);
    expect(fleshWound).not.toHaveClass('item-selected');
    expect(fleshWoundCheckbox).not.toBeChecked();
    expect(fleshWound.querySelector('.Mui-checked')).toBeNull();
  });

  it('should select the new revision and uncheck the previous one when clicking a different base revision', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    await renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    await user.click((await screen.findAllByTestId('checkbox-0'))[0]);
    await user.click(screen.getAllByTestId('checkbox-1')[0]);

    expect(screen.getAllByTestId('checkbox-0')[0]).not.toHaveClass(
      'Mui-checked',
    );
    expect(screen.getAllByTestId('checkbox-1')[0]).toHaveClass('Mui-checked');

    // Should allow unchecking revisions too
    await user.click(screen.getAllByTestId('checkbox-1')[0]);
    expect(screen.getAllByTestId('checkbox-1')[0]).not.toHaveClass(
      'Mui-checked',
    );
  });

  it('should not allow selecting more than 3 revisions on New Search', async () => {
    const checkboxForText = (textElement: Element) =>
      textElement.closest('li')?.querySelector('.MuiCheckbox-root');

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    await renderComponent();
    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[1];
    await user.click(searchInput);

    const noArmsLeft = await screen.findByText(/no arms left/);
    const fleshWound = await screen.findByText(/flesh wound/);
    const onAHorse = await screen.findByText(/on a horse/);
    const alvesOfCoconut = await screen.findByText(/alves of coconuts/);

    await user.click(noArmsLeft);
    await user.click(fleshWound);
    await user.click(onAHorse);
    await user.click(alvesOfCoconut);

    expect(checkboxForText(noArmsLeft)).toHaveClass('Mui-checked');
    expect(checkboxForText(fleshWound)).toHaveClass('Mui-checked');
    expect(checkboxForText(onAHorse)).toHaveClass('Mui-checked');
    expect(checkboxForText(alvesOfCoconut)).not.toHaveClass('Mui-checked');

    expect(screen.getByText('Maximum 3 revisions.')).toBeInTheDocument();

    // Should allow unchecking revisions even after four have been selected
    await user.click(fleshWound);
    expect(fleshWound).not.toHaveClass('Mui-checked');
  });
});
