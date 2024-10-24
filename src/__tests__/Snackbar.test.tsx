import userEvent from '@testing-library/user-event';

import App from '../components/App';
import { loader } from '../components/Search/loader';
import SearchView from '../components/Search/SearchView';
import { Strings } from '../resources/Strings';
import getTestData from './utils/fixtures';
import {
  screen,
  act,
  renderWithRouter,
  render,
  waitForElementToBeRemoved,
  FetchMockSandbox,
} from './utils/test-utils';

describe('Snackbar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    const { testData } = getTestData();
    (global.fetch as FetchMockSandbox).get(
      'begin:https://treeherder.mozilla.org/api/project/try/push/',
      {
        results: testData,
      },
    );
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should dismiss an alert when close button is clicked', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers

    const user = userEvent.setup({ delay: null });

    render(<App />);

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[1];
    await user.click(searchInput);

    await user.click(await screen.findByTestId('checkbox-0'));
    await user.click(screen.getByTestId('checkbox-1'));
    await user.click(screen.getByTestId('checkbox-2'));
    await user.click(screen.getByTestId('checkbox-3'));

    const alert = screen.getByText('Maximum 3 revisions.');

    const closeButton = screen.getByTestId('alert-close');
    await user.click(closeButton);

    await waitForElementToBeRemoved(closeButton);
    expect(alert).not.toBeInTheDocument();
  });

  it('should have aria-live attribute', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    jest.setTimeout(60000);

    const user = userEvent.setup({ delay: null });

    render(<App />);

    // focus input to show results
    const searchInput = screen.getAllByRole('textbox')[0];
    await user.click(searchInput);

    await user.click((await screen.findAllByTestId('checkbox-0'))[0]);
    await user.click(screen.getAllByTestId('checkbox-1')[0]);

    const alert = await screen.findAllByRole('alert');
    expect(alert[0]).toHaveAttribute('aria-live');
  });

  it('should dismiss an alert after 6 seconds', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    renderWithRouter(<SearchView title={Strings.metaData.pageTitle.search} />, {
      loader,
    });

    // focus input to show results
    const searchInput = (await screen.findAllByRole('textbox'))[1];
    await user.click(searchInput);

    await user.click(await screen.findByTestId('checkbox-0'));
    await user.click(screen.getByTestId('checkbox-1'));
    await user.click(screen.getByTestId('checkbox-2'));
    await user.click(screen.getByTestId('checkbox-3'));

    const alert = screen.getByText('Maximum 3 revisions.');

    const closeButton = screen.getByTestId('alert-close');

    act(() => {
      jest.advanceTimersByTime(6000);
    });

    await waitForElementToBeRemoved(closeButton);
    expect(alert).not.toBeInTheDocument();
  });
});
