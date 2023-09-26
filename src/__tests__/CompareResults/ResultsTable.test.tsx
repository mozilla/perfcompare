import type { ReactElement } from 'react';

import ResultsTable from '../../components/CompareResults/ResultsTable';
import useProtocolTheme from '../../theme/protocolTheme';
import { renderWithRouter } from '../utils/setupTests';
import { renderHook, screen } from '../utils/test-utils';

function renderWithRoute(component: ReactElement) {
  return renderWithRouter(component, {
    route: '/compare-results/?fakedata=true',
  });
}

describe('Results Table', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const themeMode = protocolTheme.palette.mode;

  it('Should match snapshot', () => {
    renderWithRoute(<ResultsTable themeMode={themeMode} />);

    expect(screen.getByTestId('results-table')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });

  it('Display message for not finding results', () => {
    renderWithRoute(<ResultsTable themeMode={themeMode} />);

    expect(screen.getByText(/No results found/)).toBeInTheDocument();
  });
});
