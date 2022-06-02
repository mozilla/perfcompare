import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { connect } from 'react-redux';

import useAlert from '../../hooks/useAlert';
import type { AlertType, State } from '../../types/state';

function HeaderAlert(props: HeaderAlertProps) {
  const { alert } = props;
  const { dispatchClearAlert } = useAlert();
  return (
    <Alert
      severity={alert.severity}
      onClose={(e: React.SyntheticEvent) => {
        dispatchClearAlert(e);
      }}
    >
      {alert.title && <AlertTitle>{alert.title}</AlertTitle>}
      {alert.message}
    </Alert>
  );
}

interface HeaderAlertProps {
  alert: AlertType;
}

function mapStateToProps(state: State) {
  return {
    alert: state.alert.alert,
  };
}

export default connect(mapStateToProps)(HeaderAlert);
