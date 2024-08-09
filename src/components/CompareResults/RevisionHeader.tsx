import { Link } from '@mui/material';
import { style } from 'typestyle';

import { Strings } from '../../resources/Strings';
import { Colors, Spacing } from '../../styles';
import type { RevisionsHeader } from '../../types/state';
import {
  getTreeherderURL,
  truncateHash,
  getDocsURL,
} from '../../utils/helpers';

const styles = {
  revisionHeader: style({
    borderBottom: `0.5px solid ${Colors.BorderDropdownMenu}`,
    display: 'flex',
    justifyContent: 'space-between',
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
    // End to be removed - update SubtestsRevisionHeader if this is removed
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

function createTitle(
  header: RevisionsHeader,
  docsURL: string,
  isLinkSupported: boolean,
) {
  const isTestUnavailable = header.test === '' || header.suite === header.test;
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
        {isTestUnavailable ? '' : ` ${header.test}`}
      </>
    );
  } else {
    return isTestUnavailable ? header.suite : `${header.suite} ${header.test}`;
  }
}

function getExtraOptions(extraOptions: string) {
  return extraOptions ? extraOptions.split(' ') : [];
}

function RevisionHeader(props: RevisionHeaderProps) {
  const { header } = props;
  const { docsURL, isLinkSupported } = getDocsURL(
    header.suite,
    header.framework_id,
  );
  const extraOptions = getExtraOptions(header.extra_options);
  const shortHash = truncateHash(header.new_rev);
  return (
    <div className={styles.revisionHeader}>
      <div className={styles.typography}>
        <strong>{createTitle(header, docsURL, isLinkSupported)}</strong>{' '}
        <Link
          href={getTreeherderURL(header.new_rev, header.new_repo)}
          target='_blank'
          title={`${Strings.components.revisionRow.title.jobLink} ${shortHash}`}
        >
          {shortHash}
        </Link>
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

interface RevisionHeaderProps {
  header: RevisionsHeader;
}

export default RevisionHeader;
