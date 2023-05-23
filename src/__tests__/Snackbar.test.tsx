import { renderHook } from '@testing-library/react';
import { waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import { maxRevisionsError } from '../common/constants';
import App from '../components/App';
import SearchView from '../components/Search/beta/SearchView';
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

  it('should render feedback alert', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);
    const infoButton = screen.getAllByTestId('InfoOutlinedIcon')[0];
    await user.click(infoButton);
    const feedbackAlert = screen.getByTestId('feedback-alert');
    expect(feedbackAlert).toBeInTheDocument();
  });

  it('should close feedback alert on clicking the close button', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);
    const infoButton = screen.getAllByTestId('InfoOutlinedIcon')[0];
    await user.click(infoButton);
    const feedbackAlert = screen.getByTestId('feedback-alert');
    expect(feedbackAlert).toBeVisible();
    const closeButton = feedbackAlert.querySelector('button');
    await user.click(closeButton as Element);
    expect(feedbackAlert).not.toBeVisible();
  });

  it('should not close feedback alert on blur', async () => {
    const user = userEvent.setup({ delay: null });
    render(<App />);
    const infoButton = screen.getAllByTestId('InfoOutlinedIcon')[0];
    await user.click(infoButton);
    const feedbackAlert = screen.getByTestId('feedback-alert');
    expect(feedbackAlert).toBeVisible();
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);
    expect(feedbackAlert).toBeVisible();
  });

  it('should dismiss feedback alert after 10 seconds', async () => {
    jest.spyOn(global, 'setTimeout');
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    render(<App />);
    const infoButton = screen.getAllByTestId('InfoOutlinedIcon')[0];
    await user.click(infoButton);
    const feedbackAlert = screen.getByTestId('feedback-alert');
    expect(feedbackAlert).toBeVisible();
    act(() => {
      jest.advanceTimersByTime(10000);
    });
    expect(feedbackAlert).not.toBeVisible();
  });
});
