import { ReactElement } from 'react';

import fetchMock from '@fetch-mock/jest';
import userEvent from '@testing-library/user-event';

import { frameworks } from '../../common/constants';
import { loader as withBaseLoader } from '../../components/CompareResults/loader';
import ResultsView from '../../components/CompareResults/ResultsView';
import { loader as searchLoader } from '../../components/Search/loader';
import SearchView from '../../components/Search/SearchView';
import { Strings } from '../../resources/Strings';
import getTestData from '../utils/fixtures';
import { screen, renderWithRouter, within, waitFor } from '../utils/test-utils';

const searchRevisionPlaceholder =
  Strings.components.searchDefault.base.collapsed.base.inputPlaceholder;

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

async function renderSearchViewComponent() {
  setUpTestData();
  renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />, {
    loader: searchLoader,
  });
  const title = /Compare with a base/;
  const compTitle = await screen.findByRole('heading', { name: title });
  expect(compTitle).toBeInTheDocument();
}

function renderWithCompareResultsURL(component: ReactElement) {
  setUpTestData();
  return renderWithRouter(component, {
    route: '/compare-results/',
    search:
      '?baseRev=coconut&baseRepo=try&newRev=spam&newRepo=mozilla-central&framework=2',
    loader: withBaseLoader,
  });
}

