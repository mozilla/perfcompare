import { type ReactNode } from 'react';

import AppleIcon from '@mui/icons-material/Apple';
import { Link } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { useLoaderData } from 'react-router-dom';
import { style } from 'typestyle';

import {
  frameworkMap,
  subtestsView,
  subtestsOverTimeView,
  timeRangeMap,
} from '../../../common/constants';
import { Strings } from '../../../resources/Strings';
import { Colors, Spacing } from '../../../styles';
import type {
  SubtestsRevisionsHeader,
  PlatformShortName,
} from '../../../types/state';
import { Changeset, Repository } from '../../../types/state';
import {
  getTreeherderURL,
  truncateHash,
  getDocsURL,
} from '../../../utils/helpers';
import {
  getPlatformAndVersion,
  getPlatformShortName,
} from '../../../utils/platform';
import AndroidIcon from '../../Shared/Icons/AndroidIcon';
import LinuxIcon from '../../Shared/Icons/LinuxIcon';
import WindowsIcon from '../../Shared/Icons/WindowsIcon';
import { LoaderReturnValue as OvertimeLoaderReturnValue } from '../subtestsOverTimeLoader';

const styles = {
  revisionHeader: style({
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '12px',
    marginBottom: '12px',
  }),
  tagsOptions: style({
    textAlign: 'right',
    $nest: {
      'span:nth-child(3n)': {
        background: '#592ACB',
      },
      'span:nth-child(3n+1)': {
        background: '#005E5E',
      },
      'span:nth-child(3n+2)': {
        background: '#0250BB',
      },
    },
  }),
  chip: style({
    borderRadius: '4px',
    color: Colors.Background300,
    fontFamily: 'SF Pro',
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: '8.2px',
    gap: 10,
    letterSpacing: '0.02em',
    marginLeft: Spacing.xSmall,
    padding: Spacing.xSmall,
    textAlign: 'center',
    textTransform: 'uppercase',
  }),
  typography: style({
    fontFamily: 'SF Pro',
    fontStyle: 'normal',
    fontWeight: 590,
    fontSize: '16px',
    lineHeight: '1.5',
  }),
};

function getSuite(
  header: SubtestsRevisionsHeader,
  docsURL: string,
  isLinkSupported: boolean,
) {
  const suiteLink = Strings.components.revisionRow.title.suiteLink;
  if (isLinkSupported) {
    return (
      <>
        <Link
          aria-label='link to suite documentation'
          underline='hover'
          target='_blank'
          href={docsURL}
          title={suiteLink}
        >
          {header.suite}
        </Link>
      </>
    );
  } else {
    return header.suite;
  }
}

function getRevLink(
  rev: Changeset['revision'],
  repo: Repository['name'],
  text: string,
) {
  const shortHash = truncateHash(rev);
  return (
    <>
      {` ${text} (${repo}) `}
      <Link
        href={getTreeherderURL(rev, repo)}
        target='_blank'
        title={`${Strings.components.revisionRow.title.jobLink} ${shortHash}`}
      >
        {shortHash}
      </Link>
    </>
  );
}

function getTimeRange(repo: Repository['name']) {
  const { intervalValue } = useLoaderData() as OvertimeLoaderReturnValue;
  return ` Base (${repo}) ${timeRangeMap[intervalValue]} `;
}

function getExtraOptions(extraOptions: string) {
  return extraOptions ? extraOptions.split(' ') : [];
}

function SubtestsRevisionHeader(props: SubtestsRevisionHeaderProps) {
  const { header, view } = props;
  const { docsURL, isLinkSupported } = getDocsURL(
    header.suite,
    header.framework_id,
  );
  const platformIcons: Record<PlatformShortName, ReactNode> = {
    Linux: <LinuxIcon />,
    macOS: <AppleIcon />,
    iOS: <AppleIcon />,
    Windows: <WindowsIcon />,
    Android: <AndroidIcon />,
    Unspecified: '',
  };

  const platformShortName = getPlatformShortName(header.platform);
  const platformIcon = platformIcons[platformShortName];
  const extraOptions = getExtraOptions(header.extra_options);
  const framework = frameworkMap[header.framework_id];
  const baseInfo =
    view === subtestsView
      ? getRevLink(header.base_rev, header.base_repo, 'Base')
      : getTimeRange(header.base_repo);

  return (
    <div className={styles.revisionHeader}>
      <div className={styles.typography}>
        <strong>{getSuite(header, docsURL, isLinkSupported)}</strong> |
        {baseInfo}
        {getRevLink(header.new_rev, header.new_repo, '- New')} | {framework} |{' '}
        <Tooltip
          style={{ cursor: 'pointer' }}
          placement='bottom'
          title={header.platform}
          arrow
        >
          <span>
            {platformIcon}
            <span>{getPlatformAndVersion(header.platform)}</span>
          </span>
        </Tooltip>
      </div>
      <div className={styles.tagsOptions}>
        <span className={styles.chip}>{header.option_name}</span>
        {extraOptions.map((option, index) => (
          <span className={styles.chip} key={index}>
            {option}
          </span>
        ))}
      </div>
    </div>
  );
}

interface SubtestsRevisionHeaderProps {
  header: SubtestsRevisionsHeader;
  view: typeof subtestsView | typeof subtestsOverTimeView;
}

export default SubtestsRevisionHeader;
