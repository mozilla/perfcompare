import userEvent from '@testing-library/user-event';

import FrameworkDropdown from '../components/CompareResults/FrameworkDropdown';
import { setSelectedRevisions } from '../reducers/SelectedRevisions';
import getTestData from './utils/fixtures';
import { render, store } from './utils/setupTests';
import { screen, waitFor } from './utils/test-utils';

describe('FrameworkDropdown', () => {
  it('should update framework when clicked', async () => {
    const { testData } = getTestData();
    const user = userEvent.setup({ delay: null });

    // start with two selected revisions
    const selectedRevisions = testData.slice(0, 2);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    render(<FrameworkDropdown />);

    await user.click(screen.getByRole('button', { name: 'talos' }));

    const awsyFramework = screen.getByRole('option', { name: 'awsy' });
    const fxrecordFramework = screen.getByRole('option', { name: 'fxrecord' });
    expect(awsyFramework).toBeInTheDocument();

    await user.click(awsyFramework);

    await waitFor(() => expect(fxrecordFramework).not.toBeInTheDocument());

    expect(store.getState().compareResults.framework).toStrictEqual({
      id: 4,
      name: 'awsy',
    });
  });

  it('should display an error if selectedRevisions is undefined', async () => {
    const user = userEvent.setup({ delay: null });

    render(<FrameworkDropdown />);

    await user.click(screen.getByRole('button', { name: 'talos' }));

    const awsyFramework = screen.getByRole('option', { name: 'awsy' });
    const fxrecordFramework = screen.getByRole('option', { name: 'fxrecord' });
    expect(awsyFramework).toBeInTheDocument();

    await user.click(awsyFramework);

    await waitFor(() => expect(fxrecordFramework).not.toBeInTheDocument());

    expect(screen.getByText('An error has occurred')).toBeInTheDocument();
  });

  it('should call setErrorMessage if fetch call returns an error', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('An error has occurred')),
    ) as jest.Mock;
    const user = userEvent.setup({ delay: null });
    const { testData } = getTestData();

    // start with two selected revisions
    const selectedRevisions = testData.slice(0, 2);
    store.dispatch(setSelectedRevisions(selectedRevisions));

    render(<FrameworkDropdown />);

    await user.click(screen.getByRole('button', { name: 'talos' }));

    const awsyFramework = screen.getByRole('option', { name: 'awsy' });
    const fxrecordFramework = screen.getByRole('option', { name: 'fxrecord' });
    expect(awsyFramework).toBeInTheDocument();

    await user.click(awsyFramework);

    await waitFor(() => expect(fxrecordFramework).not.toBeInTheDocument());

    expect(store.getState().compareResults.error).toStrictEqual(
      'An error has occurred',
    );
  });
});
