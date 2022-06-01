import userEvent from '@testing-library/user-event';

import PerfCompareHeader from '../components/Shared/PerfCompareHeader';
import { setAlert } from '../reducers/AlertSlice';
import type { AlertType } from '../types/state';
import { render, screen, store } from './utils/test-utils';

const message = 'Maximum 4 Revisions';
const severity: AlertType['severity'] = 'error';
let title;

describe('PerfCompareHeader', () => {
  it('renders correctly when there is no alert', () => {
    render(<PerfCompareHeader />);

    expect(document.body).toMatchSnapshot();
  });

  it('should hide alert when close button is clicked', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });
    title = undefined;

    store.dispatch(setAlert({ message, severity, title }));
    render(<PerfCompareHeader />);

    expect(screen.getByText('Maximum 4 Revisions')).toBeInTheDocument();
    expect(document.body).toMatchSnapshot();

    await user.click(screen.getByRole('button', { name: 'Close' }));
    expect(screen.queryByText('Maximum 4 Revisions')).not.toBeInTheDocument();
  });

  it('should should show alert title', async () => {
    title = 'This is a title';

    store.dispatch(setAlert({ message, severity, title }));
    render(<PerfCompareHeader />);

    expect(screen.getByText('This is a title')).toBeInTheDocument();

    expect(document.body).toMatchSnapshot();
  });
});
