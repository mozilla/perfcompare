import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import CompareResultsTable from '../../components/CompareResults/CompareResultsTable';
import {
  addFilter,
  applyFilters,
  removeFilter,
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
    let platformOptionsList = screen.queryByTestId('platform-options');

    expect(platformOptionsList).toBeNull();

    const platformFilter = screen.getByTestId('platform-options-button');
    const user = userEvent.setup({ delay: null });

    await user.click(platformFilter);

    platformOptionsList = screen.getByTestId('platform-options');

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

    filteredRows.forEach((row) =>
      expect(row.firstChild).toHaveAttribute(
        'aria-label',
        'macosx1015-64-shippable-qr',
      ),
    );
  });

  it('Should remove platform macosx1015-64-shippable-qr from filter', async () => {
    render(<CompareResultsTable mode="light" />);

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

    expect(
      store.getState().filterCompareResults.activeFilters.platform,
    ).toStrictEqual(['macosx1015-64-shippable-qr']);

    act(() => {
      store.dispatch(applyFilters(activeFilter));
    });

    act(() => {
      store.dispatch(
        removeFilter({ name: 'platform', value: 'macosx1015-64-shippable-qr' }),
      );
    });

    act(() => {
      store.dispatch(applyFilters(activeFilter));
    });

    expect(
      store.getState().filterCompareResults.activeFilters.platform,
    ).toStrictEqual([]);
  });
});
