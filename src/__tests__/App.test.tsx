import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import App from '../components/App';
import { render } from './utils/setupTests';
import { screen } from './utils/test-utils';

describe('App', () => {
  test('should render search view on default route', async () => {
    render(<App />);
    await act(async () => void jest.runOnlyPendingTimers());

    expect(
      screen.getByLabelText('Search By Revision ID or Author Email'),
    ).toBeInTheDocument();
  });

  test('should switch between dark mode and light mode on toggle', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<App />);

    const darkModeButton = screen.getByRole('button', {
      name: 'toggle-dark-mode',
    });

    await user.click(darkModeButton);
    expect(screen.queryByTestId('Brightness7Icon')).toBeInTheDocument();

    await user.click(darkModeButton);
    expect(screen.queryByTestId('Brightness4Icon')).toBeInTheDocument();
  });

  test('clicking on the info icon should display an alert', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<App />);

    const infoButton = screen.getByRole('button', {
      name: 'info-button',
    });

    expect(() => screen.getByTestId('feedback-alert')).toThrow('Unable to find an element');

    await user.click(infoButton);

    expect(screen.getByText('This is an unstable pre-release version. Some features may not yet be supported. Please file any bugs on the Github Repo.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'close' }));

    expect(() => screen.getByTestId('feedback-alert')).toThrow('Unable to find an element');
  });
});
