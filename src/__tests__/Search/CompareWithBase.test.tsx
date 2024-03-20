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
} from '../utils/test-utils';

function setUpTestData() {
  const { testData } = getTestData();
  (global.fetch as FetchMockSandbox)
    .get('begin:https://treeherder.mozilla.org/api/project/try/push/', {
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
      'begin:https://treeherder.mozilla.org/api/project/mozilla-central/push/?revision=spam',
      {
        results: [testData[1]],
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

function getEditButtons() {
  return screen.getAllByRole('button', {
    name: 'edit revision',
  });
}

function getRemoveRevisionButton() {
  return screen.getByRole('button', {
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

  it('toggles component open and closed on click', async () => {
    renderSearchViewComponent();

    const user = userEvent.setup({ delay: null });
    const testExpandedID = 'base-state';
    const headerContent = screen.getByTestId(testExpandedID);

    //make sure it's in collapsed state first
    expect(screen.getAllByTestId('base-state')[0]).toHaveClass(
      'compare-card-container--expanded',
    );

    //make sure it's hidden when user clicks on title component
    await user.click(headerContent);
    expect(screen.getAllByTestId('base-state')[0]).not.toHaveClass(
      'compare-card-container--expanded',
    );

    await user.click(headerContent);
    expect(screen.getAllByTestId('base-state')[0]).toHaveClass(
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

    // Find out if the base revision is rendered
    const baseRevisionText = screen.getByText(/you've got no arms left!/);
    const newRevisionText = screen.getByText(/it's just a flesh wound/);
    expect(baseRevisionText).toBeInTheDocument();
    expect(newRevisionText).toBeInTheDocument();

    // The search container should be hidden
    const baseSearchContainer = document.querySelector(
      '#base-search-container',
    );
    expect(baseSearchContainer).toHaveClass('hide-container');

    // Click the edit revision
    const editButton = getEditButtons()[0];
    await user.click(editButton);

    expect(baseSearchContainer).toHaveClass('show-container');

    expect(formElement).toMatchSnapshot(
      'After clicking edit for the base revision',
    );
    expect(editButton).not.toBeInTheDocument();

    // Pressing the cancel button should hide input and dropdown
    await user.click(getCancelButton());

    expect(baseSearchContainer).toHaveClass('hide-container');

    // Click the edit revision again
    await user.click(getEditButtons()[0]);
    expect(baseSearchContainer).toHaveClass('show-container');

    // Remove the base revision by clicking the X button
    await user.click(getRemoveRevisionButton());
    expect(baseRevisionText).not.toBeInTheDocument();

    // Click the Save
    const saveButtonBase = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButtonBase);

    // The baseRevision is still hidden
    expect(baseRevisionText).not.toBeInTheDocument();

    // The search container is hidden.
    expect(baseSearchContainer).toHaveClass('hide-container');

    // Do the same operation with the components for the "new" revisions
    const newSearchContainer = document.querySelector('#new-search-container');
    expect(newSearchContainer).toHaveClass('hide-container');

    // Click the edit revision for new revisions
    await user.click(getEditButtons()[1]);
    expect(formElement).toMatchSnapshot(
      'After clicking edit for the new revision',
    );
    expect(newSearchContainer).toHaveClass('show-container');

    // Remove the new revision by clicking the X button
    await user.click(getRemoveRevisionButton());
    expect(newRevisionText).not.toBeInTheDocument();

    // Click the Save
    const saveButtonNew = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButtonNew);
    expect(newSearchContainer).toHaveClass('hide-container');
  });

  it('should save the updated BASE revision when Save is clicked', async () => {
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    await waitForPageReadyAndReturnForm();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // Click the edit revision
    await user.click(getEditButtons()[0]);

    // Remove the base revision by clicking the X button
    await user.click(getRemoveRevisionButton());

    // Select an updated base revision in the dropdown
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    const horse = await screen.findAllByText('What, ridden on a horse?');

    await user.click(horse[0]);
    expect(screen.getAllByTestId('checkbox-2')[0]).toHaveClass('Mui-checked');
    //test toggle action for base revision container
    await user.click(horse[0]);
    expect(screen.getAllByTestId('checkbox-2')[0]).not.toHaveClass(
      'Mui-checked',
    );
    await user.click(horse[0]);
    expect(screen.getAllByTestId('checkbox-2')[0]).toHaveClass('Mui-checked');

    // Click the Save
    const saveButtonBase = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButtonBase);

    //the updated base revision is rendered
    const updatedBaseRevisionText = screen.getByText(
      /What, ridden on a horse?/,
    );
    expect(updatedBaseRevisionText).toBeInTheDocument();
  });

  it('should save the updated NEW revision when Save is clicked', async () => {
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );

    await waitForPageReadyAndReturnForm();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // Click the edit revision for new revisions
    await user.click(getEditButtons()[1]);

    // Select an updated new revision in the dropdown
    const searchInputNew = screen.getByRole('textbox');
    await user.click(searchInputNew);
    const horse = await screen.findByRole('button', {
      name: /What, ridden on a horse?/,
    });
    await user.click(horse);
    expect(horse).toHaveClass('item-selected');
    // test toggle action for new revision container
    await user.click(horse);
    expect(horse).not.toHaveClass('item-selected');
    await user.click(horse);
    expect(horse).toHaveClass('item-selected');

    // Click the Save
    const saveButton = screen.getByRole('button', { name: 'Save' });
    await user.click(saveButton);

    //the updated new revision is rendered
    const updatedNewRevisionText = screen.getByText(/What, ridden on a horse?/);
    expect(updatedNewRevisionText).toBeInTheDocument();
  });
});
