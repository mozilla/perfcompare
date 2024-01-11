import TableHeader from '../../components/CompareResults/TableHeader';
import { renderWithRouter, screen } from '../utils/test-utils';

describe('Table Header', () => {
  it('Should match snapshot', () => {
    renderWithRouter(<TableHeader />);

    expect(screen.getByTestId('table-header')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
