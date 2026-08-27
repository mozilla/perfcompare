import FilteredRowsNotice from '../../components/CompareResults/FilteredRowsNotice';
import type { ActiveColumnFilter } from '../../hooks/useTableFilters';
import { render, screen } from '../utils/test-utils';

describe('FilteredRowsNotice', () => {
  const filters: ActiveColumnFilter[] = [
    { name: 'Significance', excludedLabels: ['Noise'] },
  ];

  it('renders nothing when no rows are hidden', () => {
    const { container } = render(
      <FilteredRowsNotice hiddenCount={0} activeFilters={filters} />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByTestId('filtered-rows-notice'),
    ).not.toBeInTheDocument();
  });

  it('reports the count (singular) and the active filter reasons', () => {
    render(<FilteredRowsNotice hiddenCount={1} activeFilters={filters} />);
    const notice = screen.getByTestId('filtered-rows-notice');
    expect(notice).toHaveTextContent('1 row hidden by filters');
    expect(notice).toHaveTextContent('Significance: Noise');
  });

  it('pluralizes the count and joins multiple filters and values', () => {
    render(
      <FilteredRowsNotice
        hiddenCount={3}
        activeFilters={[
          { name: 'Significance', excludedLabels: ['Noise'] },
          { name: 'Status', excludedLabels: ['No changes', 'Improvement'] },
        ]}
      />,
    );
    const notice = screen.getByTestId('filtered-rows-notice');
    expect(notice).toHaveTextContent('3 rows hidden by filters');
    expect(notice).toHaveTextContent(
      'Significance: Noise • Status: No changes, Improvement',
    );
  });
});
