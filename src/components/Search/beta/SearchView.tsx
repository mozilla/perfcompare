import { useNavigate } from 'react-router-dom';

import PerfCompareHeader from '../../Shared/beta/PerfCompareHeader';

function SearchViewBeta() {
  const navigate = useNavigate();
  navigate({
    pathname: '/beta',
  });
  return (
    <section className='perfcompare-body'>
      <PerfCompareHeader />
    </section>
  );
}

export default SearchViewBeta;
