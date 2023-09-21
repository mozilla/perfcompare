import ResultsView from '../../components/CompareResults/ResultsView';
import { Strings } from '../../resources/Strings';
import useProtocolTheme from '../../theme/protocolTheme';
import { renderWithRouter } from '../utils/setupTests';
import { renderHook, screen } from '../utils/test-utils';

describe('Search by title/test name', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;

  it('Should match snapshot', () => {
    renderWithRouter(
      <ResultsView
        protocolTheme={protocolTheme}
        toggleColorMode={toggleColorMode}
        title={Strings.metaData.pageTitle.results}
      />,
    );

    expect(screen.getByTestId('search-by-title-test-name')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
