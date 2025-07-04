import { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';

import { loader as overTimeLoader } from '../../components/CompareResults/overTimeLoader';
import OverTimeResultsView from '../../components/CompareResults/OverTimeResultsView';
import { loader as searchLoader } from '../../components/Search/loader';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  renderWithRouter,
  within,
  render,
  waitFor,
} from '../utils/test-utils';

function setUpTestData() {
  const { testData } = getTestData();
  fetchMock
    .get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: testData,
    })
    .get('begin:https://treeherder.mozilla.org/api/perfcompare/results/', [])
    .get(
      'begin:https://treeherder.mozilla.org/api/project/try/push/?revision=coconut',
      {
        results: [testData[0]],
      },
    );
}

function renderSearchViewComponent() {
  setUpTestData();
  return renderWithRouter(
    <SearchView title={Strings.metaData.pageTitle.search} />,
    { loader: searchLoader },
  );
}

function renderWithCompareResultsURL(component: ReactElement) {
  setUpTestData();
  return renderWithRouter(component, {
    route: '/compare-over-time-results/',
    search:
      '?baseRepo=try&selectedTimeRange=86400&newRev=coconut&newRepo=try&framework=2',
    loader: overTimeLoader,
  });
}

async function waitForPageReady() {
  const overTimeTitle = /Compare over time/;
  const compTitle = await screen.findByRole('heading', {
    name: overTimeTitle,
  });

  expect(compTitle).toBeInTheDocument();
}

// Useful function utilities to get various elements in the page
async function waitForPageReadyAndReturnForm() {
  await waitForPageReady();
  const formName = 'Compare over time form';
  const formElement = await screen.findByRole('form', {
    name: formName,
  });
  return formElement;
}

function getEditButton() {
  return screen.getByRole('button', {
    name: 'edit revision',
  });
}

function getCancelButton() {
  return screen.getByRole('button', { name: 'Cancel' });
}

