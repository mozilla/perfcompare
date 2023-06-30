import userEvent from '@testing-library/user-event';

import ResultsView from '../../../components/CompareResults/beta/ResultsView';
import useProtocolTheme from '../../../theme/protocolTheme';
import { renderWithRouter } from '../../utils/setupTests';
import { renderHook, screen, waitFor } from '../../utils/test-utils';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual<typeof import('react-router-dom')>('react-router-dom'),
  useSearchParams: () => [new URLSearchParams({ fakedata: 'true' })],
}));


describe('Results View', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;

  it('Should match snapshot', () => {
    renderWithRouter(<ResultsView protocolTheme={protocolTheme} toggleColorMode={toggleColorMode} />);

    expect(screen.getByTestId('beta-version-compare-results')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('Fakedata', () => {
    renderWithRouter(<ResultsView protocolTheme={protocolTheme} toggleColorMode={toggleColorMode} />);

    expect(screen.getByTestId('table-header')).toBeInTheDocument();
  });

  it('Should expand on click', async () => {
    const user = userEvent.setup({ delay: null });

    const location = {
      ...window.location,
      search: '?fakedata=true',
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location,
    });
    const urlParams = new URLSearchParams(window.location.search);
    const fakedataParam = urlParams.get('fakedata');
    expect(fakedataParam).toBe('true');

    renderWithRouter(<ResultsView protocolTheme={protocolTheme} toggleColorMode={toggleColorMode} />);
   

    const expandButtons = screen.queryAllByTestId('expand-revision-button');
    await user.click(expandButtons[0]);
    const expandedContent = await waitFor(() => screen.queryAllByTestId('expanded-row-content'));
    expect(expandedContent[0]).toBeVisible();

  });
});
