import { Box, Link } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { style } from 'typestyle';

import { frameworkMap } from '../../../../common/constants';
import { Strings } from '../../../../resources/Strings';
import { Colors, Spacing } from '../../../../styles';
import { Changeset, Repository } from '../../../../types/state';
import { Framework } from '../../../../types/types';
import {
  getTreeherderURL,
  truncateHash,
  getDocsURL,
} from '../../../../utils/helpers';
import { getPlatformAndVersion } from '../../../../utils/platform';
import { getPlatformIcon } from '../../../Shared/Icons/platformIcons';
import BetterDirectionIndicator from '../../BetterDirectionIndicator';

const strings = Strings.components.crossPlatformSubtests;

// Mirrors SubtestsRevisionHeader, but the single-platform chip is replaced by
// the list of platforms this page compares.
export type CrossPlatformHeaderProperties = {
  suite: string;
  framework_id: Framework['id'];
  option_name: string;
  extra_options: string;
  new_rev: Changeset['revision'];
  new_repo: Repository['name'];
  base_rev: Changeset['revision'];
  base_repo: Repository['name'];
  lower_is_better: boolean | null;
};

const styles = {
  revisionHeader: style({
    display: 'flex',
    alignItems: 'center',
    paddingBottom: '12px',
    marginBottom: '12px',
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
  header: CrossPlatformHeaderProperties,
  docsURL: string,
  isLinkSupported: boolean,
) {
  const suiteLink = Strings.components.revisionRow.title.suiteLink;
  if (isLinkSupported) {
    return (
      <Link
        aria-label='link to suite documentation'
        underline='hover'
        target='_blank'
        href={docsURL}
        title={suiteLink}
      >
        {header.suite}
      </Link>
    );
  }
  return header.suite;
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

function getExtraOptions(extraOptions: string) {
  return extraOptions ? extraOptions.split(' ') : [];
}

type SubtestsCrossPlatformHeaderProps = {
  header: CrossPlatformHeaderProperties;
  platforms: string[];
};

function SubtestsCrossPlatformHeader({
  header,
  platforms,
}: SubtestsCrossPlatformHeaderProps) {
  const { docsURL, isLinkSupported } = getDocsURL(
    header.suite,
    header.framework_id,
  );
  const extraOptions = getExtraOptions(header.extra_options);
  const framework = frameworkMap[header.framework_id];

  return (
    <div className={styles.revisionHeader}>
      <div className={styles.typography}>
        <strong>{getSuite(header, docsURL, isLinkSupported)}</strong>
        <BetterDirectionIndicator lowerIsBetter={header.lower_is_better} /> |
        {getRevLink(header.base_rev, header.base_repo, 'Base')}
        {getRevLink(header.new_rev, header.new_repo, '- New')} | {framework} |{' '}
        <span className='platform-list'>
          {strings.platformCount(platforms.length)}
          {platforms.map((platform) => (
            <Tooltip
              key={platform}
              style={{ cursor: 'pointer' }}
              placement='bottom'
              title={platform}
              arrow
            >
              <Box component='span' sx={{ marginLeft: '6px' }}>
                {getPlatformIcon(platform)}
                <span>{getPlatformAndVersion(platform)}</span>
              </Box>
            </Tooltip>
          ))}
        </span>
      </div>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          margin: '0 4px',
          textAlign: 'right',
          '& span': {
            color: 'tagOptions.text',
          },
          '& span:nth-of-type(3n)': {
            bgcolor: 'tagOptions.backgroundColorOption1',
          },
          '& span:nth-of-type(3n+1)': {
            bgcolor: 'tagOptions.backgroundColorOption2',
          },
          '& span:nth-of-type(3n+2)': {
            bgcolor: 'tagOptions.backgroundColorOption3',
          },
        }}
      >
        <span className={styles.chip}>{header.option_name}</span>
        {extraOptions.map((option, index) => (
          <span className={styles.chip} key={index}>
            {option}
          </span>
        ))}
      </Box>
    </div>
  );
}

export default SubtestsCrossPlatformHeader;
