import { useDispatch } from 'react-redux';

import { comparisonResults as secondRevisionResults } from '../mockData/9d5066525489';
import { comparisonResults as thirdRevisionResults } from '../mockData/a998c42399a8';
import { comparisonResults as firstRevisionResults } from '../mockData/bb6a5e451dac';
import { setCompareData } from '../reducers/CompareResults';
import { updateComparison } from '../reducers/ComparisonSlice';
import { Strings } from '../resources/Strings';
import { truncateHash } from '../utils/helpers';
import { useAppSelector } from './app';

const useComparison = () => {
  const dispatch = useDispatch();

  const activeComparison: string = useAppSelector(
    (state) => state.comparison.activeComparison,
  );
  const allRevisions =
    Strings.components.comparisonRevisionDropdown.allRevisions;

  const switchComparisonData = () => {
    if (activeComparison === truncateHash(firstRevisionResults[0].new_rev)) {
      dispatch(setCompareData({ data: firstRevisionResults }));
    }
    if (activeComparison === truncateHash(secondRevisionResults[0].new_rev)) {
      dispatch(setCompareData({ data: secondRevisionResults }));
    }
    if (activeComparison === truncateHash(thirdRevisionResults[0].new_rev)) {
      dispatch(setCompareData({ data: thirdRevisionResults }));
    }
    if (activeComparison === allRevisions) {
      const comparisonResults = firstRevisionResults.concat(
        secondRevisionResults,
        thirdRevisionResults,
      );
      dispatch(setCompareData({ data: comparisonResults }));
    }
  };

  const handlerChangeComparison = (selectedRevision: string) => {
    dispatch(updateComparison({ activeComparison: selectedRevision }));
  };

  return { handlerChangeComparison, switchComparisonData };
};

export default useComparison;
