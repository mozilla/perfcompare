import { Link } from '@mui/material';
import { style } from 'typestyle';

import LinkToRevision from './LinkToRevision';
import { Strings } from '../../resources/Strings';
import { Colors, Spacing } from '../../styles';
import type { CompareResultsItem } from '../../types/state';
import { getDocsURL } from '../../utils/helpers';

const styles = {
  revisionHeader: style({
    borderBottom: `0.5px solid ${Colors.BorderDropdownMenu}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    marginBottom: '12px',
  }),
  tagsOptions: style({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    margin: '0 4px',
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
  revisionTitle: style({
    flexWrap: 'wrap',
    fontFamily: 'SF Pro',
    display: 'flex',
    gap: '4px',
  }),
};

type HeaderProperties = Pick<
  CompareResultsItem,
  | 'extra_options'
  | 'framework_id'
  | 'option_name'
  | 'suite'
  | 'test'
  | 'new_repository_name'
  | 'new_rev'
>;

function createTitle(
  result: HeaderProperties,
  docsURL: string,
  isLinkSupported: boolean,
) {
  const isTestUnavailable = result.test === '' || result.suite === result.test;
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

export default function TestHeader(props: TestHeaderProps) {
  const { result, withRevision } = props;
  const { docsURL, isLinkSupported } = getDocsURL(
    result.suite,
    result.framework_id,
  );
  const extraOptions = getExtraOptions(result.extra_options);
  return (
    <div className={styles.revisionHeader}>
      <div className={styles.revisionTitle}>
        <strong>{createTitle(result, docsURL, isLinkSupported)}</strong>
        {withRevision && (
          <>
            {' '}
            <LinkToRevision result={result} />
          </>
        )}
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

interface TestHeaderProps {
  result: HeaderProperties;
  withRevision: boolean;
}
