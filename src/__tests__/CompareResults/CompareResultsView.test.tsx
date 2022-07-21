import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import CompareResultsView from '../../components/CompareResults/CompareResultsView';
import RevisionSearch from '../../components/Shared/RevisionSearch';
import SelectedRevisionsTable from '../../components/Shared/SelectedRevisionsTable';
import { updateSearchResults } from '../../reducers/SearchSlice';
import { setSelectedRevisions } from '../../reducers/SelectedRevisions';
import getTestData from '../utils/fixtures';
import { render, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

describe('CompareResults View', () => {
  it('Should match snapshot', () => {
    render(<CompareResultsView mode="light" />);

    expect(document.body).toMatchSnapshot();
  });

  it('should display SelectedRevisionsTable if there are selected revisions', async () => {
    const { testData } = getTestData();

    // start with four selected revisions
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    render(<CompareResultsView mode="light" />);

    expect(screen.getByText("you've got no arms left!")).toBeInTheDocument();
  });

  it('should display revision search when clicking edit button', async () => {
    const { testData } = getTestData();
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // start with four selected revisions
    const selectedRevisions = testData.slice(0, 4);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    render(<CompareResultsView mode="light" />);

    const editButton = screen.getByRole('button', {
      name: 'edit-revision-1',
    });

    await user.click(editButton);
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(
      screen.getByRole('textbox', {
        name: 'Search By Revision ID or Author Email',
      }),
    ).toBeInTheDocument();
  });
});

describe('RevisionSearch', () => {
  it('should display SearchResultsItem when focusing input', async () => {
    const { testData } = getTestData();
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    store.dispatch(updateSearchResults(testData));

    render(
      <RevisionSearch
        inputWidth={9}
        resultsWidth={12}
        view="compare-results"
      />,
    );

    const input = screen.getByRole('textbox', {
      name: 'Search By Revision ID or Author Email',
    });
    await user.click(input);
    jest.runOnlyPendingTimers();
    expect(
      screen.getByText('spamspam - What, ridden on a horse?'),
    ).toBeInTheDocument();
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

    render(<SelectedRevisionsTable view="compare-results" />);

    await user.click(screen.getByRole('button', { name: 'edit-revision-1' }));

    const input = screen.getByRole('textbox', {
      name: 'Search By Revision ID or Author Email',
    });
    await user.click(input);
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(
      screen.getByText('spamspam - What, ridden on a horse?'),
    ).toBeInTheDocument();

    await user.keyboard('{Esc}');
    await act(async () => {
      jest.runOnlyPendingTimers();
    });

    expect(
      screen.queryByText('spamspam - What, ridden on a horse?'),
    ).not.toBeInTheDocument();
  });
});
