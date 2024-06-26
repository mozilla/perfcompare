import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton } from '@mui/material';

import {
  getTaskclusterCredentials,
  signInIntoTaskcluster,
} from '../../logic/taskcluster';
import { Strings } from '../../resources/Strings';

function RetriggerButton() {
  const onOpenModal = async () => {
    let credentials = getTaskclusterCredentials();
    if (!credentials) {
      await signInIntoTaskcluster();
      credentials = getTaskclusterCredentials();
    }

    console.log('We have an access token!', credentials);
  };

  // TODO implement modal

  return (
    <>
      <IconButton
        title={Strings.components.revisionRow.title.retriggerJobs}
        color='primary'
        size='small'
        onClick={() => void onOpenModal()}
      >
        <RefreshOutlinedIcon />
      </IconButton>
    </>
  );
}

export default RetriggerButton;
