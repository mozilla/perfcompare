import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import { maxRevisionsError } from '../common/constants';
import CompareResultsView from '../components/CompareResults/CompareResultsView';
import SearchView from '../components/Search/SearchView';
import { SelectedRevisionsTable } from '../components/Shared/SelectedRevisionsTable';
import { updateSearchResults } from '../reducers/SearchSlice';
import { setSelectedRevisions } from '../reducers/SelectedRevisions';
import getTestData from './utils/fixtures';
import { renderWithRouter, store } from './utils/setupTests';
import { fireEvent, screen } from './utils/test-utils';

describe('Search View', () => {
  it('should match snapshot', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;

    // start with four selected revisions
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    renderWithRouter(<SearchView />);
    await act(async () => void jest.runOnlyPendingTimers());

    expect(document.body).toMatchSnapshot();
  });

  it('should render correctly when there are selected revisions', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView />);

    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    const fleshWound = await screen.findByText(
      "spam - it's just a flesh wound",
    );

    await user.click(fleshWound);
    const addRevision = screen.getByRole('button', { name: 'add revisions' });
    await user.click(addRevision);

    expect(screen.getByText('BASE')).toBeInTheDocument();
  });

  it('should delete revisions after click and not show revisions table if no revisions', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    const selectedRevisions = testData.slice(0, 2);
    store.dispatch(setSelectedRevisions(selectedRevisions));
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView />);

    expect(screen.queryByText('Commit Message')).toBeInTheDocument();
    const button = document.querySelectorAll('#close-button');

    await user.click(button[0]);
    await user.click(button[1]);

    expect(store.getState().selectedRevisions.revisions).toEqual([]);
    expect(screen.queryByText('Commit Message')).not.toBeInTheDocument();
  });

  it('should print error message if trying to add more than four revisions', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    // start with four selected revisions
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));
    renderWithRouter(<SearchView />);

    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    await user.click(screen.getByTestId('checkbox-4'));

    const addRevision = screen.getByRole('button', {
      name: 'add revisions',
    });
    await user.click(addRevision);
    expect(screen.getByText(maxRevisionsError)).toBeInTheDocument();
  });

  it('should print error message if trying to add revision that has already been selected', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // start with a selected revision
    const selectedRevisions = testData.slice(0, 1);
    store.dispatch(setSelectedRevisions(selectedRevisions));
    renderWithRouter(<SearchView />);

    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    await user.click(screen.getByTestId('checkbox-0'));

    const addRevision = screen.getByRole('button', {
      name: 'add revisions',
    });
    await user.click(addRevision);
    expect(
      screen.getByText('Revision coconut is already selected.'),
    ).toBeInTheDocument();
  });

  it('should replace revision when editing from Compare View', async () => {
    const { testData } = getTestData();
    store.dispatch(updateSearchResults(testData));
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // start with one selected revision
    const selectedRevisions = testData.slice(0, 1);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    renderWithRouter(<CompareResultsView mode="light" />);
    const prevRevision = screen.getByText("you've got no arms left!");
    const editRevisionButton = screen.getByRole('button', {
      name: 'edit-revision-1',
    });
    expect(editRevisionButton).toBeInTheDocument();

    await user.click(editRevisionButton);

    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    await user.click(screen.getByTestId('checkbox-4'));
    await user.click(screen.getByTestId('replace-revision-button'));
    jest.runOnlyPendingTimers();

    expect(prevRevision).not.toBeInTheDocument();
    expect(screen.getByText('It got better...')).toBeInTheDocument();
  });

  it('should display an alert when editing revision from Compare View if revision is already selected', async () => {
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

    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    await user.click(screen.getByTestId('checkbox-0'));
    await user.click(screen.getByTestId('replace-revision-button'));
    expect(
      screen.getByText('Revision coconut is already selected.'),
    ).toBeInTheDocument();
  });
  it('should render draggable rows', async () => {
    const { testData } = getTestData();
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));
    renderWithRouter(<SearchView />);
    const rowEls = screen.getAllByRole('row');
    const bodyRows = rowEls.slice(1);
    bodyRows.forEach((row) => {
      expect(row).toHaveAttribute('draggable');
    });
  });
  it('should call dispatchSelectedRevisions on drop', async () => {
    const { testData } = getTestData();
    const revisions = testData.slice(0, 4);

    const props = {
      dispatchSelectedRevisions: jest.fn(),
      view: 'search' as const,
      revisions,
    };
    renderWithRouter(<SelectedRevisionsTable {...props} />);
    const rows = screen.getAllByRole('row');
    const lastRow = rows[rows.length - 1];
    expect(props.dispatchSelectedRevisions).toBeCalledTimes(0);
    fireEvent.dragEnd(lastRow);
    expect(props.dispatchSelectedRevisions).toBeCalledTimes(1);
  });
});
