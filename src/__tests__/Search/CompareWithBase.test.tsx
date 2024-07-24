import { ReactElement } from 'react';

import userEvent from '@testing-library/user-event';

import { loader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import {
  screen,
  renderWithRouter,
  FetchMockSandbox,
  within,
  waitFor,
} from '../utils/test-utils';

function setUpTestData() {
  const { testData } = getTestData();
  (global.fetch as FetchMockSandbox)
    .get('glob:https://treeherder.mozilla.org/api/project/*/push/*', {
      results: testData,
    })
    .get('begin:https://treeherder.mozilla.org/api/perfcompare/results/', [])
    .get(
      'begin:https://treeherder.mozilla.org/api/project/try/push/?revision=coconut',
      {
        results: [testData[0]],
      },
    )
    .get(
      'glob:https://treeherder.mozilla.org/api/project/mozilla-central/push/?revision=spam',
      {
        results: [testData[1]],
      },
    )
    .get(
      'glob:https://treeherder.mozilla.org/api/project/mozilla-central/push/?revision=spamspam',
      {
        results: [testData[2]],
      },
    );
}

function renderSearchViewComponent() {
  setUpTestData();
  return renderWithRouter(
    <SearchView title={Strings.metaData.pageTitle.search} />,
  );
}

function renderWithCompareResultsURL(component: ReactElement) {
  setUpTestData();
  return renderWithRouter(component, {
    route: '/compare-results/',
    search:
      '?baseRev=coconut&baseRepo=try&newRev=spam&newRepo=mozilla-central&framework=2',
    loader,
  });
}

// Useful function utilities to get various elements in the page
async function waitForPageReadyAndReturnForm() {
  const formName = 'Compare with base form';
  const baseTitle = Strings.components.searchDefault.base.title;

  const compTitle = await screen.findByRole('heading', {
    name: baseTitle,
  });

  expect(compTitle).toBeInTheDocument();
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

function getRemoveRevisionButton(
  index: number,
  targetRevision?: string | RegExp,
) {
  let container: { getByRole: (typeof screen)['getByRole'] } = screen;
  if (targetRevision) {
    const target = screen.getAllByText(targetRevision)[index];
    container = within(target.closest('li') ?? document.body);
  }

  // eslint-disable-next-line testing-library/prefer-screen-queries
  return container.getByRole('button', {
    name: 'remove revision',
  });
}

function getCancelButton() {
  return screen.getByRole('button', { name: 'Cancel' });
}

describe('Compare With Base', () => {
  it('renders correctly when there are no results', async () => {
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    const formElement = await waitForPageReadyAndReturnForm();
    expect(formElement).toMatchSnapshot('Initial state for the form');
  });

  it('has the correct title for the component', async () => {
    renderSearchViewComponent();
    const title = 'Compare with a base';
    const compTitle = screen.getByRole('heading', { name: title });
    expect(compTitle).toBeInTheDocument();
  });

  it('expands when user clicks on title header', async () => {
    renderSearchViewComponent();

    const user = userEvent.setup({ delay: null });
    const testExpandedTimeID = 'time-state';
    const headerContentTime = screen.getByTestId(testExpandedTimeID);
    const testExpandedBaseID = 'base-state';
    const headerContentBase = screen.getByTestId(testExpandedBaseID);

    //make sure it's in collapsed state first
    expect(screen.getAllByTestId(testExpandedBaseID)[0]).toHaveClass(
      'compare-card-container--expanded',
    );

    //make sure it's hidden when user clicks on the over time title component
    await user.click(headerContentTime);
    expect(screen.getAllByTestId(testExpandedBaseID)[0]).toHaveClass(
      'compare-card-container--hidden',
    );

    await user.click(headerContentBase);
    expect(screen.getAllByTestId(testExpandedBaseID)[0]).toHaveClass(
      'compare-card-container--expanded',
    );
  });

  it('does nothing when user clicks on title header in Results view', async () => {
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    await waitForPageReadyAndReturnForm();

    const user = userEvent.setup({ delay: null });
    const testExpandedBaseID = 'base-state';
    const headerContentBase = screen.getByTestId(testExpandedBaseID);

    //make sure it's in collapsed state first
    expect(screen.getByTestId(testExpandedBaseID)).toHaveClass(
      'compare-card-container--expanded',
    );

    //remains expanded when user clicks on the title component
    await user.click(headerContentBase);
    expect(screen.getByTestId(testExpandedBaseID)).toHaveClass(
      'compare-card-container--expanded',
    );
  });

  it('selects and displays new framework when clicked', async () => {
    renderSearchViewComponent();
    const formElement = await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ delay: null });
    expect(within(formElement).getByText(/talos/i)).toBeInTheDocument();
    expect(
      within(formElement).queryByText(/build_metrics/i),
    ).not.toBeInTheDocument();

    const frameworkDropdown = screen.getAllByRole('button', {
      name: 'Framework talos',
    });

    await user.click(frameworkDropdown[0]);
    expect(screen.getByRole('listbox')).toMatchSnapshot();
    const buildMetricsItem = screen.getByRole('option', {
      name: 'build_metrics',
    });

    await user.click(buildMetricsItem);

    expect(within(formElement).getByText(/build_metrics/i)).toBeInTheDocument();
  });

  it('should remove the checked revision once X button is clicked', async () => {
    renderSearchViewComponent();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    const checkbox = (await screen.findAllByTestId('checkbox-0'))[0];
    await user.click(checkbox);
    expect(checkbox).toHaveClass('Mui-checked');
    const removeButton = document.querySelectorAll('[title="remove revision"]');
    expect(removeButton[0]).toBeInTheDocument();
    expect(screen.getAllByTestId('selected-rev-item')[0]).toBeInTheDocument();

    await user.click(removeButton[0]);

    expect(document.body).toMatchSnapshot();

    expect(screen.queryByTestId('selected-rev-item')).not.toBeInTheDocument();
  });

  it('should have an edit mode in Results View', async () => {
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    const formElement = await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ delay: null });
    expect(formElement).toMatchSnapshot('Initial state for the form');

    const baseSelectedRevision = await screen.findByTestId(
      'base-selected-revision',
    );

    const newSelectedRevision = await screen.findByTestId(
      'new-selected-revision',
    );

    // Find out if the base revision is rendered
    expect(
      within(baseSelectedRevision).getByText(/no arms left/),
    ).toBeInTheDocument();

    expect(
      within(newSelectedRevision).getByText(/no arms left/),
    ).toBeInTheDocument();

    // The search container should be hidden
    const baseSearchContainer = document.querySelector(
      '#base-search-container',
    );
    expect(baseSearchContainer).toHaveClass('hide-container');

    // Click the edit revision
    const editButton = getEditButton();
    await user.click(editButton);

    expect(baseSearchContainer).toHaveClass('show-container');

    expect(formElement).toMatchSnapshot('After clicking edit button');
    expect(editButton).not.toBeVisible();
    // Pressing the cancel button should hide input and dropdown
    await user.click(getCancelButton());

    expect(baseSearchContainer).toHaveClass('hide-container');

    // Click the edit revision again
    await user.click(getEditButton());
    expect(baseSearchContainer).toHaveClass('show-container');

    // Remove the base revision by clicking the X button
    await user.click(getRemoveRevisionButton(0, 'coconut'));
    expect(formElement).toMatchSnapshot('after removal of base revision');
    expect(
      within(baseSelectedRevision).queryByText(/no arms left/),
    ).not.toBeInTheDocument();

    // The baseRevision is still hidden
    expect(
      within(baseSelectedRevision).queryByText(/no arms left/),
    ).not.toBeInTheDocument();

    // Pressing the cancel button should hide input and dropdown
    await user.click(getCancelButton());

    // The search container is hidden.
    expect(baseSearchContainer).toHaveClass('hide-container');

    // Do the same operation with the components for the "new" revisions
    const newSearchContainer = document.querySelector('#new-search-container');
    expect(newSearchContainer).toHaveClass('hide-container');

    // Click the edit revision for new revisions
    await user.click(getEditButton());

    expect(newSearchContainer).toHaveClass('show-container');

    // Remove the new revision by clicking the X button
    await user.click(getRemoveRevisionButton(1, 'coconut'));
    expect(formElement).toMatchSnapshot('after removal of new revision');
    expect(
      within(newSelectedRevision).queryByText(/no arms left/),
    ).not.toBeInTheDocument();
  });

  it('updates the framework and url when a new one is selected', async () => {
    const user = userEvent.setup({ delay: null });
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    await waitForPageReadyAndReturnForm();
    const header = await screen.findByText('Results');

    expect(header).toBeInTheDocument();

    const frameworkDropdown = screen.getByRole('button', {
      name: 'build_metrics',
    });

    await user.click(frameworkDropdown);

    const list = await screen.findByRole('listbox');

    const option = await screen.findByRole('option', { name: 'awsy' });
    await user.click(option);

    await waitFor(() => {
      expect(location.href).toContain('framework=4');
    });

    expect(list).toMatchSnapshot('after awsy is selected');
    const awsy = screen.getByText('awsy');
    expect(awsy).toBeInTheDocument();
  });

  it('should move back to the previously selected base and new revisions when Cancel is clicked', async () => {
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    await waitForPageReadyAndReturnForm();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    const baseSelectedRevision = await screen.findByTestId(
      'base-selected-revision',
    );

    const newSelectedRevision = await screen.findByTestId(
      'new-selected-revision',
    );

    // Find out if the base revision is rendered
    expect(
      within(baseSelectedRevision).getByText(/no arms left/),
    ).toBeInTheDocument();

    // Click the edit revision for the base revision
    await user.click(getEditButton());

    // Remove the base revision by clicking the X button
    await user.click(getRemoveRevisionButton(0, 'coconut'));

    // The base revision has been removed
    expect(
      within(baseSelectedRevision).queryByText(/no arms left/),
    ).not.toBeInTheDocument();

    // Click the Cancel button
    await user.click(getCancelButton());

    // the base revision is rendered again
    expect(
      within(baseSelectedRevision).getByText(/no arms left/),
    ).toBeInTheDocument();

    // Do the same with the new revision
    expect(
      within(newSelectedRevision).getByText(/no arms left/),
    ).toBeInTheDocument();

    // Click the edit revision for the new revisions
    await user.click(getEditButton());

    // Remove the new revision by clicking the X button
    await user.click(getRemoveRevisionButton(1, 'coconut'));

    // The new revision has been removed
    expect(
      within(newSelectedRevision).queryByText(/no arms left/),
    ).not.toBeInTheDocument();

    // Click the Cancel button
    await user.click(getCancelButton());

    // the new revision is rendered again
    expect(
      within(newSelectedRevision).getByText(/no arms left/),
    ).toBeInTheDocument();
  });
});
