import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import { subtestsView, subtestsOverTimeView } from '../../../common/constants';
import useAdvancedColumns from '../../../hooks/useAdvancedColumns';
import useExpandedRowOptions from '../../../hooks/useExpandedRowOptions';
import type { AdvancedColumns, ExpandedRowOptions } from '../../../types/types';
import { setAdvancedOptionsParams } from '../../../utils/advancedOptionsUrl';

type SubtestsBreadcrumbsProps = {
  view: typeof subtestsView | typeof subtestsOverTimeView;
};

const getPreviousCompareWithBaseURL = (
  advancedColumns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
) => {
  const currentSearchParams = new URLSearchParams(location.search);
  const baseRev = currentSearchParams.get('baseRev') as string;
  const baseRepo = currentSearchParams.get('baseRepo') as string;
  const newRev = currentSearchParams.get('newRev') as string;
  const newRepo = currentSearchParams.get('newRepo') as string;
  const framework = currentSearchParams.get('framework') as string;

  const params = new URLSearchParams({
    baseRev,
    baseRepo,
    newRev,
    newRepo,
    framework,
  });
  // Carry the Advanced options selection back so the results page matches
  // the subtests page.
  setAdvancedOptionsParams(params, advancedColumns, expandedRow);

  return `/compare-results?${params.toString()}`;
};

const getPreviousCompareOverTimeURL = (
  advancedColumns: AdvancedColumns,
  expandedRow: ExpandedRowOptions,
) => {
  const currentSearchParams = new URLSearchParams(location.search);
  const interval = currentSearchParams.get('selectedTimeRange') as string;
  const baseRepo = currentSearchParams.get('baseRepo') as string;
  const newRev = currentSearchParams.get('newRev') as string;
  const newRepo = currentSearchParams.get('newRepo') as string;
  const framework = currentSearchParams.get('framework') as string;

  const params = new URLSearchParams({
    baseRepo,
    selectedTimeRange: interval,
    newRev,
    newRepo,
    framework,
  });
  setAdvancedOptionsParams(params, advancedColumns, expandedRow);

  return `/compare-over-time-results?${params.toString()}`;
};

function SubtestsBreadcrumbs({ view }: SubtestsBreadcrumbsProps) {
  const advancedColumns = useAdvancedColumns();
  const expandedRow = useExpandedRowOptions();
  const allResultsURL =
    view === subtestsView
      ? getPreviousCompareWithBaseURL(advancedColumns, expandedRow)
      : getPreviousCompareOverTimeURL(advancedColumns, expandedRow);

  return (
    <Breadcrumbs separator={<ChevronLeftIcon fontSize='small' />}>
      <span role='presentation'></span>
      <Link href='/'>Home</Link>
      <Link href={allResultsURL}>All results</Link>
    </Breadcrumbs>
  );
}

export default SubtestsBreadcrumbs;
