import userEvent from '@testing-library/user-event';

import { maxRevisionsError } from '../common/constants';
import App from '../components/App';
import SearchView from '../components/Search/SearchView';
import { Strings } from '../resources/Strings';
import useProtocolTheme from '../theme/protocolTheme';
import getTestData from './utils/fixtures';
import {
  screen,
  act,
  renderHook,
  renderWithRouter,
  render,
  waitForElementToBeRemoved,
  FetchMockSandbox,
} from './utils/test-utils';

describe('Snackbar', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;

  beforeEach(() => {
    const { testData } = getTestData();
    (global.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/project/try/push/',
      {
        results: testData,
      },
    );
  });

  it('should dismiss an alert when close button is clicked', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<App />);

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await user.click((await screen.findAllByTestId('checkbox-0'))[0]);
    await user.click(screen.getAllByTestId('checkbox-1')[0]);

    const alert = screen.getByText(maxRevisionsError);

    const closeButton = screen.getByTestId('alert-close');
    await user.click(closeButton);

    await waitForElementToBeRemoved(closeButton);
    expect(alert).not.toBeInTheDocument();
  });

  it('should have aria-live attribute', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<App />);

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await user.click((await screen.findAllByTestId('checkbox-0'))[0]);
    await user.click(screen.getAllByTestId('checkbox-1')[0]);

    const alert = screen.getAllByRole('alert')[0];
    expect(alert).toHaveAttribute('aria-live');
  });

  it('should dismiss an alert after 6 seconds', async () => {
    jest.spyOn(global, 'setTimeout');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(
      <SearchView
        toggleColorMode={toggleColorMode}
        protocolTheme={protocolTheme}
        title={Strings.metaData.pageTitle.search}
      />,
    );

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await user.click((await screen.findAllByTestId('checkbox-0'))[0]);
    await user.click(screen.getAllByTestId('checkbox-1')[0]);

    const alert = screen.getByText(maxRevisionsError);

    const closeButton = screen.getByTestId('alert-close');

    act(() => {
      jest.advanceTimersByTime(6000);
    });
    expect(setTimeout).toHaveBeenCalled();

    await waitForElementToBeRemoved(closeButton);
    expect(alert).not.toBeInTheDocument();
  });
});
