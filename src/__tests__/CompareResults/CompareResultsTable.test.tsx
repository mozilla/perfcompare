import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import CompareResultsTable from '../../components/CompareResults/CompareResultsTable';
import { setCompareResults } from '../../reducers/CompareResultsSlice';
import {
  addFilter,
  setFilteredResults,
  removeFilter,
} from '../../reducers/FilterCompareResultsSlice';
import { ActiveFilters, FilteredResults } from '../../types/types';
import getTestData from '../utils/fixtures';
import { render, store } from '../utils/setupTests';
import { screen, waitFor } from '../utils/test-utils';

const { testCompareData } = getTestData();

describe('Compare Results Table', () => {
  it('Should match snapshot', () => {
    render(<CompareResultsTable mode="light" />);

    expect(document.body).toMatchSnapshot();
  });

  it('Should not display platform options list by default', () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    render(<CompareResultsTable mode="light" />);

    const platformOptionsList = screen.queryByTestId('platform-options');

    expect(platformOptionsList).toBeNull();
  });

  it('Should open platform options', async () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    render(<CompareResultsTable mode="light" />);

    const platformFilter = await waitFor(() =>
      screen.getByTestId('platform-options-button'),
    );
    const user = userEvent.setup({ delay: null });

    await user.click(platformFilter);

    const platformOptionsList = screen.getByTestId('platform-options');

    expect(platformOptionsList).toBeInTheDocument();
  });

  it('Should filter data by platform', async () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    const { rerender } = render(<CompareResultsTable mode="light" />);
    const rows = screen.getAllByTestId('table-row');

    expect(rows).not.toBeNull();

    act(() => {
      store.dispatch(
        addFilter({ name: 'platform', value: 'macosx1015-64-shippable-qr' }),
      );
    });

    const activeFilters: ActiveFilters = {
      platform: ['macosx1015-64-shippable-qr'],
      test: [],
      confidence: [],
    };
    const filteredResults: FilteredResults = {
      data: [testCompareData[0]],
      activeFilters,
      isFiltered: true,
    };

    act(() => {
      store.dispatch(setFilteredResults(filteredResults));
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
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    render(<CompareResultsTable mode="light" />);

    act(() => {
      store.dispatch(
        addFilter({ name: 'platform', value: 'macosx1015-64-shippable-qr' }),
      );
    });

    expect(
      store.getState().filterCompareResults.activeFilters.platform,
    ).toStrictEqual(['macosx1015-64-shippable-qr']);

    const activeFilters = {
      platform: ['macosx1015-64-shippable-qr'],
      test: [],
      confidence: [],
    };

    let filteredResults: FilteredResults = {
      data: [testCompareData[0]],
      activeFilters,
      isFiltered: true,
    };

    act(() => {
      store.dispatch(setFilteredResults(filteredResults));
    });

    act(() => {
      store.dispatch(
        removeFilter({ name: 'platform', value: 'macosx1015-64-shippable-qr' }),
      );
    });

    filteredResults = {
      data: [],
      activeFilters,
      isFiltered: false,
    };

    act(() => {
      store.dispatch(setFilteredResults(filteredResults));
    });

    expect(
      store.getState().filterCompareResults.activeFilters.platform,
    ).toStrictEqual([]);
  });

  it('Should display succes message for filtering data.', () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    const { rerender } = render(<CompareResultsTable mode="light" />);

    const activeFilters: ActiveFilters = {
      platform: ['macosx1015-64-shippable-qr'],
      test: [],
      confidence: [],
    };
    const filteredResults: FilteredResults = {
      data: [testCompareData[0]],
      activeFilters,
      isFiltered: true,
    };

    act(() => {
      store.dispatch(setFilteredResults(filteredResults));
    });

    act(() => {
      rerender(<CompareResultsTable mode="light" />);
    });

    const message = screen.queryByText('Filters have been applied.');

    expect(message).toBeInTheDocument();
  });

  it('Should display no data message for filtering data.', () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    const { rerender } = render(<CompareResultsTable mode="light" />);

    const activeFilters: ActiveFilters = {
      platform: ['macosx1015-64-shippable-qr'],
      test: [],
      confidence: ['med'],
    };
    const filteredResults: FilteredResults = {
      data: [],
      activeFilters,
      isFiltered: true,
    };

    act(() => {
      store.dispatch(setFilteredResults(filteredResults));
    });

    act(() => {
      rerender(<CompareResultsTable mode="light" />);
    });

    const message = screen.queryByText('No data for this combination.');

    expect(message).toBeInTheDocument();
  });

  it('Should display changed options message for filtering data.', () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    const { rerender } = render(<CompareResultsTable mode="light" />);

    act(() => {
      store.dispatch(
        addFilter({ name: 'platform', value: 'macosx1015-64-shippable-qr' }),
      );
    });

    act(() => {
      rerender(<CompareResultsTable mode="light" />);
    });

    const message = screen.queryByText(
      'Filter options have changed. Apply the new changes.',
    );

    expect(message).toBeInTheDocument();
  });

  it('Should display active options chip.', () => {
    // set compare data
    store.dispatch(setCompareResults(testCompareData));

    const { rerender } = render(<CompareResultsTable mode="light" />);

    const activeFilters: ActiveFilters = {
      platform: ['macosx1015-64-shippable-qr'],
      test: [],
      confidence: [],
    };
    const filteredResults: FilteredResults = {
      data: [testCompareData[0]],
      activeFilters,
      isFiltered: true,
    };

    act(() => {
      store.dispatch(setFilteredResults(filteredResults));
    });

    act(() => {
      rerender(<CompareResultsTable mode="light" />);
    });

    const chip = screen.queryByLabelText('macosx1015-64-shippable-qr');

    expect(chip).toBeInTheDocument();
  });
});
