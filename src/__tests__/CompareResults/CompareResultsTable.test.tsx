import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';

import CompareResultsTable from '../../components/CompareResults/CompareResultsTable';
import SearchView from '../../components/Search/SearchView';
import { setCompareResults } from '../../reducers/CompareResultsSlice';
import {
  addFilter,
  setFilteredResults,
  removeFilter,
} from '../../reducers/FilterCompareResultsSlice';
import { setSelectedRevisions } from '../../reducers/SelectedRevisions';
import { ActiveFilters, FilteredResults } from '../../types/types';
import getTestData from '../utils/fixtures';
import { render, renderWithRouter, store } from '../utils/setupTests';
import { screen, waitFor } from '../utils/test-utils';

const { testCompareData, paginationTestCompareData } = getTestData();

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

    const user = userEvent.setup({ delay: null });

    await user.click(screen.getByTestId('platform-options-button'));

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

  it("Should filter data by confidence 'not available'", async () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    const { rerender } = render(<CompareResultsTable mode="light" />);
    const rows = screen.getAllByTestId('table-row');

    expect(rows).not.toBeNull();

    act(() => {
      store.dispatch(addFilter({ name: 'confidence', value: 'not available' }));
    });

    const activeFilters: ActiveFilters = {
      platform: [],
      test: [],
      confidence: ['not available'],
    };
    const filteredResults: FilteredResults = {
      data: [testCompareData[3]],
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
      expect(row.childNodes[7].firstChild).toHaveAttribute(
        'aria-label',
        'Confidence not available',
      ),
    );
  });

  it("Should check confidence 'not available'", async () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    render(<CompareResultsTable mode="light" />);
    const user = userEvent.setup({ delay: null });

    await user.click(screen.getByTestId('confidence-options-button'));

    const option = await waitFor(() =>
      screen.getByTestId('not available-checkbox'),
    );

    expect(option).not.toBeNull();

    await user.click(option);

    expect(
      screen
        .getByTestId('not available-checkbox')
        .classList.contains('Mui-checked'),
    ).toBe(true);
  });

  it("Should filter data on 'apply' button", async () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    render(<CompareResultsTable mode="light" />);
    const user = userEvent.setup({ delay: null });

    await user.click(screen.getByTestId('confidence-options-button'));
    await user.click(screen.getByTestId('not available-checkbox'));
    await user.click(screen.getAllByTestId('apply-filter')[0]);

    const filteredRows = screen.getAllByTestId('table-row');

    filteredRows.forEach((row) =>
      expect(row.childNodes[7].firstChild).toHaveAttribute(
        'aria-label',
        'Confidence not available',
      ),
    );
  });

  it("Should uncheck confidence 'not available'", async () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    render(<CompareResultsTable mode="light" />);
    const user = userEvent.setup({ delay: null });

    await user.click(screen.getByTestId('confidence-options-button'));
    await user.click(screen.getByTestId('not available-checkbox'));
    await user.click(screen.getByTestId('not available-checkbox'));

    expect(
      screen
        .getByTestId('not available-checkbox')
        .classList.contains('Mui-checked'),
    ).toBe(false);
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

  it('Should display success message for filtering data.', () => {
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

  it("Should reset filter when 'clear' button is clicked", async () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    render(<CompareResultsTable mode="light" />);
    const user = userEvent.setup({ delay: null });

    const rows = await waitFor(() => screen.getAllByTestId('table-row'));

    expect(rows.length).toBe(4);

    await user.click(screen.getByTestId('platform-options-button'));
    await user.click(screen.getByTestId('macosx1015-64-shippable-qr-checkbox'));
    await user.click(screen.getAllByTestId('apply-filter')[0]);

    let filteredRows = await waitFor(() => screen.getAllByTestId('table-row'));

    expect(filteredRows.length).toBe(1);

    await user.click(screen.getByTestId('clear-filter'));

    filteredRows = await waitFor(() => screen.getAllByTestId('table-row'));

    expect(filteredRows.length).toEqual(rows.length);
    expect(
      store.getState().filterCompareResults.activeFilters.platform,
    ).toStrictEqual([]);
  });

  it('Should reset filter when new data is compared', async () => {
    // set results data
    store.dispatch(setCompareResults(testCompareData));

    const activeFilters = {
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
    const { testData } = getTestData();

    act(() => {
      store.dispatch(setSelectedRevisions(testData.slice(0, 2)));
    });

    const { history } = renderWithRouter(<SearchView />);
    expect(history.location.pathname).toEqual('/');

    const user = userEvent.setup({ delay: null });

    const compareButton = document.querySelector('.compare-button');
    await user.click(compareButton as HTMLElement);

    expect(history.location.pathname).toEqual('/compare-results');
    expect(
      store.getState().filterCompareResults.activeFilters.platform,
    ).toStrictEqual([]);
    expect(store.getState().filterCompareResults.isFiltered).toStrictEqual(
      false,
    );
  });

  it('Should close filter popper', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // set compare data
    store.dispatch(setCompareResults(testCompareData));

    render(<CompareResultsTable mode="light" />);

    const filterButton = screen.getByTestId('platform-options-button');
    await user.click(filterButton);
    let popper = await waitFor(() => screen.getByRole('tooltip'));
    expect(popper).toBeVisible();

    const windowsCheckbox = await waitFor(() => screen.getByRole('checkbox', {
      name: 'windows10-64-shippable-qr',
    }));
    expect(windowsCheckbox).toBeInTheDocument();

    await user.click(windowsCheckbox);
    
    const applyButtons = await waitFor(() => screen.getAllByRole('button', { name: 'Apply' }));
    
    await user.click(applyButtons[1]);

    popper = await waitFor(() => screen.getByRole('tooltip'));
    
    expect(popper).toHaveAttribute('style', '');
  });

  it('Should close filter popper by clicking outside of it', async () => {
    // set delay to null to prevent test time-out due to useFakeTimers
    const user = userEvent.setup({ delay: null });

    // set compare data
    store.dispatch(setCompareResults(testCompareData));

    render(<CompareResultsTable mode="light" />);

    const filterButtonPlatform = await waitFor(() => screen.getByTestId('platform-options-button'));
    await user.click(filterButtonPlatform);

    const filterPlatfomList = screen.getByTestId('platform-options');
    let popper = await waitFor(() => screen.getByRole('tooltip'));
    expect(popper).toContainElement(filterPlatfomList);

    const filterButtonConfidence = await waitFor(() => screen.getByTestId('confidence-options-button'));
    expect(filterButtonConfidence).toBeInTheDocument();

    await user.click(filterButtonConfidence);

    const filterConfidenceList = await waitFor(() => screen.getByTestId('confidence-options'));

    popper = await waitFor(() => screen.getByRole('tooltip'));

    expect(popper).toContainElement(filterConfidenceList);
  });

  it('should reset to first table page when filtering is changed', async () => {
    // set results data
    store.dispatch(setCompareResults(paginationTestCompareData));

    const activeFilters: ActiveFilters = {
      platform: ['macosx1015-64-shippable-qr'],
      test: [],
      confidence: [],
    };

    const filteredResults: FilteredResults = {
      data: [...paginationTestCompareData.slice(1, 33)],
      activeFilters,
      isFiltered: true,
    };

    act(() => {
      store.dispatch(setFilteredResults(filteredResults));
    });

    render(<CompareResultsTable mode="light" />);

    let firstPageButton = await waitFor(() =>
      screen.getByLabelText('first page'),
    );

    expect(firstPageButton).toHaveAttribute('disabled');

    const user = userEvent.setup({ delay: null });

    // goes to second page
    await user.click(screen.getByLabelText('next page'));

    firstPageButton = await waitFor(() => screen.getByLabelText('first page'));

    expect(firstPageButton).not.toHaveAttribute('disabled');

    act(() => {
      store.dispatch(
        addFilter({ name: 'test', value: 'content-process-startup' }),
      );
    });

    firstPageButton = await waitFor(() => screen.getByLabelText('first page'));

    expect(firstPageButton).toHaveAttribute('disabled');
  });
});
