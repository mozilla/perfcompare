import { style } from 'typestyle';

import { Spacing } from '../../../styles';
import SearchInput from './SearchInput';

const styles = {
  title: style({
    margin: 0,
    marginBottom: Spacing.Medium,
  }),
};

function ResultsHeader() {
  return (
    <header>
      <div className={styles.title}>Results</div>
      <SearchInput />
      {/* TODO PCF-224 */}
      {/* TODO PCF-225 */}
    </header>
  );
}

export default ResultsHeader;
