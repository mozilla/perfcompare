import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import { subtestsView, subtestsOverTimeView } from '../../../common/constants';
import { Spacing } from '../../../styles';

type SubtestsBreadcrumbsProps = {
  view: typeof subtestsView | typeof subtestsOverTimeView;
};

const getPreviousCompareWithBaseURL = () => {
  const currentSearchParams = new URLSearchParams(location.search);
  const baseRev = currentSearchParams.get('baseRev');
  const baseRepo = currentSearchParams.get('baseRepo');
  const newRev = currentSearchParams.get('newRev');
  const newRepo = currentSearchParams.get('newRepo');
  const framework = currentSearchParams.get('framework');

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
  const interval = currentSearchParams.get('interval');
  const baseRepo = currentSearchParams.get('baseRepo');
  const newRev = currentSearchParams.get('newRev');
  const newRepo = currentSearchParams.get('newRepo');
  const framework = currentSearchParams.get('framework');

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
  const breadcrumbs = [
    <div key='1'></div>,
    <Link key='2' href='/'>
      Home
    </Link>,
    <Link key='3' href={allResultsURL}>
      All results
    </Link>,
  ];

  return (
    <Stack spacing={2} direction='row' alignItems='center'>
      <Breadcrumbs
        separator={<ChevronLeftIcon fontSize='small' />}
        aria-label='subtests breadcrumb'
        sx={{
          marginLeft: Spacing.xLarge,
          marginBottom: `${Spacing.layoutXLarge + 4}px`,
        }}
      >
        {breadcrumbs}
      </Breadcrumbs>
    </Stack>
  );
}

export default SubtestsBreadcrumbs;
