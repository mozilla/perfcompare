import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import App from '../components/App';
import { render } from './utils/setupTests';
import { screen, FetchMockSandbox } from './utils/test-utils';

describe('App', () => {
  beforeEach(() => {
    (global.fetch as FetchMockSandbox).get(
      'glob:https://treeherder.mozilla.org/api/project/*/push/*',
      { results: [] },
    );
  });

  test('Should render search view on default route', async () => {
    render(<App />);

    // Title appears
    expect(screen.getByText(/PerfCompare/i)).toBeInTheDocument();

    act(() => void jest.runAllTimers());
    const homeText = screen.getByText('Compare with a base or over time');
    expect(homeText).toBeInTheDocument();
  });

  test('Should switch between dark mode and light mode on toggle', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<App />);

    const darkModeButton = screen.getByLabelText('Dark mode');

    await user.click(darkModeButton);
    expect(screen.getByLabelText('Light mode')).toBeInTheDocument();

    await user.click(darkModeButton);
    expect(screen.queryByLabelText('Light mode')).not.toBeInTheDocument();
  });
});
