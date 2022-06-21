import userEvent from '@testing-library/user-event';

import App from '../components/App';
import { render } from './utils/setupTests';
import { screen } from './utils/test-utils';

describe('App', () => {
  test('Should render search view on default route', () => {
    render(<App />);

    expect(
      screen.getByLabelText('Search By Revision ID or Author Email'),
    ).toBeInTheDocument();
  });

  test('Should switch between dark mode and light mode on toggle', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<App />);

    const darkModeButton = screen.getByRole('button', {
      name: 'toggle-dark-mode',
    });

    await user.click(darkModeButton);
    jest.runOnlyPendingTimers();
    expect(screen.queryByTestId('Brightness7Icon')).toBeInTheDocument();

    await user.click(darkModeButton);
    jest.runOnlyPendingTimers();
    expect(screen.queryByTestId('Brightness4Icon')).toBeInTheDocument();
  });
});
