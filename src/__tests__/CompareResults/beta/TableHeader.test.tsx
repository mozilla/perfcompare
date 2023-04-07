import TableHeader from '../../../components/CompareResults/beta/TableHeader';
import { renderWithRouter } from '../../utils/setupTests';
import { screen } from '../../utils/test-utils';

describe('Table Header', () => {
  it('Should match snapshot', () => {
    renderWithRouter(<TableHeader />);

    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});