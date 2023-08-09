import { TableRow, TableCell, Link } from '@mui/material';
import { style } from 'typestyle';

// import useDocsURL from '../../../hooks/useDocsURL';
import { Colors, Spacing } from '../../../styles';
import type { RevisionsHeader } from '../../../types/state';
import { getTreeherderURL, truncateHash, getDocsURL } from '../../../utils/helpers';

const styles = {
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
};

function createTitle(
  header: RevisionsHeader,
  docsURL: string,
  isLinkSupported: boolean,
) {
  const isTestUnavailable = header.test === '' || header.suite === header.test;
  if (isLinkSupported) {
    return isTestUnavailable ? (
      <Link
        aria-label='link to suite documentation'
        underline='hover'
        href={docsURL}
      >
        {header.suite}{' '}
      </Link>
    ) : (
      <>
        <Link
          aria-label='link to suite documentation'
          underline='hover'
          href={docsURL}
        >
          {header.suite}
        </Link>
        &nbsp;{header.test}
      </>
    );
  } else {
    return isTestUnavailable ? header.suite : `${header.suite} ${header.test}`;
  }
}

function getExtraOptions(extraOptions: string) {
  return extraOptions.split(' ');
}

function RevisionHeader(props: RevisionHeaderProps) {
  const { header } = props;
  const { docsURL, isLinkSupported } = getDocsURL(
    header.suite,
    header.framework_id,
  );
  const extraOptions = getExtraOptions(header.extra_options);
  return (
    <TableRow className='revision-header'>
      <TableCell colSpan={8}>
        <strong>{createTitle(header, docsURL, isLinkSupported)}</strong>{' '}
        <Link href={getTreeherderURL(header.new_rev, header.new_repo)}>
          {truncateHash(header.new_rev)}
        </Link>
      </TableCell>
      <TableCell colSpan={4}>
        <div className={styles.tagsOptions}>
          <span className={styles.chip}>{header.option_name}</span>
          {extraOptions.map((option, index) => (
            <span className={styles.chip} key={index}>
              {option}
            </span>
          ))}
        </div>
      </TableCell>
    </TableRow>
  );
}

interface RevisionHeaderProps {
  header: RevisionsHeader;
}

export default RevisionHeader;
