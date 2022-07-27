import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import { maxRevisionsError } from '../common/constants';
import CompareResultsView from '../components/CompareResults/CompareResultsView';
import SearchView from '../components/Search/SearchView';
import { setSelectedRevisions } from '../reducers/SelectedRevisions';
import getTestData from './utils/fixtures';
import { renderWithRouter, store } from './utils/setupTests';
import { screen } from './utils/test-utils';

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

  it('should display edit button on Compare View', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;

    // start with one selected revision
    const selectedRevisions = testData.slice(0, 1);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    renderWithRouter(<CompareResultsView mode="light" />);

    expect(
      screen.getByRole('button', { name: 'edit-revision-1' }),
    ).toBeInTheDocument();
  });
});
