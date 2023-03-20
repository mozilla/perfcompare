import { act } from 'react-dom/test-utils';

import SearchViewBeta from '../../components/Search/beta/SearchView';
import { renderWithRouter } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

describe('Search View', () => {
  it('renders correctly when there are no results', async () => {
    renderWithRouter(<SearchViewBeta />);

    // Title appears
    expect(screen.getByText(/PerfCompare/i)).toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
