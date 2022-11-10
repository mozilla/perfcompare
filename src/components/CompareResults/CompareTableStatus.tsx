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
  const { filterResults } = useFilterCompareResults();

  if (updatedOptions) {
    return (
      <Alert severity="warning">
        Filter options have changed. Apply the new changes.
        <Button
          data-testid="apply-filter"
          variant="outlined"
          color="inherit"
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
        <Alert>
          <span>Filters have been applied.</span>
          <FilterStatusChip color="success" />
        </Alert>
        {!filteredResults.length && (
          <Alert severity="info">
            No data for this combination.
          </Alert>
        )}
      </>
    );
  }
  return null;
};

export default CompareTableStatus;
