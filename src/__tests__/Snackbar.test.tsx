import { renderHook } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import { maxRevisionsError } from '../common/constants';
import App from '../components/App';
import SearchView from '../components/Search/SearchView';
import { Strings } from '../resources/Strings';
import useProtocolTheme from '../theme/protocolTheme';
import getTestData from './utils/fixtures';
import { renderWithRouter, render } from './utils/setupTests';
import { screen } from './utils/test-utils';

describe('Snackbar', () => {
  const protocolTheme = renderHook(() => useProtocolTheme()).result.current
    .protocolTheme;
  const toggleColorMode = renderHook(() => useProtocolTheme()).result.current
    .toggleColorMode;
  it('should dismiss an alert when close button is clicked', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<App />);

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await user.click(screen.getAllByTestId('checkbox-0')[0]);
    await user.click(screen.getAllByTestId('checkbox-1')[0]);

    const alert = screen.getByText(maxRevisionsError);

    const closeButton = screen.getByTestId('alert-close');
    await user.click(closeButton);

    await waitForElementToBeRemoved(closeButton);
    expect(alert).not.toBeInTheDocument();
  });

  it('should have aria-live attribute', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    render(<App />);

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await user.click(screen.getAllByTestId('checkbox-0')[0]);
    await user.click(screen.getAllByTestId('checkbox-1')[0]);

    const alert = screen.getAllByRole('alert')[0];
    expect(alert).toHaveAttribute('aria-live');
  });

  it('should dismiss an alert after 6 seconds', async () => {
    const { testData } = getTestData();
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => ({
          results: testData,
        }),
      }),
    ) as jest.Mock;
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

    await user.click(screen.getAllByTestId('checkbox-0')[0]);
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
