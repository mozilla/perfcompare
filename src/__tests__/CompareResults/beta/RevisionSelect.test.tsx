import RevisionSelect from '../../../components/CompareResults/beta/RevisionSelect';
import { renderWithRouter } from '../../utils/setupTests';
import { screen } from '../../utils/test-utils';

describe('Revision select', () => {
  it('Should match snapshot', () => {
    renderWithRouter(<RevisionSelect />);

    expect(screen.getByTestId('revision-select')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
