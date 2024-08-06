import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';

import { subtestsView, subtestsOverTimeView } from '../../../common/constants';

type SubtestsBreadcrumbsProps = {
  view: typeof subtestsView | typeof subtestsOverTimeView;
};

const getPreviousCompareWithBaseURL = () => {
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

  return `/compare-results?${params.toString()}`;
};

const getPreviousCompareOverTimeURL = () => {
  const currentSearchParams = new URLSearchParams(location.search);
  const interval = currentSearchParams.get('interval') as string;
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

  return `/compare-over-time-results?${params.toString()}`;
};

function SubtestsBreadcrumbs({ view }: SubtestsBreadcrumbsProps) {
  const allResultsURL =
    view === subtestsView
      ? getPreviousCompareWithBaseURL()
      : getPreviousCompareOverTimeURL();

  return (
    <Breadcrumbs
      separator={<ChevronLeftIcon fontSize='small' />}
      aria-label='subtests breadcrumbs'
      sx={{
        marginBottom: 3,
      }}
    >
      [<div></div>,<Link href='/'>Home</Link>,
      <Link href={allResultsURL}>All results</Link>, ]
    </Breadcrumbs>
  );
}

export default SubtestsBreadcrumbs;
