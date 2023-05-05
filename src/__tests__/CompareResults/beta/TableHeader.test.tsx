import TableHeader from '../../../components/CompareResults/beta/TableHeader';
import useProtocolTheme from '../../../theme/protocolTheme';
import { renderWithRouter } from '../../utils/setupTests';
import { renderHook, screen } from '../../utils/test-utils';

describe('Table Header', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const themeMode = protocolTheme.palette.mode;

  it('Should match snapshot', () => {
    renderWithRouter(<TableHeader themeMode={themeMode} />);

    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
