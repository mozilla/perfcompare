import { useDispatch } from 'react-redux';

import type { AppDispatch } from '../common/store';
import { clearAlert, setAlert } from '../reducers/AlertSlice';
import type { AlertType } from '../types/state';

const useAlert = () => {
  const dispatch: AppDispatch = useDispatch();

  const dispatchClearAlert = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    dispatch(clearAlert());
  };

  const dispatchSetAlert = (
    message: AlertType['message'],
    severity: AlertType['severity'],
    title: AlertType['title'] = undefined,
  ) => {
    dispatch(setAlert({ message, title, severity }));
  };

  return { dispatchClearAlert, dispatchSetAlert };
};

export default useAlert;
