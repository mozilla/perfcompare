import userEvent from '@testing-library/user-event';

import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  renderWithRouter,
  FetchMockSandbox,
  within,
} from '../utils/test-utils';

function setUpTestData() {
  const { testData } = getTestData();
  (global.fetch as FetchMockSandbox).get(
    'glob:https://treeherder.mozilla.org/api/project/*/push/*',
    {
      results: testData,
    },
  );
}

function renderSearchViewComponent() {
  setUpTestData();
  return renderWithRouter(
    <SearchView title={Strings.metaData.pageTitle.search} />,
  );
}

// Useful function utilities to get various elements in the page
async function waitForPageReadyAndReturnForm() {
  const formName = 'Compare over time form';
  const overTimeTitle = Strings.components.searchDefault.overTime.title;
  const compTitle = await screen.findByRole('heading', {
    name: overTimeTitle,
  });

  expect(compTitle).toBeInTheDocument();
  const formElement = await screen.findByRole('form', {
    name: formName,
  });
  return formElement;
}

async function expandOverTimeComponent() {
  window.location.hash = '#comparetime';
  expect(window.location.hash).toBe('#comparetime');
  const user = userEvent.setup({ delay: null });
  const testExpandedID = 'time-state';
  const headerContent = screen.getByTestId(testExpandedID);
  await user.click(headerContent);
  expect(screen.getByTestId(testExpandedID)).toHaveClass(
    'compare-card-container--expanded',
  );
}

describe('Compare Over Time', () => {
  it('renders correctly in Search View', async () => {
    renderSearchViewComponent();
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();
    expect(formElement).toMatchSnapshot('Initial state for the form');
  });

  it('expands on header click and closes when user clicks base component header', async () => {
    renderSearchViewComponent();
    const user = userEvent.setup({ delay: null });

    const testExpandedID = 'time-state';
    const headerContent = screen.getByTestId(testExpandedID);
    const testExpandedBaseID = 'base-state';
    const headerContentBase = screen.getByTestId(testExpandedBaseID);

    //make sure it's in the hidden state first
    expect(screen.getByTestId(testExpandedID)).toHaveClass(
      'compare-card-container--hidden',
    );

    //make sure it's collapsed when user clicks on title component
    await user.click(headerContent);
    expect(screen.getByTestId(testExpandedID)).toHaveClass(
      'compare-card-container--expanded',
    );

    //make sure it's hidden when user clicks title
    await user.click(headerContentBase);
    expect(screen.getByTestId(testExpandedID)).toHaveClass(
      'compare-card-container--hidden',
    );
  });

  it('selects and displays new repository when clicked', async () => {
    renderSearchViewComponent();
    const user = userEvent.setup({ delay: null });
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();

    expect(within(formElement).getByText(/try/i)).toBeInTheDocument();

    expect(
      within(formElement).queryByText(/mozilla-central/i),
    ).not.toBeInTheDocument();

    const newDropdown = screen.getAllByRole('button', { name: 'Revisions' })[1];

    await user.click(newDropdown);
    const mozRepoItem = await screen.findAllByRole('option', {
      name: 'mozilla-central',
    });
    await user.click(mozRepoItem[0]);
    expect(screen.getAllByText(/mozilla-central/i)[0]).toBeInTheDocument();

    await user.click(newDropdown);
    const autolandItem = await screen.findAllByRole('option', {
      name: 'autoland',
    });
    await user.click(autolandItem[0]);
    expect(screen.getAllByText(/autoland/i)[0]).toBeInTheDocument();
  });

  it('selects and displays new framework when clicked', async () => {
    renderSearchViewComponent();
    const user = userEvent.setup({ delay: null });
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();

    expect(within(formElement).getByText(/talos/i)).toBeInTheDocument();

    expect(
      within(formElement).queryByText(/build_metrics/i),
    ).not.toBeInTheDocument();

    const frameworkDropdown = screen.getAllByRole('button', {
      name: 'Framework talos',
    });

    await user.click(frameworkDropdown[1]);
    expect(screen.getByRole('listbox')).toMatchSnapshot();
    const buildMetricsItem = screen.getByRole('option', {
      name: 'build_metrics',
    });

    await user.click(buildMetricsItem);

    expect(screen.getAllByText(/build_metrics/i)[1]).toBeInTheDocument();
  });

  it('selects and displays new time range when clicked', async () => {
    renderSearchViewComponent();
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();

    const user = userEvent.setup({ delay: null });

    expect(within(formElement).getByText(/Last day/i)).toBeInTheDocument();

    expect(
      within(formElement).queryByText(/Last 2 days/i),
    ).not.toBeInTheDocument();

    const timeRangeDropdown = screen.getByRole('button', {
      name: 'Time range Last day',
    });

    await user.click(timeRangeDropdown);
    expect(screen.getByRole('listbox')).toMatchSnapshot();
    const last2daysItem = screen.getByRole('option', {
      name: 'Last 2 days',
    });

    await user.click(last2daysItem);

    expect(within(formElement).getByText(/Last 2 days/i)).toBeInTheDocument();
  });

  it('should hide search results when clicking outside of search input', async () => {
    renderSearchViewComponent();
    await expandOverTimeComponent();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // Click inside the input box to show search results.
    const searchInput = screen.getAllByRole('textbox')[2];
    await user.click(searchInput);

    const comment = await screen.findAllByText("you've got no arms left!");
    expect(comment[0]).toBeInTheDocument();

    // Click outside the over time input box to hide search results.
    const labelTime = screen.getAllByText('Revisions');
    await user.click(labelTime[0]);
    expect(comment[0]).not.toBeInTheDocument();
  });

  it('should remove the checked revision once X button is clicked', async () => {
    renderSearchViewComponent();
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    expect(within(formElement).getByText(/Time range/)).toBeInTheDocument();

    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);
    const checkbox = await screen.findByTestId('checkbox-0');
    await user.click(checkbox);
    expect(checkbox).toHaveClass('Mui-checked');
    const removeButton = document.querySelectorAll('[title="remove revision"]');
    expect(removeButton[0]).toBeInTheDocument();
    expect(screen.getAllByTestId('selected-rev-item')[0]).toBeInTheDocument();

    await user.click(removeButton[0]);

    expect(formElement).toMatchSnapshot();

    expect(screen.queryByTestId('selected-rev-item')).not.toBeInTheDocument();
  });

  it('should not allow selecting more than 3 revisions', async () => {
    renderSearchViewComponent();
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();
    expect(within(formElement).getByText(/Time range/)).toBeInTheDocument();

    const checkboxForText = (textElement: Element) =>
      textElement.closest('li')?.querySelector('.MuiCheckbox-root');

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // focus input to show results
    const searchInput = screen.getByRole('textbox');
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
