import { Strings } from '../../../resources/Strings';

const strings = Strings.components.searchDefault;

function CompareOverTime() {
  return (
    <div className='compare-card-container compare-card-container--time'>
      <div className='compare-card-text'>
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

export default CompareOverTime;
