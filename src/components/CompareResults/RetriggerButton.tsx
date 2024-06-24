import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import { IconButton } from '@mui/material';

import { getTaskclusterAccessToken } from '../../logic/taskcluster';
import { Strings } from '../../resources/Strings';

function RetriggerButton() {
  const onOpenModal = async () => {
    const accessToken = await getTaskclusterAccessToken();

    // TODO do something with accessToken
    console.log('We have an access token!', accessToken);
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
