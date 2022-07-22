import { useEffect } from 'react';

import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { useSnackbar } from 'notistack';

import { maxRevisionsError } from '../common/constants';
import SearchView from '../components/Search/SearchView';
import SnackbarCloseButton from '../components/Shared/SnackbarCloseButton';
import getTestData from './utils/fixtures';
import { render, renderWithRouter } from './utils/setupTests';
import { screen, waitFor, waitForElementToBeRemoved } from './utils/test-utils';

describe('Snackbar', () => {
  it('should dismiss an alert when close button is clicked', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    const MockComponent = jest.fn();
    MockComponent.mockImplementation(() => {
      const { enqueueSnackbar } = useSnackbar();
      useEffect(() => {
        enqueueSnackbar('She turned me into a newt!');
      });
      return null;
    });

    render(
      <SnackbarProvider
        action={(snackbarKey) => (
          <SnackbarCloseButton snackbarKey={snackbarKey} />
        )}
      >
        <MockComponent />
      </SnackbarProvider>,
    );

    expect(screen.getByText('She turned me into a newt!')).toBeInTheDocument();
    const closeButton = screen.getByTestId('alert-close');
    await user.click(closeButton);

    await waitForElementToBeRemoved(closeButton);

    expect(
      screen.queryByText('She turned me into a newt!'),
    ).not.toBeInTheDocument();
  });

  it('should dismiss an alert after 6 seconds', async () => {
    jest.spyOn(global, 'setTimeout');
    const MockComponent = jest.fn();
    MockComponent.mockImplementation(() => {
      const { enqueueSnackbar } = useSnackbar();
      useEffect(() => {
        enqueueSnackbar('She turned me into a newt!');
      });
      return null;
    });

    render(
      <SnackbarProvider
        autoHideDuration={500}
        action={(snackbarKey) => (
          <SnackbarCloseButton snackbarKey={snackbarKey} />
        )}
      >
        <MockComponent />
      </SnackbarProvider>,
    );

    const alert = screen.getByText('She turned me into a newt!');
    expect(alert).toBeInTheDocument();
    expect(setTimeout).toHaveBeenCalled();

    await waitFor(() => expect(alert).not.toBeInTheDocument(), {
      timeout: 3000,
    });
    expect(
      screen.queryByText('She turned me into a newt!'),
    ).not.toBeInTheDocument();
  });

  it('should call enqueueSnackbar when an alert is raised', async () => {
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

    renderWithRouter(<SearchView />);

    // focus input to show results
    const searchInput = screen.getByRole('textbox');
    await user.click(searchInput);

    await user.click(screen.getByTestId('checkbox-0'));
    await user.click(screen.getByTestId('checkbox-1'));
    await user.click(screen.getByTestId('checkbox-2'));
    await user.click(screen.getByTestId('checkbox-3'));
    await user.click(screen.getByTestId('checkbox-4'));

    expect(screen.getByText(maxRevisionsError)).toBeInTheDocument();
  });
});
