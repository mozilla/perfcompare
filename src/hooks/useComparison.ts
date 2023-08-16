import { useDispatch } from 'react-redux';

import { updateComparison } from '../reducers/ComparisonSlice';

const useComparison = () => {
  const dispatch = useDispatch();

  const handlerChangeComparison = (selectedRevision: string) => {
    dispatch(updateComparison({ activeComparison: selectedRevision }));
  };

  return { handlerChangeComparison };
};

export default useComparison;
