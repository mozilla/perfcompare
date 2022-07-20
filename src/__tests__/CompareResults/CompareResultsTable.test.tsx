import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import CompareResultsTable from '../../components/CompareResults/CompareResultsTable';
import {
  addFilter, applyFilters,
} from '../../reducers/FilterCompareResultsSlice';
import { render, store } from '../utils/setupTests';
import { screen } from '../utils/test-utils';

describe('Compare Results Table', () => {
  it('Should match snapshot', () => {
    render(<CompareResultsTable mode="light" />);

    expect(document.body).toMatchSnapshot();
  });

  it('Should open platform options', async () => {
    render(<CompareResultsTable mode="light" />);
    const platformFilter = screen.getByTestId('platform-options-button');
    const user = userEvent.setup({ delay: null });

    await user.click(platformFilter);

    const platformOptionsList = screen.getByTestId('platform-options');
    expect(platformOptionsList).toBeInTheDocument();
  });

  it('Should filter data by platform', async () => {
    const { rerender } = render(<CompareResultsTable mode="light" />);
    const rows = screen.getAllByTestId('table-row');

    expect(rows).not.toBeNull();

    const activeFilter = {
      platform: ['macosx1015-64-shippable-qr'],
      test: [],
      confidence: [],
    };

    act(() => {
      store.dispatch(
        addFilter({ name: 'platform', value: 'macosx1015-64-shippable-qr' }),
      );
    });

    act(() => {
      store.dispatch(applyFilters(activeFilter));
    });

    act(() => {
      rerender(<CompareResultsTable mode="light" />);
    });

    const filteredRows = screen.getAllByTestId('table-row');
    
    filteredRows.forEach(row => expect(row.firstChild).toHaveAttribute('aria-label', 'macosx1015-64-shippable-qr'));
  });
});
