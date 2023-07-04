import userEvent from '@testing-library/user-event';
import { Bubble, ChartProps } from 'react-chartjs-2';

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

    const expandButtons = screen.getAllByTestId('expand-revision-button');
    await user.click(expandButtons[0]);
    const expandedContent = await waitFor(() =>
      screen.getAllByTestId('expanded-row-content'),
    );

    expect(expandedContent[0]).toBeVisible();
  });

  it('Should display Base graph and New graph', async () => {
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

    const expandButtons = screen.getAllByTestId('expand-revision-button');
    await user.click(expandButtons[0]);
    await waitFor(() => screen.getAllByTestId('expanded-row-content'));

    const MockedBubble = Bubble as jest.Mock;

    const bubbleProps = MockedBubble.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    expect(bubbleProps[0].data.datasets[0].label).toBe('Base');
    expect(bubbleProps[1].data.datasets[0].label).toBe('New');
  });

  it('Should display tooltip for single graph distrbution', async () => {
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

    const expandButtons = screen.getAllByTestId('expand-revision-button');
    await user.click(expandButtons[0]);

    const MockedBubble = Bubble as jest.Mock;
    const bubbleProps = MockedBubble.mock.calls.map(
      (call) => call[0] as ChartProps,
    );
    const labelFunction =
      bubbleProps[0].options?.plugins?.tooltip?.callbacks?.label;
    if (!labelFunction) {
      // eslint-disable-next-line @typescript-eslint/no-throw-literal
      throw Error;
    }

    // @ts-expect-error does not affect the test coverage
    // consider fixing it if we change the label function in the future
    const labelResult = labelFunction({ raw: { x: 5, y: 0, r: 10 } });
    expect(labelResult).toBe('5 ms');
  });

});