// Useful function utilities to get various elements in the page
async function waitForPageReadyAndReturnForm() {
  const formName = 'Compare with base form';
  const baseTitle = /Compare with a base/;

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

  it('expands when user clicks on title header', async () => {
    await renderSearchViewComponent();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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

  it('selects and displays new framework when clicked', async () => {
    await renderSearchViewComponent();
    await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });
    // Talos is the default framework.
    expect(frameworkDropdown).toHaveTextContent('talos');

    await user.click(frameworkDropdown);
    expect(screen.getByRole('listbox')).toMatchSnapshot();

    expect(screen.getByRole('option', { name: 'talos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('option', { name: 'build_metrics' }),
    ).toHaveAttribute('aria-selected', 'false');

    await user.click(screen.getByRole('option', { name: 'build_metrics' }));

    // Both frameworks are selected now.
    expect(screen.getByRole('option', { name: 'talos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(
      screen.getByRole('option', { name: 'build_metrics' }),
    ).toHaveAttribute('aria-selected', 'true');
    expect(frameworkDropdown).toHaveTextContent('build_metrics, talos');
  });

  it('falls back to talos when the last framework is unchecked', async () => {
    await renderSearchViewComponent();
    await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });
    await user.click(frameworkDropdown);

    // Uncheck the only selected framework.
    await user.click(screen.getByRole('option', { name: 'talos' }));

    expect(screen.getByRole('option', { name: 'talos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(frameworkDropdown).toHaveTextContent('talos');
  });

  it('selects all frameworks and restores the previous selection with the All frameworks checkbox', async () => {
    await renderSearchViewComponent();
    await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });
    expect(frameworkDropdown).toHaveTextContent('talos');

    await user.click(frameworkDropdown);

    // "All frameworks" is a regular checkbox, only checked when everything is.
    expect(
      within(screen.getByRole('option', { name: 'All frameworks' })).getByRole(
        'checkbox',
      ),
    ).not.toBeChecked();

    await user.click(screen.getByRole('option', { name: 'All frameworks' }));

    // Every framework is selected now.
    expect(frameworkDropdown).toHaveTextContent('All frameworks');
    expect(
      within(screen.getByRole('option', { name: 'All frameworks' })).getByRole(
        'checkbox',
      ),
    ).toBeChecked();
    expect(screen.getByRole('option', { name: 'talos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('option', { name: 'awsy' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    // Clicking it again restores the selection from before it was checked.
    await user.click(screen.getByRole('option', { name: 'All frameworks' }));
    expect(frameworkDropdown).toHaveTextContent('talos');
    expect(
      within(screen.getByRole('option', { name: 'All frameworks' })).getByRole(
        'checkbox',
      ),
    ).not.toBeChecked();
    expect(screen.getByRole('option', { name: 'talos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('option', { name: 'awsy' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
  });

  it('restores the selection from before All frameworks was checked', async () => {
    await renderSearchViewComponent();
    await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });
    await user.click(frameworkDropdown);

    // Select a second framework before checking "All frameworks".
    await user.click(screen.getByRole('option', { name: 'build_metrics' }));
    expect(frameworkDropdown).toHaveTextContent('build_metrics, talos');

    await user.click(screen.getByRole('option', { name: 'All frameworks' }));
    expect(frameworkDropdown).toHaveTextContent('All frameworks');

    await user.click(screen.getByRole('option', { name: 'All frameworks' }));
    expect(frameworkDropdown).toHaveTextContent('build_metrics, talos');
  });

  it('keeps the remaining frameworks selected when unchecking some after All frameworks', async () => {
    await renderSearchViewComponent();
    await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });
    await user.click(frameworkDropdown);
    await user.click(screen.getByRole('option', { name: 'All frameworks' }));
    expect(frameworkDropdown).toHaveTextContent('All frameworks');

    // Unchecking a few is a quick way to get most frameworks.
    await user.click(screen.getByRole('option', { name: 'awsy' }));
    await user.click(screen.getByRole('option', { name: 'browsertime' }));

    expect(screen.getByRole('option', { name: 'awsy' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByRole('option', { name: 'browsertime' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.getByRole('option', { name: 'talos' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    // "All frameworks" auto-unchecks since it's no longer everything.
    expect(
      within(screen.getByRole('option', { name: 'All frameworks' })).getByRole(
        'checkbox',
      ),
    ).not.toBeChecked();
  });

  it('summarizes the selected frameworks when more than three are selected', async () => {
    await renderSearchViewComponent();
    await waitForPageReadyAndReturnForm();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });
    await user.click(frameworkDropdown);

    // Three selected frameworks are all displayed, with no "+ N others".
    await user.click(screen.getByRole('option', { name: 'awsy' }));
    await user.click(screen.getByRole('option', { name: 'browsertime' }));
    expect(frameworkDropdown).toHaveTextContent('awsy, browsertime, talos');
    expect(
      screen.queryByTestId('framework-summary-remaining'),
    ).not.toBeInTheDocument();

    // A fourth one truncates the summary, keeping only the first three names.
    await user.click(screen.getByRole('option', { name: 'build_metrics' }));
    expect(frameworkDropdown).toHaveTextContent(
      'awsy, browsertime, build_metrics + 1 other',
    );
    expect(screen.getByTestId('framework-summary-remaining')).toHaveTextContent(
      '+ 1 other',
    );

    // A fifth one updates the remaining count.
    await user.click(screen.getByRole('option', { name: 'devtools' }));
    expect(frameworkDropdown).toHaveTextContent(
      'awsy, browsertime, build_metrics + 2 others',
    );
    expect(screen.getByTestId('framework-summary-remaining')).toHaveTextContent(
      '+ 2 others',
    );

    // The "All frameworks" summary stays the same.
    await user.click(screen.getByRole('option', { name: 'All frameworks' }));
    expect(frameworkDropdown).toHaveTextContent('All frameworks');
  });

  it('should remove the checked revision once X button is clicked', async () => {
    await renderSearchViewComponent();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    // focus input to show results
    const searchInput = screen.getAllByPlaceholderText(
      searchRevisionPlaceholder,
    )[1];
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
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
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
    expect(
      screen.queryByRole('button', {
        name: /Compare/,
      }),
    ).not.toBeInTheDocument();

    // Click the edit revision for new revisions
    await user.click(getEditButton());

    expect(newSearchContainer).toHaveClass('show-container');
    const compareButton = screen.getByRole('button', {
      name: /Compare/,
    });
    expect(compareButton).toBeInTheDocument();

    // Remove the new revision by clicking the X button
    await user.click(getRemoveRevisionButton(1, 'coconut'));
    expect(formElement).toMatchSnapshot('after removal of new revision');
    expect(
      within(newSelectedRevision).queryByText(/no arms left/),
    ).not.toBeInTheDocument();

    // Press the compare button
    await user.click(compareButton);

    expect(formElement).toMatchSnapshot('After clicking Compare button');

    // The form should be back at its initial state.
    expect(compareButton).not.toBeVisible();
    expect(editButton).toBeVisible();
    expect(baseSearchContainer).toHaveClass('hide-container');

    await waitFor(() => expect(location.href).not.toContain('newRev=spam'));
  });

  it('updates the framework and url when a new one is selected', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    await waitForPageReadyAndReturnForm();
    const header = await screen.findByText('Results');

    expect(header).toBeInTheDocument();

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });
    // build_metrics comes from the URL.
    expect(frameworkDropdown).toHaveTextContent('build_metrics');

    await user.click(frameworkDropdown);

    const list = await screen.findByRole('listbox');

    const option = await screen.findByRole('option', { name: 'awsy' });
    await user.click(option);

    // Both frameworks are selected in the dropdown.
    expect(frameworkDropdown).toHaveTextContent('awsy, build_metrics');
    expect(list).toMatchSnapshot('after awsy is selected');

    // The selection is committed to the URL when the menu closes.
    await user.keyboard('{Escape}');
    await waitFor(() => {
      const frameworkParams = new URLSearchParams(location.search).getAll(
        'framework',
      );
      expect(frameworkParams.sort()).toEqual(['2', '4']);
    });
  });

  it('updates the url with every framework when All frameworks is checked in the results view', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    await waitForPageReadyAndReturnForm();
    await screen.findByText('Results');

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });
    await user.click(frameworkDropdown);
    await user.click(screen.getByRole('option', { name: 'All frameworks' }));
    expect(frameworkDropdown).toHaveTextContent('All frameworks');

    // The selection is committed to the URL when the menu closes.
    await user.keyboard('{Escape}');
    await waitFor(() => {
      const frameworkParams = new URLSearchParams(location.search).getAll(
        'framework',
      );
      expect(frameworkParams.sort()).toEqual(
        frameworks.map((framework) => framework.id.toString()).sort(),
      );
    });
  });

  it('defaults to talos when All frameworks arrives checked from the url and is unchecked', async () => {
    setUpTestData();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderWithRouter(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
      {
        route: '/compare-results/',
        search: `?baseRev=coconut&baseRepo=try&newRev=spam&newRepo=mozilla-central&${frameworks
          .map((framework) => `framework=${framework.id}`)
          .join('&')}`,
        loader: withBaseLoader,
      },
    );
    await waitForPageReadyAndReturnForm();
    await screen.findByText('Results');

    const frameworkDropdown = screen.getByRole('combobox', {
      name: 'Framework',
    });
    expect(frameworkDropdown).toHaveTextContent('All frameworks');

    // There's no in-session selection to restore, so unchecking defaults to
    // talos.
    await user.click(frameworkDropdown);
    await user.click(screen.getByRole('option', { name: 'All frameworks' }));
    expect(frameworkDropdown).toHaveTextContent('talos');

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(new URLSearchParams(location.search).getAll('framework')).toEqual([
        '1',
      ]);
    });
  });

  it('should move back to the previously selected base and new revisions when Cancel is clicked', async () => {
    renderWithCompareResultsURL(
      <ResultsView title={Strings.metaData.pageTitle.results} />,
    );
    await waitForPageReadyAndReturnForm();

    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

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
