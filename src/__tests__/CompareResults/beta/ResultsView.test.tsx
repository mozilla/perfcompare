import ResultsView from '../../../components/CompareResults/beta/ResultsView';
import useProtocolTheme from '../../../theme/protocolTheme';
import { renderWithRouter } from '../../utils/setupTests';
import { renderHook, screen } from '../../utils/test-utils';

describe('Results View', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
    const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;  

  it('Should match snapshot', () => {
    renderWithRouter(<ResultsView protocolTheme={protocolTheme} toggleColorMode={toggleColorMode}/>);

    expect(screen.getByTestId('beta-version-compare-results')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
