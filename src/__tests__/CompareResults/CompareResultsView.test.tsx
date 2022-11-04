import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import CompareResultsTable from '../../components/CompareResults/CompareResultsTable';
import CompareResultsView from '../../components/CompareResults/CompareResultsView';
import SelectedRevisionsTable from '../../components/Shared/SelectedRevisionsTable';
import { setCompareResults } from '../../reducers/CompareResultsSlice';
import { updateSearchResults } from '../../reducers/SearchSlice';
import { setSelectedRevisions } from '../../reducers/SelectedRevisions';
import getTestData from '../utils/fixtures';
import { renderWithRouter, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

describe('CompareResults View', () => {
  it('Should match snapshot', () => {
    const { testCompareData } = getTestData();
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    renderWithRouter(<CompareResultsTable mode="light" />);

    expect(document.body).toMatchSnapshot();
  });

  it('should display SelectedRevisionsTable if there are selected revisions', async () => {
    const { testData } = getTestData();

    // start with four selected revisions
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    renderWithRouter(<CompareResultsView mode="light" />);

    expect(screen.getByText("you've got no arms left!")).toBeInTheDocument();
  });

  it('should display revision search when clicking edit button', async () => {
    const { testData } = getTestData();
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // start with four selected revisions
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    renderWithRouter(<CompareResultsView mode="light" />);

    const editButton = screen.getByRole('button', {
      name: 'edit-revision-1',
    });

    await user.click(editButton);

    act(() => void jest.runOnlyPendingTimers());
    expect(
      screen.getByRole('textbox', {
        name: 'Search By Revision ID or Author Email',
      }),
    ).toBeInTheDocument();
  });

  it('should show correct icon for improvements and regressions', () => {
    const { testCompareData } = getTestData();
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    renderWithRouter(<CompareResultsTable mode="light" />);

    expect(screen.getByTestId('ThumbUpAltIcon')).toBeInTheDocument();
    expect(screen.getByTestId('WarningIcon')).toBeInTheDocument();
  });
});

describe('SelectedRevisionsTableRow', () => {
  it('should close popover on close', async () => {
    const { testData } = getTestData();
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // start with four selected revisions
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));
    store.dispatch(updateSearchResults(testData));

    renderWithRouter(<SelectedRevisionsTable view="compare-results" />);

    await user.click(screen.getByRole('button', { name: 'edit-revision-1' }));

    const input = screen.getByRole('textbox', {
      name: 'Search By Revision ID or Author Email',
    });
    await user.click(input);

    expect(
      screen.getByText('spamspamspam - It got better...'),
    ).toBeInTheDocument();

    await user.keyboard('{Esc}');
    act(() => void jest.runOnlyPendingTimers());

    expect(screen.queryByText('It got better...')).not.toBeInTheDocument();
  });

  it('should close popover when close button is clicked', async () => {
    const { testData } = getTestData();
    store.dispatch(updateSearchResults(testData));
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // start with one selected revision
    const selectedRevisions = testData.slice(0, 1);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    renderWithRouter(<CompareResultsView mode="light" />);
    const editRevisionButton = screen.getByRole('button', {
      name: 'edit-revision-1',
    });
    expect(editRevisionButton).toBeInTheDocument();

    await user.click(editRevisionButton);

    const searchInput = screen.getByRole('textbox', {
      name: 'Search By Revision ID or Author Email',
    });
    expect(searchInput).toBeInTheDocument();

    await user.click(screen.getByTestId('cancel-edit-revision-button'));
    act(() => void jest.runOnlyPendingTimers());

    expect(searchInput).not.toBeInTheDocument();
  });
});

describe('CompareResultsTable', () => {
  it('Should display correct confidence icon', async () => {
    const { testCompareData } = getTestData();
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    renderWithRouter(<CompareResultsTable mode="light" />);

    const icons = screen.getAllByTestId('confidence-icon');
    expect(icons[0]).toHaveClass('low');
    expect(icons[1]).toHaveClass('med');
    expect(icons[2]).toHaveClass('high');
    expect(icons[3]).toHaveClass('unknown-confidence');
  });
});
