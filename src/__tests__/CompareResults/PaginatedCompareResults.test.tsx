import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CompareResultsTable from '../../components/CompareResults/CompareResultsTable';
import {
  TablePaginationActions,
  TablePaginationActionsProps,
} from '../../components/CompareResults/PaginatedCompareResults';
import { setCompareResults } from '../../reducers/CompareResultsSlice';
import { CompareResultsItem } from '../../types/state';
import getTestData from '../utils/fixtures';
import { render, store } from '../utils/setupTests';

describe('Tests PaginatedCompareResults', () => {
  const { testCompareData } = getTestData();
  const compareResults = Array(100)
    .fill(testCompareData)
    .flat()
    .map((result: CompareResultsItem, index) => ({
      ...result,
      header_name: result.header_name + String(index + 1),
    })) as CompareResultsItem[];
  let props: TablePaginationActionsProps & {
    onPageChange: ReturnType<typeof jest.fn>;
  };
  beforeEach(() => {
    props = {
      count: 60,
      page: 0,
      rowsPerPage: 20,
      onPageChange: jest.fn(),
    };
  });

  it('should render disabled first and previous buttons if page index is 0', () => {
    const { container } = render(<TablePaginationActions {...props} />);
    const backButton = container.querySelector("[aria-label='previous page']");
    const firstButton = container.querySelector("[aria-label='first page']");
    expect(backButton).toBeInTheDocument();
    expect(backButton).toBeDisabled();
    expect(firstButton).toBeInTheDocument();
    expect(firstButton).toBeDisabled();
  });

  it('should render disabled last and next buttons if showing the last page', () => {
    const { container } = render(
      <TablePaginationActions {...{ ...props, page: 2 }} />,
    );
    const nextButton = container.querySelector("[aria-label='next page']");
    const lastButton = container.querySelector("[aria-label='last page']");
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).toBeDisabled();
    expect(lastButton).toBeInTheDocument();
    expect(lastButton).toBeDisabled();
  });

  it('should increase page on next button click', async () => {
    const { container } = render(<TablePaginationActions {...props} />);
    const nextButton = container.querySelector(
      "[aria-label='next page']",
    ) as Element;
    const user = userEvent.setup({ delay: null });
    await user.click(nextButton);
    expect(props.onPageChange.mock.calls[0][1]).toBe(1);
  });

  it('should pass last page as argument', async () => {
    const { container } = render(<TablePaginationActions {...props} />);
    const lastButton = container.querySelector(
      "[aria-label='last page']",
    ) as Element;
    const user = userEvent.setup({ delay: null });
    await user.click(lastButton);
    expect(props.onPageChange.mock.calls[0][1]).toBe(2);
  });

  it('should decrease page on next button click', async () => {
    const { container } = render(
      <TablePaginationActions {...{ ...props, page: 2 }} />,
    );
    const backButton = container.querySelector(
      "[aria-label='previous page']",
    ) as Element;
    const user = userEvent.setup({ delay: null });
    await user.click(backButton);
    expect(props.onPageChange.mock.calls[0][1]).toBe(1);
  });
  it('should pass first page as argument', async () => {
    const { container } = render(
      <TablePaginationActions {...{ ...props, page: 2 }} />,
    );
    const firstButton = container.querySelector(
      "[aria-label='first page']",
    ) as Element;
    const user = userEvent.setup({ delay: null });
    await user.click(firstButton);
    expect(props.onPageChange.mock.calls[0][1]).toBe(0);
  });

  it('should reverse buttons if direction is rtl', async () => {
    const { container } = render(<TablePaginationActions {...props} />, {
      direction: 'rtl',
    });

    const firstButton = container.querySelector("[aria-label='first page']");
    const lastPageIcon = firstButton?.querySelector(
      '[data-testid="LastPageIcon"]',
    );
    expect(lastPageIcon).toBeTruthy();

    const nextButton = container.querySelector("[aria-label='next page']");
    const previousPageIcon = nextButton?.querySelector(
      '[data-testid="KeyboardArrowLeftIcon"]',
    );
    expect(previousPageIcon).toBeTruthy();

    const backButton = container.querySelector("[aria-label='previous page']");
    const nextPageIcon = backButton?.querySelector(
      '[data-testid="KeyboardArrowRightIcon"]',
    );
    expect(nextPageIcon).toBeTruthy();

    const lastButton = container.querySelector("[aria-label='last page']");
    const firstPageIcon = lastButton?.querySelector(
      '[data-testid="FirstPageIcon"]',
    );
    expect(firstPageIcon).toBeTruthy();
  });

  it('should change rendered 25 rows by default', () => {
    store.dispatch(setCompareResults(compareResults));
    const { container } = render(<CompareResultsTable mode="light" />);
    const select = container.querySelector('tfoot select') as HTMLSelectElement;
    const rows = screen.getAllByRole('row');
    expect(select.value).toBe('25');
    //row count is +2 because of header and footer rows
    expect(rows.length).toBe(27);
  });

  it('should change rendered rows count on select value change', async () => {
    store.dispatch(setCompareResults(compareResults));
    const { container } = render(<CompareResultsTable mode="light" />);
    const selectEl = container.querySelector(
      'tfoot select',
    ) as HTMLSelectElement;
    const user = userEvent.setup({ delay: null });
    await user.selectOptions(selectEl, '50');
    const rows = screen.getAllByRole('row');
    //row count is +2 because of header and footer rows
    expect(rows.length).toBe(52);
  });

  it('should render all rows', async () => {
    store.dispatch(setCompareResults(compareResults));
    const { container } = render(<CompareResultsTable mode="light" />);
    const selectEl = container.querySelector(
      'tfoot select',
    ) as HTMLSelectElement;
    const user = userEvent.setup({ delay: null });
    await user.selectOptions(selectEl, '-1');
    const rows = screen.getAllByRole('row');
    //row count is +2 because of header and footer rows
    expect(rows.length).toBe(compareResults.length + 2);
  });

  it('should render new rows on page change', async () => {
    const headerName1 = 'a11yr dhtml.html opt e10s fission stylo webrender1';
    const headerName26 = 'a11yr dhtml.html opt e10s fission stylo webrender26';
    store.dispatch(setCompareResults(compareResults));
    const { container } = render(<CompareResultsTable mode="light" />);
    const nextButton = container.querySelector(
      '[aria-label="next page"]',
    ) as HTMLSelectElement;
    const user = userEvent.setup({ delay: null });
    const testNameCell = screen.getByText(headerName1);
    expect(testNameCell).toBeInTheDocument();
    await user.click(nextButton);
    expect(testNameCell.textContent).toBe(headerName26);
  });
});
