import { Link } from '@mui/material';
import { style } from 'typestyle';

import { Strings } from '../../resources/Strings';
import type { CompareResultsItem } from '../../types/state';
import { getTreeherderURL, truncateHash } from '../../utils/helpers';

const styles = {
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
  'new_repository_name' | 'new_rev'
>;

export default function LinkToRevision(props: LinkToRevisionProps) {
  const { result } = props;
  const shortHash = truncateHash(result.new_rev);
  return (
    <Link
      href={getTreeherderURL(result.new_rev, result.new_repository_name)}
      target='_blank'
      title={`${Strings.components.revisionRow.title.jobLink} ${shortHash}`}
      className={styles.typography}
    >
      {shortHash}
    </Link>
  );
}

interface LinkToRevisionProps {
  result: HeaderProperties;
}
