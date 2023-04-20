import { Strings } from '../../../resources/Strings';

const strings = Strings.components.searchDefault;

function CompareWithBase() {
  return (
    <div className='compare-card-container'>
      <div className='compare-card-text'>
        <div className='compare-card-title'>{strings.base.title}</div>
        <div className='compare-card-tagline'>{strings.base.tagline}</div>
      </div>
      <div
        className='compare-card-img compare-card-img--base'
        aria-label='two overlapping circles'
      />
    </div>
  );
}

export default CompareWithBase;
