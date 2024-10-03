import { Link } from '@mui/material';
import { style } from 'typestyle';

import { Strings } from '../../resources/Strings';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
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

type HeaderProperties = Pick<
  CompareResultsItem,
  | 'extra_options'
  | 'framework_id'
  | 'new_repository_name'
  | 'new_rev'
  | 'option_name'
  | 'suite'
  | 'test'
>;

function createTitle(
  result: HeaderProperties,
  docsURL: string,
  isLinkSupported: boolean,
) {
  const isTestUnavailable = result.test === '' || result.suite === result.test;
  if (isLinkSupported) {
    return (
      <>
        <Link
          aria-label='link to suite documentation'
          underline='hover'
          target='_blank'
          href={docsURL}
        >
          {result.suite}
        </Link>
        {isTestUnavailable ? '' : ` ${result.test}`}
      </>
    );
  } else {
    return isTestUnavailable ? result.suite : `${result.suite} ${result.test}`;
  }
}

function getExtraOptions(extraOptions: string) {
  return extraOptions ? extraOptions.split(' ') : [];
}

function RevisionHeader(props: RevisionHeaderProps) {
  const { result } = props;
  const { docsURL, isLinkSupported } = getDocsURL(
    result.suite,
    result.framework_id,
  );
  const extraOptions = getExtraOptions(result.extra_options);
  const shortHash = truncateHash(result.new_rev);
  return (
    <div className={styles.revisionHeader}>
      <div className={styles.typography}>
        <strong>{createTitle(result, docsURL, isLinkSupported)}</strong>{' '}
        <Link
          href={getTreeherderURL(result.new_rev, result.new_repository_name)}
          target='_blank'
          title={`${Strings.components.revisionRow.title.jobLink} ${shortHash}`}
        >
          {shortHash}
        </Link>
      </div>
      <div className={styles.tagsOptions}>
        <span className={styles.chip}>{result.option_name}</span>
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
  result: HeaderProperties;
}

export default RevisionHeader;
