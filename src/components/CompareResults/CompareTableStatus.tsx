import { Alert, Button } from '@mui/material';

import { RootState } from '../../common/store';
import { useAppSelector } from '../../hooks/app';
import useFilterCompareResults from '../../hooks/useFilterCompareResults';
import FilterStatusChip from './FilterStatusChip';

const CompareTableStatus = () => {
  const filteredResults = useAppSelector(
    (state: RootState) => state.filterCompareResults.filteredResults,
  );
  const updatedOptions = useAppSelector(
    (state: RootState) => state.filterCompareResults.updatedOptions,
  );
  const isFiltered = useAppSelector(
    (state: RootState) => state.filterCompareResults.isFiltered,
  );
  const { filterResults, clearFilters } = useFilterCompareResults();

  if (updatedOptions) {
    return (
      <Alert severity="warning" className='filter-status'>
        Filter options have changed. Apply the new changes.
        <Button
          data-testid="apply-filter-status"
          variant="outlined"
          color="inherit"
          size="small"
          sx={{ margin: '5px 2px 10px 2px' }}
          onClick={() => filterResults()}
        >
          Apply
        </Button>
      </Alert>
    );
  }

  if (isFiltered) {
    return (
      <>
        <Alert className='filter-status'>
          <span>Filters have been applied.</span>
          <Button
            data-testid="clear-filter"
            variant="outlined"
            color="inherit"
            size="small"
            sx={{ margin: '5px 2px 10px 2px' }}
            onClick={() => clearFilters()}
          >
            Clear
          </Button>
          <FilterStatusChip color="success" />
        </Alert>
        {!filteredResults.length && (
          <Alert severity="info">No data for this combination.</Alert>
        )}
      </>
    );
  }
  return null;
};

export default CompareTableStatus;
