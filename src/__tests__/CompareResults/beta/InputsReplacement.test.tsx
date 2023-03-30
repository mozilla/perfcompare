import InputsReplacement from '../../../components/CompareResults/beta/InputsReplacement';
import { renderWithRouter } from '../../utils/setupTests';
import { screen } from '../../utils/test-utils';

describe('Inputs replacement', () => {
  it('Should match snapshot', () => {
    renderWithRouter(<InputsReplacement />);

    expect(screen.getByTestId('inputs-replacement')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();
  });
});