async function expandOverTimeComponent() {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  const testExpandedID = 'time-state';
  const headerContent = await screen.findByTestId(testExpandedID);
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

  it('renders correctly when there are no results', async () => {
    renderWithCompareResultsURL(
      <OverTimeResultsView title={Strings.metaData.pageTitle.results} />,
    );
    const formElement = await waitForPageReadyAndReturnForm();
    expect(formElement).toMatchSnapshot('Initial state for the form');
  });

  it('expands on header click and closes when user clicks base component header', async () => {
    renderSearchViewComponent();
    await waitForPageReady();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

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

  it('selects and displays base repository when clicked', async () => {
    renderSearchViewComponent();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();

    expect(within(formElement).getAllByText(/try/i)[0]).toBeInTheDocument();

    expect(
      within(formElement).queryByText(/mozilla-central/i),
    ).not.toBeInTheDocument();

    const baseDropdown = screen.getByRole('combobox', {
      name: 'Base repository',
    });

    await user.click(baseDropdown);
    const mozRepoItem = await screen.findByRole('option', {
      name: 'mozilla-central',
    });
    await user.click(mozRepoItem);
    expect(baseDropdown).toHaveTextContent('mozilla-central');

    await user.click(baseDropdown);
    const autolandItem = await screen.findByRole('option', {
      name: 'autoland',
    });
    await user.click(autolandItem);
    expect(baseDropdown).toHaveTextContent('autoland');
  });

  it('selects and displays new repository when clicked', async () => {
    renderSearchViewComponent();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();

    expect(within(formElement).getAllByText(/try/i)[1]).toBeInTheDocument();

    expect(
      within(formElement).queryByText(/mozilla-central/i),
    ).not.toBeInTheDocument();

    const newDropdown = screen.getByRole('combobox', { name: 'Revisions' });

    await user.click(newDropdown);
    const mozRepoItem = await screen.findByRole('option', {
      name: 'mozilla-central',
    });
    await user.click(mozRepoItem);
    expect(newDropdown).toHaveTextContent('mozilla-central');

    await user.click(newDropdown);
    const autolandItem = await screen.findByRole('option', {
      name: 'autoland',
    });
    await user.click(autolandItem);
    expect(newDropdown).toHaveTextContent('autoland');
  });

  it('selects and displays new framework when clicked', async () => {
    renderSearchViewComponent();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();

    expect(within(formElement).getByText(/talos/i)).toBeInTheDocument();

    expect(
      within(formElement).queryByText(/build_metrics/i),
    ).not.toBeInTheDocument();

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework Framework',
    });

    await user.click(frameworkDropdown);
    const buildMetricsItem = screen.getByRole('option', {
      name: 'build_metrics',
    });
    await user.click(buildMetricsItem);
    expect(frameworkDropdown).toHaveTextContent('build_metrics');
  });

  it('selects and displays new time range when clicked', async () => {
    renderSearchViewComponent();
    await expandOverTimeComponent();
    const formElement = await waitForPageReadyAndReturnForm();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    expect(
      within(formElement).getAllByText(/Last day/i)[0],
    ).toBeInTheDocument();

    expect(
      within(formElement).queryByText(/Last 2 days/i),
    ).not.toBeInTheDocument();

    const timeRangeDropdown = screen.getByRole('combobox', {
      name: /Time range/i,
    });

    await user.click(timeRangeDropdown);
    expect(screen.getByRole('listbox')).toMatchSnapshot();
    const last2daysItem = screen.getByRole('option', {
      name: /Last 2 days/i,
    });

    await user.click(last2daysItem);

    expect(
      within(formElement).getAllByText(/Last 2 days/i)[0],
    ).toBeInTheDocument();
  });

  it('should hide search results when clicking outside of search input', async () => {
    renderSearchViewComponent();
    await expandOverTimeComponent();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Click inside the input box to show search results.
    const searchInput = screen.getByRole('textbox');
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

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

  it('should redirect to compare over time results page with the right query params when the user clicks over time compare button', async () => {
    setUpTestData();
    const router = createBrowserRouter([
      {
        path: '/',
        element: <SearchView title={Strings.metaData.pageTitle.search} />,
        loader: searchLoader,
        hydrateFallbackElement: <></>,
      },
      { path: '/compare-over-time-results', element: <div /> },
    ]);

    render(<RouterProvider router={router} />);

    expect(window.location.pathname).toBe('/');
    await expandOverTimeComponent();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // Press the compare button -> It shouldn't work!
    const compareButton = await screen.findByRole('button', {
      name: /Compare/,
    });
    await user.click(compareButton);

    // We haven't navigated.
    expect(window.location.pathname).toBe('/');
    // And there should be an alert
    expect(
      await screen.findByText('Please select at least one revision.'),
    ).toBeInTheDocument();

    // focus first input to show results
    const inputs = screen.getAllByRole('textbox');
    await user.click(inputs[0]);

    // Select a rev
    const items = await screen.findAllByText("you've got no arms left!");
    await user.click(items[0]);

    // Press Escape key to hide search results.
    await user.keyboard('{Escape}');
    expect(items[0]).not.toBeInTheDocument();

    // Check that the item has been added
    await screen.findByText(/no arms left/);

    // Press the compare button
    await user.click(compareButton);

    expect(window.location.pathname).toBe('/compare-over-time-results');
    const searchParams = new URLSearchParams(window.location.search);

    expect(searchParams.toString()).toBe(
      'baseRepo=try&selectedTimeRange=86400&newRev=coconut&newRepo=try&framework=1',
    );
  });

  it('should show the new revision in the results view', async () => {
    renderWithCompareResultsURL(
      <OverTimeResultsView title={Strings.metaData.pageTitle.results} />,
    );
    await waitForPageReadyAndReturnForm();
    const selectedRevs = screen.getByTestId('selected-rev-item');
    expect(selectedRevs).toBeInTheDocument();

    expect(screen.getByText("you've got no arms left!")).toBeInTheDocument();
  });

  it('should have an edit mode in Results View', async () => {
    renderWithCompareResultsURL(
      <OverTimeResultsView title={Strings.metaData.pageTitle.results} />,
    );
    const formElement = await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    expect(formElement).toMatchSnapshot('Initial state for the form');

    // the readonly and new revision should be displayed
    const timeReadOnly = document.querySelector(
      '#time-search-container--readonly',
    );
    expect(timeReadOnly).toBeInTheDocument();

    const newSelectedRevision = await screen.findByTestId('selected-rev-item');
    expect(
      within(newSelectedRevision).getByText(/no arms left/),
    ).toBeInTheDocument();

    //the base repo and time range dropdowns should be hidden
    expect(
      screen.queryByRole('combobox', { name: 'Base repository' }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole('combobox', { name: 'Time range' }),
    ).not.toBeInTheDocument();

    // The new repo dropdown and search input should be hidden
    expect(
      screen.queryByRole('combobox', { name: 'Revisions' }),
    ).not.toBeInTheDocument();
    expect(within(formElement).queryByRole('textbox')).not.toBeInTheDocument();

    // Click the edit revision button
    const editButton = getEditButton();
    await user.click(editButton);

    expect(formElement).toMatchSnapshot('After clicking edit button');

    expect(editButton).not.toBeVisible();

    //the base repo and time range dropdowns should be visible
    expect(
      screen.getByRole('combobox', { name: 'Base repository' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('combobox', { name: /Time range/i }),
    ).toBeInTheDocument();

    // The new repo dropdown and search input should be visible
    expect(
      screen.getByRole('combobox', { name: 'Revisions' }),
    ).toBeInTheDocument();
    expect(within(formElement).getByRole('textbox')).toBeInTheDocument();

    // Pressing the cancel button should hide input and dropdowns
    await user.click(getCancelButton());

    expect(
      screen.queryByRole('combobox', { name: 'Base repository' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Time range' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('combobox', { name: 'Revisions' }),
    ).not.toBeInTheDocument();
    expect(within(formElement).queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('should update base repo, revisions and time-range after user changes them and clicks Compare in edit mode', async () => {
    renderWithCompareResultsURL(
      <OverTimeResultsView title={Strings.metaData.pageTitle.results} />,
    );
    const formElement = await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    expect(formElement).toMatchSnapshot('Initial state for the form');

    const checkboxForText = (textElement: Element) =>
      textElement.closest('li')?.querySelector('.MuiCheckbox-root');

    const newSelectedRevision = await screen.findByTestId('selected-rev-item');

    expect(
      within(newSelectedRevision).getByText(/no arms left/),
    ).toBeInTheDocument();

    // The new repo dropdown and search input should be hidden
    expect(
      screen.queryByRole('combobox', { name: 'Revisions' }),
    ).not.toBeInTheDocument();
    expect(within(formElement).queryByRole('textbox')).not.toBeInTheDocument();

    //Compare should not be visible
    expect(
      screen.queryByRole('button', {
        name: /Compare/,
      }),
    ).not.toBeInTheDocument();

    // Click the edit revision
    const editButton = getEditButton();
    await user.click(editButton);

    //The base repo dropdown
    const baseDropdown = screen.getByRole('combobox', {
      name: 'Base repository',
    });

    await user.click(baseDropdown);
    const autolandItem = await screen.findByRole('option', {
      name: 'autoland',
    });
    await user.click(autolandItem);

    // The new repo dropdown and search input should be visible
    expect(
      screen.getByRole('combobox', { name: 'Revisions' }),
    ).toBeInTheDocument();
    expect(within(formElement).getByRole('textbox')).toBeInTheDocument();
    const compareButton = await screen.findByRole('button', {
      name: /Compare/,
    });
    expect(compareButton).toBeInTheDocument();

    expect(formElement).toMatchSnapshot('After clicking edit button');
    expect(editButton).not.toBeVisible();

    //add a new revision
    const searchInput = within(formElement).getByRole('textbox');
    await user.click(searchInput);
    const alvesOfCoconut = await screen.findByText(/alves of coconuts/);
    await user.click(alvesOfCoconut);
    expect(checkboxForText(alvesOfCoconut)).toHaveClass('Mui-checked');

    //change time range
    const timeRangeDropdown = screen.getByRole('combobox', {
      name: /Time range/i,
    });
    await user.click(timeRangeDropdown);
    const last2daysItem = screen.getByRole('option', {
      name: /Last 2 days/i,
    });
    await user.click(last2daysItem);

    // Press the compare button
    await user.click(compareButton);
    expect(formElement).toMatchSnapshot('After clicking Compare button');

    await waitFor(() => {
      expect(location.href).toContain('selectedTimeRange=172800');
    });

    // the updated revision and time range should be displayed
    expect(screen.getByText(/alves of coconuts/)).toBeInTheDocument();
    expect(screen.getByText(/Last 2 days/)).toBeInTheDocument();
    expect(within(formElement).getAllByText('autoland')[0]).toBeInTheDocument();

    expect(compareButton).not.toBeVisible();
    expect(editButton).toBeVisible();
    expect(within(formElement).queryByRole('textbox')).not.toBeInTheDocument();
  });
});
