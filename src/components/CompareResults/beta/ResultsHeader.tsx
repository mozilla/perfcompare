import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import DownloadButton from './DownloadButton';
import RevisionSelect from './RevisionSelect';
import SearchInput from './SearchInput';

const styles = {
  title: style({
    margin: 0,
    marginBottom: Spacing.Medium,
  }),
  content: style({
    display: 'flex',
    justifyContent: 'space-between',
  }),
};

function ResultsHeader() {
  return (
    <header>
      <div className={styles.title}>Results</div>
      <div className={styles.content}>
        <SearchInput />
        <DownloadButton />
        <RevisionSelect />
      </div>
    </header>
  );
}

export default ResultsHeader;
