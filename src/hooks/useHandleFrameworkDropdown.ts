import { updateFramework as updateFrameworkCompareWithBase } from '../reducers/SearchSlice';
import { updateFramework as updateFrameworkCompareOverTime } from '../reducers/SearchSliceCompareOverTime';
import { ComparisonType } from '../types/state';
import { useAppDispatch } from './app';

interface DropdownProps {
  id: number;
  name: string;
}

function useHandleChangeFrameworkDropdown(comparisonType: ComparisonType) {
  const dispatch = useAppDispatch();

  const handleChangeFrameworkDropdown = async ({ id, name }: DropdownProps) => {
    if (comparisonType == 'searchCompareWithBase') {
      dispatch(
        updateFrameworkCompareWithBase({
          id,
          name,
        }),
      );
    } else {
      dispatch(
        updateFrameworkCompareOverTime({
          id,
          name,
        }),
      );
    }
  };
  return { handleChangeFrameworkDropdown };
}

export default useHandleChangeFrameworkDropdown;
