import { Strings } from '../../resources/Strings';
import { CompareCardsStyles } from '../../styles';

const strings = Strings.components.searchDefault;

function CompareOverTime(props: CompareOverTimeProps) {
  const { mode } = props;
  const styles = CompareCardsStyles(mode);
  return (
    <div
      className={`compare-card-container compare-card-container--time ${styles.container}`}
    >
      <div className={`compare-card-text ${styles.cardText}`}>
        <div className='compare-card-title'>{strings.overTime.title}</div>
        <div className='compare-card-tagline'>{strings.overTime.tagline}</div>
      </div>
      <div
        className='compare-card-img compare-card-img--time'
        aria-label='a clock'
      />
    </div>
  );
}

interface CompareOverTimeProps {
  mode: 'light' | 'dark';
}

export default CompareOverTime;
