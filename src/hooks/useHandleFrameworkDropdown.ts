import { updateFramework } from '../reducers/FrameworkSlice';
import { useAppDispatch } from './app';

interface DropdownProps {
  id: number | undefined;
  name: string;
}

function useHandleChangeFrameworkDropdown() {
  const dispatch = useAppDispatch();

  const handleChangeFrameworkDropdown = async ({ id, name }: DropdownProps) => {
    dispatch(
      updateFramework({
        id,
        name,
      }),
    );
  };
  return { handleChangeFrameworkDropdown };
}

export default useHandleChangeFrameworkDropdown;
