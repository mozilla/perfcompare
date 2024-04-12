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
  (global.fetch as FetchMockSandbox)
    .get('begin:https://treeherder.mozilla.org/api/project/try/push/', {
      results: testData,
    })
    .get('begin:https://treeherder.mozilla.org/api/perfcompare/results/', [])
    .get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/push/?revision=coconut',
      {
        results: [testData[0]],
      },
    )
    .get(
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/push/?revision=spam',
      {
        results: [testData[1]],
      },
    );
}

async function expandOverTimeComponent() {
  const user = userEvent.setup({ delay: null });
  const testExpandedID = 'time-state';
  const headerContent = screen.getByTestId(testExpandedID);
  await user.click(headerContent);
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

describe('Compare Over Time', () => {
  it('renders correctly in Search View', async () => {
    renderSearchViewComponent();
    const formElement = await waitForPageReadyAndReturnForm();
    expect(formElement).toMatchSnapshot('Initial state for the form');
  });

  it('toggles component open and closed on click', async () => {
    renderSearchViewComponent();

    const user = userEvent.setup({ delay: null });
    const testExpandedID = 'time-state';
    const headerContent = screen.getByTestId(testExpandedID);

    //make sure it's in the hidden state first
    expect(screen.getByTestId('time-state')).toHaveClass(
      'compare-card-container--hidden',
    );

    //make sure it's collapsed when user clicks on title component
    await user.click(headerContent);
    expect(screen.getByTestId('time-state')).toHaveClass(
      'compare-card-container--expanded',
    );

    await user.click(headerContent);
    expect(screen.getByTestId('time-state')).toHaveClass(
      'compare-card-container--hidden',
    );
  });

  it('selects and displays new repository when clicked', async () => {
    renderSearchViewComponent();
    const formElement = await waitForPageReadyAndReturnForm();
    await expandOverTimeComponent();

    const user = userEvent.setup({ delay: null });
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
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ delay: null });

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
    const formElement = await waitForPageReadyAndReturnForm();
    await expandOverTimeComponent();

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
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    renderSearchViewComponent();
    await expandOverTimeComponent();

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
});
