import { type ReactNode } from 'react';

import AppleIcon from '@mui/icons-material/Apple';
import { Link } from '@mui/material';
import { style } from 'typestyle';

import { Strings } from '../../../resources/Strings';
import { Colors, Spacing } from '../../../styles';
import type {
  SubtestsRevisionsHeader,
  PlatformShortName,
} from '../../../types/state';
import {
  getTreeherderURL,
  truncateHash,
  getDocsURL,
} from '../../../utils/helpers';
import { getPlatformShortName } from '../../../utils/platform';
import AndroidIcon from '../../Shared/Icons/AndroidIcon';
import LinuxIcon from '../../Shared/Icons/LinuxIcon';
import WindowsIcon from '../../Shared/Icons/WindowsIcon';

const styles = {
  revisionHeader: style({
    // borderBottom: `0.5px solid ${Colors.BorderDropdownMenu}`,
    display: 'flex',
    // justifyContent: 'space-between',
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
    // To be removed
    fontFamily: 'SF Pro',
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: '8.2px',
    // End to be removed
    gap: Spacing.Small + 2,
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
    fontSize: '15px',
    lineHeight: '20px',
  }),
};

// function createTitle(
function getSuite(
  header: SubtestsRevisionsHeader,
  docsURL: string,
  isLinkSupported: boolean,
) {
  if (isLinkSupported) {
    return (
      <>
        <Link
          aria-label='link to suite documentation'
          underline='hover'
          target='_blank'
          href={docsURL}
        >
          {header.suite}
        </Link>
      </>
    );
  } else {
    return header.suite;
  }
}

function getExtraOptions(extraOptions: string) {
  return extraOptions ? extraOptions.split(' ') : [];
}

function SubtestsRevisionHeader(props: SubtestsRevisionHeaderProps) {
  const { header } = props;
  const { docsURL, isLinkSupported } = getDocsURL(
    header.suite,
    header.framework_id,
  );
  const platformIcons: Record<PlatformShortName, ReactNode> = {
    Linux: <LinuxIcon />,
    OSX: <AppleIcon />,
    Windows: <WindowsIcon />,
    Android: <AndroidIcon />,
    Unspecified: '',
  };

  const platformShortName = getPlatformShortName(header.platform);
  const platformIcon = platformIcons[platformShortName];
  const extraOptions = getExtraOptions(header.extra_options);
  const shortHash = truncateHash(header.new_rev);
  return (
    <div className={styles.revisionHeader}>
      <div className={styles.typography}>
        <strong>{getSuite(header, docsURL, isLinkSupported)}</strong> |{' '}
        <Link
          href={getTreeherderURL(header.new_rev, header.new_repo)}
          target='_blank'
          title={`${Strings.components.revisionRow.title.jobLink} ${shortHash}`}
        >
          {shortHash}
        </Link>{' '}
        | {platformIcon} <span>{platformShortName}</span> |{' '}
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
}

export default SubtestsRevisionHeader;
