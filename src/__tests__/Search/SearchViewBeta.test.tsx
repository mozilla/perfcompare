import { act } from 'react-dom/test-utils';

import SearchViewBeta from '../../components/Search/beta/SearchView';
import { renderWithRouter } from '../utils/setupTests';

describe('Search View', () => {
  it('renders correctly when there are no results', async () => {
    renderWithRouter(<SearchViewBeta />);

    expect(document.body).toMatchSnapshot();
    await act(async () => void jest.runOnlyPendingTimers());
  });
});
