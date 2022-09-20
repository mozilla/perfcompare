import { Alert } from '@mui/material';

import { useAppSelector } from '../../hooks/app';

const CompareTableStatus = () => {
  const filterIsActive = useAppSelector((state) => {
    const { platform, test, confidence } =
      state.filterCompareResults.activeFilters;
      
    return platform.length || test.length || confidence.length;
  });
  const filteredResults = useAppSelector(
    (state) => state.filterCompareResults.filteredResults,
  );

  if (filterIsActive && filteredResults.length) {
    return <Alert>Filters may have been applied</Alert>;
  }
  return null;
};

export default CompareTableStatus;
