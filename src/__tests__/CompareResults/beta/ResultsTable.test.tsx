import userEvent from '@testing-library/user-event';
import { Bubble } from 'react-chartjs-2';

import ResultsTable from '../../../components/CompareResults/beta/ResultsTable';
import useProtocolTheme from '../../../theme/protocolTheme';
import { renderWithRouter } from '../../utils/setupTests';
import { renderHook, screen, waitFor } from '../../utils/test-utils';

describe('Results Table', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const themeMode = protocolTheme.palette.mode;

  it('Should match snapshot', () => {
    renderWithRouter(<ResultsTable themeMode={themeMode} />);

    expect(screen.getByTestId('results-table')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('Should expand on click', async () => {
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<ResultsTable themeMode={themeMode} />);

    const expandButtons = screen.getAllByTestId('expand-revision-button');
    await user.click(expandButtons[0]);
    const expandedContent = await waitFor(() =>
      screen.getAllByTestId('expanded-row-content'),
    );
    expect(expandedContent[0]).toBeVisible();
    const bubbleProps = Bubble.mock.calls.map((call) => call[0]);
    expect(bubbleProps[0].data.datasets[0].label).toBe('Base');
    expect(bubbleProps[1].data.datasets[0].label).toBe('New');
  });
});
