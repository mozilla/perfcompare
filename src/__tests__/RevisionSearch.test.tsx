import userEvent from '@testing-library/user-event';

import RevisionSearch from '../components/Shared/RevisionSearch';
import { updateSearchResults } from '../reducers/SearchSlice';
import getTestData from './utils/fixtures';
import { render, store } from './utils/setupTests';
import { screen } from './utils/test-utils';

describe('RevisionSearch', () => {
  it('should display SearchResultsItem when focusing input', async () => {
    const { testData } = getTestData();
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    store.dispatch(updateSearchResults(testData));

    render(<RevisionSearch inputWidth={9} view="compare-results" />);

    const input = screen.getByRole('textbox', {
      name: 'Search By Revision ID or Author Email',
    });
    await user.click(input);
    jest.runOnlyPendingTimers();
    expect(screen.getByText('It got better...')).toBeInTheDocument();
  });
});
