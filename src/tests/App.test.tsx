import App from '../components/App';
import { render } from './utils/setupTests';
import { screen } from './utils/test-utils';

test('Should render search view on default route', () => {
  render(<App />);

  expect(
    screen.getByLabelText('Search By Revision ID or Author Email'),
  ).toBeInTheDocument();
});
