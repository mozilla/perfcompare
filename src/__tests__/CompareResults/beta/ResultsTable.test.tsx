import ResultsTable from '../../../components/CompareResults/beta/ResultsTable';
import useProtocolTheme from '../../../theme/protocolTheme';
import { renderWithRouter } from '../../utils/setupTests';
import { renderHook, screen } from '../../utils/test-utils';

describe('Results Table', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
  .protocolTheme;
  const themeMode = protocolTheme.palette.mode;

  it('Should match snapshot', () => {
    renderWithRouter(<ResultsTable themeMode={themeMode} />);

    expect(screen.getByTestId('results-table')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});